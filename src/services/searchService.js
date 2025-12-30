import Fuse from 'fuse.js';
import { canAccessAssetSearch } from '../utils/userRoles';

// Default searchable fields (used when domain config doesn't specify)
const DEFAULT_SEARCHABLE_FIELDS = {
  asset: ['name', 'code', 'activities', 'description'],
  affair: ['name', 'type', 'category', 'authority', 'description'],
  renewal: ['name', 'type', 'responsiblePerson', 'notes'],
  attachment: ['name', 'type', 'notes', 'uploadedBy'],
};

// Fuse.js configuration
const FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.35,
  distance: 1000,
  minMatchCharLength: 2,
  ignoreLocation: true,
  useExtendedSearch: false,
};

const TOKEN_SPLIT_REGEX = /[\s,.;:]+/;

const searchState = {
  assets: [],
  affairs: [],
  renewals: [],
  attachments: [],
  assetMap: new Map(),
  affairMap: new Map(),
  renewalMap: new Map(),
  assetFuse: null,
  affairFuse: null,
  renewalFuse: null,
  attachmentFuse: null,
  // Domain-specific state
  domainConfig: null,
  currentUser: null,
  // Per-category Fuse instances for domain-specific search fields
  categoryFuseMap: new Map(),
  // Security → Entity mapping (pension_fund domain)
  securityFuse: null,
  securitiesByEntityId: new Map(),
  securities: [],
};

const buildFuse = (data, keys) => new Fuse(data || [], { ...FUSE_OPTIONS, keys });

/**
 * Get search fields for a category, using domain config with fallback to defaults
 * @param {string} category - Asset category key
 * @param {Object} domainConfig - Domain configuration
 * @returns {string[]} Array of searchable field names
 */
const getSearchFieldsForCategory = (category, domainConfig) => {
  // Try domain-specific config first
  const domainFields = domainConfig?.entities?.[category]?.searchFields;
  if (domainFields && domainFields.length > 0) {
    return domainFields;
  }

  // Fallback to hardcoded defaults
  return DEFAULT_SEARCHABLE_FIELDS.asset;
};

/**
 * Get searchable categories based on domain config and user role
 * @param {Object} domainConfig - Domain configuration
 * @param {Object} currentUser - Current user object
 * @returns {string[]|null} Array of accessible categories, or null for all categories
 */
const getAccessibleCategories = (domainConfig, currentUser) => {
  const searchConfig = domainConfig?.search;
  if (!searchConfig?.searchableCategories) {
    return null; // No restriction - all categories
  }

  const roleRestrictions = searchConfig.roleRestrictions || {};

  // Filter by role
  return searchConfig.searchableCategories.filter((category) => {
    const requiredRoles = roleRestrictions[category];
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role restriction for this category
    }
    // Check if user has one of the required roles (pass domainId for domain-aware check)
    return canAccessAssetSearch(currentUser, domainConfig?.id);
  });
};

/**
 * Group items by a key
 * @param {Array} items - Array of items
 * @param {string} key - Key to group by
 * @returns {Object} Object with keys as group values
 */
const groupBy = (items, key) => {
  return items.reduce((acc, item) => {
    const groupKey = item[key] || 'unknown';
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {});
};

const searchWithTokenIntersection = (fuseInstance, query) => {
  if (!fuseInstance) return [];
  const tokens = query
    .split(TOKEN_SPLIT_REGEX)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length <= 1) {
    return fuseInstance.search(query);
  }

  const perTokenResults = tokens.map((token) => fuseInstance.search(token));

  if (perTokenResults.every((results) => results.length === 0)) {
    return fuseInstance.search(query);
  }

  const resultMap = new Map();

  perTokenResults.forEach((results) => {
    results.forEach((result) => {
      const key = result.item?.id ?? JSON.stringify(result.item);
      if (!resultMap.has(key)) {
        resultMap.set(key, {
          result,
          count: 1,
          worstScore: result.score ?? 1,
        });
      } else {
        const entry = resultMap.get(key);
        entry.count += 1;
        entry.worstScore = Math.max(entry.worstScore, result.score ?? entry.worstScore);
      }
    });
  });

  const intersection = [];
  resultMap.forEach((entry) => {
    if (entry.count === tokens.length) {
      intersection.push({
        ...entry.result,
        score: entry.worstScore,
      });
    }
  });

  if (intersection.length === 0) {
    return fuseInstance.search(query);
  }

  intersection.sort((a, b) => (a.score ?? 1) - (b.score ?? 1));
  return intersection;
};

/**
 * Set (or reset) the search data for the current domain/business.
 * Call this whenever domain data changes.
 * @param {Object} data - domain data containing assets, regulatory_affairs, renewals, attachments
 * @param {Object} domainConfig - Domain configuration (optional)
 * @param {Object} currentUser - Current user object (optional)
 */
export const setSearchData = (data = {}, domainConfig = null, currentUser = null) => {
  const assets = data.assets || [];
  const affairs = data.regulatory_affairs || data.affairs || [];
  const renewals = data.renewals || [];
  const attachments = data.attachments || [];
  const securities = data.securities || [];

  // Store domain config and user for use in searchEntities
  searchState.domainConfig = domainConfig;
  searchState.currentUser = currentUser;

  searchState.assets = assets;
  searchState.affairs = affairs;
  searchState.renewals = renewals;
  searchState.attachments = attachments;
  searchState.securities = securities;

  searchState.assetMap = new Map(assets.map((a) => [a.id, a]));
  searchState.affairMap = new Map(affairs.map((a) => [a.id, a]));
  searchState.renewalMap = new Map(renewals.map((r) => [r.id, r]));

  // Build default Fuse instances for backward compatibility
  searchState.assetFuse = buildFuse(assets, DEFAULT_SEARCHABLE_FIELDS.asset);
  searchState.affairFuse = buildFuse(affairs, DEFAULT_SEARCHABLE_FIELDS.affair);
  searchState.renewalFuse = buildFuse(renewals, DEFAULT_SEARCHABLE_FIELDS.renewal);
  searchState.attachmentFuse = buildFuse(attachments, DEFAULT_SEARCHABLE_FIELDS.attachment);

  // Build per-category Fuse instances for domain-specific search fields
  searchState.categoryFuseMap = new Map();
  const assetsByCategory = groupBy(assets, 'category');

  for (const [category, categoryAssets] of Object.entries(assetsByCategory)) {
    const fields = getSearchFieldsForCategory(category, domainConfig);
    searchState.categoryFuseMap.set(category, buildFuse(categoryAssets, fields));
  }

  // Build security lookup and Fuse instance (pension_fund domain)
  searchState.securityFuse = null;
  searchState.securitiesByEntityId = new Map();

  const securitySearchConfig = domainConfig?.search?.securitySearch;
  if (securitySearchConfig?.enabled && securities.length > 0) {
    // Build entity_id → securities map
    for (const security of securities) {
      const entityId = security.entity_id;
      if (entityId) {
        if (!searchState.securitiesByEntityId.has(entityId)) {
          searchState.securitiesByEntityId.set(entityId, []);
        }
        searchState.securitiesByEntityId.get(entityId).push(security);
      }
    }

    // Build Fuse instance for securities
    const securityFields = securitySearchConfig.searchFields || ['ticker', 'cusip', 'isin', 'security_name'];
    searchState.securityFuse = buildFuse(securities, securityFields);
  }
};

/**
 * Build context information for nested entities using current search state
 * @param {Object} entity - The entity to build context for
 * @param {String} entityType - Type of entity
 * @returns {Object|null} Context object with parent information
 */
function buildContext(entity, entityType) {
  if (entityType === 'affair') {
    const parentAsset = searchState.assetMap.get(entity.assetId);
    if (parentAsset) {
      return {
        assetId: parentAsset.id,
        assetName: parentAsset.name,
        assetCategory: parentAsset.category,
      };
    }
  } else if (entityType === 'renewal') {
    const parentAffair = searchState.affairMap.get(entity.affairId);
    if (parentAffair) {
      const grandparentAsset = searchState.assetMap.get(parentAffair.assetId);
      return {
        affairId: parentAffair.id,
        affairName: parentAffair.name,
        assetId: grandparentAsset?.id,
        assetName: grandparentAsset?.name,
        assetCategory: grandparentAsset?.category,
      };
    }
  } else if (entityType === 'attachment') {
    if (entity.renewalId) {
      const parentRenewal = searchState.renewalMap.get(entity.renewalId);
      if (parentRenewal) {
        const grandparentAffair = searchState.affairMap.get(parentRenewal.affairId);
        const greatGrandparentAsset = grandparentAffair
          ? searchState.assetMap.get(grandparentAffair.assetId)
          : null;

        return {
          renewalId: parentRenewal.id,
          renewalName: parentRenewal.name,
          affairId: grandparentAffair?.id,
          affairName: grandparentAffair?.name,
          assetId: greatGrandparentAsset?.id,
          assetName: greatGrandparentAsset?.name,
          assetCategory: greatGrandparentAsset?.category,
        };
      }
    } else if (entity.assetId) {
      const parentAsset = searchState.assetMap.get(entity.assetId);
      if (parentAsset) {
        return {
          assetId: parentAsset.id,
          assetName: parentAsset.name,
          assetCategory: parentAsset.category,
        };
      }
    }
  }

  return null;
}

/**
 * Search assets with domain-specific category filtering and security matching
 * @param {String} trimmedQuery - Search query
 * @param {Number} limit - Max results per category
 * @param {String} assetId - Filter to specific asset (optional)
 * @returns {Array} Array of search result groups by category
 */
function searchAssets(trimmedQuery, limit, assetId = null) {
  const { domainConfig, currentUser } = searchState;
  const results = [];

  // Get accessible categories based on domain config and user role
  const accessibleCategories = getAccessibleCategories(domainConfig, currentUser);

  // If no domain config or no category filtering, use default behavior
  if (!accessibleCategories) {
    const assetSearchResults = searchWithTokenIntersection(searchState.assetFuse, trimmedQuery);
    let filteredResults = assetSearchResults;
    if (assetId) {
      filteredResults = assetSearchResults.filter((result) => result.item.id === assetId);
    }

    const assetResults = filteredResults.slice(0, limit).map((result) => ({
      ...result.item,
      entityType: 'asset',
      matchScore: result.score,
      context: null,
    }));

    if (assetResults.length > 0) {
      results.push({ entityType: 'asset', results: assetResults });
    }
    return results;
  }

  // Search with domain-specific category filtering and security matching
  const securitySearchConfig = domainConfig?.search?.securitySearch;
  const securityTargetCategory = securitySearchConfig?.targetCategory;

  // Collect all asset results across categories into a single map
  const allAssetResults = new Map();

  for (const category of accessibleCategories) {
    const categoryFuse = searchState.categoryFuseMap.get(category);
    if (!categoryFuse) continue;

    // Direct search on category
    const categoryResults = searchWithTokenIntersection(categoryFuse, trimmedQuery);

    // Add direct matches
    for (const result of categoryResults) {
      if (assetId && result.item.id !== assetId) continue;
      // Only add if not already present (lower score = better match)
      if (!allAssetResults.has(result.item.id) || result.score < allAssetResults.get(result.item.id).matchScore) {
        allAssetResults.set(result.item.id, {
          ...result.item,
          entityType: 'asset',
          matchScore: result.score,
          context: null,
          matchedVia: null,
        });
      }
    }

    // Add security-matched entities (if this category is the target for security search)
    if (securitySearchConfig?.enabled && category === securityTargetCategory && searchState.securityFuse) {
      const securityResults = searchWithTokenIntersection(searchState.securityFuse, trimmedQuery);

      for (const result of securityResults) {
        const entityId = result.item.entity_id;
        if (!entityId) continue;
        if (assetId && entityId !== assetId) continue;

        // Only add if not already in results (direct match takes priority)
        if (!allAssetResults.has(entityId)) {
          const entity = searchState.assetMap.get(entityId);
          if (entity && entity.category === category) {
            allAssetResults.set(entityId, {
              ...entity,
              entityType: 'asset',
              matchScore: result.score,
              context: null,
              matchedVia: 'security',
              matchedSecurityTicker: result.item.ticker,
              matchedSecurityName: result.item.security_name,
            });
          }
        }
      }
    }
  }

  // Convert to array, sort by score, and limit
  const finalResults = Array.from(allAssetResults.values())
    .sort((a, b) => a.matchScore - b.matchScore)
    .slice(0, limit);

  if (finalResults.length > 0) {
    results.push({ entityType: 'asset', results: finalResults });
  }

  return results;
}

/**
 * Unified search function that works with both global and contextual searches
 * @param {String} query - Search query string
 * @param {Object} options - Search options
 * @param {String} options.entityType - Type filter: 'all' | 'asset' | 'affair' | 'renewal' | 'attachment'
 * @param {String} options.assetId - Filter to specific asset (for contextual search)
 * @param {String} options.affairId - Filter to specific affair (for contextual search)
 * @param {Number} options.limit - Max results per entity type (default: 3 for dropdown, 20 for full search)
 * @param {Number} options.offset - Pagination offset (future use)
 * @returns {Object} Search results grouped by entity type
 */
export function searchEntities(query, options = {}) {
  const startTime = performance.now();

  const {
    entityType = 'all',
    assetId = null,
    affairId = null,
    limit = 3,
    offset = 0, // kept for future compatibility
  } = options;

  if (!query || query.trim().length < 2) {
    return { groups: [], total: 0 };
  }

  if (!searchState.assetFuse || !searchState.affairFuse || !searchState.renewalFuse || !searchState.attachmentFuse) {
    throw new Error('[searchService] Fuse instances are not initialized. Did you forget to call setSearchData before searching?');
  }

  const trimmedQuery = query.trim();
  const results = [];
  const { domainConfig } = searchState;

  // Check if domain config restricts search to assets only
  const searchEntityTypes = domainConfig?.search?.entityTypes;
  const isAssetOnlyDomain = searchEntityTypes?.length === 1 && searchEntityTypes[0] === 'asset';

  // Search Assets (using domain-aware search function)
  if (!entityType || entityType === 'all' || entityType === 'asset') {
    const assetResults = searchAssets(trimmedQuery, limit, assetId);
    results.push(...assetResults);
  }

  // Search Regulatory Affairs (skip if asset-only domain)
  if (!isAssetOnlyDomain && (!entityType || entityType === 'all' || entityType === 'affair')) {
    const affairSearchResults = searchWithTokenIntersection(searchState.affairFuse, trimmedQuery);
    let filteredResults = affairSearchResults;
    if (assetId) {
      filteredResults = filteredResults.filter((result) => result.item.assetId === assetId);
    }
    if (affairId) {
      filteredResults = filteredResults.filter((result) => result.item.id === affairId);
    }

    const affairResults = filteredResults.slice(0, limit).map((result) => ({
      ...result.item,
      entityType: 'affair',
      matchScore: result.score,
      context: buildContext(result.item, 'affair'),
    }));

    if (affairResults.length > 0) {
      results.push({ entityType: 'affair', results: affairResults });
    }
  }

  // Search Renewals (skip if asset-only domain)
  if (!isAssetOnlyDomain && (!entityType || entityType === 'all' || entityType === 'renewal')) {
    const renewalSearchResults = searchWithTokenIntersection(searchState.renewalFuse, trimmedQuery);
    let filteredResults = renewalSearchResults;
    if (affairId) {
      filteredResults = filteredResults.filter((result) => result.item.affairId === affairId);
    } else if (assetId) {
      const assetAffairIds = searchState.affairs.filter((a) => a.assetId === assetId).map((a) => a.id);
      filteredResults = filteredResults.filter((result) => assetAffairIds.includes(result.item.affairId));
    }

    const renewalResults = filteredResults.slice(0, limit).map((result) => ({
      ...result.item,
      entityType: 'renewal',
      matchScore: result.score,
      context: buildContext(result.item, 'renewal'),
    }));

    if (renewalResults.length > 0) {
      results.push({ entityType: 'renewal', results: renewalResults });
    }
  }

  // Search Attachments (skip if asset-only domain)
  if (!isAssetOnlyDomain && (!entityType || entityType === 'all' || entityType === 'attachment')) {
    const attachmentSearchResults = searchWithTokenIntersection(searchState.attachmentFuse, trimmedQuery);
    let filteredResults = attachmentSearchResults;
    if (affairId) {
      const affairRenewalIds = searchState.renewals.filter((r) => r.affairId === affairId).map((r) => r.id);
      filteredResults = filteredResults.filter((result) => affairRenewalIds.includes(result.item.renewalId));
    } else if (assetId) {
      const assetAffairIds = searchState.affairs.filter((a) => a.assetId === assetId).map((a) => a.id);
      const assetRenewalIds = searchState.renewals
        .filter((r) => assetAffairIds.includes(r.affairId))
        .map((r) => r.id);

      filteredResults = filteredResults.filter(
        (result) => result.item.assetId === assetId || assetRenewalIds.includes(result.item.renewalId),
      );
    }

    const attachmentResults = filteredResults.slice(0, limit).map((result) => ({
      ...result.item,
      entityType: 'attachment',
      matchScore: result.score,
      context: buildContext(result.item, 'attachment'),
    }));

    if (attachmentResults.length > 0) {
      results.push({ entityType: 'attachment', results: attachmentResults });
    }
  }

  const total = results.reduce((sum, group) => sum + group.results.length, 0);
  const endTime = performance.now();
  const searchTime = (endTime - startTime).toFixed(2);

  if (searchTime > 100) {
    console.warn(`[Search Performance] Query "${trimmedQuery}" took ${searchTime}ms (threshold: 100ms)`);
  }

  return { groups: results, total, query: trimmedQuery };
}

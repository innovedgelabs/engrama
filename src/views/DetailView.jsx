import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  IconButton,
  Button,
  Stack,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { LIFECYCLE_STATUS } from '../utils/status';
import PageLayout from '../components/layout/PageLayout';
import ContentPanel from '../components/layout/ContentPanel';
import AssetAvatar from '../components/common/AssetAvatar';
import BottomTabBar from '../components/common/BottomTabBar';
import {
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { getTabComponent } from '../utils/componentRegistry';
import InfoTab from '../components/detail/InfoTab';
import FilterChip from '../components/common/FilterChip';
import { DEFAULT_LANGUAGE, getCategoryLabel as translateCategoryLabel, getUIText } from '../utils/i18nHelpers';
import {
  resolveRouteSegment,
  resolveCategoryFromSlug,
  getCategorySlug,
  getTabSlug,
  resolveTabKeyFromSlug,
  getRouteSegment,
} from '../utils/routing';
import { useDomain } from '../contexts/DomainContext';
import { useScopedDomainData } from '../hooks/useScopedDomainData';

// No longer needed - we use category names directly as routes

const FILTER_KEYS_BY_CONTEXT = {
  asset: {
    regulatory: ['complianceStatus', 'affairCategory'],
    dossier: ['attachmentType', 'attachmentPrimary'],
    relations: ['status', 'category'],
  },
  affair: {
    renewals: ['workflowStatus', 'renewalType', 'renewalAttachments'],
  },
  renewal: {
    attachments: ['attachmentType', 'attachmentPrimary'],
  },
};

const MANAGED_FILTER_KEYS = new Set(
  Object.values(FILTER_KEYS_BY_CONTEXT)
    .flatMap((tabMap) => Object.values(tabMap))
    .flat()
);

const getFilterKeysForContext = (type, tabKey) =>
  FILTER_KEYS_BY_CONTEXT[type]?.[tabKey] ?? [];

const getComparableRenewalDate = (renewal) =>
  new Date(
    renewal.approvalDate ||
    renewal.submissionDate ||
    renewal.expiryDate ||
    0
  ).getTime();

const DetailView = ({
  language = DEFAULT_LANGUAGE,
  currentUser,
}) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentConfig, getEntityConfig, currentData: unscopedData } = useDomain();
  const scopedData = useScopedDomainData(currentUser);
  const currentData = scopedData || unscopedData;
  const assets = currentData?.assets ?? [];
  const regulatoryAffairs = currentData?.regulatory_affairs ?? [];
  const renewals = currentData?.renewals ?? [];
  const attachments = currentData?.attachments ?? [];

  // Detect entity type from URL path (works for localized segments)
  const primarySegment = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    return segments[0] ?? '';
  }, [location.pathname]);

  const primaryRouteKey = resolveRouteSegment(primarySegment, currentConfig);

  const entityType = (primaryRouteKey === 'affair' || primaryRouteKey === 'regulatory_affair')
    ? 'affair'
    : primaryRouteKey === 'renewal'
    ? 'renewal'
    : 'asset';

  // Extract IDs and tab based on entity type
  const { category: categorySlug, id, affairId, renewalId, tab: tabSlug, relatedCategory: relatedCategorySlug } = params;

  const category = useMemo(
    () => (categorySlug ? resolveCategoryFromSlug(categorySlug, currentConfig) ?? categorySlug : null),
    [categorySlug, currentConfig]
  );

  const relatedCategoryKey = useMemo(
    () => (relatedCategorySlug ? resolveCategoryFromSlug(relatedCategorySlug, currentConfig) ?? null : null),
    [relatedCategorySlug, currentConfig]
  );

  const tabKeyFromParams = useMemo(() => {
    if (!tabSlug) {
      return null;
    }
    const context = entityType === 'affair' ? 'affair' : entityType === 'renewal' ? 'renewal' : 'asset';
    return resolveTabKeyFromSlug(tabSlug, context, currentConfig) ?? tabSlug;
  }, [tabSlug, entityType, currentConfig]);

  const homeLabel = useMemo(
    () => getUIText('breadcrumbHome', language),
    [language]
  );
  const assetsLabel = useMemo(
    () => getUIText('assetsPlural', language),
    [language]
  );

  // Determine which ID to use
  const currentId = entityType === 'affair' ? affairId : entityType === 'renewal' ? renewalId : id;

  const assetsById = useMemo(() => {
    const map = new Map();
    assets.forEach(asset => map.set(asset.id, asset));
    return map;
  }, [assets]);

  const regulatoryAffairsById = useMemo(() => {
    const map = new Map();
    regulatoryAffairs.forEach(affair => map.set(affair.id, affair));
    return map;
  }, [regulatoryAffairs]);

  const renewalsById = useMemo(() => {
    const map = new Map();
    renewals.forEach(renewal => map.set(renewal.id, renewal));
    return map;
  }, [renewals]);

  const regulatoryAffairsByAsset = useMemo(() => {
    const map = new Map();
    regulatoryAffairs.forEach(affair => {
      const list = map.get(affair.assetId);
      if (list) {
        list.push(affair);
      } else {
        map.set(affair.assetId, [affair]);
      }
    });
    return map;
  }, [regulatoryAffairs]);

  const renewalsByAffair = useMemo(() => {
    const map = new Map();
    renewals.forEach(renewal => {
      const list = map.get(renewal.affairId);
      if (list) {
        list.push(renewal);
      } else {
        map.set(renewal.affairId, [renewal]);
      }
    });

    map.forEach((list, affairId, target) => {
      target.set(
        affairId,
        list.sort((a, b) => getComparableRenewalDate(b) - getComparableRenewalDate(a))
      );
    });

    return map;
  }, [renewals]);

  const latestRenewalByAffair = useMemo(() => {
    const map = new Map();
    renewalsByAffair.forEach((list, affairId) => {
      if (list.length > 0) {
        map.set(affairId, list[0]);
      }
    });
    return map;
  }, [renewalsByAffair]);

  const attachmentsByRenewal = useMemo(() => {
    const map = new Map();
    attachments.forEach((doc) => {
      const list = map.get(doc.renewalId);
      if (list) {
        list.push(doc);
      } else {
        map.set(doc.renewalId, [doc]);
      }
    });
    return map;
  }, [attachments]);

  const attachmentsByAsset = useMemo(() => {
    const map = new Map();
    attachments.forEach((doc) => {
      if (!doc.assetId) {
        return;
      }
      const list = map.get(doc.assetId);
      if (list) {
        list.push(doc);
      } else {
        map.set(doc.assetId, [doc]);
      }
    });
    return map;
  }, [attachments]);

  const resolveCollectionKey = useCallback(
    (cat) => {
      if (!cat || !currentData) return 'assets';

      const candidates = new Set();
      candidates.add(cat);
      if (!cat.endsWith('s')) candidates.add(`${cat}s`);
      if (!cat.endsWith('es')) candidates.add(`${cat}es`);
      if (cat.endsWith('y')) candidates.add(`${cat.slice(0, -1)}ies`);

      const sourcesKeys = Object.keys(currentData || {});
      for (const key of candidates) {
        if (currentData[key]) {
          return key;
        }
        // also try to match data keys that start with the category (e.g., board_seat -> board_seats)
        const startsWith = sourcesKeys.find((k) => k.startsWith(key));
        if (startsWith) {
          return startsWith;
        }
      }

      if (currentConfig?.dataLoading?.sources) {
        const sourceKeys = Object.keys(currentConfig.dataLoading.sources);
        const match = sourceKeys.find((k) => k.startsWith(cat) || cat.startsWith(k));
        if (match && currentData[match]) {
          return match;
        }
      }

      return 'assets';
    },
    [currentData, currentConfig]
  );

  const entity = useMemo(() => {
    if (!currentId) return null;

    if (entityType === 'asset') {
      const effectiveCategory = category ?? primaryRouteKey ?? null;
      const collectionKey = resolveCollectionKey(effectiveCategory);
      const collection = currentData?.[collectionKey] || assets;
      const found = collection.find((item) => item.id === currentId) ?? null;
      if (!found) return null;

      const enriched = { ...found };
      if (!enriched.category) {
        enriched.category = effectiveCategory || collectionKey;
      }
      if (!enriched.name) {
        enriched.name =
          enriched.security_name ||
          enriched.entity_name ||
          enriched.representative_name ||
          enriched.obligation_type ||
          enriched.request_type ||
          enriched.id;
      }
      return enriched;
    }

    if (entityType === 'affair') {
      return regulatoryAffairsById.get(currentId) ?? null;
    }

    if (entityType === 'renewal') {
      return renewalsById.get(currentId) ?? null;
    }

    return null;
  }, [currentId, entityType, category, primaryRouteKey, resolveCollectionKey, currentData, assets, regulatoryAffairsById, renewalsById]);

  const resolvedCategory = useMemo(() => {
    if (entityType !== 'asset') {
      return category ?? null;
    }
    return category ?? primaryRouteKey ?? entity?.category ?? null;
  }, [category, primaryRouteKey, entityType, entity]);

  const investmentEntityRelations = useMemo(() => {
    if (!entity || entityType !== 'asset' || entity.category !== 'investment_entity') {
      return {};
    }
    const entId = entity.id;
    return {
      securities: currentData?.securities?.filter((s) => s.entity_id === entId) || [],
      holdings: currentData?.holdings?.filter((h) => h.entity_id === entId) || [],
      obligations: currentData?.compliance_obligations?.filter((o) => o.entity_id === entId) || [],
      requests: currentData?.requests?.filter((r) => r.counterparty_id === entId) || [],
      boardSeats: currentData?.board_seats?.filter((b) => b.entity_id === entId) || [],
    };
  }, [entity, entityType, currentData]);

  const securityRelations = useMemo(() => {
    if (!entity || entityType !== 'asset' || entity.category !== 'security') {
      return {};
    }
    const secId = entity.id;
    return {
      holdings: currentData?.holdings?.filter((h) => h.security_id === secId) || [],
    };
  }, [entity, entityType, currentData]);

  const entityConfig = useMemo(() => {
    const typeKey =
      entityType === 'asset'
        ? resolvedCategory
        : entityType === 'affair'
        ? 'regulatory_affair'
        : entityType === 'renewal'
        ? 'renewal'
        : entityType;

    return typeKey ? getEntityConfig(typeKey) : null;
  }, [entityType, resolvedCategory, getEntityConfig]);

  const { relatedData, breadcrumbItems, tabConfigs } = useMemo(() => {
    if (!entity) {
      return {
        relatedData: {},
        breadcrumbItems: [{ label: homeLabel, path: '/' }],
        tabConfigs: [],
      };
    }

  if (entityType === 'asset') {
    const regulatoryAffairs = regulatoryAffairsByAsset.get(currentId) ?? [];
    const attachmentsForAsset = attachmentsByAsset.get(currentId) ?? [];
    const relationEntries = new Map();

      const addRelation = (targetAsset, relation) => {
        if (!targetAsset || targetAsset.id === entity.id) {
          return;
        }
        const existing = relationEntries.get(targetAsset.id);
        if (existing) {
          existing.relations.push(relation);
        } else {
          relationEntries.set(targetAsset.id, {
            asset: targetAsset,
            relations: [relation],
          });
        }
      };

      (entity.connections ?? []).forEach((connection) => {
        const targetAsset = assetsById.get(connection.id);
        addRelation(targetAsset, {
          type: connection.type,
          description: connection.description,
          direction: 'outgoing',
          sourceId: entity.id,
        });
      });

      assets.forEach((otherAsset) => {
        if (otherAsset.id === entity.id) {
          return;
        }
        (otherAsset.connections ?? []).forEach((connection) => {
          if (connection.id === entity.id) {
            addRelation(otherAsset, {
              type: connection.type,
              description: connection.description,
              direction: 'incoming',
              sourceId: otherAsset.id,
            });
          }
        });
      });

      const relatedAssets = Array.from(relationEntries.values()).sort((a, b) =>
        a.asset.name.localeCompare(b.asset.name)
      );

      const tabOrder = entityConfig?.tabs || [];

      const makeTabLabel = (tabKey) => {
        const labelOverride =
          entityConfig?.tabLabels?.[tabKey]?.[language] ||
          entityConfig?.tabLabels?.[tabKey]?.en ||
          entityConfig?.tabLabels?.[tabKey]?.es;

        if (labelOverride) {
          return labelOverride;
        }

        switch (tabKey) {
          case 'info':
            return getUIText('tabInfo', language);
          case 'regulatory':
            return getUIText('tabRegulatory', language);
          case 'dossier':
            return getUIText('tabDossier', language);
          case 'relations':
            return getUIText('tabRelations', language);
          default:
            return tabKey;
        }
      };

      const buildTab = (tabKey, badgeCount) => ({
        key: tabKey,
        labelText: makeTabLabel(tabKey),
        label:
          badgeCount !== undefined
            ? (
              <Badge badgeContent={badgeCount} color="primary">
                <Box sx={{ pr: badgeCount > 0 ? 2 : 0 }}>
                  {makeTabLabel(tabKey)}
                </Box>
              </Badge>
            )
            : makeTabLabel(tabKey),
      });

      const tabConfigs = tabOrder.length
        ? tabOrder.map((tabKey) => {
            const badgeCount =
              tabKey === 'regulatory'
                ? regulatoryAffairs.length
                : tabKey === 'dossier'
                ? attachmentsForAsset.length
                : tabKey === 'relations'
                ? relatedAssets.length
                : undefined;
            return buildTab(tabKey, badgeCount);
          })
        : [
            buildTab('info'),
            buildTab('regulatory', regulatoryAffairs.length),
            buildTab('dossier', attachmentsForAsset.length),
            buildTab('relations', relatedAssets.length),
          ];

      return {
        relatedData: { regulatoryAffairs, attachments: attachmentsForAsset, relatedAssets },
        breadcrumbItems: [
          { label: homeLabel, path: '/' },
          {
            label: translateCategoryLabel(resolvedCategory, language),
            path: resolvedCategory ? `/${getCategorySlug(resolvedCategory, language, currentConfig)}` : '/',
          },
          { label: entity.name, path: null },
        ],
        tabConfigs,
      };
    }

    if (entityType === 'affair') {
      const renewals = renewalsByAffair.get(currentId) ?? [];
      const asset = entity.assetId ? assetsById.get(entity.assetId) ?? null : null;

      const tabOrder = getEntityConfig('regulatory_affair')?.tabs || [];
      const makeTabLabel = (tabKey) => (tabKey === 'info' ? getUIText('tabInfo', language) : tabKey === 'renewals' ? getUIText('tabRenewals', language) : tabKey);
      const buildTab = (tabKey, badgeCount) => ({
        key: tabKey,
        labelText: makeTabLabel(tabKey),
        label:
          badgeCount !== undefined
            ? (
              <Badge badgeContent={badgeCount} color="primary">
                <Box sx={{ pr: badgeCount > 0 ? 2 : 0 }}>
                  {makeTabLabel(tabKey)}
                </Box>
              </Badge>
            )
            : makeTabLabel(tabKey),
      });

      const tabConfigs = tabOrder.length
        ? tabOrder.map((tabKey) => buildTab(tabKey, tabKey === 'renewals' ? renewals.length : undefined))
        : [
            buildTab('info'),
            buildTab('renewals', renewals.length),
          ];

      return {
        relatedData: { renewals },
        breadcrumbItems: [
          { label: homeLabel, path: '/' },
          {
            label: asset ? translateCategoryLabel(asset.category, language) : assetsLabel,
            path: asset?.category ? `/${getCategorySlug(asset.category, language, currentConfig)}` : '/',
          },
          {
            label: asset?.name,
            path: asset
              ? `/${getCategorySlug(asset.category, language, currentConfig)}/${asset.id}/${getTabSlug('info', 'asset', language, currentConfig)}`
              : null,
          },
          { label: entity.name, path: null },
        ],
        tabConfigs,
      };
    }

    const attachmentsForRenewal = attachmentsByRenewal.get(currentId) ?? [];
    const affair = entity.affairId ? regulatoryAffairsById.get(entity.affairId) ?? null : null;
    const asset = affair && affair.assetId ? assetsById.get(affair.assetId) ?? null : null;

    return {
      relatedData: { attachments: attachmentsForRenewal },
      breadcrumbItems: [
        { label: homeLabel, path: '/' },
        {
          label: asset ? translateCategoryLabel(asset.category, language) : assetsLabel,
          path: asset?.category ? `/${getCategorySlug(asset.category, language, currentConfig)}` : '/',
        },
        {
          label: asset?.name,
          path: asset
            ? `/${getCategorySlug(asset.category, language, currentConfig)}/${asset.id}/${getTabSlug('info', 'asset', language, currentConfig)}`
            : null,
        },
        {
          label: affair?.name,
          path: affair
            ? `/${getRouteSegment('affair', language, currentConfig)}/${affair.id}/${getTabSlug('info', 'affair', language, currentConfig)}`
            : null,
        },
        { label: entity.name, path: null },
      ],
      tabConfigs: (getEntityConfig('renewal')?.tabs || ['info', 'attachments']).map((tabKey) => {
        const makeTabLabel =
          tabKey === 'info'
            ? getUIText('tabInfo', language)
            : tabKey === 'attachments'
            ? getUIText('tabAttachments', language)
            : tabKey;

        const badgeCount = tabKey === 'attachments' ? attachmentsForRenewal.length : undefined;

        return {
          key: tabKey,
          labelText: makeTabLabel,
          label:
            badgeCount !== undefined ? (
              <Badge badgeContent={badgeCount} color="primary">
                <Box sx={{ pr: badgeCount > 0 ? 2 : 0 }}>
                  {makeTabLabel}
                </Box>
              </Badge>
            ) : (
              makeTabLabel
            ),
        };
      }),
    };
  }, [
    entity,
    entityType,
    currentId,
    resolvedCategory,
    assets,
    assetsById,
    regulatoryAffairsByAsset,
    renewalsByAffair,
    attachmentsByRenewal,
    attachmentsByAsset,
    homeLabel,
    assetsLabel,
    language,
    regulatoryAffairsById,
    getEntityConfig,
    currentConfig,
  ]);

  const filteredTabs = useMemo(
    () => (tabConfigs || []).filter((tab) => getTabComponent(tab.key)),
    [tabConfigs]
  );

  const currentTabKey = filteredTabs[activeTab]?.key ?? filteredTabs[0]?.key ?? null;

  const currentFilterKeys = useMemo(
    () => getFilterKeysForContext(entityType, currentTabKey),
    [entityType, currentTabKey]
  );

  const activeFilters = useMemo(() => {
    const filters = {};
    currentFilterKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null) {
        filters[key] = value;
      }
    });

    // Default to showing active affairs in regulatory affairs tab if no lifecycle filter is set
    if (currentTabKey === 'regulatoryAffairs' && !filters.lifecycleStatus) {
      filters.lifecycleStatus = 'active';
    }

    return filters;
  }, [currentFilterKeys, searchParams, currentTabKey]);

  // Set initial tab based on URL parameter
  useEffect(() => {
    if (!Array.isArray(filteredTabs) || filteredTabs.length === 0) {
      return;
    }

    if (!tabKeyFromParams) {
      setActiveTab(0);
      return;
    }

    const tabIndex = filteredTabs.findIndex((t) => t.key === tabKeyFromParams);
    setActiveTab(tabIndex >= 0 ? tabIndex : 0);
  }, [tabKeyFromParams, filteredTabs]);

  // Clamp active tab if filteredTabs shrink
  useEffect(() => {
    if (activeTab >= filteredTabs.length) {
      setActiveTab(filteredTabs.length ? 0 : 0);
    }
  }, [activeTab, filteredTabs]);

  // Hook: handleRelatedCategoryChange (must be before early return)
  const handleRelatedCategoryChange = useCallback(
    (nextCategory) => {
      if (entityType !== 'asset') {
        return;
      }

      const baseCategorySlug = category
        ? getCategorySlug(category, language, currentConfig)
        : resolvedCategory
        ? getCategorySlug(resolvedCategory, language, currentConfig)
        : categorySlug;
      const relationsSlug = getTabSlug('relations', 'asset', language, currentConfig);

      let newPath = `/${baseCategorySlug}/${id}/${relationsSlug}`;
      if (nextCategory) {
        newPath += `/${getCategorySlug(nextCategory, language, currentConfig)}`;
      }

      const params = new URLSearchParams(searchParams);
      const allowedKeys = new Set(getFilterKeysForContext('asset', 'relations'));

      MANAGED_FILTER_KEYS.forEach((key) => {
        if (!allowedKeys.has(key)) {
          params.delete(key);
        }
      });

      const searchString = params.toString();
      if (searchString) {
        navigate({ pathname: newPath, search: `?${searchString}` }, { replace: true });
      } else {
        navigate(newPath, { replace: true });
      }
    },
    [entityType, category, categorySlug, id, language, navigate, searchParams, currentConfig, resolvedCategory]
  );

  // Hook: handleFilterChange (must be before early return)
  const handleFilterChange = useCallback(
    (key, value) => {
      if (!key) {
        return;
      }

      const activeTabKey = filteredTabs[activeTab]?.key;
      const allowedKeys = getFilterKeysForContext(entityType, activeTabKey);

      if (!allowedKeys.includes(key)) {
        return;
      }

      const params = new URLSearchParams(searchParams);
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }

      setSearchParams(params, { replace: true });
    },
    [activeTab, entityType, filteredTabs, searchParams, setSearchParams]
  );

  // Handle case when entity not found
  if (!entity) {
    const entityLabel = entityType === 'affair' ? 'Regulatory Affair' : entityType === 'renewal' ? 'Renewal' : 'Asset';
    return (
      <PageLayout showBackButton={false}>
        <Box sx={{ py: 4 }}>
          <Typography variant="h5">{entityLabel} no encontrado</Typography>
          <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Volver al inicio
          </Button>
        </Box>
      </PageLayout>
    );
  }

  // Event handler: handleTabChange
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);

    const newTabKey = filteredTabs[newValue]?.key;
    if (!newTabKey) {
      return;
    }

    let newPath;
    if (entityType === 'asset') {
      const baseCategorySlug = category
        ? getCategorySlug(category, language, currentConfig)
        : resolvedCategory
        ? getCategorySlug(resolvedCategory, language, currentConfig)
        : categorySlug;
      const tabSlug = getTabSlug(newTabKey, 'asset', language, currentConfig);
      newPath = `/${baseCategorySlug}/${id}/${tabSlug}`;
      if (newTabKey === 'relations' && relatedCategoryKey) {
        const relatedSlug = getCategorySlug(relatedCategoryKey, language, currentConfig);
        newPath += `/${relatedSlug}`;
      }
    } else if (entityType === 'affair') {
      const affairSegment = getRouteSegment('affair', language, currentConfig);
      const tabSlug = getTabSlug(newTabKey, 'affair', language, currentConfig);
      newPath = `/${affairSegment}/${affairId}/${tabSlug}`;
    } else {
      const renewalSegment = getRouteSegment('renewal', language, currentConfig);
      const tabSlug = getTabSlug(newTabKey, 'renewal', language, currentConfig);
      newPath = `/${renewalSegment}/${renewalId}/${tabSlug}`;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    const keysToKeep = new Set(getFilterKeysForContext(entityType, newTabKey));

    MANAGED_FILTER_KEYS.forEach((key) => {
      if (!keysToKeep.has(key)) {
        nextSearchParams.delete(key);
      }
    });

    const nextSearchString = nextSearchParams.toString();
    if (nextSearchString) {
      navigate({ pathname: newPath, search: `?${nextSearchString}` }, { replace: true });
    } else {
      navigate(newPath, { replace: true });
    }
  };

  // Render tab content from registry
  const renderTabContent = () => {
    const tabConfig = filteredTabs[activeTab];
    const tabKey = tabConfig?.key;
    const TabComponent = tabKey ? getTabComponent(tabKey) : null;

    if (!TabComponent) {
      return null;
    }

    const commonProps = {
      language,
      activeFilters,
      onFilterChange: handleFilterChange,
    };

    if (tabKey === 'info') {
      const infoSchemaKey =
        entityType === 'affair'
          ? 'regulatory_affair'
          : entityType === 'asset'
          ? entity.category
          : entityType;
      return <TabComponent asset={entity} entityType={infoSchemaKey} renewals={renewals} language={language} />;
    }

    if (tabKey === 'regulatory') {
      return (
        <TabComponent
          regulatoryAffairs={relatedData.regulatoryAffairs}
          renewals={renewals}
          attachments={attachments}
          assetId={entity.id}
          {...commonProps}
        />
      );
    }

    if (tabKey === 'dossier' || tabKey === 'attachments') {
      return (
        <TabComponent
          attachments={relatedData.attachments ?? attachments}
          {...commonProps}
        />
      );
    }

    if (tabKey === 'relations') {
      return (
        <TabComponent
          relatedAssets={relatedData.relatedAssets ?? []}
          currentCategory={relatedCategoryKey}
          onCategoryChange={handleRelatedCategoryChange}
          {...commonProps}
        />
      );
    }

    if (tabKey === 'renewals') {
      return (
        <TabComponent
          renewals={relatedData.renewals}
          attachments={attachments}
          affairId={entity.id}
          {...commonProps}
        />
      );
    }

    if (tabKey === 'securities') {
      return (
        <TabComponent
          entity={entity}
          securities={investmentEntityRelations.securities || []}
          {...commonProps}
        />
      );
    }

    if (tabKey === 'holdings') {
      const holdingsForContext =
        entity.category === 'security'
          ? securityRelations.holdings || []
          : investmentEntityRelations.holdings || [];
      return (
        <TabComponent
          entity={entity}
          holdings={holdingsForContext}
          {...commonProps}
        />
      );
    }

    if (tabKey === 'compliance') {
      return (
        <TabComponent
          entity={entity}
          obligations={investmentEntityRelations.obligations || []}
          {...commonProps}
        />
      );
    }

    if (tabKey === 'board_seats') {
      return (
        <TabComponent
          entity={entity}
          boardSeats={investmentEntityRelations.boardSeats || []}
          holdings={investmentEntityRelations.holdings || []}
          requests={investmentEntityRelations.requests || []}
          {...commonProps}
        />
      );
    }

    if (tabKey === 'requests') {
      return (
        <TabComponent
          entity={entity}
          requests={investmentEntityRelations.requests || []}
          {...commonProps}
        />
      );
    }

    // Default: domain-specific tabs receive the entity and full domain data for flexibility
    return (
      <TabComponent
        entity={entity}
        data={currentData}
        domainConfig={currentConfig}
        {...commonProps}
      />
    );
  };

  return (
    <PageLayout
      breadcrumbs={breadcrumbItems.map(({ label, path }) => ({
        label,
        path: path ?? undefined,
      }))}
      mobileBottomOffset={64} // BottomTabBar height
      mobileHeaderContent={isMobile ? (
        <>
          {/* Entity Name + Tab Label */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '1.1rem',
                lineHeight: 1.2,
              }}
            >
              {entity.name}
            </Typography>
            {filteredTabs[activeTab]?.labelText && (
              <Typography
                variant="caption"
                sx={{
                  color: 'secondary.main',
                  fontSize: '0.75rem',
                  display: 'block',
                  mt: 0.75,
                  fontWeight: 500,
                }}
              >
                {filteredTabs[activeTab].labelText}
              </Typography>
            )}
          </Box>

          {/* Entity Image - only for assets with images */}
          {entityType === 'asset' && entity.image && (
            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <AssetAvatar
                name={entity.name}
                image={entity.image}
                variant="detail"
                containerSx={{ width: '100%', height: '100%' }}
                imageSx={{ objectFit: 'cover' }}
                avatarSx={{ fontSize: '1.25rem' }}
              />
            </Box>
          )}
        </>
      ) : null}
    >
      <Box
        sx={{
          ...(isMobile
            ? {
                // Mobile: Natural flow, no flex constraints
                display: 'flex',
                flexDirection: 'column',
                pt: 0,
                pb: 2, // Bottom padding for spacing before BottomTabBar
                px: 0,
              }
            : {
                // Desktop: Fill height with flex
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                pt: 0,
                pb: 2,
                pr: 1,
              }),
        }}
      >

        {/* Desktop Header Card - Hidden on mobile */}
        {!isMobile && (
          <Paper
            elevation={2}
            sx={{
              p: { xs: 1.5, sm: 2 },
              mb: 2,
              borderRadius: 2,
              flexShrink: 0,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: { xs: 1.5, sm: 2 }
            }}
          >

            {/* Entity Avatar/Image - only for assets */}
            {entityType === 'asset' && (
              <Box
                sx={{
                  width: { xs: 56, sm: 64 },
                  height: { xs: 56, sm: 64 },
                  flexShrink: 0,
                  alignSelf: { xs: 'center', sm: 'flex-start' },
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                }}
              >
                <AssetAvatar
                  name={entity.name}
                  image={entity.image}
                  variant="detail"
                  containerSx={{ width: '100%', height: '100%' }}
                  imageSx={{ objectFit: 'cover' }}
                  avatarSx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                />
              </Box>
            )}

            {/* Entity Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 0.5, sm: 1 }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ mb: 0.5 }}
              >
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: { xs: 'normal', sm: 'nowrap' },
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  {entity.name}
                </Typography>
              </Stack>
            </Box>

          </Paper>
        )}

        {/* Tabs Content Area */}
        <ContentPanel
          elevation={1}
          fullHeight={!isMobile} // Only fill height on desktop
          contentFlex={!isMobile} // Only flex on desktop
          sx={{
            borderRadius: '12px',
          }}
          contentSx={{
            pt: 0,
            px: { xs: 0, md: 2 },
            pb: { xs: 0, md: 2 },
          }}
        >
          {!isMobile && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                borderBottom: 1,
                borderColor: 'divider',
                mb: 0,
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  px: { xs: 1, sm: 2 },
                  flex: 1,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    minHeight: { xs: 44, sm: 48 },
                    px: { xs: 1, sm: 2 }
                  }
                }}
              >
            {filteredTabs.map((tabConfig, index) => (
                  <Tab
                    key={tabConfig.key}
                    label={tabConfig.label}
                    sx={{ py: 1.5 }}
                  />
                ))}
              </Tabs>

              {/* Lifecycle Status Filter - Show on non-info tabs */}
              {activeTab !== 0 && (
                <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mr: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>
                    {getUIText('lifecycle_status', language)}:
                  </Typography>
                  <Chip
                    label={getUIText('lifecycle_active', language)}
                    variant={activeFilters.lifecycleStatus === LIFECYCLE_STATUS.ACTIVE ? 'filled' : 'outlined'}
                    color={activeFilters.lifecycleStatus === LIFECYCLE_STATUS.ACTIVE ? 'primary' : 'default'}
                    size="small"
                    clickable
                    onClick={() => handleFilterChange('lifecycleStatus', LIFECYCLE_STATUS.ACTIVE)}
                    sx={{
                      fontSize: '0.75rem',
                      height: 28,
                      fontWeight: 500,
                      ...(activeFilters.lifecycleStatus === LIFECYCLE_STATUS.ACTIVE && {
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }),
                    }}
                  />
                  <Chip
                    label={getUIText('lifecycle_archived', language)}
                    variant={activeFilters.lifecycleStatus === LIFECYCLE_STATUS.ARCHIVED ? 'filled' : 'outlined'}
                    color={activeFilters.lifecycleStatus === LIFECYCLE_STATUS.ARCHIVED ? 'primary' : 'default'}
                    size="small"
                    clickable
                    onClick={() => handleFilterChange('lifecycleStatus', LIFECYCLE_STATUS.ARCHIVED)}
                    sx={{
                      fontSize: '0.75rem',
                      height: 28,
                      fontWeight: 500,
                      ...(activeFilters.lifecycleStatus === LIFECYCLE_STATUS.ARCHIVED && {
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }),
                    }}
                  />
                </Box>
              )}

              {/* Action Button - Edit for Info tab, Add for others */}
              <Tooltip title={activeTab === 0 ? "Editar" : "Agregar"}>
                <IconButton
                  size="small"
                  color="primary"
                  sx={{
                    mr: 1,
                    '&:hover': { bgcolor: 'primary.50' }
                  }}
                >
                  {activeTab === 0 ? (
                    <EditIcon fontSize="small" />
                  ) : (
                    <AddIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Tab Content */}
          <Box
            sx={{
              ...(isMobile
                ? {
                    // Mobile: Natural flow, no overflow constraints
                    display: 'block',
                  }
                : {
                    // Desktop: Fill height with internal scrolling
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }),
            }}
          >
            {renderTabContent()}
          </Box>
        </ContentPanel>

        {/* Bottom Tab Bar - Mobile only */}
        {isMobile && (
          <BottomTabBar
            tabs={filteredTabs}
            value={activeTab}
            onChange={handleTabChange}
          />
        )}
      </Box>
    </PageLayout>
  );
};

export default DetailView;

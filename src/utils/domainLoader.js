/**
 * Domain Data Loader
 *
 * Dynamically loads domain-specific data and schemas based on configuration.
 */

// Glob imports ensure Vite includes these files in the production bundle
const dataModules = import.meta.glob('../data/contexts/*/businesses/*/*.{js,mjs}');
const enrichmentModules = import.meta.glob('../data/contexts/*/enrichment/*.{js,mjs}');
const schemaModules = import.meta.glob('../data/contexts/*/schemas/*.{js,mjs}');

/**
 * Load domain data based on configuration
 *
 * @param {Object} domainConfig - Domain configuration object
 * @param {string} organizationId - Organization/business ID
 * @returns {Promise<Object>} Object with entity data arrays
 */
export const loadDomainData = async (domainConfig, organizationId) => {
  console.log(`[Loader] Loading data for domain: ${domainConfig.id}, org: ${organizationId}`);

  const { dataLoading } = domainConfig;

  if (!dataLoading) {
    throw new Error(`Domain config ${domainConfig.id} missing dataLoading configuration`);
  }

  const orgId =
    (dataLoading.organizationMap && dataLoading.organizationMap[organizationId]) ||
    organizationId ||
    dataLoading.defaultOrganization;

  if (!orgId) {
    throw new Error(`No organization ID provided and no default set for domain ${domainConfig.id}`);
  }

  const demoId =
    Object.entries(domainConfig.demos || {}).find(
      ([, demo]) => demo.organizationId === orgId || demo.businessId === organizationId
    )?.[0] || orgId;

  const schemaUsage =
    domainConfig.demos?.[demoId]?.schemaUsage || domainConfig.schemaUsage || null;

  const data = {};
  let loadedCount = 0;
  let failedCount = 0;

  // Load each entity's data based on config
  for (const [entityKey, sourceConfig] of Object.entries(dataLoading.sources)) {
    try {
      // Build module path
      const modulePath = `../data/contexts/${domainConfig.id}/${dataLoading.basePath}/${orgId}/${sourceConfig.file}`;
      const loader = dataModules[modulePath];

      if (!loader) {
        console.warn(
          `[Loader] No module found for ${entityKey} at ${modulePath}. ` +
            'Ensure the file is included in the build.'
        );
        data[entityKey] = [];
        failedCount++;
        continue;
      }

      console.log(`[Loader] Loading ${entityKey} from ${sourceConfig.file}`);

      // Dynamic import via Vite glob
      const module = await loader();

      // Extract the named export or default
      const entityData = module[sourceConfig.export] || module.default;

      if (!entityData) {
        console.warn(
          `[Loader] No export found for ${entityKey}. ` +
            `Expected: ${sourceConfig.export} in ${sourceConfig.file}`
        );
        data[entityKey] = [];
        failedCount++;
      } else {
        data[entityKey] = entityData;
        loadedCount++;
        console.log(`[Loader] Loaded ${entityData.length} ${entityKey} records`);
      }
    } catch (error) {
      console.warn(`[Loader] Failed to load ${entityKey} for domain ${domainConfig.id}:`, error.message);
      // Fallback to empty array
      data[entityKey] = [];
      failedCount++;
    }
  }

  console.log(`[Loader] Data loading complete: ${loadedCount} succeeded, ${failedCount} failed`);

  // Apply enrichment pipeline if configured
  if (dataLoading.enrichment && Array.isArray(dataLoading.enrichment)) {
    console.log(`[Loader] Applying ${dataLoading.enrichment.length} enrichment step(s)`);

    for (const step of dataLoading.enrichment) {
      try {
        const processorPath = `../data/contexts/${domainConfig.id}/${step.processor}`;
        const processorLoader = enrichmentModules[processorPath];

        if (!processorLoader) {
          console.warn(
            `[Loader] No enrichment module found at ${processorPath}. ` +
              'Ensure the file is included in the build.'
          );
          continue;
        }

        console.log(`[Loader] Running enrichment: ${step.processor}`);

        const processorModule = await processorLoader();

        const processor = processorModule[step.function] || processorModule.default;

        if (!processor || typeof processor !== 'function') {
          console.warn(`[Loader] Enrichment processor not found: ${step.function} in ${step.processor}`);
          continue;
        }

        // Apply enrichment (may modify multiple entity arrays)
        const enrichedData = processor(data, step.params || {});

        // Merge enriched data back
        Object.assign(data, enrichedData);

        console.log(`[Loader] Enrichment applied: ${step.processor}`);
      } catch (error) {
        console.warn(`[Loader] Failed to apply enrichment step: ${step.processor}`, error.message);
      }
    }
  }

  data.__meta = {
    demoId,
    organizationId: orgId,
    schemaUsage,
  };

  return data;
};

/**
 * Load entity schema for a domain
 *
 * @param {string} domainId - Domain ID
 * @param {string} schemaKey - Schema key/filename (without .js extension)
 * @returns {Promise<Object|null>} Schema object or null if not found
 */
export const loadEntitySchema = async (domainId, schemaKey) => {
  console.log(`[Loader] Loading schema: ${domainId}/${schemaKey}`);

  try {
    const modulePath = `../data/contexts/${domainId}/schemas/${schemaKey}.js`;
    const loader = schemaModules[modulePath];

    if (!loader) {
      console.warn(`[Loader] No schema module found at ${modulePath}`);
      return null;
    }

    const module = await loader();

    // Try multiple export patterns
    const schema = module.default || module[`${schemaKey}Schema`] || module.schema;

    if (!schema) {
      console.warn(
        `[Loader] No schema export found in ${schemaKey}.js. ` + `Tried: default, ${schemaKey}Schema, schema`
      );
      return null;
    }

    console.log(`[Loader] Schema loaded: ${domainId}/${schemaKey}`);
    return schema;
  } catch (error) {
    console.warn(`[Loader] Failed to load schema ${schemaKey} for domain ${domainId}:`, error.message);
    return null;
  }
};

/**
 * Preload all schemas for a domain
 *
 * @param {Object} domainConfig - Domain configuration
 * @returns {Promise<Map<string, Object>>} Map of schema key to schema object
 */
export const preloadDomainSchemas = async (domainConfig) => {
  console.log(`[Loader] Preloading schemas for domain: ${domainConfig.id}`);

  const schemas = new Map();

  // Get all unique schema keys from entity configs
  const schemaKeys = new Set();

  Object.values(domainConfig.entities || {}).forEach((entityConfig) => {
    if (entityConfig.schemaKey) {
      schemaKeys.add(entityConfig.schemaKey);
    }
  });

  // Always try to load shared field types if present
  schemaKeys.add('fieldTypes');

  // Load all schemas in parallel
  const loadPromises = Array.from(schemaKeys).map(async (schemaKey) => {
    const schema = await loadEntitySchema(domainConfig.id, schemaKey);
    if (schema) {
      schemas.set(schemaKey, schema);
    }
  });

  await Promise.all(loadPromises);

  console.log(`[Loader] Preloaded ${schemas.size} schema(s)`);
  return schemas;
};

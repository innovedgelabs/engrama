/**
 * Domain Registry
 *
 * Central registry for all available domain contexts.
 * Handles dynamic loading of domain configurations.
 */

/**
 * Domain IDs enum
 */
export const DOMAIN_IDS = {
  REGULATORY_AFFAIRS: 'regulatory_affairs',
  PENSION_FUND: 'pension_fund',
};

/**
 * In-memory registry of domain configurations
 * @type {Map<string, Object>}
 */
export const domainRegistry = new Map();

/**
 * Vite glob import of all domain config files so they get bundled.
 * Keys look like "../data/contexts/<domainId>/domainConfig.js"
 */
const domainConfigModules = import.meta.glob('../data/contexts/*/domainConfig.js');

/**
 * Register a domain configuration
 * @param {Object} config - Domain configuration object
 * @throws {Error} If config is invalid
 */
export const registerDomain = (config) => {
  if (!config || !config.id || !config.name) {
    throw new Error('Domain config must have id and name properties');
  }

  if (domainRegistry.has(config.id)) {
    console.warn(`Domain ${config.id} is already registered. Overwriting.`);
  }

  domainRegistry.set(config.id, config);
  console.log(`[Registry] Registered domain: ${config.id}`);
};

/**
 * Get all registered domains
 * @returns {Array<Object>} Array of domain configurations
 */
export const getAvailableDomains = () => {
  return Array.from(domainRegistry.values());
};

/**
 * Get specific domain configuration
 * @param {string} domainId - Domain ID
 * @returns {Object|undefined} Domain configuration or undefined
 */
export const getDomainConfig = (domainId) => {
  return domainRegistry.get(domainId);
};

/**
 * Check if domain is registered
 * @param {string} domainId - Domain ID
 * @returns {boolean} True if domain is registered
 */
export const isDomainRegistered = (domainId) => {
  return domainRegistry.has(domainId);
};

/**
 * Load domain configuration dynamically
 *
 * @param {string} domainId - Domain ID to load
 * @returns {Promise<Object>} Domain configuration
 * @throws {Error} If domain config file not found or invalid
 */
export const loadDomainConfig = async (domainId) => {
  console.log(`[Registry] Loading domain config: ${domainId}`);

  const modulePath = `../data/contexts/${domainId}/domainConfig.js`;
  const loader = domainConfigModules[modulePath];

  if (!loader) {
    throw new Error(
      `No domain config found for "${domainId}". ` +
        `Make sure the file exists at: src/data/contexts/${domainId}/domainConfig.js`
    );
  }

  try {
    const module = await loader();

    // Extract config (support both named and default exports)
    const config = module.domainConfig || module.default;

    if (!config) {
      throw new Error(`Domain config module for ${domainId} has no export`);
    }

    // Validate config
    if (!config.id || !config.name) {
      throw new Error(`Invalid domain config for ${domainId}: missing id or name`);
    }

    // Auto-register the loaded config
    registerDomain(config);

    console.log(`[Registry] Successfully loaded domain: ${domainId}`);
    return config;
  } catch (error) {
    console.error(`[Registry] Failed to load domain config: ${domainId}`, error);
    throw new Error(
      `Failed to load domain configuration for "${domainId}". ` +
        `Make sure the file exists at: src/data/contexts/${domainId}/domainConfig.js`
    );
  }
};

/**
 * Clear all registered domains (useful for testing)
 */
export const clearRegistry = () => {
  domainRegistry.clear();
  console.log('[Registry] Cleared all registered domains');
};

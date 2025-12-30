import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { preloadDomainSchemas, loadEntitySchema } from '../utils/domainLoader';
import { setActiveDomainI18n } from '../utils/i18nHelpers';

const DomainContext = createContext(null);

const normalizeDomainData = (data = {}, domainConfig) => {
  if (!data || typeof data !== 'object') return {};

  const sources = domainConfig?.dataLoading?.sources || {};
  const normalized = { ...data };

  Object.keys(sources).forEach((sourceKey) => {
    const value = data[sourceKey];
    const normalizedValue = Array.isArray(value) ? value : value ?? [];
    normalized[sourceKey] = normalizedValue;
  });

  return normalized;
};

/**
 * DomainProvider - Manages domain configuration and state
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.initialDomainId - Initial domain to load (default: 'regulatory_affairs')
 * @param {Object|null} props.initialConfig - Preloaded domain config to register immediately
 * @param {Object|null} props.initialData - Preloaded domain data to store for the initial domain
 */
export const DomainProvider = ({
  children,
  initialDomainId = 'regulatory_affairs',
  initialConfig = null,
  initialData = null,
}) => {
  // Current domain ID (e.g., 'regulatory_affairs', 'pension_fund')
  const [currentDomainId, setCurrentDomainId] = useState(initialDomainId || initialConfig?.id || 'regulatory_affairs');

  // Map of domain IDs to their configurations
  const [domainConfigs, setDomainConfigs] = useState(() => {
    const map = new Map();
    if (initialConfig?.id) {
      map.set(initialConfig.id, initialConfig);
    }
    return map;
  });

  // Map of domain data keyed by domain id
  const [domainDataById, setDomainDataById] = useState(() => {
    const map = new Map();
    if (initialConfig?.id && initialData) {
      map.set(initialConfig.id, normalizeDomainData(initialData, initialConfig));
    }
    return map;
  });

  // Map of domainId -> Map<schemaKey, schemaObject>
  const [domainSchemasById, setDomainSchemasById] = useState(() => new Map());
  const lastInitialDomainIdRef = useRef(null);

  // Get current domain configuration
  const currentConfig = useMemo(
    () => domainConfigs.get(currentDomainId),
    [currentDomainId, domainConfigs]
  );

  // Get current domain data
  const currentData = useMemo(
    () => domainDataById.get(currentDomainId),
    [currentDomainId, domainDataById]
  );

  /**
   * Register a domain configuration
   * @param {Object} config - Domain configuration object
   */
  const registerDomain = useCallback((config) => {
    if (!config || !config.id || !config.name) {
      console.error('Invalid domain config:', config);
      throw new Error('Domain config must have id and name properties');
    }

    setDomainConfigs((prev) => {
      const newMap = new Map(prev);
      newMap.set(config.id, config);
      return newMap;
    });

    // Preload schemas for this domain so consumers can synchronously access them
    preloadDomainSchemas(config)
      .then((schemas) => {
        setDomainSchemasById((prev) => {
          const next = new Map(prev);
          next.set(config.id, schemas);
          return next;
        });
      })
      .catch((error) => {
        console.warn(`[Domain] Failed to preload schemas for ${config.id}:`, error.message);
      });

    console.log(`[Domain] Registered domain: ${config.id}`);
  }, []);

  /**
   * Store data for a domain
   * @param {string} domainId
   * @param {Object} data
   */
  const setDomainData = useCallback((domainId, data, configOverride = null) => {
    if (!domainId) return;
    const configForDomain = configOverride || domainConfigs.get(domainId);
    setDomainDataById((prev) => {
      const next = new Map(prev);
      next.set(domainId, normalizeDomainData(data, configForDomain));
      return next;
    });
  }, [domainConfigs]);

  /**
   * Store a single schema for a domain (e.g., loaded on-demand)
   * @param {string} domainId
   * @param {string} schemaKey
   * @param {Object} schema
   */
  const cacheDomainSchema = useCallback((domainId, schemaKey, schema) => {
    if (!domainId || !schemaKey || !schema) return;
    setDomainSchemasById((prev) => {
      const next = new Map(prev);
      const map = new Map(next.get(domainId) || []);
      map.set(schemaKey, schema);
      next.set(domainId, map);
      return next;
    });
  }, []);

  /**
   * Switch to a different domain
   * @param {string} domainId - ID of domain to switch to
   */
  const switchDomain = useCallback(
    (domainId) => {
      if (!domainConfigs.has(domainId)) {
        console.error(`Domain not found: ${domainId}`);
        return;
      }

      console.log(`[Domain] Switching to domain: ${domainId}`);
      setCurrentDomainId(domainId);
    },
    [domainConfigs]
  );

  /**
   * Get primary entity configuration for current domain
   * @returns {Object|null} Primary entity config
   */
  const getPrimaryEntity = useCallback(() => {
    if (!currentConfig?.entities || !currentConfig?.routing?.primaryEntity) {
      return null;
    }
    return currentConfig.entities[currentConfig.routing.primaryEntity];
  }, [currentConfig]);

  /**
   * Get configuration for a specific entity type
   * @param {string} entityType - Entity type key
   * @returns {Object|null} Entity configuration
   */
  const getEntityConfig = useCallback(
    (entityType) => {
      if (!currentConfig?.entities) {
        return null;
      }
      return currentConfig.entities[entityType] || null;
    },
    [currentConfig]
  );

  /**
   * Get schema key for an entity type
   * @param {string} entityType - Entity type
   * @returns {string} Schema key to use for loading
   */
  const getSchemaKey = useCallback(
    (entityType) => {
      const entityConfig = getEntityConfig(entityType);
      return entityConfig?.schemaKey || entityType;
    },
    [getEntityConfig]
  );

  const getSchemaFromCache = useCallback(
    (domainId, schemaKey) => {
      const map = domainSchemasById.get(domainId);
      if (!map) return null;
      return (
        map.get(schemaKey) || null
      );
    },
    [domainSchemasById],
  );

  /**
   * Get schema object by entity type or schema key
   * @param {string} typeOrKey - Entity type or schema key
   * @returns {Object|null} Schema object
   */
  const getSchema = useCallback(
    (typeOrKey) => {
      const schemaKey = getSchemaKey(typeOrKey);
      const cached = getSchemaFromCache(currentDomainId, schemaKey);
      if (cached) return cached;

      // Attempt to load on-demand and cache; returns null until loaded
      const config = domainConfigs.get(currentDomainId);
      if (config) {
        loadEntitySchema(currentDomainId, schemaKey)
          .then((schema) => {
            if (schema) {
              cacheDomainSchema(currentDomainId, schemaKey, schema);
            }
          })
          .catch((error) =>
            console.warn(`[Domain] Failed to load schema ${schemaKey} for ${currentDomainId}:`, error.message),
          );
      }
      return null;
    },
    [cacheDomainSchema, currentDomainId, domainConfigs, getSchemaFromCache, getSchemaKey],
  );

  const getDomainData = useCallback(
    (domainId) => domainDataById.get(domainId ?? currentDomainId),
    [domainDataById, currentDomainId]
  );

  // Context value
  const value = useMemo(
    () => ({
      // State
      currentDomainId,
      currentConfig,
      currentData,
      availableDomains: Array.from(domainConfigs.values()),

      // Actions
      registerDomain,
      switchDomain,
      setDomainData,

      // Helper functions
      getPrimaryEntity,
      getEntityConfig,
      getSchemaKey,
      getSchema,
      getDomainData,
    }),
    [
      currentDomainId,
      currentConfig,
      currentData,
      domainConfigs,
      registerDomain,
      switchDomain,
      setDomainData,
      getPrimaryEntity,
      getEntityConfig,
      getSchemaKey,
      getSchema,
      getDomainData,
    ]
  );

  // Register any provided initial config/data
  useEffect(() => {
    const initialId = initialConfig?.id;
    if (!initialId || lastInitialDomainIdRef.current === initialId) {
      return;
    }

    registerDomain(initialConfig);
    if (initialData) {
      setDomainData(initialId, initialData, initialConfig);
    }
    setCurrentDomainId((prev) => prev || initialId);
    lastInitialDomainIdRef.current = initialId;
  }, [initialConfig, initialData, registerDomain, setDomainData]);

  // Keep currentDomainId in sync if the parent provides a new initialDomainId
  useEffect(() => {
    if (initialDomainId && initialDomainId !== currentDomainId) {
      setCurrentDomainId(initialDomainId);
    }
  }, [initialDomainId, currentDomainId]);

  useEffect(() => {
    if (currentConfig) {
      setActiveDomainI18n(currentConfig);
    }
  }, [currentConfig]);

  return <DomainContext.Provider value={value}>{children}</DomainContext.Provider>;
};

/**
 * useDomain - Hook to access domain context
 * @returns {Object} Domain context value
 * @throws {Error} If used outside DomainProvider
 */
export const useDomain = () => {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error('useDomain must be used within DomainProvider');
  }
  return context;
};

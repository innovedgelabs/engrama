/**
 * Entity ID Utility Functions
 * 
 * Standardizes entity IDs to use:
 * - LEI-{LEI} format for entities with a Legal Entity Identifier
 * - ENTITY-{id} format for private entities without LEI
 * 
 * Securities link to entities via entity_id using these standardized formats.
 */

// Prefixes for standardized IDs
export const ID_PREFIX = {
  LEI: 'LEI-',
  ENTITY: 'ENTITY-',
};

/**
 * Generate a standardized entity ID from an entity object
 * @param {Object} entity - Entity object with optional lei field
 * @returns {string} Standardized ID (LEI-{value} or ENTITY-{id})
 */
export const normalizeEntityId = (entity) => {
  if (!entity) {
    return null;
  }

  // If entity has LEI, use LEI-{lei} format
  if (entity.lei) {
    return `${ID_PREFIX.LEI}${entity.lei}`;
  }

  // Extract numeric part from existing ID if it exists (e.g., ENTITY-001 -> 001)
  if (entity.id) {
    const existingId = entity.id;
    
    // If already in correct format, return as is
    if (existingId.startsWith(ID_PREFIX.LEI) || existingId.startsWith(ID_PREFIX.ENTITY)) {
      return existingId;
    }
    
    // Extract the numeric/identifier part from old format
    const match = existingId.match(/^ENTITY-(.+)$/);
    if (match) {
      return `${ID_PREFIX.ENTITY}${match[1]}`;
    }
    
    // For other formats, use the full ID
    return `${ID_PREFIX.ENTITY}${existingId}`;
  }

  return null;
};

/**
 * Parse a standardized entity ID to extract its type and value
 * @param {string} id - Standardized entity ID
 * @returns {Object} { type: 'LEI' | 'ENTITY', value: string } or null if invalid
 */
export const parseEntityId = (id) => {
  if (!id || typeof id !== 'string') {
    return null;
  }

  if (id.startsWith(ID_PREFIX.LEI)) {
    return {
      type: 'LEI',
      value: id.substring(ID_PREFIX.LEI.length),
    };
  }

  if (id.startsWith(ID_PREFIX.ENTITY)) {
    return {
      type: 'ENTITY',
      value: id.substring(ID_PREFIX.ENTITY.length),
    };
  }

  // Legacy format - assume it's an entity ID
  return {
    type: 'ENTITY',
    value: id,
  };
};

/**
 * Check if an ID is in LEI format
 * @param {string} id - Entity ID to check
 * @returns {boolean} True if ID starts with LEI- prefix
 */
export const isLeiId = (id) => {
  return typeof id === 'string' && id.startsWith(ID_PREFIX.LEI);
};

/**
 * Check if an ID is in ENTITY format
 * @param {string} id - Entity ID to check
 * @returns {boolean} True if ID starts with ENTITY- prefix
 */
export const isEntityId = (id) => {
  return typeof id === 'string' && id.startsWith(ID_PREFIX.ENTITY);
};

/**
 * Extract LEI value from a LEI-prefixed ID
 * @param {string} id - Entity ID (LEI-{value} format)
 * @returns {string|null} LEI value or null if not a LEI ID
 */
export const extractLeiFromId = (id) => {
  if (!isLeiId(id)) {
    return null;
  }
  return id.substring(ID_PREFIX.LEI.length);
};

/**
 * Extract entity identifier from an ENTITY-prefixed ID
 * @param {string} id - Entity ID (ENTITY-{value} format)
 * @returns {string|null} Entity identifier value or null if not an ENTITY ID
 */
export const extractEntityIdValue = (id) => {
  if (!isEntityId(id)) {
    return null;
  }
  return id.substring(ID_PREFIX.ENTITY.length);
};

/**
 * Convert an old entity ID to the new standardized format using a lookup map
 * @param {string} oldId - Old entity ID (e.g., ENTITY-001)
 * @param {Map<string, string>} idMap - Map of old IDs to new standardized IDs
 * @returns {string} New standardized ID or original if not found
 */
export const convertEntityId = (oldId, idMap) => {
  if (!oldId || !idMap) {
    return oldId;
  }
  return idMap.get(oldId) || oldId;
};

/**
 * Build a mapping of old entity IDs to new standardized IDs
 * @param {Array} entities - Array of entity objects with id and optional lei fields
 * @returns {Map<string, string>} Map of old IDs to new standardized IDs
 */
export const buildEntityIdMap = (entities) => {
  const idMap = new Map();
  
  if (!entities || !Array.isArray(entities)) {
    return idMap;
  }

  entities.forEach((entity) => {
    if (!entity || !entity.id) {
      return;
    }
    
    const newId = normalizeEntityId(entity);
    if (newId && newId !== entity.id) {
      idMap.set(entity.id, newId);
    }
  });

  return idMap;
};

/**
 * Get the entity type based on ID format
 * @param {string} id - Entity ID
 * @returns {'LEI' | 'private' | null} Entity type
 */
export const getEntityTypeFromId = (id) => {
  if (isLeiId(id)) {
    return 'LEI';
  }
  if (isEntityId(id)) {
    return 'private';
  }
  return null;
};


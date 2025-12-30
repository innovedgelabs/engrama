/**
 * Request Utility Functions
 * 
 * Helper functions for request calculations and lookups
 */

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {Date} date - Date to check
 * @returns {boolean} True if weekend
 */
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

/**
 * Add business days to a date (excluding weekends)
 * @param {Date} startDate - Starting date
 * @param {number} businessDays - Number of business days to add
 * @returns {Date} New date with business days added
 */
const addBusinessDays = (startDate, businessDays) => {
  const result = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < businessDays) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result)) {
      daysAdded++;
    }
  }

  return result;
};

/**
 * Calculate due date based on submission date and urgency level
 * SLA Rules:
 * - URGENT: 4 hours from submission
 * - HIGH: 1 business day (excluding weekends)
 * - NORMAL: 3 business days (excluding weekends)
 * 
 * @param {string|Date} submittedAt - Submission date/time (ISO string or Date object)
 * @param {string} urgency - Urgency level: 'urgent', 'high', or 'normal'
 * @returns {Date|null} Calculated due date, or null if invalid input
 */
export const calculateDueDate = (submittedAt, urgency) => {
  if (!submittedAt || !urgency) {
    return null;
  }

  const submissionDate = submittedAt instanceof Date ? submittedAt : new Date(submittedAt);
  
  if (isNaN(submissionDate.getTime())) {
    console.warn('[requestUtils] Invalid submission date:', submittedAt);
    return null;
  }

  const dueDate = new Date(submissionDate);

  switch (urgency.toLowerCase()) {
    case 'urgent':
      // 4 hours from submission
      dueDate.setHours(dueDate.getHours() + 4);
      break;

    case 'high':
      // 1 business day (excluding weekends)
      dueDate.setHours(17, 0, 0, 0); // End of business day (5 PM)
      const highDueDate = addBusinessDays(dueDate, 1);
      // If submission was after 5 PM, add one more business day
      if (submissionDate.getHours() >= 17) {
        return addBusinessDays(highDueDate, 1);
      }
      return highDueDate;

    case 'normal':
      // 3 business days (excluding weekends)
      dueDate.setHours(17, 0, 0, 0); // End of business day (5 PM)
      const normalDueDate = addBusinessDays(dueDate, 3);
      // If submission was after 5 PM, add one more business day
      if (submissionDate.getHours() >= 17) {
        return addBusinessDays(normalDueDate, 1);
      }
      return normalDueDate;

    default:
      console.warn('[requestUtils] Unknown urgency level:', urgency);
      return null;
  }

  return dueDate;
};

/**
 * Check if a request is overdue
 * @param {string|Date} dueDate - Due date (ISO string or Date object)
 * @returns {boolean} True if overdue, false otherwise
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) {
    return false;
  }

  const due = dueDate instanceof Date ? dueDate : new Date(dueDate);
  
  if (isNaN(due.getTime())) {
    return false;
  }

  const now = new Date();
  return now > due;
};

/**
 * Get entity LEI by looking up counterparty ID in investment entities
 * 
 * Supports standardized entity ID formats:
 * - LEI-{value} format: extracts LEI directly from the ID
 * - ENTITY-{id} format: looks up entity by ID and returns its LEI (if any)
 * 
 * @param {string} counterpartyId - Entity ID to lookup (LEI-{value} or ENTITY-{id} format)
 * @param {Array} entities - Array of investment entities
 * @returns {string|null} LEI if found, null otherwise
 */
export const getEntityLei = (counterpartyId, entities) => {
  if (!counterpartyId) {
    return null;
  }

  // If ID is in LEI-{value} format, extract LEI directly
  if (counterpartyId.startsWith('LEI-')) {
    return counterpartyId.substring(4); // Remove 'LEI-' prefix
  }

  // Otherwise, lookup entity by ID and return its LEI
  if (!entities || !Array.isArray(entities)) {
    return null;
  }

  const entity = entities.find((e) => e.id === counterpartyId);
  return entity?.lei || null;
};

/**
 * Get entity identifiers with priority: ISIN > LEI > Ticker > ID
 * Returns the best available identifier along with its type
 *
 * @param {string} counterpartyId - Entity ID from request
 * @param {Array} entities - Array of investment entities
 * @param {Array} securities - Array of securities (optional, for ISIN/CUSIP lookup)
 * @returns {Object} { identifier: string, type: 'ISIN'|'LEI'|'TICKER'|'ID' }
 */
export const getEntityIdentifier = (counterpartyId, entities, securities = []) => {
  if (!counterpartyId) {
    return { identifier: null, type: null };
  }

  // Find entity
  const entity = entities?.find((e) => e.id === counterpartyId);

  // Try to find ISIN from securities linked to this entity
  if (securities?.length > 0) {
    const entitySecurity = securities.find((s) => s.entity_id === counterpartyId && s.isin);
    if (entitySecurity?.isin) {
      return { identifier: entitySecurity.isin, type: 'ISIN' };
    }
    // Try CUSIP if no ISIN
    const entitySecurityCusip = securities.find((s) => s.entity_id === counterpartyId && s.cusip);
    if (entitySecurityCusip?.cusip) {
      return { identifier: entitySecurityCusip.cusip, type: 'CUSIP' };
    }
  }

  // Check for LEI
  if (counterpartyId.startsWith('LEI-')) {
    return { identifier: counterpartyId.substring(4), type: 'LEI' };
  }
  if (entity?.lei) {
    return { identifier: entity.lei, type: 'LEI' };
  }

  // Check for ticker
  if (entity?.ticker) {
    return { identifier: entity.ticker, type: 'TICKER' };
  }

  // Fallback to entity ID
  return { identifier: counterpartyId, type: 'ID' };
};

/**
 * Format due date for display
 * For urgent requests, show time. For others, show date.
 * @param {Date} dueDate - Due date
 * @param {string} urgency - Urgency level
 * @returns {string} Formatted date string
 */
export const formatDueDate = (dueDate, urgency) => {
  if (!dueDate) {
    return '';
  }

  const date = dueDate instanceof Date ? dueDate : new Date(dueDate);
  
  if (isNaN(date.getTime())) {
    return '';
  }

  if (urgency === 'urgent') {
    // Show time for urgent requests
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  // Show date for high/normal requests
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Parse estimated value string to number
 * Strips non-numeric characters (except decimal point and minus sign) before parsing
 * @param {string} valueString - Value string (e.g., "$1,234.56", "1234.56")
 * @returns {number|null} Parsed number, or null if invalid
 */
export const parseEstimatedValue = (valueString) => {
  if (!valueString || typeof valueString !== 'string') {
    return null;
  }

  // Strip all characters except digits, decimal point, and minus sign
  const cleaned = valueString.replace(/[^0-9.-]/g, '');

  if (!cleaned) {
    return null;
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};



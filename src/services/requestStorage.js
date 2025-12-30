/**
 * Request Storage Service
 * 
 * Manages dynamic requests stored in localStorage, separate from hardcoded demo data.
 * All requests are stored with domain-specific key to support future multi-domain support.
 */

const STORAGE_KEY = 'pension_fund_requests';

/**
 * Generate a unique ID for dynamic requests
 * Format: REQ-{4-5 digit number}
 * Uses a combination of sequential counter and random digits for uniqueness
 * @returns {string} Unique request ID
 */
const generateRequestId = () => {
  // Get existing IDs to find next sequence number
  const existingRequests = getDynamicRequestsRaw();
  const existingIds = existingRequests.map((r) => r.id).filter(Boolean);

  // Extract numeric parts from existing REQ-XXXX IDs
  const existingNumbers = existingIds
    .map((id) => {
      const match = id.match(/^REQ-(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n) => n !== null);

  // Start from 1000, increment from highest existing, add small random offset
  const baseNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1000;
  const randomOffset = Math.floor(Math.random() * 9); // 0-8 random offset
  const nextNumber = baseNumber + randomOffset;

  return `REQ-${nextNumber}`;
};

/**
 * Internal function to get dynamic requests without adding _source flag
 * Used by generateRequestId to avoid circular dependency issues
 * @returns {Array<Object>} Array of request objects
 */
const getDynamicRequestsRaw = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const requests = JSON.parse(stored);
    return Array.isArray(requests) ? requests : [];
  } catch (error) {
    return [];
  }
};

/**
 * Validate request structure matches expected schema
 * @param {Object} request - Request object to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateRequest = (request) => {
  if (!request || typeof request !== 'object') {
    return false;
  }

  // Required fields
  const requiredFields = [
    'request_type',
    'counterparty_id',
    'counterparty_name',
    'investment_program',
    'submitted_by',
    'submitted_at',
    'office_location',
    'urgency',
    'purpose',
    'workflow_status',
  ];

  for (const field of requiredFields) {
    if (!(field in request)) {
      console.warn(`[requestStorage] Missing required field: ${field}`);
      return false;
    }
  }

  // Validate request_type
  const validTypes = ['NDA', 'MNPI', 'INFO_SHARING', 'NRL'];
  if (!validTypes.includes(request.request_type)) {
    console.warn(`[requestStorage] Invalid request_type: ${request.request_type}`);
    return false;
  }

  // Validate workflow_status
  const validStatuses = ['draft', 'submitted', 'in_review', 'approved', 'rejected', 'needs_info'];
  if (!validStatuses.includes(request.workflow_status)) {
    console.warn(`[requestStorage] Invalid workflow_status: ${request.workflow_status}`);
    return false;
  }

  // Validate urgency
  const validUrgencies = ['normal', 'high', 'urgent'];
  if (!validUrgencies.includes(request.urgency)) {
    console.warn(`[requestStorage] Invalid urgency: ${request.urgency}`);
    return false;
  }

  return true;
};

/**
 * Get all dynamic requests from localStorage
 * @returns {Array<Object>} Array of request objects
 */
export const getDynamicRequests = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const requests = JSON.parse(stored);
    if (!Array.isArray(requests)) {
      console.warn('[requestStorage] Stored data is not an array, returning empty array');
      return [];
    }

    // Ensure all requests have _source flag
    return requests.map((req) => ({
      ...req,
      _source: 'dynamic',
    }));
  } catch (error) {
    console.warn('[requestStorage] Error reading from localStorage:', error.message);
    return [];
  }
};

/**
 * Get a single request by ID
 * @param {string} requestId - Request ID to find
 * @returns {Object|null} Request object or null if not found
 */
export const getRequestById = (requestId) => {
  if (!requestId) {
    return null;
  }

  const requests = getDynamicRequests();
  return requests.find((req) => req.id === requestId) || null;
};

/**
 * Get requests filtered by entity (counterparty_id)
 * @param {string} entityId - Entity ID to filter by
 * @returns {Array<Object>} Array of matching requests
 */
export const getRequestsByEntity = (entityId) => {
  if (!entityId) {
    return [];
  }

  const requests = getDynamicRequests();
  return requests.filter((req) => req.counterparty_id === entityId);
};

/**
 * Get requests filtered by workflow status
 * @param {string} status - Workflow status to filter by
 * @returns {Array<Object>} Array of matching requests
 */
export const getRequestsByStatus = (status) => {
  if (!status) {
    return [];
  }

  const requests = getDynamicRequests();
  return requests.filter((req) => req.workflow_status === status);
};

/**
 * Get requests filtered by request type
 * @param {string} type - Request type to filter by (NDA, MNPI, etc.)
 * @returns {Array<Object>} Array of matching requests
 */
export const getRequestsByType = (type) => {
  if (!type) {
    return [];
  }

  const requests = getDynamicRequests();
  return requests.filter((req) => req.request_type === type);
};

/**
 * Save a new request or update existing one
 * Auto-generates ID if missing (for new requests)
 * @param {Object} request - Request object to save
 * @returns {boolean} True if successful, false otherwise
 */
export const saveRequest = (request) => {
  if (!request) {
    console.warn('[requestStorage] Cannot save: request is null or undefined');
    return false;
  }

  // Validate request structure
  if (!validateRequest(request)) {
    console.warn('[requestStorage] Cannot save: request validation failed');
    return false;
  }

  try {
    const requests = getDynamicRequests();

    // Generate ID if missing (new request)
    let requestToSave = { ...request };
    if (!requestToSave.id) {
      requestToSave.id = generateRequestId();
    }

    // Ensure _source flag is set
    requestToSave._source = 'dynamic';

    // Check if request with this ID already exists
    const existingIndex = requests.findIndex((req) => req.id === requestToSave.id);

    if (existingIndex >= 0) {
      // Update existing request
      requests[existingIndex] = requestToSave;
    } else {
      // Add new request
      requests.push(requestToSave);
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    return true;
  } catch (error) {
    console.warn('[requestStorage] Error saving request:', error.message);
    return false;
  }
};

/**
 * Update an existing request by ID
 * @param {string} requestId - ID of request to update
 * @param {Object} updates - Partial request object with fields to update
 * @returns {boolean} True if successful, false otherwise
 */
export const updateRequest = (requestId, updates) => {
  if (!requestId) {
    console.warn('[requestStorage] Cannot update: requestId is required');
    return false;
  }

  if (!updates || typeof updates !== 'object') {
    console.warn('[requestStorage] Cannot update: updates must be an object');
    return false;
  }

  try {
    const requests = getDynamicRequests();
    const existingIndex = requests.findIndex((req) => req.id === requestId);

    if (existingIndex < 0) {
      console.warn(`[requestStorage] Cannot update: request ${requestId} not found`);
      return false;
    }

    // Merge updates with existing request
    const updatedRequest = {
      ...requests[existingIndex],
      ...updates,
      id: requestId, // Prevent ID changes
      _source: 'dynamic', // Maintain source flag
    };

    // Validate updated request
    if (!validateRequest(updatedRequest)) {
      console.warn('[requestStorage] Cannot update: validation failed after merge');
      return false;
    }

    // Save updated request
    requests[existingIndex] = updatedRequest;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    return true;
  } catch (error) {
    console.warn('[requestStorage] Error updating request:', error.message);
    return false;
  }
};

/**
 * Delete a request by ID
 * @param {string} requestId - ID of request to delete
 * @returns {boolean} True if successful, false otherwise
 */
export const deleteRequest = (requestId) => {
  if (!requestId) {
    console.warn('[requestStorage] Cannot delete: requestId is required');
    return false;
  }

  try {
    const requests = getDynamicRequests();
    const filteredRequests = requests.filter((req) => req.id !== requestId);

    if (filteredRequests.length === requests.length) {
      console.warn(`[requestStorage] Cannot delete: request ${requestId} not found`);
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRequests));
    return true;
  } catch (error) {
    console.warn('[requestStorage] Error deleting request:', error.message);
    return false;
  }
};

/**
 * Clear all dynamic requests from localStorage
 * Useful for testing or reset functionality
 * @returns {boolean} True if successful, false otherwise
 */
export const clearAllDynamicRequests = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn('[requestStorage] Error clearing requests:', error.message);
    return false;
  }
};


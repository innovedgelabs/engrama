/**
 * Renewal Utility Functions
 *
 * Shared functions for working with renewal objects across the application.
 */

/**
 * Gets a comparable timestamp from a renewal object for sorting purposes.
 * Uses the most recent date available in priority order:
 * 1. approvalDate (when authority approved)
 * 2. submissionDate (when submitted to authority)
 * 3. expiryDate (when it expires)
 * 4. 0 (fallback for renewals with no dates)
 *
 * @param {Object} renewal - Renewal object with date fields
 * @returns {number} Unix timestamp in milliseconds
 */
export const getComparableRenewalDate = (renewal) =>
  new Date(
    renewal.approvalDate ||
    renewal.submissionDate ||
    renewal.expiryDate ||
    0
  ).getTime();

/**
 * Dashboard Calculations & Data Aggregation
 *
 * Legacy utilities for ControlPanelView (renewals-based).
 * Most functions removed - only keeping what's actively used.
 */

import { calculateComplianceStatus, COMPLIANCE_STATUS } from './status';

/**
 * Calculate days until expiry
 *
 * @param {string} expiryDate - ISO date string
 * @param {Date} referenceDate - Reference date for calculation
 * @returns {number} Days until expiry (negative if expired)
 */
export function calculateDaysUntilExpiry(expiryDate, referenceDate = new Date()) {
  if (!expiryDate) return Infinity; // Permanent

  const expiry = new Date(expiryDate);
  const reference = new Date(referenceDate);
  const diffTime = expiry - reference;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Group renewals by urgency (urgent, upcoming, future)
 *
 * @param {Array} renewals - Array of renewal objects
 * @param {Date} referenceDate - Reference date for calculation
 * @returns {Object} Renewals grouped by urgency
 */
export function groupRenewalsByUrgency(renewals, referenceDate = new Date()) {
  const groups = {
    urgent: [],      // In alert period (expiring or expired)
    upcoming: [],    // Next 90 days (not yet in alert period)
    future: [],      // 90+ days
  };

  renewals.forEach(renewal => {
    const status = renewal.complianceStatus || calculateComplianceStatus(renewal, referenceDate);
    const daysUntilExpiry = calculateDaysUntilExpiry(renewal.expiryDate, referenceDate);
    const reminderDays = renewal.reminderDays || 30;
    const daysUntilAlert = daysUntilExpiry - reminderDays;

    if (status === COMPLIANCE_STATUS.EXPIRING || status === COMPLIANCE_STATUS.EXPIRED) {
      groups.urgent.push(renewal);
    } else if (daysUntilAlert <= 90) {
      groups.upcoming.push(renewal);
    } else {
      groups.future.push(renewal);
    }
  });

  return groups;
}

/**
 * Aggregate dashboard statistics
 *
 * NOTE: This is legacy code for ControlPanelView. Only urgencyGroups is used.
 * Other properties are calculated but never accessed.
 *
 * @param {Array} renewals - Array of all renewal objects
 * @param {Date} referenceDate - Reference date for calculations
 * @returns {Object} Object with urgencyGroups property
 */
export function aggregateDashboardStats(renewals, referenceDate = new Date()) {
  const urgencyGroups = groupRenewalsByUrgency(renewals, referenceDate);

  return {
    urgencyGroups,
  };
}

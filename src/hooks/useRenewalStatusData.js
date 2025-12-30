import { useMemo } from 'react';
import {
  COMPLIANCE_STATUS,
  WORKFLOW_STATUS,
  PRIORITY_LEVEL,
  calculateComplianceStatus,
  calculateWorkflowStatus,
} from '../utils/status';
import { getComparableRenewalDate } from '../utils/renewal';

const createCountsObject = (values) => values.reduce((acc, value) => {
  acc[value] = 0;
  return acc;
}, {});

export const createEmptyComplianceCounts = () => createCountsObject(Object.values(COMPLIANCE_STATUS));
export const createEmptyWorkflowCounts = () => createCountsObject(Object.values(WORKFLOW_STATUS));
export const createEmptyPriorityCounts = () => createCountsObject(Object.values(PRIORITY_LEVEL));

const createDimensionCounts = () => ({
  compliance: createEmptyComplianceCounts(),
  workflow: createEmptyWorkflowCounts(),
  priority: createEmptyPriorityCounts(),
});

const getComplianceStatusForAffair = (affair, latestRenewal) => {
  if (affair.complianceStatus) {
    return affair.complianceStatus;
  }
  if (latestRenewal) {
    return calculateComplianceStatus(latestRenewal);
  }
  return COMPLIANCE_STATUS.EXPIRED;
};

const getWorkflowStatusForAffair = (affair, latestRenewal, complianceStatus) => {
  if (affair.workflowStatus) {
    return affair.workflowStatus;
  }
  if (latestRenewal) {
    return calculateWorkflowStatus(latestRenewal, complianceStatus);
  }
  return WORKFLOW_STATUS.IN_PREPARATION;
};

const getPriorityLevelForAffair = (affair) => affair.priorityLevel ?? PRIORITY_LEVEL.LOW;

const incrementDimensionCounts = (entry, complianceStatus, workflowStatus, priorityLevel) => {
  entry.compliance[complianceStatus] = (entry.compliance[complianceStatus] ?? 0) + 1;
  entry.workflow[workflowStatus] = (entry.workflow[workflowStatus] ?? 0) + 1;
  entry.priority[priorityLevel] = (entry.priority[priorityLevel] ?? 0) + 1;
};

/**
 * Custom hook for calculating renewal status data across regulatory affairs.
 * Provides core data structures and aggregated metrics used throughout the app.
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.regulatoryAffairs - Array of regulatory affairs (use currentData.regulatory_affairs)
 * @param {Array} options.renewals - Array of renewals
 * @param {Array} [options.assets=[]] - Array of assets (for asset-level aggregation)
 * @param {string} [options.aggregateBy='none'] - Aggregation strategy: 'asset' | 'global' | 'category' | 'none'
 * @param {boolean} [options.includeItems=false] - Include full item objects per status
 * @param {boolean} [options.includeDerived=false] - Calculate derived metrics (health scores, critical items, etc.)
 *
 * @returns {Object} Status data and aggregations
 */
export const useRenewalStatusData = ({
  regulatoryAffairs = [],
  renewals = [],
  assets = [],
  aggregateBy = 'none',
  includeItems = false,
  includeDerived = false,
} = {}) => {

  // Core data structures: renewalsByAffair and latestRenewalByAffair
  const { renewalsByAffair, latestRenewalByAffair } = useMemo(() => {
    const renewalsMap = new Map();

    // Group renewals by affair
    for (const renewal of renewals) {
      const list = renewalsMap.get(renewal.affairId);
      if (list) {
        list.push(renewal);
      } else {
        renewalsMap.set(renewal.affairId, [renewal]);
      }
    }

    // Sort renewals by date (most recent first)
    renewalsMap.forEach((list, affairId, map) => {
      map.set(
        affairId,
        list.sort((a, b) => getComparableRenewalDate(b) - getComparableRenewalDate(a))
      );
    });

    // Extract latest renewal per affair
    const latestMap = new Map();
    renewalsMap.forEach((list, affairId) => {
      if (list.length > 0) {
        latestMap.set(affairId, list[0]);
      }
    });

    return {
      renewalsByAffair: renewalsMap,
      latestRenewalByAffair: latestMap,
    };
  }, [renewals]);

  // Aggregated status counts based on aggregation strategy
  const dimensionCounts = useMemo(() => {
    if (aggregateBy === 'none') {
      return null;
    }

    const buildEntry = () => createDimensionCounts();

    if (aggregateBy === 'asset') {
      const map = new Map();
      for (const affair of regulatoryAffairs) {
        const affairRenewals = renewalsByAffair.get(affair.id) ?? [];
        const latestRenewal = affairRenewals[0];
        const complianceStatus = getComplianceStatusForAffair(affair, latestRenewal);
        const workflowStatus = getWorkflowStatusForAffair(affair, latestRenewal, complianceStatus);
        const priorityLevel = getPriorityLevelForAffair(affair);

        const entry = map.get(affair.assetId) ?? buildEntry();
        incrementDimensionCounts(entry, complianceStatus, workflowStatus, priorityLevel);
        map.set(affair.assetId, entry);
      }
      return map;
    }

    if (aggregateBy === 'global') {
      const entry = buildEntry();
      for (const affair of regulatoryAffairs) {
        const affairRenewals = renewalsByAffair.get(affair.id) ?? [];
        const latestRenewal = affairRenewals[0];
        const complianceStatus = getComplianceStatusForAffair(affair, latestRenewal);
        const workflowStatus = getWorkflowStatusForAffair(affair, latestRenewal, complianceStatus);
        const priorityLevel = getPriorityLevelForAffair(affair);
        incrementDimensionCounts(entry, complianceStatus, workflowStatus, priorityLevel);
      }
      return entry;
    }

    if (aggregateBy === 'category') {
      const countsByCategory = {};
      for (const affair of regulatoryAffairs) {
        const asset = assets.find((a) => a.id === affair.assetId);
        if (!asset) continue;
        const entry = countsByCategory[asset.category] ?? buildEntry();
        const affairRenewals = renewalsByAffair.get(affair.id) ?? [];
        const latestRenewal = affairRenewals[0];
        const complianceStatus = getComplianceStatusForAffair(affair, latestRenewal);
        const workflowStatus = getWorkflowStatusForAffair(affair, latestRenewal, complianceStatus);
        const priorityLevel = getPriorityLevelForAffair(affair);
        incrementDimensionCounts(entry, complianceStatus, workflowStatus, priorityLevel);
        countsByCategory[asset.category] = entry;
      }
      return countsByCategory;
    }

    return null;
  }, [aggregateBy, regulatoryAffairs, renewalsByAffair, assets]);

  return {
    renewalsByAffair,
    latestRenewalByAffair,
    dimensionCounts,
  };
};

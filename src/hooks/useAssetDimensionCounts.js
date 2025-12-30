import { useMemo } from 'react';
import {
  LIFECYCLE_STATUS,
  COMPLIANCE_STATUS,
  WORKFLOW_STATUS,
  PRIORITY_LEVEL,
} from '../utils/status';

const createCountsObject = (values) => values.reduce((acc, value) => {
  acc[value] = 0;
  return acc;
}, {});

export const createEmptyLifecycleCounts = () => createCountsObject(Object.values(LIFECYCLE_STATUS));
export const createEmptyComplianceCounts = () => createCountsObject(Object.values(COMPLIANCE_STATUS));
export const createEmptyWorkflowCounts = () => createCountsObject(Object.values(WORKFLOW_STATUS));
export const createEmptyPriorityCounts = () => createCountsObject(Object.values(PRIORITY_LEVEL));

const createDimensionEntry = () => ({
  lifecycle: createEmptyLifecycleCounts(),
  compliance: createEmptyComplianceCounts(),
  workflow: createEmptyWorkflowCounts(),
  priority: createEmptyPriorityCounts(),
});

const normalizeLifecycleStatus = (affair) => {
  return affair?.lifecycleStatus ?? LIFECYCLE_STATUS.ACTIVE;
};

const normalizeComplianceStatus = (affair) => {
  return affair?.complianceStatus ?? COMPLIANCE_STATUS.EXPIRED;
};

const normalizeWorkflowStatus = (affair) => {
  return affair?.workflowStatus ?? WORKFLOW_STATUS.IN_PREPARATION;
};

const normalizePriorityLevel = (affair) => {
  return affair?.priorityLevel ?? PRIORITY_LEVEL.MEDIUM;
};

const incrementCounts = (entry, lifecycleStatus, complianceStatus, workflowStatus, priorityLevel) => {
  entry.lifecycle[lifecycleStatus] = (entry.lifecycle[lifecycleStatus] ?? 0) + 1;
  entry.compliance[complianceStatus] = (entry.compliance[complianceStatus] ?? 0) + 1;
  entry.workflow[workflowStatus] = (entry.workflow[workflowStatus] ?? 0) + 1;
  entry.priority[priorityLevel] = (entry.priority[priorityLevel] ?? 0) + 1;
};

export const useAssetDimensionCounts = (regulatoryAffairs = []) => {
  return useMemo(() => {
    const map = new Map();

    regulatoryAffairs.forEach((affair) => {
      if (!affair?.assetId) {
        return;
      }

      const entry = map.get(affair.assetId) ?? createDimensionEntry();
      const lifecycleStatus = normalizeLifecycleStatus(affair);
      const complianceStatus = normalizeComplianceStatus(affair);
      const workflowStatus = normalizeWorkflowStatus(affair);
      const priorityLevel = normalizePriorityLevel(affair);

      incrementCounts(entry, lifecycleStatus, complianceStatus, workflowStatus, priorityLevel);
      map.set(affair.assetId, entry);
    });

    return map;
  }, [regulatoryAffairs]);
};

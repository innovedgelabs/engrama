import { calculateComplianceStatus, calculateWorkflowStatus, LIFECYCLE_STATUS, PRIORITY_LEVEL } from '../utils/status';
import { getComparableRenewalDate } from '../utils/renewal';

// Simple role mapping for demo ownership/approvals
const DEFAULT_APPROVER_ID = 'user-ra-admin';
const RESPONSIBLE_TO_USER_ID = {
  'Ana María Sánchez': DEFAULT_APPROVER_ID,
  'Carlos Eduardo Pérez': 'user-ra-coordinator',
  'Luis Alberto Torres': 'user-ra-qa-lead',
};

const getUserIdForResponsible = (name) => {
  if (!name) return null;
  const userId = RESPONSIBLE_TO_USER_ID[name];
  if (!userId) {
    console.warn(`[enrichRegulatoryAffairs] Responsible "${name}" not found in user mapping.`);
  }
  return userId || null;
};

const PREFIX_SCOPE_MAP = {
  EM: 'companies',
  PR: 'suppliers',
  PD: 'products',
  ES: 'facilities',
  EQ: 'equipment',
  VH: 'vehicles',
  PE: 'people',
  CL: 'customers',
};

const deriveScopeFromAffair = (affair) => {
  if (!affair?.assetId) {
    return { assets: [] };
  }

  const prefix = affair.assetId.split('-')[0];
  const scopeKey = PREFIX_SCOPE_MAP[prefix] || 'assets';

  return {
    assets: [affair.assetId],
    [scopeKey]: [affair.assetId],
  };
};

const sortRenewalsDescending = (a, b) =>
  getComparableRenewalDate(b) - getComparableRenewalDate(a);

/**
 * Enriches regulatory affairs with all 4 dimension statuses:
 * - Lifecycle (manual, defaults to 'active')
 * - Compliance (calculated from latest renewal)
 * - Workflow (calculated from latest renewal)
 * - Priority (manual, defaults to 'medium')
 *
 * Also normalizes renewal objects (removing legacy fields such as status).
 *
 * @param {Array} regulatoryAffairs - Raw regulatory affairs dataset
 * @param {Array} renewals - Raw renewals dataset
 * @returns {{ regulatory_affairs: Array, renewals: Array }}
 */
export const enrichRegulatoryAffairsDataset = (regulatoryAffairs = [], renewals = []) => {
  const affairById = new Map(regulatoryAffairs.map((affair) => [affair.id, affair]));
  const renewalsByAffair = new Map();
  const normalizedRenewals = renewals.map((renewal) => {
    const normalizedRenewal = { ...renewal };
    delete normalizedRenewal.status;

    const affair = affairById.get(normalizedRenewal.affairId);
    const scope = deriveScopeFromAffair(affair);
    const ownerUserId = getUserIdForResponsible(normalizedRenewal.responsiblePerson);

    normalizedRenewal.scope = scope;
    normalizedRenewal.ownerUserId = ownerUserId;
    normalizedRenewal.assignedUserId = ownerUserId || null;
    // For now, approvals are centralized with the compliance manager
    normalizedRenewal.approverUserId = DEFAULT_APPROVER_ID;

    const existing = renewalsByAffair.get(normalizedRenewal.affairId);
    if (existing) {
      existing.push(normalizedRenewal);
    } else {
      renewalsByAffair.set(normalizedRenewal.affairId, [normalizedRenewal]);
    }

    return normalizedRenewal;
  });

  renewalsByAffair.forEach((list) => {
    list.sort(sortRenewalsDescending);
  });

  const enrichedRegulatoryAffairs = regulatoryAffairs.map((affair) => {
    const affairRenewals = renewalsByAffair.get(affair.id) ?? [];
    const latestRenewal = affairRenewals[0];

    // Derived statuses (calculated from latest renewal)
    const complianceStatus = latestRenewal
      ? calculateComplianceStatus(latestRenewal)
      : null;
    const workflowStatus = latestRenewal
      ? calculateWorkflowStatus(latestRenewal, complianceStatus)
      : null;

    // Manual statuses (ensure defaults if missing)
    const lifecycleStatus = affair.lifecycleStatus ?? LIFECYCLE_STATUS.ACTIVE;
    const priorityLevel = affair.priorityLevel ?? PRIORITY_LEVEL.MEDIUM;

    return {
      ...affair,
      scope: deriveScopeFromAffair(affair),
      ownerUserId: latestRenewal?.ownerUserId || DEFAULT_APPROVER_ID,
      lifecycleStatus,
      complianceStatus,
      workflowStatus,
      priorityLevel,
    };
  });

  return {
    regulatory_affairs: enrichedRegulatoryAffairs,
    renewals: normalizedRenewals,
  };
};

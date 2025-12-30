import {
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  WatchLater as WatchLaterIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  NotificationsActive as NotificationIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Archive as ArchiveIcon,
  AllInclusive as AllInclusiveIcon,
} from '@mui/icons-material';
import { getUIText } from './i18nHelpers';

const MS_IN_DAY = 1000 * 60 * 60 * 24;

// ========================================
// NEW 4-DIMENSION STATUS SYSTEM
// ========================================

// Dimension A: Lifecycle Status (operational relevance)
export const LIFECYCLE_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
};

// Dimension B: Compliance Status (legal validity)
export const COMPLIANCE_STATUS = {
  CURRENT: 'current',
  EXPIRING: 'expiring',
  EXPIRED: 'expired',
  PERMANENT: 'permanent',
};

// Dimension C: Workflow Status (process state)
export const WORKFLOW_STATUS = {
  IN_PREPARATION: 'in_preparation',
  SUBMITTED: 'submitted',
  COMPLETED: 'completed',
  NEEDS_RENEWAL: 'needs_renewal',
};

// Dimension D: Priority Level (business impact)
export const PRIORITY_LEVEL = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const DEFAULT_REMINDER_DAYS = 30;

// ========================================
// METADATA FOR EACH DIMENSION
// ========================================

// Lifecycle Metadata
export const LIFECYCLE_METADATA = {
  [LIFECYCLE_STATUS.ACTIVE]: {
    labelKey: 'lifecycle_active',
    color: '#2BA87F',
    icon: CheckCircleIcon,
  },
  [LIFECYCLE_STATUS.ARCHIVED]: {
    labelKey: 'lifecycle_archived',
    color: '#6B7280',
    icon: ArchiveIcon,
  },
};

// Compliance Metadata
export const COMPLIANCE_METADATA = {
  [COMPLIANCE_STATUS.CURRENT]: {
    labelKey: 'compliance_current',
    color: '#2BA87F', // Green - compliant
    textColor: '#ffffff',
    icon: CheckCircleIcon,
    severity: 1,
  },
  [COMPLIANCE_STATUS.EXPIRING]: {
    labelKey: 'compliance_expiring',
    color: '#F2C94C', // Yellow - warning
    textColor: '#7A5A00',
    icon: WatchLaterIcon,
    severity: 3,
  },
  [COMPLIANCE_STATUS.EXPIRED]: {
    labelKey: 'compliance_expired',
    color: '#EF4444', // Red - critical
    textColor: '#ffffff',
    icon: CancelIcon,
    severity: 5,
  },
  [COMPLIANCE_STATUS.PERMANENT]: {
    labelKey: 'compliance_permanent',
    color: '#D1D5DB', // Lighter gray - neutral/permanent
    textColor: '#374151',
    icon: AllInclusiveIcon,
    severity: 0,
  },
};

// Workflow Metadata
export const WORKFLOW_METADATA = {
  [WORKFLOW_STATUS.IN_PREPARATION]: {
    labelKey: 'workflow_in_preparation',
    color: '#9C27B0', // Purple - in progress
    textColor: '#ffffff',
    icon: EditIcon,
  },
  [WORKFLOW_STATUS.SUBMITTED]: {
    labelKey: 'workflow_submitted',
    color: '#0EA5E9', // Blue - waiting
    textColor: '#ffffff',
    icon: ScheduleIcon,
  },
  [WORKFLOW_STATUS.COMPLETED]: {
    labelKey: 'workflow_completed',
    color: '#2BA87F', // Green - done
    textColor: '#ffffff',
    icon: CheckCircleIcon,
  },
  [WORKFLOW_STATUS.NEEDS_RENEWAL]: {
    labelKey: 'workflow_needs_renewal',
    color: '#EF4444', // Red - critical, needs renewal
    textColor: '#ffffff',
    icon: NotificationIcon,
  },
};

// Priority Metadata
export const PRIORITY_METADATA = {
  [PRIORITY_LEVEL.CRITICAL]: {
    labelKey: 'priority_critical',
    color: '#DC2626', // Dark red
    icon: ErrorIcon,
    weight: 4,
  },
  [PRIORITY_LEVEL.HIGH]: {
    labelKey: 'priority_high',
    color: '#F97316', // Orange
    icon: ErrorIcon, // Same icon as critical, different color
    weight: 3,
  },
  [PRIORITY_LEVEL.MEDIUM]: {
    labelKey: 'priority_medium',
    color: '#3B82F6', // Blue
    icon: InfoIcon,
    weight: 2,
  },
  [PRIORITY_LEVEL.LOW]: {
    labelKey: 'priority_low',
    color: '#6B7280', // Gray
    icon: InfoIcon, // Same icon as medium, different color
    weight: 1,
  },
};

const DEFAULT_LOCALE = 'es-VE';
const DEFAULT_DATE_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric' };

const normalizeDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// ========================================
// NEW STATUS CALCULATION FUNCTIONS
// ========================================

/**
 * Calculate compliance status based on expiry date
 * @param {Object} renewal - Renewal object with expiryDate and reminderDays
 * @param {Date} referenceDate - Reference date for calculation (defaults to current date)
 * @returns {string} Compliance status: 'current' | 'expiring' | 'expired' | 'permanent'
 */
export const calculateComplianceStatus = (
  renewal,
  referenceDate = new Date(),
) => {
  // No expiry date = permanent (e.g., professional registrations)
  const expiry = normalizeDate(renewal?.expiryDate);
  if (!expiry) {
    return COMPLIANCE_STATUS.PERMANENT;
  }

  const today = normalizeDate(referenceDate) ?? new Date();
  const reminderDays = renewal?.reminderDays ?? DEFAULT_REMINDER_DAYS;

  // Calculate days until expiry
  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / MS_IN_DAY);

  // Past expiration
  if (daysUntilExpiry < 0) {
    return COMPLIANCE_STATUS.EXPIRED;
  }

  // Within reminder window
  if (daysUntilExpiry <= reminderDays) {
    return COMPLIANCE_STATUS.EXPIRING;
  }

  // All good
  return COMPLIANCE_STATUS.CURRENT;
};

/**
 * Calculate workflow status based on renewal process state
 * @param {Object} renewal - Renewal object with submissionDate, expiryDate, primaryAttachmentId
 * @param {string} complianceStatus - Current compliance status (optional, will calculate if not provided)
 * @returns {string|null} Workflow status: 'in_preparation' | 'submitted' | 'completed' | 'needs_renewal' | null
 *                        Returns null if no renewal exists (can be used to prompt user to create first renewal)
 */
export const calculateWorkflowStatus = (renewal, complianceStatus = null) => {
  // No renewal object = affair has no renewals yet
  // UI can detect this and prompt user to create first renewal
  if (!renewal) {
    return null;
  }

  // No submission date = still preparing documents
  if (!renewal.submissionDate) {
    return WORKFLOW_STATUS.IN_PREPARATION;
  }

  // Submitted but missing expiry date or primary document
  // (waiting for authority response or document upload)
  if (!renewal.expiryDate || !renewal.primaryAttachmentId) {
    return WORKFLOW_STATUS.SUBMITTED;
  }

  // Has everything - check if expired
  // Calculate compliance if not provided
  const compliance = complianceStatus ?? calculateComplianceStatus(renewal);

  // Completed renewal that has expired = needs new renewal cycle
  if (compliance === COMPLIANCE_STATUS.EXPIRED) {
    return WORKFLOW_STATUS.NEEDS_RENEWAL;
  }

  // Completed and still valid
  return WORKFLOW_STATUS.COMPLETED;
};

// ========================================
// HELPER FUNCTIONS - NEW DIMENSION-SPECIFIC
// ========================================

// Deprecated metadata helpers removed; domain metadata is used instead.

// ========================================
// UTILITY FUNCTIONS (DIMENSION-AGNOSTIC)
// ========================================

export const formatDisplayDate = (
  date,
  { locale = DEFAULT_LOCALE, fallback = 'Sin vencimiento', options = DEFAULT_DATE_OPTIONS } = {},
) => {
  const normalized = normalizeDate(date);
  if (!normalized) {
    return fallback;
  }

  return normalized.toLocaleDateString(locale, options);
};

// ========================================
// DEPRECATED HELPER FUNCTIONS
// ========================================





import { Box, Typography, Tooltip, Divider } from '@mui/material';
import {
  LIFECYCLE_STATUS,
  COMPLIANCE_STATUS,
  WORKFLOW_STATUS,
  PRIORITY_LEVEL,
} from '../../utils/status';
import { useStatusHelpers } from '../../utils/domainStatus';

/**
 * StatusTrafficLights - Multi-dimensional status indicator
 *
 * Displays all 4 status dimensions with colored dots and counts:
 * - Lifecycle (active/archived)
 * - Compliance (current/expiring/expired/permanent)
 * - Workflow (in_preparation/submitted/completed/needs_renewal)
 * - Priority (critical/high/medium/low)
 *
 * @param {Object} dimensionCounts - Object with { lifecycle, compliance, workflow, priority }
 * @param {Function} onStatusClick - Optional callback (dimension, status) => void
 * @param {string} language - Current language ('es' or 'en')
 * @param {string} size - 'small' | 'medium' for different contexts (default: 'medium')
 * @param {Array<string>} showDimensions - Which dimensions to show (default: all)
 * @param {string} activeDimension - Currently filtered dimension (optional)
 * @param {string} activeStatus - Currently filtered status within dimension (optional)
 */
const StatusTrafficLights = ({
  dimensionCounts = {},
  onStatusClick,
  language = 'es',
  size = 'medium',
  showDimensions = ['lifecycle', 'compliance', 'workflow', 'priority'],
  activeDimension,
  activeStatus,
  statusOrder = {},
}) => {
  const { getValues, getMetadata } = useStatusHelpers();
  // Size configurations
  const sizeConfig = {
    small: {
      dotSize: 6,
      fontSize: '0.65rem',
      indicatorGap: 0.1,
      itemGap: 1.2,
      minWidth: 10,
      dividerHeight: 12,
    },
    medium: {
      dotSize: { xs: 7, sm: 8 },
      fontSize: { xs: '0.65rem', sm: '0.7rem' },
      indicatorGap: { xs: 0.3, sm: 0.35 },
      itemGap: { xs: 0.9, sm: 1 },
      minWidth: { xs: 10, sm: 12 },
      dividerHeight: { xs: 14, sm: 16 },
    },
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  const defaultStatuses = {
    lifecycle: [LIFECYCLE_STATUS.ACTIVE, LIFECYCLE_STATUS.ARCHIVED],
    compliance: [
      COMPLIANCE_STATUS.CURRENT,
      COMPLIANCE_STATUS.EXPIRING,
      COMPLIANCE_STATUS.EXPIRED,
      COMPLIANCE_STATUS.PERMANENT,
    ],
    workflow: [
      WORKFLOW_STATUS.IN_PREPARATION,
      WORKFLOW_STATUS.SUBMITTED,
      WORKFLOW_STATUS.COMPLETED,
      WORKFLOW_STATUS.NEEDS_RENEWAL,
    ],
    priority: [
      PRIORITY_LEVEL.CRITICAL,
      PRIORITY_LEVEL.HIGH,
      PRIORITY_LEVEL.MEDIUM,
      PRIORITY_LEVEL.LOW,
    ],
  };

  const domainDimensions = showDimensions
    .map((key) => {
      const values = getValues(key);
      const statuses =
        statusOrder[key]?.length ? statusOrder[key] : values.length > 0 ? values : defaultStatuses[key] ?? [];
      if (statuses.length === 0) return null;
      return {
        key,
        statuses,
        getMetadata: (statusKey) => getMetadata(key, statusKey, language),
        getLabel: (statusKey, lang = language) => getMetadata(key, statusKey, lang)?.label ?? statusKey,
      };
    })
    .filter(Boolean);

  const dimensions =
    domainDimensions.length > 0
      ? domainDimensions
      : Object.entries(defaultStatuses)
          .filter(([key]) => showDimensions.includes(key))
          .map(([key, statuses]) => ({
            key,
            statuses: statusOrder[key]?.length ? statusOrder[key] : statuses,
            getMetadata: (statusKey) => getMetadata(key, statusKey, language),
            getLabel: (statusKey, lang = language) => getMetadata(key, statusKey, lang)?.label ?? statusKey,
          }));

  const renderStatusIndicator = (dimension, statusKey) => {
    const counts = dimensionCounts[dimension.key] || {};
    const count = counts[statusKey] || 0;
    const metadata = dimension.getMetadata(statusKey);
    const colorKey = metadata?.color ?? '#94a3b8';
    const isClickable = Boolean(onStatusClick);
    const isActive = activeDimension === dimension.key && activeStatus === statusKey;

    // Tooltip text using dimension-specific label function
    const tooltipText = dimension.getLabel(statusKey, language);

    return (
      <Tooltip key={statusKey} title={tooltipText} arrow>
        <Box
          onClick={isClickable ? () => onStatusClick(dimension.key, statusKey) : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: config.indicatorGap,
            cursor: isClickable ? 'pointer' : 'default',
            transition: 'transform 0.1s ease',
            opacity: count === 0 ? 0.3 : 1,
            '&:hover': isClickable
              ? {
                  transform: 'scale(1.1)',
                }
              : {},
          }}
        >
          {/* Colored dot */}
          <Box
            sx={{
              width: config.dotSize,
              height: config.dotSize,
              borderRadius: '50%',
              bgcolor: colorKey,
              boxShadow:
                size === 'small' ? `0 0 0 1.5px ${colorKey}26` : `0 0 0 2px ${colorKey}26`,
              flexShrink: 0,
              border: isActive ? `2px solid ${colorKey}` : 'none',
            }}
          />
          {/* Count */}
          <Typography
            variant="caption"
            sx={{
              fontSize: config.fontSize,
              fontWeight: isActive ? 700 : 600,
              color: 'text.primary',
              minWidth: config.minWidth,
              textAlign: 'center',
            }}
          >
            {count}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  const renderDimension = (dimension, index) => {
    return (
      <Box
        key={dimension.key}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: config.itemGap,
        }}
      >
        {dimension.statuses.map((statusKey) =>
          renderStatusIndicator(dimension, statusKey)
        )}
        {/* Add divider between dimensions (except after last) */}
        {index < dimensions.length - 1 && (
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              mx: { xs: 0.3, sm: 0.5 },
              height: config.dividerHeight,
              alignSelf: 'center',
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: config.itemGap,
        flexShrink: 0,
        flexWrap: 'wrap',
      }}
    >
      {dimensions.map((dimension, index) => renderDimension(dimension, index))}
    </Box>
  );
};

export default StatusTrafficLights;

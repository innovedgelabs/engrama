import { Box, Typography, useTheme } from '@mui/material';
import { COMPLIANCE_STATUS } from '../../utils/status';
import { getUIText } from '../../utils/i18nHelpers';
import { useStatusHelpers } from '../../utils/domainStatus';

/**
 * HorizontalStackedBar - Mobile-optimized status visualization
 *
 * Displays a horizontal stacked bar chart showing status distribution
 * with labels and counts for each status type.
 *
 * @param {Object} complianceCounts - Count of each compliance status
 * @param {number} totalAffairs - Total number of regulatory affairs
 * @param {string} language - Current language
 * @param {Function} onStatusClick - Callback when status is clicked
 * @param {string} activeStatus - Currently selected status (optional)
 * @param {boolean} showLegend - Toggle legend row (default: true)
 */
const HorizontalStackedBar = ({
  complianceCounts = {},
  totalAffairs = 0,
  language = 'es',
  onStatusClick,
  activeStatus,
  showLegend = true,
}) => {
  const theme = useTheme();
  const { getMetadata, getValues } = useStatusHelpers();

  const normalizedActiveStatus = activeStatus?.toLowerCase?.();

  // Status order for display (most critical first)
  const statusOrder =
    getValues('compliance').length > 0
      ? getValues('compliance')
      : [
          COMPLIANCE_STATUS.EXPIRED,
          COMPLIANCE_STATUS.EXPIRING,
          COMPLIANCE_STATUS.CURRENT,
          COMPLIANCE_STATUS.PERMANENT,
        ];

  // Calculate percentages
  const statusData = statusOrder
    .map((status) => {
      const count = complianceCounts[status] || 0;
      const percentage = totalAffairs > 0 ? (count / totalAffairs) * 100 : 0;
      const metadata =
        getMetadata('compliance', status, language) ||
        { label: status, color: theme.palette.primary.main };

      return {
        status,
        count,
        percentage,
        metadata,
      };
    })
    .filter((item) => item.count > 0); // Only show statuses with non-zero counts

  if (totalAffairs === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {getUIText('emptyRegulatoryAffairs', language)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Stacked Bar */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: 32,
          borderRadius: 1,
          overflow: 'hidden',
          mb: 1.5,
        }}
      >
        {statusData.map(({ status, percentage, metadata }) => {
          const isActive = normalizedActiveStatus === status;

          return (
          <Box
            key={status}
            onClick={() => onStatusClick?.(status)}
            sx={{
              width: `${percentage}%`,
              backgroundColor: metadata.color || theme.palette.primary.main,
              cursor: onStatusClick ? 'pointer' : 'default',
              transition: 'filter 0.2s ease',
              opacity: normalizedActiveStatus
                ? isActive
                  ? 1
                  : 0.35
                : 1,
              filter: isActive ? 'brightness(1.05)' : 'none',
              '&:hover': onStatusClick ? {
                filter: 'brightness(1.1)',
              } : {},
            }}
          />
        );
        })}
      </Box>

      {/* Status Labels and Counts */}
      {showLegend && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            justifyContent: 'space-between',
          }}
        >
          {statusData.map(({ status, count, metadata }) => {
            const isActive = normalizedActiveStatus === status;

            return (
              <Box
                key={status}
                onClick={() => onStatusClick?.(status)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: onStatusClick ? 'pointer' : 'default',
                  opacity: normalizedActiveStatus
                    ? isActive
                      ? 1
                      : 0.45
                    : 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '2px',
                    backgroundColor: metadata.color || theme.palette.primary.main,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: isActive ? 600 : 500,
                    color: 'text.secondary',
                  }}
                >
                  {(metadata?.label ?? status)}: {count}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default HorizontalStackedBar;

import { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  COMPLIANCE_STATUS,
  PRIORITY_LEVEL,
} from '../../utils/status';
import { getComplianceLabel, getPriorityLabel } from '../../utils/i18nHelpers';
import DashboardCard from './DashboardCard';
import { useStatusHelpers } from '../../utils/domainStatus';
import * as MuiIcons from '@mui/icons-material';

const PRIORITY_ORDER = [
  PRIORITY_LEVEL.CRITICAL,
  PRIORITY_LEVEL.HIGH,
  PRIORITY_LEVEL.MEDIUM,
  PRIORITY_LEVEL.LOW,
];

const COMPLIANCE_ORDER = [
  COMPLIANCE_STATUS.CURRENT,
  COMPLIANCE_STATUS.EXPIRING,
  COMPLIANCE_STATUS.EXPIRED,
  COMPLIANCE_STATUS.PERMANENT,
];

/**
 * CompliancePriorityMatrix
 *
 * Reusable 4x4 matrix visualizing the intersection of:
 *  - Compliance (rows): current, expiring, expired, permanent
 *  - Priority (columns): critical, high, medium, low
 *
 * Props:
 *  - affairs: Array of affairs or affair summaries
 *      Each item may contain:
 *        - complianceStatus
 *        - priorityLevel or priority
 *        - name or affair.name
 *  - language: 'es' | 'en'
 *  - title: optional card title (already localized)
 *  - onCellClick?: ({ priority, complianceStatus, affairs }) => void
 */
const CompliancePriorityMatrix = ({
  affairs = [],
  language = 'es',
  title,
  onCellClick,
}) => {
  const theme = useTheme();
  const { getMetadata } = useStatusHelpers();

  const { matrix, maxCount, totalCount } = useMemo(() => {
    const initialCell = () => ({ count: 0, items: [] });

    // Matrix keyed by compliance (rows) then priority (columns)
    const baseMatrix = COMPLIANCE_ORDER.reduce((acc, status) => {
      acc[status] = PRIORITY_ORDER.reduce((cols, priority) => {
        cols[priority] = initialCell();
        return cols;
      }, {});
      return acc;
    }, {});

    let max = 0;
    let total = 0;

    affairs.forEach((item) => {
      if (!item) return;

      const complianceStatus =
        item.complianceStatus ||
        item.affair?.complianceStatus ||
        null;

      const priorityLevel =
        item.priorityLevel ||
        item.priority ||
        item.affair?.priorityLevel ||
        item.affair?.priority ||
        PRIORITY_LEVEL.MEDIUM;

      if (
        !PRIORITY_ORDER.includes(priorityLevel) ||
        !COMPLIANCE_ORDER.includes(complianceStatus)
      ) {
        return;
      }

      const cell = baseMatrix[complianceStatus][priorityLevel];
      cell.count += 1;
      cell.items.push(item);

      max = Math.max(max, cell.count);
      total += 1;
    });

    return { matrix: baseMatrix, maxCount: max, totalCount: total };
  }, [affairs]);

  const renderCellContent = (complianceKey, priorityKey) => {
    const cell = matrix[complianceKey][priorityKey];
    const count = cell.count;
    const metadata = getMetadata('compliance', complianceKey, language) || {};

    const baseColor =
      metadata?.color ??
      theme.palette.grey[400];

    const intensity =
      maxCount > 0 && count > 0 ? count / maxCount : 0;

    const bgColor =
      count === 0
        ? alpha(baseColor, 0.04)
        : alpha(baseColor, 0.25 + intensity * 0.5);

    const useLightText = count > 0 && intensity >= 0.6;
    const textColor = useLightText
      ? theme.palette.common.white
      : theme.palette.text.primary;

    const clickable =
      typeof onCellClick === 'function' && count > 0;

    const priorityLabel = getMetadata('priority', priorityKey, language)?.label ?? getPriorityLabel(priorityKey, language);
    const complianceLabel = metadata?.label ?? getComplianceLabel(complianceKey, language);

    const titleText = `${priorityLabel} × ${complianceLabel} · ${count}`;

    const items = cell.items || [];
    const maxNamesInTooltip = 5;
    const names = items
      .map((item) => item.name || item.affair?.name)
      .filter(Boolean);
    const visibleNames = names.slice(0, maxNamesInTooltip);
    const remaining = names.length - visibleNames.length;

    const cellContent = (
      <Box
        onClick={
          clickable
            ? () =>
                onCellClick({
                  priority: priorityKey,
                  complianceStatus: complianceKey,
                  affairs: items,
                })
            : undefined
        }
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: bgColor,
          borderRadius: 1.5,
          cursor: clickable ? 'pointer' : 'default',
          transition: 'background-color 120ms ease, transform 120ms ease',
          '&:hover': clickable
            ? {
                transform: 'translateY(-1px)',
                bgcolor: alpha(baseColor, 0.4 + intensity * 0.4),
              }
            : undefined,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: '0.9rem',
            color: textColor,
          }}
        >
          {count}
        </Typography>
      </Box>
    );

    // Hover tooltips removed for a cleaner, more minimal matrix.
    // Cell remains clickable when an onCellClick handler is provided.
    return cellContent;
  };

  if (totalCount === 0) {
    return (
      <DashboardCard title={title || ''}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 120,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.85rem', textAlign: 'center' }}
          >
            {language === 'es'
              ? 'No hay asuntos para mostrar en la matriz.'
              : 'No affairs to display in the matrix.'}
          </Typography>
        </Box>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title={title || ''}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(4, 1fr)',
          gridTemplateRows: { xs: 'auto repeat(4, minmax(28px, 1fr))', sm: 'auto repeat(4, minmax(24px, 1fr))', md: 'auto repeat(4, minmax(28px, 1fr))' },
          gap: 0.5,
        }}
      >
        {/* Top-left empty cell */}
        <Box />

        {/* Column headers - Priority */}
        {PRIORITY_ORDER.map((priorityKey) => {
          const domainMeta = getMetadata('priority', priorityKey, language) || {};
          const priorityLabel = domainMeta?.label ?? getPriorityLabel(priorityKey, language);
          const PriorityIcon =
            typeof domainMeta?.icon === 'string'
              ? MuiIcons[domainMeta.icon]
              : domainMeta?.icon;
          const iconColor = domainMeta.color;

          return (
            <Box
              key={priorityKey}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 0.5,
              }}
              title={priorityLabel}
            >
              {PriorityIcon && (
                <PriorityIcon
                  sx={{
                    fontSize: '1.1rem',
                    color: iconColor || theme.palette.text.secondary,
                  }}
                />
              )}
            </Box>
          );
        })}

        {/* Rows - Compliance */}
        {COMPLIANCE_ORDER.map((statusKey) => {
          const metadata = getMetadata('compliance', statusKey, language) || {};
          const label = metadata?.label ?? getComplianceLabel(statusKey, language);
          const ComplianceIcon =
            typeof metadata?.icon === 'string' ? MuiIcons[metadata.icon] : metadata?.icon;

          return (
            <Box
              key={statusKey}
              sx={{
                display: 'contents',
              }}
            >
              {/* Row header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pr: 0.75,
                }}
                title={label}
              >
                {ComplianceIcon && (
                  <ComplianceIcon
                    sx={{
                      fontSize: '1.1rem',
                      color: metadata.color,
                    }}
                  />
                )}
              </Box>

              {/* Data cells */}
              {PRIORITY_ORDER.map((priorityKey) => (
                <Box key={`${statusKey}-${priorityKey}`}>
                  {renderCellContent(statusKey, priorityKey)}
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
    </DashboardCard>
  );
};

export default CompliancePriorityMatrix;



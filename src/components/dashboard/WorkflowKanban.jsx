import { useMemo } from 'react';
import { Box, Typography, useTheme, Paper } from '@mui/material';
import { WORKFLOW_STATUS } from '../../utils/status';
import { getUIText } from '../../utils/i18nHelpers';
import { useStatusHelpers } from '../../utils/domainStatus';
import * as MuiIcons from '@mui/icons-material';

/**
 * WorkflowKanban
 *
 * Read-only visualization of the workflow pipeline for regulatory affairs.
 *
 * Compact layout:
 * - Single card section
 * - 4 vertical pills connected by a subtle flow line/arrow
 * - Counts rendered on the right side of each pill
 *
 * Props:
 * - affairs: Array<{ workflowStatus: string | null }>
 * - language: 'es' | 'en'
 * - onStatusClick?: (statusKey: string) => void   // Optional, for future filter wiring
 */
const WorkflowKanban = ({ affairs = [], language = 'es', onStatusClick, getMetadata: getMetadataProp }) => {
  const theme = useTheme();
  const { getMetadata: getMetadataFromHook } = useStatusHelpers();
  const getMetadata = getMetadataProp || getMetadataFromHook;

  const counts = useMemo(
    () =>
      affairs.reduce(
        (acc, affair) => {
          const status = affair?.workflowStatus;
          if (!status) {
            return acc;
          }

          if (status === WORKFLOW_STATUS.NEEDS_RENEWAL) {
            acc[WORKFLOW_STATUS.NEEDS_RENEWAL] += 1;
          } else if (status === WORKFLOW_STATUS.IN_PREPARATION) {
            acc[WORKFLOW_STATUS.IN_PREPARATION] += 1;
          } else if (status === WORKFLOW_STATUS.SUBMITTED) {
            acc[WORKFLOW_STATUS.SUBMITTED] += 1;
          } else if (status === WORKFLOW_STATUS.COMPLETED) {
            acc[WORKFLOW_STATUS.COMPLETED] += 1;
          }

          return acc;
        },
        {
          [WORKFLOW_STATUS.NEEDS_RENEWAL]: 0,
          [WORKFLOW_STATUS.IN_PREPARATION]: 0,
          [WORKFLOW_STATUS.SUBMITTED]: 0,
          [WORKFLOW_STATUS.COMPLETED]: 0,
        }
      ),
    [affairs]
  );

  const columns = [
    WORKFLOW_STATUS.NEEDS_RENEWAL,
    WORKFLOW_STATUS.IN_PREPARATION,
    WORKFLOW_STATUS.SUBMITTED,
    WORKFLOW_STATUS.COMPLETED,
  ];

  const handleColumnClick = (statusKey) => {
    if (typeof onStatusClick === 'function') {
      onStatusClick(statusKey);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.25, md: 1.5 } }}>
      <Box
        sx={{
          mt: 0.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {columns.map((statusKey) => {
          const metadata = getMetadata('workflow', statusKey, language) || {};
          const columnCount = counts[statusKey] || 0;
          const clickable = typeof onStatusClick === 'function';
          const IconComponent =
            typeof metadata?.icon === 'string' ? MuiIcons[metadata.icon] : metadata?.icon;

          return (
            <Paper
              key={statusKey}
              elevation={0}
              onClick={clickable ? () => handleColumnClick(statusKey) : undefined}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.9, md: 1.2 },
                px: { xs: 1.25, md: 1.5 },
                py: { xs: 0.9, md: 1 },
                border: 1,
                borderColor: metadata?.color || theme.palette.divider,
                borderLeftWidth: 4,
                borderLeftColor: metadata?.color || theme.palette.divider,
                borderRadius: 1.5,
                bgcolor: 'common.white',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                width: '100%',
                '&:hover': clickable
                  ? {
                      boxShadow: 1,
                      transform: 'translateX(2px)',
                    }
                  : undefined,
                '&:focus-visible': clickable
                  ? {
                      outline: `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: 2,
                    }
                  : undefined,
              }}
            >
              {IconComponent && (
                <IconComponent
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.1rem' },
                    color: metadata?.color || theme.palette.text.primary,
                    flexShrink: 0,
                  }}
                />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.65rem', md: '0.75rem' },
                    letterSpacing: 0.2,
                    color: 'text.primary',
                  }}
                >
                  {metadata?.label ?? (metadata?.labelKey ? getUIText(metadata.labelKey, language) : statusKey)}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  color: metadata?.color || theme.palette.text.primary,
                  flexShrink: 0,
                }}
              >
                {columnCount}
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default WorkflowKanban;



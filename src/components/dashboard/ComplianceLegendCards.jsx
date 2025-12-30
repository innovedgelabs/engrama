import PropTypes from 'prop-types';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import {
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  HighlightOff as CancelIcon,
} from '@mui/icons-material';
import { COMPLIANCE_STATUS } from '../../utils/status';
import { getUIText, getComplianceLabel } from '../../utils/i18nHelpers';

/**
 * ComplianceMiniCard - Individual compliance metric card
 * Designed to be used directly in a grid layout
 */
export const ComplianceMiniCard = ({ label, value, color, icon: Icon, onClick }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      px: 1.5,
      py: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      borderLeft: 3,
      borderColor: color,
      bgcolor: 'background.paper',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.15s ease',
      height: '100%',
      '&:hover': onClick
        ? {
            boxShadow: 1,
            transform: 'translateX(2px)',
          }
        : {},
    }}
  >
    {Icon && (
      <Icon
        sx={{
          fontSize: 18,
          color,
          opacity: 0.7,
          flexShrink: 0,
        }}
      />
    )}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.primary"
        sx={{
          display: 'block',
          fontSize: '0.68rem',
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        {label}
      </Typography>
    </Box>
    <Typography
      variant="body1"
      sx={{
        fontWeight: 700,
        color,
        fontSize: '1rem',
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {value}
    </Typography>
  </Paper>
);

ComplianceMiniCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  onClick: PropTypes.func,
};

/**
 * ComplianceLegendStack
 *
 * A vertical stack of 4 mini stat cards - use this when you want them
 * wrapped together (e.g., inside a DashboardCard)
 */
const ComplianceLegendStack = ({
  totalAffairs = 0,
  permanentCount = 0,
  complianceCounts = {},
  language = 'es',
  onStatusClick,
}) => {
  const theme = useTheme();

  const handleClick = (status) => {
    if (onStatusClick) {
      onStatusClick(status);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        height: '100%',
        justifyContent: 'center',
      }}
    >
      <ComplianceMiniCard
        label={
          permanentCount > 0
            ? `${getUIText('total_affairs', language)} (+${permanentCount})`
            : getUIText('total_affairs', language)
        }
        value={totalAffairs}
        color={theme.palette.primary.main}
        icon={AssessmentIcon}
      />
      <ComplianceMiniCard
        label={getComplianceLabel(COMPLIANCE_STATUS.CURRENT, language)}
        value={complianceCounts[COMPLIANCE_STATUS.CURRENT] || 0}
        color={theme.palette.success.main}
        icon={CheckCircleIcon}
        onClick={() => handleClick(COMPLIANCE_STATUS.CURRENT)}
      />
      <ComplianceMiniCard
        label={getComplianceLabel(COMPLIANCE_STATUS.EXPIRING, language)}
        value={complianceCounts[COMPLIANCE_STATUS.EXPIRING] || 0}
        color={theme.palette.warning.main}
        icon={ScheduleIcon}
        onClick={() => handleClick(COMPLIANCE_STATUS.EXPIRING)}
      />
      <ComplianceMiniCard
        label={getComplianceLabel(COMPLIANCE_STATUS.EXPIRED, language)}
        value={complianceCounts[COMPLIANCE_STATUS.EXPIRED] || 0}
        color={theme.palette.error.main}
        icon={CancelIcon}
        onClick={() => handleClick(COMPLIANCE_STATUS.EXPIRED)}
      />
    </Box>
  );
};

ComplianceLegendStack.propTypes = {
  totalAffairs: PropTypes.number,
  permanentCount: PropTypes.number,
  complianceCounts: PropTypes.shape({
    [COMPLIANCE_STATUS.CURRENT]: PropTypes.number,
    [COMPLIANCE_STATUS.EXPIRING]: PropTypes.number,
    [COMPLIANCE_STATUS.EXPIRED]: PropTypes.number,
  }),
  language: PropTypes.oneOf(['es', 'en']),
  onStatusClick: PropTypes.func,
};

// Re-export icons for use in DashboardView
export { AssessmentIcon, CheckCircleIcon, ScheduleIcon, CancelIcon };

export default ComplianceLegendStack;

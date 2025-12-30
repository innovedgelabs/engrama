import PropTypes from 'prop-types';
import { Box, Paper, Typography } from '@mui/material';

/**
 * ComplianceMiniCard - Individual compliance/priority metric card
 * Compact card with icon, label, and value designed for vertical stacking
 */
const ComplianceMiniCard = ({ label, value, color, icon: Icon, onClick }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      px: { xs: 1.25, sm: 0.9, md: 1.25 },
      py: { xs: 0.9, sm: 0.5, md: 0.9 },
      display: 'flex',
      alignItems: 'center',
      gap: { xs: 1, sm: 0.5, md: 1 },
      border: 1,
      borderColor: color,
      borderLeftWidth: 4,
      borderLeftColor: color,
      borderRadius: 1.5,
      bgcolor: 'common.white',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.15s ease',
      flex: 1,
      width: '100%',
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
          fontSize: { xs: 16, sm: 14, md: 16 },
          color,
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
          fontSize: { xs: '0.65rem', sm: '0.55rem', md: '0.65rem' },
          fontWeight: 600,
          lineHeight: 1.2,
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
        fontSize: { xs: '0.9rem', sm: '0.8rem', md: '0.9rem' },
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

export default ComplianceMiniCard;

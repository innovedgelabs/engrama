import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { getUIText } from '../../../../utils/i18nHelpers';

/**
 * ConflictCard - Single conflict display with severity-based styling
 */
const ConflictCard = ({ conflict, language, isLast = false }) => {
  // Severity-based styling
  const severityStyles = {
    critical: {
      borderColor: 'error.main',
      bgcolor: 'error.lighter',
      labelBg: 'error.main',
      labelColor: 'white',
    },
    warning: {
      borderColor: 'warning.main',
      bgcolor: 'warning.lighter',
      labelBg: 'warning.main',
      labelColor: 'white',
    },
  };

  const styles = severityStyles[conflict.severity] || severityStyles.warning;

  // Get translated labels
  const severityLabel = getUIText(`pf_conflict_severity_${conflict.severity}`, language) ||
    conflict.severity?.toUpperCase();
  const typeLabel = getUIText(`pf_conflict_type_${conflict.type}`, language) ||
    conflict.type?.replace(/_/g, ' ');

  return (
    <Card
      variant="outlined"
      sx={{
        mb: isLast ? 0 : 2,
        borderColor: styles.borderColor,
        borderLeftWidth: 4,
        borderLeftStyle: 'solid',
      }}
    >
      <CardContent sx={{ bgcolor: styles.bgcolor, py: 2, '&:last-child': { pb: 2 } }}>
        {/* Severity label + Type */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box
            sx={{
              px: 1,
              py: 0.25,
              bgcolor: styles.labelBg,
              color: styles.labelColor,
              borderRadius: 0.5,
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            {severityLabel}
          </Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {typeLabel}
          </Typography>
        </Box>

        {/* Message */}
        <Typography variant="body2" sx={{ mb: 1 }}>
          {conflict.message}
        </Typography>

        {/* Details */}
        {conflict.details && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Detail:</strong> {conflict.details}
          </Typography>
        )}

        {/* Impact */}
        {conflict.impact && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Impact:</strong> {conflict.impact}
          </Typography>
        )}

        {/* Recommendation */}
        {conflict.recommendation && (
          <Typography variant="body2" color="primary.main" fontWeight={500}>
            <strong>Recommendation:</strong> {conflict.recommendation}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ConflictCard;

import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import { useStatusHelpers } from '../../../../utils/domainStatus';
import { getUIText } from '../../../../utils/i18nHelpers';

/**
 * RequestReviewHeader - Displays title, counterparty, and status badges
 * Matches DetailView header styling
 */
const RequestReviewHeader = ({ request, entity, language }) => {
  const { getMetadata } = useStatusHelpers();

  // Get workflow status metadata
  const statusMeta = getMetadata('workflow', request.workflow_status, language);

  // Get localized title - use type-specific template for proper word order
  const titleTemplate = getUIText(`pf_review_title_${request.request_type}`, language)
    || getUIText('pf_review_title_default', language)
    || 'Request';

  // Get translated labels
  const urgencyLabel = getUIText(`pf_urgency_${request.urgency}`, language) || request.urgency;

  // Urgency color mapping
  const urgencyColors = {
    urgent: 'error',
    high: 'warning',
    normal: 'default',
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
      {/* Left side: Title and counterparty */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Title - matching DetailView h5/h1 styling */}
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: { xs: 'normal', sm: 'nowrap' },
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            mb: 0.5,
          }}
        >
          {titleTemplate} ({request.id})
        </Typography>
        {/* Counterparty name - clickable if entity exists */}
        <Typography variant="body2" color="text.secondary">
          {entity ? (
            <Link
              component={RouterLink}
              to={`/entity/${entity.id}/info`}
              sx={{ fontWeight: 500 }}
            >
              {request.counterparty_name}
            </Link>
          ) : (
            request.counterparty_name
          )}
        </Typography>
      </Box>

      {/* Right side: Status badges */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ flexShrink: 0 }}>
        {/* Workflow status chip */}
        <Chip
          label={statusMeta?.label || request.workflow_status}
          size="small"
          sx={{
            bgcolor: statusMeta?.color || 'grey.500',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
        {/* Urgency chip */}
        <Chip
          label={urgencyLabel}
          size="small"
          color={urgencyColors[request.urgency] || 'default'}
          variant={request.urgency === 'normal' ? 'outlined' : 'filled'}
          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
        />
      </Stack>
    </Box>
  );
};

export default RequestReviewHeader;

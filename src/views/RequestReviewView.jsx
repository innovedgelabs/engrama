import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useDomain } from '../contexts/DomainContext';
import PageLayout from '../components/layout/PageLayout';
import { getUIText } from '../utils/i18nHelpers';

// Section components
import RequestReviewHeader from '../components/domain/pension_fund/request-review/RequestReviewHeader';
import RequestContextSection from '../components/domain/pension_fund/request-review/RequestContextSection';
import ConflictsSection from '../components/domain/pension_fund/request-review/ConflictsSection';
import ReviewSection from '../components/domain/pension_fund/request-review/ReviewSection';

/**
 * RequestReviewView - Attorney review interface for pending requests
 *
 * Layout (Alt 1 - Hybrid):
 * 1. Header - title, badges, status
 * 2. Request Context (3:2) - Request Details | Entity Summary
 * 3. Conflicts - Full width, severity-based styling
 * 4. Review - Two-column (Recommended Actions | Approval Status) + Notes + Buttons
 */
const RequestReviewView = ({ language, currentUser }) => {
  const { id } = useParams();
  const { currentData } = useDomain();

  // Get request from domain data
  const request = useMemo(() => {
    return currentData?.requests?.find(r => r.id === id);
  }, [currentData?.requests, id]);

  // Get linked entity
  const entity = useMemo(() => {
    if (!request?.counterparty_id) return null;
    return currentData?.assets?.find(a => a.id === request.counterparty_id);
  }, [currentData?.assets, request?.counterparty_id]);

  // Get related data for entity context
  const entityHoldings = useMemo(() => {
    if (!entity?.id) return [];
    return currentData?.holdings?.filter(h => h.entity_id === entity.id) || [];
  }, [currentData?.holdings, entity?.id]);

  const entityBoardSeats = useMemo(() => {
    if (!entity?.id) return [];
    return currentData?.board_seats?.filter(bs => bs.entity_id === entity.id) || [];
  }, [currentData?.board_seats, entity?.id]);

  // Build breadcrumbs
  const breadcrumbs = useMemo(() => {
    const homeLabel = getUIText('breadcrumbHome', language) || 'Home';
    const queueLabel = getUIText('pf_request_queue_title', language) || 'Request Queue';
    const reviewLabel = getUIText('pf_review_title', language) || 'Review Request';

    return [
      { label: homeLabel, path: '/' },
      { label: queueLabel, path: '/' },
      { label: `${reviewLabel} #${id}` },
    ];
  }, [language, id]);

  // Loading state
  if (!currentData) {
    return (
      <PageLayout breadcrumbs={breadcrumbs} showBackButton>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  // Request not found
  if (!request) {
    return (
      <PageLayout breadcrumbs={breadcrumbs} showBackButton>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 2 }}>
          <Typography variant="h6" color="text.secondary">
            Request not found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Request ID: {id}
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  // Check if request is in reviewable state
  const reviewableStatuses = ['submitted', 'in_review'];
  const isReviewable = reviewableStatuses.includes(request.workflow_status);

  return (
    <PageLayout breadcrumbs={breadcrumbs} showBackButton>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        {/* Section 1: Header with title, badges, status */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 2,
            borderRadius: 2,
          }}
        >
          <RequestReviewHeader
            request={request}
            entity={entity}
            language={language}
          />
        </Paper>

        {/* Section 2: Request Context (3:2 layout) - Request Details + Entity */}
        <RequestContextSection
          request={request}
          entity={entity}
          holdings={entityHoldings}
          boardSeats={entityBoardSeats}
          language={language}
        />

        {/* Section 3: Conflicts (full width) */}
        <ConflictsSection
          conflicts={request.conflicts_detected}
          language={language}
        />

        {/* Section 4: Review (two-column actions + notes + buttons) */}
        <ReviewSection
          request={request}
          conflicts={request.conflicts_detected}
          currentUser={currentUser}
          isReviewable={isReviewable}
          language={language}
        />
      </Container>
    </PageLayout>
  );
};

export default RequestReviewView;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { updateRequest } from '../../../../services/requestStorage';
import { getUIText } from '../../../../utils/i18nHelpers';

/**
 * ReviewSection - Unified review card with two-column layout
 * Left: Recommended Actions | Right: Approval Status
 * Bottom: Notes field + Decision buttons
 */
const ReviewSection = ({ request, conflicts, currentUser, isReviewable, language }) => {
  const navigate = useNavigate();

  const [notes, setNotes] = useState(request?.approval_notes || '');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Translated labels
  const sectionTitle = getUIText('pf_review_section_title', language) || 'Review';
  const recommendedTitle = getUIText('pf_review_recommended_actions', language) || 'Recommended Actions';
  const approvalTitle = getUIText('pf_review_approval_status', language) || 'Approval Status';
  const pendingLabel = getUIText('pf_review_pending_decision', language) || 'Pending your decision';
  const notesLabel = getUIText('pf_review_notes_label', language) || 'Notes/Comments (optional)';
  const approveLabel = getUIText('pf_review_approve', language) || 'Approve with Conditions';
  const requestInfoLabel = getUIText('pf_review_request_info', language) || 'Request More Info';
  const rejectLabel = getUIText('pf_review_reject', language) || 'Reject Request';
  const footerNote = getUIText('pf_review_footer_note', language) ||
    'If approved, selected obligations will be automatically created in entity register';
  const cancelLabel = getUIText('cancel', language) || 'Cancel';
  const confirmLabel = getUIText('confirm', language) || 'Confirm';

  // Generate actions from conflicts and standard actions
  const actions = useMemo(() => {
    const items = [];

    // Add actions from conflict recommendations
    if (conflicts && conflicts.length > 0) {
      conflicts.forEach((conflict, index) => {
        if (conflict.recommendation) {
          items.push({
            id: `${conflict.type}-${index}`,
            text: conflict.recommendation,
          });
        }
      });
    }

    // Standard action: create obligation record
    const createObligationText = getUIText('pf_review_action_create_obligation', language) ||
      'Create {type} obligation record for {entity}';
    items.push({
      id: 'create-obligation',
      text: createObligationText
        .replace('{type}', request?.request_type || '')
        .replace('{entity}', request?.counterparty_name || ''),
    });

    return items;
  }, [conflicts, request, language]);

  // Approval status logic
  const isDecided = ['approved', 'rejected'].includes(request?.workflow_status);
  const reviewerName = currentUser?.name || 'Unknown';
  const reviewerRole = currentUser?.role || currentUser?.title || 'Reviewer';

  // Handle action button click - open confirmation dialog
  const handleAction = (action) => {
    setConfirmDialog({ open: true, action });
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setConfirmDialog({ open: false, action: null });
  };

  // Handle confirmation - update request status
  const handleConfirm = async () => {
    const { action } = confirmDialog;
    if (!action) return;

    setIsSubmitting(true);

    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      request_info: 'needs_info',
    };

    try {
      const success = updateRequest(request.id, {
        workflow_status: statusMap[action],
        approval_notes: notes,
        approved_by: currentUser?.name || 'Unknown',
        reviewed_at: new Date().toISOString(),
      });

      if (success) {
        // Trigger domain data refresh
        window.dispatchEvent(new CustomEvent('domain:refresh'));

        // Navigate back to queue
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to update request:', error);
    } finally {
      setIsSubmitting(false);
      handleCloseDialog();
    }
  };

  // Get dialog content based on action
  const getDialogContent = (action) => {
    const titles = {
      approve: getUIText('pf_review_confirm_approve', language) || 'Confirm Approval',
      reject: getUIText('pf_review_confirm_reject', language) || 'Confirm Rejection',
      request_info: getUIText('pf_review_confirm_request_info', language) || 'Confirm Info Request',
    };

    const bodies = {
      approve: getUIText('pf_review_confirm_approve_body', language) ||
        'Are you sure you want to approve this request?',
      reject: getUIText('pf_review_confirm_reject_body', language) ||
        'Are you sure you want to reject this request?',
      request_info: getUIText('pf_review_confirm_request_info_body', language) ||
        'Do you want to request more information from the submitter?',
    };

    return {
      title: titles[action] || 'Confirm',
      body: bodies[action] || 'Are you sure?',
    };
  };

  const dialogContent = getDialogContent(confirmDialog.action);

  // If not reviewable, show read-only state
  if (!isReviewable) {
    return (
      <Paper elevation={1} sx={{ borderRadius: 2, p: 2, bgcolor: 'grey.50' }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            mb: 1.5,
            fontSize: '0.9rem',
            borderBottom: '1px solid',
            borderColor: 'secondary.main',
            pb: 0.5,
          }}
        >
          {sectionTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This request has already been reviewed and cannot be modified.
        </Typography>
        {request?.approval_notes && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              {getUIText('Approval Notes', language) || 'Approval Notes'}:
            </Typography>
            <Typography variant="body2">{request.approval_notes}</Typography>
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={1} sx={{ borderRadius: 2, p: 2 }}>
        {/* Section title */}
        <Typography
          variant="subtitle2"
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            mb: 2,
            fontSize: '0.9rem',
            borderBottom: '1px solid',
            borderColor: 'secondary.main',
            pb: 0.5,
          }}
        >
          {sectionTitle}
        </Typography>

        {/* Two-column layout: Recommended Actions | Approval Status */}
        <Grid container spacing={3} sx={{ mb: 2 }}>
          {/* Recommended Actions - Left */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
              {recommendedTitle}
            </Typography>

            {actions.length > 0 ? (
              <List dense disablePadding>
                {actions.map((action) => (
                  <ListItem key={action.id} disableGutters sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 20 }}>
                      <FiberManualRecordIcon sx={{ fontSize: 6, color: 'text.secondary' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={action.text}
                      primaryTypographyProps={{ variant: 'body2', fontSize: '0.8125rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                No specific actions recommended
              </Typography>
            )}
          </Grid>

          {/* Approval Status - Right */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
              {approvalTitle}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
              {/* Checkbox icon */}
              {isDecided ? (
                <CheckBoxIcon color="success" sx={{ fontSize: 20 }} />
              ) : (
                <CheckBoxOutlineBlankIcon color="action" sx={{ fontSize: 20 }} />
              )}

              {/* Reviewer info */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                  <strong>{reviewerName}</strong>
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                    {' '}({reviewerRole})
                  </Typography>
                </Typography>
              </Box>

              {/* Status chip */}
              {isDecided ? (
                <Chip
                  label={getUIText(`workflow_${request.workflow_status}`, language) || request.workflow_status}
                  size="small"
                  color={request.workflow_status === 'approved' ? 'success' : 'error'}
                  sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                />
              ) : (
                <Chip
                  label={pendingLabel}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                />
              )}
            </Box>

            {/* Reviewed date if applicable */}
            {request?.reviewed_at && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Reviewed: {new Date(request.reviewed_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Notes field */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label={notesLabel}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: 2 }}
          placeholder={language === 'es'
            ? 'Agregue notas o condiciones para esta decisión...'
            : 'Add notes or conditions for this decision...'}
          size="small"
        />

        {/* Action buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ mb: 1.5 }}
        >
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => handleAction('approve')}
            disabled={isSubmitting}
            sx={{ fontWeight: 600 }}
            size="medium"
          >
            {approveLabel}
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<HelpOutlineIcon />}
            onClick={() => handleAction('request_info')}
            disabled={isSubmitting}
            sx={{ fontWeight: 600 }}
            size="medium"
          >
            {requestInfoLabel}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CloseIcon />}
            onClick={() => handleAction('reject')}
            disabled={isSubmitting}
            sx={{ fontWeight: 600 }}
            size="medium"
          >
            {rejectLabel}
          </Button>
        </Stack>

        {/* Footer note */}
        <Typography variant="caption" color="text.secondary">
          {footerNote}
        </Typography>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{dialogContent.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {dialogContent.body}
          </Typography>

          {/* Show request summary */}
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
            <Typography variant="body2">
              <strong>Request:</strong> {request?.request_type} #{request?.id}
            </Typography>
            <Typography variant="body2">
              <strong>Counterparty:</strong> {request?.counterparty_name}
            </Typography>
          </Box>

          {/* Show notes if provided */}
          {notes && (
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {getUIText('Notes', language) || 'Notes'}:
              </Typography>
              <Typography variant="body2">{notes}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={confirmDialog.action === 'reject' ? 'error' : 'primary'}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReviewSection;

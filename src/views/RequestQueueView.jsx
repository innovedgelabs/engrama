import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDomain } from '../contexts/DomainContext';
import { DEFAULT_LANGUAGE, getUIText } from '../utils/i18nHelpers';
import { useStatusHelpers } from '../utils/domainStatus';
import { getRouteSegment, getTabSlug } from '../utils/routing';
import { formatDueDate } from '../utils/requestUtils';
import { deleteRequest } from '../services/requestStorage';
import PageLayout from '../components/layout/PageLayout';
import DataTable from '../components/layout/table/DataTable';
import ListFilterHeader from '../components/common/ListFilterHeader';
import { filterRequestsByUser, isGeneralUser } from '../utils/userRoles';

/**
 * RequestQueueView - List view of requests
 * 
 * Modes:
 * - 'queue': Request Queue for attorneys/admins - shows filtered requests awaiting review
 * - 'my_requests': My Requests for all users - shows only the user's own submissions
 * 
 * @param {string} language - Current language
 * @param {Object} currentUser - Current logged-in user
 * @param {string} mode - 'queue' or 'my_requests'
 */
const RequestQueueView = ({ language = DEFAULT_LANGUAGE, currentUser, mode = 'queue' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentData, currentConfig } = useDomain();
  const { getMetadata } = useStatusHelpers();

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  // Access guard: redirect general users from queue to my-requests
  const isMyRequestsMode = mode === 'my_requests';
  useEffect(() => {
    if (mode === 'queue' && isGeneralUser(currentUser)) {
      navigate('/my-requests', { replace: true });
    }
  }, [mode, currentUser, navigate]);

  // Read filter state from URL params (single-select values)
  const activeFilters = useMemo(() => {
    const statusParam = searchParams.get('status');
    const urgencyParam = searchParams.get('urgency');
    const typeParam = searchParams.get('type');

    return {
      status: statusParam || null,
      urgency: urgencyParam || null,
      type: typeParam || null,
    };
  }, [searchParams]);

  // Handle filter changes (single-select)
  const handleFilterChange = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams);

      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Get all requests
  const allRequests = useMemo(() => {
    return currentData?.requests || [];
  }, [currentData]);

  // Base filtered requests (mode and role-based)
  const baseFilteredRequests = useMemo(() => {
    if (isMyRequestsMode) {
      // My Requests mode: show only current user's requests (all statuses)
      return allRequests.filter((req) => req.submitted_by === currentUser?.name);
    }

    // Queue mode: filter by user role (admin sees all, attorney sees by strategy)
    const roleFiltered = filterRequestsByUser(allRequests, currentUser);

    // Then filter to submitted/in_review (exclude approved/rejected/draft for queue view)
    // Drafts are only visible to their creator in my_requests mode
    return roleFiltered.filter(
      (req) =>
        req.workflow_status === 'submitted' ||
        req.workflow_status === 'in_review'
    );
  }, [allRequests, currentUser, isMyRequestsMode]);

  // Apply URL-based filters on top of base filtering (single-select)
  const filteredRequests = useMemo(() => {
    let result = baseFilteredRequests;

    // Filter by status (use workflow_status, map 'pending' to 'submitted')
    if (activeFilters.status) {
      const mappedStatus = activeFilters.status === 'pending' ? 'submitted' : activeFilters.status;
      result = result.filter((req) => req.workflow_status === mappedStatus);
    }

    // Filter by urgency
    if (activeFilters.urgency) {
      result = result.filter((req) => req.urgency === activeFilters.urgency);
    }

    // Filter by request type
    if (activeFilters.type) {
      result = result.filter((req) => req.request_type === activeFilters.type);
    }

    return result;
  }, [baseFilteredRequests, activeFilters]);

  // Keep pendingRequests for backward compatibility in header count
  const pendingRequests = filteredRequests;

  // Filter configuration for the header
  const filterConfig = useMemo(() => {
    // Status options differ by mode
    const statusOptions = isMyRequestsMode
      ? [
          { value: 'pending', label: getUIText('pf_status_pending', language) },
          { value: 'in_review', label: getUIText('pf_status_in_review', language) },
          { value: 'draft', label: getUIText('workflow_draft', language) || 'DRAFT' },
          { value: 'approved', label: getUIText('pf_status_approved', language) || 'APPROVED' },
          { value: 'rejected', label: getUIText('pf_status_rejected', language) || 'REJECTED' },
        ]
      : [
          { value: 'pending', label: getUIText('pf_status_pending', language) },
          { value: 'in_review', label: getUIText('pf_status_in_review', language) },
        ];

    return [
      {
        key: 'status',
        label: language === 'es' ? 'Estado' : 'Status',
        type: 'select',
        multiple: false,
        options: statusOptions,
        placeholder: language === 'es' ? 'Todos' : 'All',
      },
      {
        key: 'urgency',
        label: language === 'es' ? 'Urgencia' : 'Urgency',
        type: 'select',
        multiple: false,
        options: [
          { value: 'urgent', label: getUIText('pf_urgency_urgent', language) },
          { value: 'high', label: getUIText('pf_urgency_high', language) },
          { value: 'normal', label: getUIText('pf_urgency_normal', language) },
        ],
        placeholder: language === 'es' ? 'Todas' : 'All',
      },
      {
        key: 'type',
        label: language === 'es' ? 'Tipo' : 'Type',
        type: 'select',
        multiple: false,
        options: [
          { value: 'NDA', label: getUIText('pf_request_type_NDA', language) },
          { value: 'MNPI', label: getUIText('pf_request_type_MNPI', language) },
          { value: 'INFO_SHARING', label: getUIText('pf_request_type_INFO_SHARING', language) },
          { value: 'NRL', label: getUIText('pf_request_type_NRL', language) },
        ],
        placeholder: language === 'es' ? 'Todos' : 'All',
      },
    ];
  }, [isMyRequestsMode, language]);

  // Get info tab slug for navigation
  const infoSlug = useMemo(
    () => getTabSlug('info', 'asset', language, currentConfig),
    [language, currentConfig]
  );

  // Get request route segment
  const requestSegment = useMemo(
    () => getRouteSegment('request', language, currentConfig),
    [language, currentConfig]
  );

  // Urgency order for sorting (urgent = 0, high = 1, normal = 2)
  const getUrgencyOrder = useCallback((urgency) => {
    switch (urgency) {
      case 'urgent':
        return 0;
      case 'high':
        return 1;
      case 'normal':
        return 2;
      default:
        return 3;
    }
  }, []);

  // Sort function: urgency first, then due date
  const sortedRequests = useMemo(() => {
    return [...pendingRequests].sort((a, b) => {
      // Primary sort: urgency
      const urgencyA = getUrgencyOrder(a.urgency);
      const urgencyB = getUrgencyOrder(b.urgency);
      if (urgencyA !== urgencyB) {
        return urgencyA - urgencyB;
      }

      // Secondary sort: due date (earliest first)
      const dueDateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const dueDateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return dueDateA - dueDateB;
    });
  }, [pendingRequests, getUrgencyOrder]);

  // Format submission date with time
  const formatSubmissionDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateString;
    }
  }, []);

  // Truncate LEI for display
  const truncateLei = useCallback((lei) => {
    if (!lei) return '';
    return lei.length > 8 ? `${lei.substring(0, 8)}...` : lei;
  }, []);

  // Status badge colors
  const getStatusBadge = useCallback(
    (status) => {
      switch (status) {
        case 'in_review':
          return (
            <Chip
              label={getUIText('pf_status_in_review', language)}
              size="small"
              color="warning"
              sx={{ 
                fontWeight: 600,
                fontSize: '0.75rem',
                height: '24px',
              }}
            />
          );
        case 'submitted':
          return (
            <Chip
              label={getUIText('pf_status_pending', language)}
              size="small"
              color="info"
              sx={{ 
                fontWeight: 600,
                fontSize: '0.75rem',
                height: '24px',
              }}
            />
          );
        case 'draft':
          return (
            <Chip
              label={getUIText('workflow_draft', language) || 'DRAFT'}
              size="small"
              color="default"
              sx={{ 
                fontWeight: 600,
                fontSize: '0.75rem',
                height: '24px',
              }}
            />
          );
        default:
          return (
            <Chip
              label={getMetadata('workflow', status || '', language)?.label || status || 'Unknown'}
              size="small"
              color="default"
              sx={{ 
                fontSize: '0.75rem',
                height: '24px',
              }}
            />
          );
      }
    },
    [language, getMetadata]
  );

  // Urgency badge with due date
  const getUrgencyBadge = useCallback(
    (urgency, dueDate, isOverdue) => {
      const urgencyText = getUIText(`pf_urgency_${urgency}`, language) || urgency?.toUpperCase() || 'NORMAL';
      const dueDateText = dueDate ? formatDueDate(dueDate, urgency) : '';
      const dueLabel = dueDateText
        ? getUIText('pf_due_date', language).replace('{date}', dueDateText)
        : '';

      let color = 'info';
      if (urgency === 'urgent') {
        color = 'error';
      } else if (urgency === 'high') {
        color = 'warning';
      }

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Chip
            label={urgencyText}
            size="small"
            color={color}
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              alignSelf: 'flex-start',
            }}
          />
          {dueLabel && (
            <Typography 
              variant="caption" 
              color={isOverdue ? 'error.main' : 'text.secondary'}
              sx={{ 
                fontSize: '0.75rem',
                fontWeight: isOverdue ? 600 : 400,
              }}
            >
              {isOverdue ? `${getUIText('pf_overdue', language)} - ` : ''}
              {dueLabel}
            </Typography>
          )}
        </Box>
      );
    },
    [language]
  );

  // Check if a request is an editable draft (draft status + current user is creator)
  const isEditableDraft = useCallback(
    (request) => {
      return (
        request.workflow_status === 'draft' &&
        request.submitted_by === currentUser?.name
      );
    },
    [currentUser]
  );

  // Handle delete button click - open confirmation dialog
  const handleDeleteClick = useCallback((e, request) => {
    e.stopPropagation();
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  }, []);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(() => {
    if (requestToDelete) {
      const success = deleteRequest(requestToDelete.id);
      if (success) {
        window.dispatchEvent(new CustomEvent('domain:refresh'));
      }
    }
    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  }, [requestToDelete]);

  // Handle delete cancel
  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  }, []);

  // Table rows with navigation
  const rows = useMemo(
    () =>
      sortedRequests.map((request) => ({
        ...request,
        onClick: () => {
          // Editable drafts go to edit form
          if (isEditableDraft(request)) {
            navigate(`/requests/edit/${request.id}`);
            return;
          }

          // In queue mode (attorneys), go to review view for reviewable requests
          const reviewableStatuses = ['submitted', 'in_review'];
          const shouldGoToReview = !isMyRequestsMode && reviewableStatuses.includes(request.workflow_status);

          if (shouldGoToReview) {
            navigate(`/${requestSegment}/${request.id}/review`);
          } else {
            navigate(`/${requestSegment}/${request.id}/${infoSlug}`);
          }
        },
      })),
    [sortedRequests, requestSegment, infoSlug, navigate, isEditableDraft, isMyRequestsMode]
  );

  // Table columns
  const columns = [
    {
      key: 'request',
      label: 'Request',
      sortable: false,
      cellSx: { py: 1.5, verticalAlign: 'top' },
      render: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {getUIText(`pf_request_type_${row.request_type}`, language) || row.request_type} #{row.id}
          </Typography>
          {getStatusBadge(row.workflow_status)}
        </Box>
      ),
    },
    {
      key: 'entity',
      label: 'Entity',
      sortable: false,
      cellSx: { py: 1.5, verticalAlign: 'top' },
      render: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
            {row.counterparty_name || 'N/A'}
          </Typography>
          {row.entity_identifier && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {row.entity_identifier_type === 'LEI'
                ? truncateLei(row.entity_identifier)
                : row.entity_identifier}
              {' '}
              <Typography
                component="span"
                variant="caption"
                sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
              >
                ({row.entity_identifier_type})
              </Typography>
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'submitted_by',
      label: 'Submitted By',
      sortable: false,
      cellSx: { py: 1.5, verticalAlign: 'top' },
      render: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{row.submitted_by || 'N/A'}</Typography>
          {row.investment_program && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {row.investment_program}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      sortField: 'submitted_at',
      cellSx: { py: 1.5, verticalAlign: 'top' },
      render: (row) => (
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{formatSubmissionDate(row.submitted_at)}</Typography>
      ),
    },
    {
      key: 'urgency',
      label: 'Urgency',
      sortable: true,
      sortField: 'urgency',
      sortAccessor: (row) => getUrgencyOrder(row.urgency),
      cellSx: { py: 1.5, verticalAlign: 'top' },
      render: (row) => getUrgencyBadge(row.urgency, row.due_date, row.is_overdue),
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      align: 'right',
      cellSx: { py: 1.5, verticalAlign: 'top', width: '130px' },
      render: (row) => {
        const isDraft = isEditableDraft(row);
        
        if (isDraft) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/requests/edit/${row.id}`);
                }}
                sx={{ minWidth: '60px' }}
              >
                Edit
              </Button>
              <IconButton
                size="small"
                onClick={(e) => handleDeleteClick(e, row)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'error.main',
                    bgcolor: 'error.lighter',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        }

        // In queue mode (attorneys), go to review view for reviewable requests
        const reviewableStatuses = ['submitted', 'in_review'];
        const shouldGoToReview = !isMyRequestsMode && reviewableStatuses.includes(row.workflow_status);

        return (
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (shouldGoToReview) {
                navigate(`/${requestSegment}/${row.id}/review`);
              } else {
                navigate(`/${requestSegment}/${row.id}/${infoSlug}`);
              }
            }}
            sx={{ minWidth: '70px' }}
          >
            {shouldGoToReview ? (language === 'es' ? 'Revisar' : 'Review') : 'View'}
          </Button>
        );
      },
    },
  ];

  // Action button for the header
  const actionButton = (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={() => navigate('/requests/new')}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
      }}
    >
      {language === 'es' ? 'Nueva Solicitud' : 'New Request'}
    </Button>
  );

  // Title and subtitle based on mode
  const title = isMyRequestsMode
    ? (language === 'es' ? 'Mis Solicitudes' : 'My Requests')
    : getUIText('pf_request_queue_title', language);

  const subtitle = isMyRequestsMode
    ? (language === 'es' ? 'Ver y administrar tus solicitudes enviadas' : 'View and manage your submitted requests')
    : (language === 'es' ? 'Revisar y gestionar solicitudes legales pendientes' : 'Review and manage pending legal requests');

  // Count badge for the header (small blue badge like accordions)
  const requestCount = filteredRequests.length;

  return (
    <PageLayout showBackButton={false}>
      {/* Filter Header */}
      <ListFilterHeader
        title={title}
        subtitle={subtitle}
        countBadge={requestCount}
        actionButton={actionButton}
        filters={filterConfig}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        language={language}
      />

      {/* Data Table */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <DataTable
          columns={columns}
          rows={rows}
          emptyState={{
            title: isMyRequestsMode
              ? (language === 'es' ? 'No tienes solicitudes' : "You don't have any requests")
              : getUIText('pf_request_queue_empty_title', language),
            description: isMyRequestsMode
              ? (language === 'es' ? 'Crea una nueva solicitud para comenzar.' : 'Create a new request to get started.')
              : getUIText('pf_request_queue_empty_desc', language),
          }}
          defaultSort={{ orderBy: 'urgency', order: 'asc' }}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {language === 'es' ? 'Eliminar borrador' : 'Delete Draft'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {language === 'es'
              ? '¿Estás seguro de que deseas eliminar este borrador? Esta acción no se puede deshacer.'
              : 'Are you sure you want to delete this draft? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} color="inherit">
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {language === 'es' ? 'Eliminar' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default RequestQueueView;


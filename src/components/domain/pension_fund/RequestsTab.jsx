import { useMemo } from 'react';
import { Box, Chip, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDomain } from '../../../contexts/DomainContext';
import DataTable from '../../layout/table/DataTable';
import { DEFAULT_LANGUAGE, getUIText } from '../../../utils/i18nHelpers';
import { useStatusHelpers } from '../../../utils/domainStatus';
import { getRouteSegment, getTabSlug } from '../../../utils/routing';

const RequestsTab = ({ entity, language = DEFAULT_LANGUAGE, requests: providedRequests }) => {
  const navigate = useNavigate();
  const { currentData, currentConfig } = useDomain();
  const { getMetadata } = useStatusHelpers();

  const requests = useMemo(() => {
    if (providedRequests) return providedRequests;
    const list = currentData?.requests || [];
    return list.filter((request) => request.counterparty_id === entity.id);
  }, [currentData, entity.id, providedRequests]);

  const infoSlug = useMemo(
    () => getTabSlug('info', 'asset', language, currentConfig),
    [language, currentConfig]
  );

  const rows = useMemo(
    () =>
      requests.map((request) => ({
        ...request,
        onClick: () => {
          const seg = getRouteSegment('request', language, currentConfig);
          navigate(`/${seg}/${request.id}/${infoSlug}`);
        },
      })),
    [requests, language, currentConfig, infoSlug, navigate]
  );

  const workflowColor = {
    approved: 'success',
    rejected: 'error',
    in_review: 'warning',
    submitted: 'info',
    draft: 'default',
  };

  const columns = [
    { key: 'id', label: 'Request ID', render: (row) => row.id },
    {
      key: 'request_type',
      label: 'Type',
      render: (row) => (
        <Chip
          label={getUIText(`pf_request_type_${row.request_type}`, language) || row.request_type || 'Unknown'}
          size="small"
        />
      ),
    },
    { key: 'investment_program', label: 'Program', render: (row) => row.investment_program || 'N/A' },
    { key: 'submitted_by', label: 'Submitted By', render: (row) => row.submitted_by || 'N/A' },
    {
      key: 'workflow_status',
      label: 'Status',
      render: (row) => (
        <Chip
          label={getMetadata('workflow', row.workflow_status || '', language)?.label || row.workflow_status || 'Unknown'}
          size="small"
          color={workflowColor[row.workflow_status] || 'default'}
        />
      ),
    },
    {
      key: 'conflict_severity',
      label: 'Conflicts',
      render: (row) => {
        if (!row.conflict_severity) {
          return <Chip label={getUIText('pf_conflict_none', language)} size="small" color="success" />;
        }
        return (
          <Chip
            label={getUIText(`pf_conflict_${row.conflict_severity}`, language) || row.conflict_severity}
            size="small"
            color={row.conflict_severity === 'critical' ? 'error' : 'warning'}
          />
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with Create Request button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/requests/new?entity=${entity.id}`)}
          sx={{ textTransform: 'none' }}
        >
          Create Request
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={rows}
        emptyState={{
          title: getUIText('pf_requests_empty_title'),
          description: getUIText('pf_requests_empty_desc'),
        }}
      />
    </Box>
  );
};

export default RequestsTab;

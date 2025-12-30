import { useMemo } from 'react';
import { Box, Chip, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDomain } from '../../../contexts/DomainContext';
import DataTable from '../../layout/table/DataTable';
import { DEFAULT_LANGUAGE, getUIText } from '../../../utils/i18nHelpers';
import { useStatusHelpers } from '../../../utils/domainStatus';
import { getRouteSegment, getTabSlug } from '../../../utils/routing';

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ComplianceTab = ({ entity, obligations: providedObligations, language = DEFAULT_LANGUAGE }) => {
  const navigate = useNavigate();
  const { currentData, currentConfig } = useDomain();
  const { getMetadata } = useStatusHelpers();

  const obligations = useMemo(() => {
    if (providedObligations) return providedObligations;
    const list = currentData?.compliance_obligations || [];
    return list.filter((obligation) => obligation.entity_id === entity.id);
  }, [currentData, entity.id, providedObligations]);

  const infoSlug = useMemo(
    () => getTabSlug('info', 'asset', language, currentConfig),
    [language, currentConfig]
  );

  const rows = useMemo(
    () =>
      obligations.map((obligation) => ({
        ...obligation,
        onClick: () => {
          const seg = getRouteSegment('compliance_obligation', language, currentConfig);
          navigate(`/${seg}/${obligation.id}/${infoSlug}`);
        },
      })),
    [obligations, language, currentConfig, infoSlug, navigate]
  );

  const formatDaysUntilExpiration = (expirationDate, daysUntilExpiration) => {
    if (!expirationDate) return 'N/A';
    const days = daysUntilExpiration !== undefined ? daysUntilExpiration : null;
    if (days === null) {
      const now = new Date();
      const expires = new Date(expirationDate);
      const diffDays = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'Expired';
      if (diffDays <= 30) return `${diffDays} days (URGENT)`;
      if (diffDays <= 90) return `${diffDays} days (SOON)`;
      return `${diffDays} days`;
    }
    if (days <= 30) return `${days} days (URGENT)`;
    if (days <= 90) return `${days} days (SOON)`;
    return `${days} days`;
  };

  const columns = [
    {
      key: 'obligation_type',
      label: 'Type',
      render: (row) => (
        <Chip
          label={row.obligation_type || 'Unknown'}
          size="small"
          color={row.obligation_type === 'MNPI' ? 'error' : row.obligation_type === 'REGULATORY' ? 'info' : 'primary'}
        />
      ),
    },
    {
      key: 'action_required',
      label: 'Action Required',
      render: (row) => {
        if (!row.action_required) return 'N/A';
        const isUrgent = row.action_required?.includes('REQUIRED') || row.action_required?.includes('CRITICAL');
        return (
          <Typography
            variant="body2"
            sx={{
              color: isUrgent ? 'error.main' : 'text.primary',
              fontWeight: isUrgent ? 600 : 400,
            }}
          >
            {row.action_required}
          </Typography>
        );
      },
      sortable: true,
    },
    {
      key: 'days_until_expiration',
      label: 'Days Until Expiration',
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            color: row.days_until_expiration && row.days_until_expiration <= 30 ? 'error.main' : row.days_until_expiration && row.days_until_expiration <= 90 ? 'warning.main' : 'text.primary',
            fontWeight: row.days_until_expiration && row.days_until_expiration <= 90 ? 600 : 400,
          }}
        >
          {formatDaysUntilExpiration(row.expiration_date, row.days_until_expiration)}
        </Typography>
      ),
      sortable: true,
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (row) => (
        <Box>
          <Typography variant="body2">{row.owner || 'N/A'}</Typography>
          {row.owner_email && (
            <Typography variant="caption" color="text.secondary">
              {row.owner_email}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'affected_teams',
      label: 'Affected Teams',
      render: (row) => (Array.isArray(row.affected_teams) ? row.affected_teams.join(', ') : 'N/A'),
    },
    {
      key: 'expiration_date',
      label: 'Expires',
      render: (row) => formatDate(row.expiration_date),
      sortable: true,
    },
    {
      key: 'document_reference',
      label: 'Document',
      render: (row) => {
        if (row.document_url) {
          return (
            <Link href={row.document_url} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none' }}>
              {row.document_reference || 'View'}
            </Link>
          );
        }
        return <Typography variant="body2">{row.document_reference || 'N/A'}</Typography>;
      },
    },
    {
      key: 'compliance_status',
      label: 'Status',
      render: (row) => {
        const colorMap = { compliant: 'success', warning: 'warning', critical: 'error' };
        return (
          <Chip
            label={getMetadata('compliance', row.compliance_status || '', language)?.label || row.compliance_status || 'N/A'}
            size="small"
            color={colorMap[row.compliance_status] || 'default'}
          />
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <DataTable
        columns={columns}
        rows={rows}
        emptyState={{
          title: getUIText('pf_compliance_empty_title'),
          description: getUIText('pf_compliance_empty_desc'),
        }}
      />
    </Box>
  );
};

export default ComplianceTab;

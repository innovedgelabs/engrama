import { useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDomain } from '../../../contexts/DomainContext';
import DataTable from '../../layout/table/DataTable';
import { DEFAULT_LANGUAGE, getUIText } from '../../../utils/i18nHelpers';
import { getRouteSegment, getTabSlug } from '../../../utils/routing';

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const SecuritiesTab = ({ entity, securities: providedSecurities, language = DEFAULT_LANGUAGE }) => {
  const navigate = useNavigate();
  const { currentData, currentConfig } = useDomain();

  const securities = useMemo(() => {
    if (providedSecurities) return providedSecurities;
    const list = currentData?.securities || [];
    return list.filter((security) => security.entity_id === entity.id);
  }, [currentData, entity.id, providedSecurities]);

  const infoSlug = useMemo(
    () => getTabSlug('info', 'asset', language, currentConfig),
    [language, currentConfig]
  );

  const rows = useMemo(
    () =>
      securities.map((security) => ({
        ...security,
        onClick: () => {
          const seg = getRouteSegment('security', language, currentConfig);
          navigate(`/${seg}/${security.id}/${infoSlug}`);
        },
      })),
    [securities, language, currentConfig, infoSlug, navigate]
  );

  const columns = [
    {
      key: 'cusip',
      label: 'CUSIP',
      render: (row) => (
        <Typography variant="body2" fontFamily="monospace">
          {row.cusip || 'N/A'}
        </Typography>
      ),
    },
    { key: 'security_name', label: 'Security Name', render: (row) => row.security_name || 'N/A' },
    {
      key: 'security_type',
      label: 'Type',
      render: (row) => (
        <Chip
          label={row.security_type || 'Unknown'}
          size="small"
          color={row.security_type === 'EQUITY_COMMON' ? 'primary' : 'default'}
        />
      ),
    },
    {
      key: 'maturity_date',
      label: 'Maturity',
      render: (row) => formatDate(row.maturity_date),
    },
    {
      key: 'coupon_rate',
      label: 'Coupon',
      render: (row) => row.coupon_rate || 'N/A',
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <DataTable
        columns={columns}
        rows={rows}
        emptyState={{
          title: getUIText('pf_securities_empty_title'),
          description: getUIText('pf_securities_empty_desc'),
        }}
      />
    </Box>
  );
};

export default SecuritiesTab;

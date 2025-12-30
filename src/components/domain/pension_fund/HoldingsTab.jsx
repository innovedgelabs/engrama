import { useMemo } from 'react';
import { Alert, AlertTitle, Box, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDomain } from '../../../contexts/DomainContext';
import DataTable from '../../layout/table/DataTable';
import { DEFAULT_LANGUAGE, getUIText } from '../../../utils/i18nHelpers';
import { getRouteSegment, getTabSlug } from '../../../utils/routing';

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const HoldingsTab = ({ entity, holdings: providedHoldings, language = DEFAULT_LANGUAGE }) => {
  const navigate = useNavigate();
  const { currentData, currentConfig } = useDomain();

  const holdings = useMemo(() => {
    if (providedHoldings) return providedHoldings;
    const list = currentData?.holdings || [];
    return list.filter((holding) => holding.entity_id === entity.id);
  }, [currentData, entity.id, providedHoldings]);

  const infoSlug = useMemo(
    () => getTabSlug('info', 'asset', language, currentConfig),
    [language, currentConfig]
  );

  const rows = useMemo(
    () =>
      holdings.map((holding) => ({
        ...holding,
        onClick: () => {
          const seg = getRouteSegment('holding', language, currentConfig);
          navigate(`/${seg}/${holding.id}/${infoSlug}`);
        },
      })),
    [holdings, language, currentConfig, infoSlug, navigate]
  );

  const uniquePrograms = useMemo(
    () => Array.from(new Set(holdings.map((holding) => holding.investment_program).filter(Boolean))),
    [holdings]
  );

  const totalExposure = useMemo(
    () => holdings.reduce((sum, holding) => sum + (holding.market_value || 0), 0),
    [holdings]
  );

  const columns = [
    { key: 'security_name', label: 'Security', render: (row) => row.security_name || 'N/A' },
    {
      key: 'investment_program',
      label: 'Investment Program',
      render: (row) => <Chip label={row.investment_program || 'Unknown'} size="small" />,
    },
    {
      key: 'market_value',
      label: 'Market Value',
      render: (row) => formatCurrency(row.market_value),
      sortable: true,
    },
    { key: 'capital_stack_position', label: 'Capital Stack', render: (row) => row.capital_stack_position || 'N/A' },
    { key: 'as_of_date', label: 'As Of', render: (row) => row.as_of_date || 'N/A' },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {uniquePrograms.length > 1 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>{getUIText('pf_holdings_alert_title')}</AlertTitle>
          <Typography variant="body2">
            {getUIText('pf_holdings_alert_body')}
            {' '}
            ({uniquePrograms.length}: {uniquePrograms.join(', ')}). {getUIText('pf_holdings_alert_exposure')} {formatCurrency(totalExposure)}.
          </Typography>
        </Alert>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        emptyState={{
          title: getUIText('pf_holdings_empty_title'),
          description: getUIText('pf_holdings_empty_desc'),
        }}
      />
    </Box>
  );
};

export default HoldingsTab;

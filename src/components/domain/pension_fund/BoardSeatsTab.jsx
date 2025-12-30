import { useMemo } from 'react';
import { Alert, AlertTitle, Box, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDomain } from '../../../contexts/DomainContext';
import DataTable from '../../layout/table/DataTable';
import { DEFAULT_LANGUAGE, getUIText } from '../../../utils/i18nHelpers';
import { getRouteSegment, getTabSlug } from '../../../utils/routing';

const BoardSeatsTab = ({
  entity,
  boardSeats: providedBoardSeats,
  holdings: providedHoldings,
  requests: providedRequests,
  language = DEFAULT_LANGUAGE,
}) => {
  const navigate = useNavigate();
  const { currentData, currentConfig } = useDomain();

  const boardSeats = useMemo(() => {
    if (providedBoardSeats) return providedBoardSeats;
    const list = currentData?.board_seats || [];
    return list.filter((seat) => seat.entity_id === entity.id);
  }, [currentData, entity.id, providedBoardSeats]);

  const holdings = useMemo(() => {
    if (providedHoldings) return providedHoldings;
    const list = currentData?.holdings || [];
    return list.filter((holding) => holding.entity_id === entity.id);
  }, [currentData, entity.id, providedHoldings]);

  const relatedRequests = useMemo(() => {
    if (providedRequests) return providedRequests;
    const list = currentData?.requests || [];
    return list.filter((request) => request.counterparty_id === entity.id);
  }, [currentData, entity.id, providedRequests]);

  const uniquePrograms = useMemo(
    () => Array.from(new Set(holdings.map((holding) => holding.investment_program).filter(Boolean))),
    [holdings]
  );

  const boardPrograms = useMemo(
    () => Array.from(new Set(boardSeats.map((seat) => seat.investment_program).filter(Boolean))),
    [boardSeats]
  );

  const hasRequestFromOtherProgram = useMemo(
    () =>
      relatedRequests.some(
        (request) => boardPrograms.length > 0 && request.investment_program && !boardPrograms.includes(request.investment_program)
      ),
    [relatedRequests, boardPrograms]
  );

  const hasBoardSeatConflict =
    boardSeats.length > 0 && (uniquePrograms.length > 1 || hasRequestFromOtherProgram);

  const infoSlug = useMemo(
    () => getTabSlug('info', 'asset', language, currentConfig),
    [language, currentConfig]
  );

  const rows = useMemo(
    () =>
      boardSeats.map((seat) => ({
        ...seat,
        onClick: () => {
          const seg = getRouteSegment('board_seat', language, currentConfig);
          navigate(`/${seg}/${seat.id}/${infoSlug}`);
        },
      })),
    [boardSeats, language, currentConfig, infoSlug, navigate]
  );

  const columns = [
    { key: 'representative_name', label: getUIText('pf_representative'), render: (row) => row.representative_name || 'N/A' },
    { key: 'board_title', label: getUIText('pf_board_title_label'), render: (row) => row.board_title || 'N/A' },
    {
      key: 'investment_program',
      label: getUIText('pf_investment_program'),
      render: (row) => <Chip label={row.investment_program || 'Unknown'} size="small" />,
    },
    { key: 'appointed_date', label: getUIText('pf_appointed'), render: (row) => row.appointed_date || 'N/A' },
    {
      key: 'term_end_date',
      label: getUIText('pf_term_end'),
      render: (row) => row.term_end_date || 'Indefinite',
    },
    {
      key: 'status',
      label: getUIText('pf_status_label'),
      render: (row) => (
        <Chip
          label={row.status || 'Unknown'}
          size="small"
          color={row.status === 'active' ? 'success' : 'default'}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {hasBoardSeatConflict && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>{getUIText('pf_board_alert_title')}</AlertTitle>
          <Typography variant="body2">
            {getUIText('pf_board_alert_body')}
          </Typography>
        </Alert>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        emptyState={{
          title: getUIText('pf_board_empty_title'),
          description: getUIText('pf_board_empty_desc'),
        }}
      />
    </Box>
  );
};

export default BoardSeatsTab;

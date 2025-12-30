import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getUIText } from '../../../../utils/i18nHelpers';

/**
 * RequestContextSection - Combined Request Details (60%) + Entity Summary (40%)
 * 3:2 responsive grid layout
 */
const RequestContextSection = ({ request, entity, holdings, boardSeats, language }) => {
  const requestTitle = getUIText('pf_review_request_details', language) || 'Request Details';
  const entityTitle = getUIText('pf_review_entity', language) || 'Entity';
  const viewEntityLabel = getUIText('pf_review_view_entity', language) || 'View full entity profile';
  const noneLabel = getUIText('pf_review_none', language) || 'None';

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return noneLabel;
    return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate total holdings value
  const totalHoldingsValue = useMemo(() => {
    if (!holdings || holdings.length === 0) return null;
    return holdings.reduce((sum, h) => sum + (h.market_value || 0), 0);
  }, [holdings]);

  // Get active board seats (support multiple)
  const activeBoardSeats = useMemo(() => {
    if (!boardSeats || boardSeats.length === 0) return [];
    return boardSeats.filter(bs => bs.status === 'active');
  }, [boardSeats]);

  // Get entity identifier display (from request enrichment)
  const identifierDisplay = useMemo(() => {
    if (request?.entity_identifier && request?.entity_identifier_type) {
      const identifier = request.entity_identifier_type === 'LEI' && request.entity_identifier.length > 12
        ? `${request.entity_identifier.substring(0, 12)}...`
        : request.entity_identifier;
      return { value: identifier, type: request.entity_identifier_type };
    }
    // Fallback to entity LEI if available
    if (entity?.lei) {
      const lei = entity.lei.length > 12 ? `${entity.lei.substring(0, 12)}...` : entity.lei;
      return { value: lei, type: 'LEI' };
    }
    return null;
  }, [request?.entity_identifier, request?.entity_identifier_type, entity?.lei]);

  // Field display component (matching InfoTab styling)
  // showNA: if true, displays "N/A" when value is empty; if false, hides the field
  const FieldDisplay = ({ label, value, children, showNA = true }) => {
    const displayValue = value || (showNA ? 'N/A' : null);
    if (!displayValue && !children) return null;
    return (
      <Box sx={{ mb: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, display: 'block', mb: 0.25, fontSize: '0.7rem' }}
        >
          {label}
        </Typography>
        {children || (
          <Typography
            variant="body2"
            sx={{ color: value ? 'text.primary' : 'text.secondary', fontSize: '0.8125rem' }}
          >
            {displayValue}
          </Typography>
        )}
      </Box>
    );
  };

  // Quick fact component for entity
  const QuickFact = ({ label, value, highlight = false }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={highlight ? 600 : 500}
        color={highlight ? 'primary.main' : 'text.primary'}
        sx={{ fontSize: '0.8125rem' }}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Paper elevation={1} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
      <Grid container>
        {/* Request Details - 60% (7 of 12 columns) */}
        <Grid item xs={12} lg={7} sx={{ p: 2 }}>
          {/* Section title */}
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
            {requestTitle}
          </Typography>

          <Grid container spacing={1.5}>
            {/* Counterparty */}
            <Grid item xs={12} sm={6} md={4}>
              <FieldDisplay label={language === 'es' ? 'Contraparte' : 'Counterparty'}>
                {entity && request.counterparty_name ? (
                  <Link
                    component={RouterLink}
                    to={`/entity/${entity.id}/info`}
                    sx={{ fontSize: '0.8125rem' }}
                  >
                    {request.counterparty_name}
                  </Link>
                ) : (
                  <Typography variant="body2" sx={{ color: request.counterparty_name ? 'text.primary' : 'text.secondary', fontSize: '0.8125rem' }}>
                    {request.counterparty_name || 'N/A'}
                  </Typography>
                )}
              </FieldDisplay>
            </Grid>
            {/* Target Name */}
            <Grid item xs={12} sm={6} md={4}>
              <FieldDisplay
                label={language === 'es' ? 'Nombre del Objetivo' : 'Target Name'}
                value={request.target_name}
              />
            </Grid>
            {/* Project Name */}
            <Grid item xs={12} sm={6} md={4}>
              <FieldDisplay
                label={language === 'es' ? 'Nombre del Proyecto' : 'Project Name'}
                value={request.project_name}
              />
            </Grid>
            {/* Investment Strategy */}
            <Grid item xs={12} sm={6} md={4}>
              <FieldDisplay
                label={language === 'es' ? 'Estrategia de Inversión' : 'Investment Strategy'}
                value={request.investment_program}
              />
            </Grid>
            {/* Shared To */}
            <Grid item xs={12} sm={6} md={4}>
              <FieldDisplay
                label={language === 'es' ? 'Compartido Con' : 'Shared To'}
                value={request.shared_with_team}
              />
            </Grid>
            {/* Office */}
            <Grid item xs={12} sm={6} md={4}>
              <FieldDisplay
                label={language === 'es' ? 'Oficina' : 'Office'}
                value={request.office_location}
              />
            </Grid>
            {/* Estimated Value */}
            <Grid item xs={12} sm={6} md={4}>
              <FieldDisplay
                label={language === 'es' ? 'Valor Estimado' : 'Estimated Value'}
                value={request.estimated_value ? formatCurrency(request.estimated_value) : null}
              />
            </Grid>
            {/* Submitted By */}
            <Grid item xs={12} sm={6} md={4}>
              <FieldDisplay
                label={language === 'es' ? 'Enviado Por' : 'Submitted By'}
                value={request.submitted_by}
              />
            </Grid>
            {/* Date */}
            <Grid item xs={12} sm={6} md={4}>
              <FieldDisplay
                label={language === 'es' ? 'Fecha' : 'Date'}
                value={formatDate(request.submitted_at)}
              />
            </Grid>
            {/* Purpose */}
            <Grid item xs={12}>
              <FieldDisplay
                label={language === 'es' ? 'Propósito' : 'Purpose'}
                value={request.purpose}
              />
            </Grid>
            {/* Additional Details - only show if present */}
            {request.additional_details && (
              <Grid item xs={12}>
                <FieldDisplay
                  label={language === 'es' ? 'Detalles Adicionales' : 'Additional Details'}
                  value={request.additional_details}
                  showNA={false}
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Vertical Divider - only on lg+ */}
        <Grid
          item
          lg="auto"
          sx={{
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'stretch',
          }}
        >
          <Divider orientation="vertical" flexItem />
        </Grid>

        {/* Horizontal Divider - only on xs-md */}
        <Grid item xs={12} sx={{ display: { xs: 'block', lg: 'none' }, px: 2 }}>
          <Divider />
        </Grid>

        {/* Entity Summary - 40% (remaining columns) */}
        <Grid item xs={12} lg sx={{ p: 2 }}>
          {/* Section title */}
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
            {entityTitle}
          </Typography>

          {entity ? (
            <>
              {/* Entity name with link */}
              <Link
                component={RouterLink}
                to={`/entity/${entity.id}/info`}
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                <Typography variant="subtitle1" fontWeight={600} color="primary.main" sx={{ mb: 0.5 }}>
                  {entity.name}
                </Typography>
              </Link>

              {/* Identifier (type) • Entity Type • Country - all in one row */}
              {(identifierDisplay || entity.entity_type || entity.country) && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  {[
                    identifierDisplay && `${identifierDisplay.value} (${identifierDisplay.type})`,
                    entity.entity_type,
                    entity.country,
                  ].filter(Boolean).join(' • ')}
                </Typography>
              )}

              {/* Quick Facts */}
              <Box sx={{ mb: 1.5 }}>
                <QuickFact
                  label={getUIText('pf_review_total_holdings', language) || 'BCI holds'}
                  value={formatCurrency(totalHoldingsValue)}
                  highlight={!!totalHoldingsValue}
                />
                {/* Only show board members if there are active ones */}
                {activeBoardSeats.length > 0 && (
                  <QuickFact
                    label={getUIText('pf_review_board_member', language) || 'Board member'}
                    value={
                      activeBoardSeats.length === 1
                        ? `${activeBoardSeats[0].representative_name} (${activeBoardSeats[0].board_title})`
                        : activeBoardSeats.map(bs => bs.representative_name).join(', ')
                    }
                    highlight
                  />
                )}
                {holdings && holdings.length > 0 && (
                  <QuickFact
                    label={getUIText('Investment Programs', language) || 'Programs'}
                    value={[...new Set(holdings.map(h => h.investment_program))].join(', ')}
                  />
                )}
              </Box>

              {/* Link to entity profile */}
              <Link
                component={RouterLink}
                to={`/entity/${entity.id}/info`}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                }}
              >
                {viewEntityLabel}
                <OpenInNewIcon sx={{ fontSize: 14 }} />
              </Link>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Entity information not available
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RequestContextSection;

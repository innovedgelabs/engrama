import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import PageLayout from '../components/layout/PageLayout';
import DataTable from '../components/layout/table/DataTable';
import ListFilterHeader from '../components/common/ListFilterHeader';
import ScrollContainer from '../components/common/ScrollContainer';
import { DEFAULT_LANGUAGE, getUIText } from '../utils/i18nHelpers';
import { getRouteSegment, getTabSlug } from '../utils/routing';
import { useDomain } from '../contexts/DomainContext';

/**
 * Format currency value to compact notation
 */
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

/**
 * Get the best available security identifier (ISIN > CUSIP > ID)
 */
const getSecurityIdentifier = (holding) => {
  return holding.isin || holding.cusip || holding.security_id || 'N/A';
};

/**
 * HoldingsListView - Displays holdings grouped by entity with filters
 * Accessible via /security route (same as Securities nav item)
 *
 * Features:
 * - Holdings grouped by entity using accordions
 * - Investment strategy filter (pills on desktop, dropdown on mobile)
 * - Entity autocomplete filter
 */
const HoldingsListView = ({ language = DEFAULT_LANGUAGE }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentData, currentConfig } = useDomain();

  // Get holdings from domain data
  const allHoldings = useMemo(() => currentData?.holdings || [], [currentData]);

  // Get all assets lookup map
  const assetsById = useMemo(() => {
    const assets = currentData?.assets || [];
    return assets.reduce((acc, asset) => {
      acc[asset.id] = asset;
      return acc;
    }, {});
  }, [currentData]);

  // Get entities that have holdings (derived from holdings data)
  const entitiesWithHoldings = useMemo(() => {
    const entityIds = new Set(allHoldings.map((h) => h.entity_id).filter(Boolean));
    return Array.from(entityIds)
      .map((id) => assetsById[id])
      .filter(Boolean)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [allHoldings, assetsById]);

  // Extract unique investment programs from all holdings
  const allInvestmentPrograms = useMemo(() => {
    const programs = new Set();
    allHoldings.forEach((holding) => {
      if (holding.investment_program) {
        programs.add(holding.investment_program);
      }
    });
    return Array.from(programs).sort();
  }, [allHoldings]);

  // Read filter state from URL params
  const activeFilters = useMemo(() => {
    const programParam = searchParams.get('program');
    const entityParam = searchParams.get('entity');
    const selectedEntity = entityParam
      ? entitiesWithHoldings.find((e) => e.id === entityParam) || null
      : null;

    return {
      program: programParam ? programParam.split(',').filter(Boolean) : [],
      entity: selectedEntity,
    };
  }, [searchParams, entitiesWithHoldings]);

  // For backward compatibility
  const selectedPrograms = activeFilters.program;
  const selectedEntity = activeFilters.entity;

  // Handle filter changes from ListFilterHeader
  const handleFilterChange = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams);

      if (key === 'entity') {
        // Entity is an object, store its ID
        if (value && value.id) {
          params.set('entity', value.id);
        } else {
          params.delete('entity');
        }
      } else if (key === 'program') {
        if (value === null || (Array.isArray(value) && value.length === 0)) {
          params.delete('program');
        } else if (Array.isArray(value)) {
          params.set('program', value.join(','));
        }
      }

      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Handle program chip click (used in table column)
  const handleProgramChipClick = useCallback(
    (program) => {
      const current = activeFilters.program;
      const updated = current.includes(program)
        ? current.filter((p) => p !== program)
        : [...current, program];
      handleFilterChange('program', updated.length > 0 ? updated : null);
    },
    [activeFilters.program, handleFilterChange]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Filter holdings based on selected filters
  const filteredHoldings = useMemo(() => {
    let result = allHoldings;

    // Filter by investment program (multi-select)
    if (selectedPrograms.length > 0) {
      result = result.filter((h) => selectedPrograms.includes(h.investment_program));
    }

    // Filter by entity (single-select)
    if (selectedEntity) {
      result = result.filter((h) => h.entity_id === selectedEntity.id);
    }

    return result;
  }, [allHoldings, selectedPrograms, selectedEntity]);

  // Group filtered holdings by entity
  const holdingsByEntity = useMemo(() => {
    return filteredHoldings.reduce((acc, holding) => {
      const key = holding.entity_id || holding.entity_name || 'unknown';
      if (!acc[key]) {
        const entity = assetsById[holding.entity_id];
        acc[key] = {
          entity_id: holding.entity_id,
          entity_name: holding.entity_name || entity?.name || 'Unknown Entity',
          entity_industry: entity?.industry || null,
          holdings: [],
          totalMarketValue: 0,
        };
      }
      acc[key].holdings.push(holding);
      acc[key].totalMarketValue += holding.market_value || 0;
      return acc;
    }, {});
  }, [filteredHoldings, assetsById]);

  const entityKeys = Object.keys(holdingsByEntity);

  // Track expanded accordions (all expanded by default)
  const [expanded, setExpanded] = useState(() =>
    entityKeys.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {})
  );

  const handleAccordionChange = (entityKey) => (_event, isExpanded) => {
    setExpanded((prev) => ({
      ...prev,
      [entityKey]: isExpanded,
    }));
  };

  // Get route segments for navigation
  const infoSlug = useMemo(
    () => getTabSlug('info', 'asset', language, currentConfig),
    [language, currentConfig]
  );

  // Table columns for holdings
  const columns = useMemo(
    () => [
      {
        key: 'security_name',
        label: language === 'es' ? 'Valor' : 'Security',
        render: (row) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.security_name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getSecurityIdentifier(row)}
            </Typography>
          </Box>
        ),
        sortable: true,
        sortAccessor: (row) => row.security_name || '',
      },
      {
        key: 'investment_program',
        label: language === 'es' ? 'Programa' : 'Program',
        render: (row) => (
          <Chip
            label={row.investment_program || 'Unknown'}
            size="small"
            color={selectedPrograms.includes(row.investment_program) ? 'primary' : 'default'}
            onClick={(e) => {
              e.stopPropagation();
              handleProgramChipClick(row.investment_program);
            }}
            sx={{ cursor: 'pointer' }}
          />
        ),
      },
      {
        key: 'market_value',
        label: language === 'es' ? 'Valor de Mercado' : 'Market Value',
        render: (row) => formatCurrency(row.market_value),
        sortable: true,
        sortAccessor: (row) => row.market_value || 0,
      },
      {
        key: 'capital_stack_position',
        label: language === 'es' ? 'Capital Stack' : 'Capital Stack',
        render: (row) => row.capital_stack_position || 'N/A',
      },
      {
        key: 'as_of_date',
        label: language === 'es' ? 'Fecha' : 'As Of',
        render: (row) => row.as_of_date || 'N/A',
        sortable: true,
      },
    ],
    [language, selectedPrograms, handleProgramChipClick]
  );

  // Create rows with onClick handlers for each entity group
  const createRowsForEntity = useCallback(
    (entityData) => {
      return entityData.holdings.map((holding) => ({
        ...holding,
        onClick: () => {
          const seg = getRouteSegment('holding', language, currentConfig);
          navigate(`/${seg}/${holding.id}/${infoSlug}`);
        },
      }));
    },
    [language, currentConfig, infoSlug, navigate]
  );

  // Check if any filters are active
  const hasActiveFilters = selectedPrograms.length > 0 || selectedEntity !== null;

  // Filter configuration for ListFilterHeader
  const filterConfig = useMemo(() => [
    {
      key: 'program',
      label: language === 'es' ? 'Estrategia de Inversión' : 'Investment Strategy',
      type: 'chips',
      multiple: true,
      options: allInvestmentPrograms.map((program) => ({
        value: program,
        label: program,
      })),
    },
    {
      key: 'entity',
      label: language === 'es' ? 'Filtrar por Entidad' : 'Filter by Entity',
      type: 'autocomplete',
      multiple: false,
      options: entitiesWithHoldings,
      placeholder: language === 'es' ? 'Todas las entidades' : 'All entities',
      getOptionLabel: (option) => option?.name || '',
      isOptionEqualToValue: (option, value) => option?.id === value?.id,
      renderOption: (props, option) => {
        const { key, ...otherProps } = props;
        return (
          <Box component="li" key={key} {...otherProps}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.entity_type} • {option.industry}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
  ], [language, allInvestmentPrograms, entitiesWithHoldings]);

  // Subtitle describing the view
  const subtitle = language === 'es'
    ? 'Ver y filtrar posiciones de valores por estrategia y entidad'
    : 'View and filter security holdings by strategy and entity';

  return (
    <PageLayout showBackButton={false}>
      {/* Filter Header */}
      <ListFilterHeader
        title={language === 'es' ? 'Posiciones de Valores' : 'Security Holdings'}
        subtitle={subtitle}
        countBadge={filteredHoldings.length}
        filters={filterConfig}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        language={language}
      />

      {/* Grouped Holdings */}
      {entityKeys.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1rem' }}>
            {getUIText('noResultsTitle', language)}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
            {hasActiveFilters
              ? language === 'es'
                ? 'No hay posiciones que coincidan con los filtros seleccionados.'
                : 'No holdings match the selected filters.'
              : getUIText('noResultsSubtitle', language)}
          </Typography>
        </Box>
      ) : (
        <Box>
          {entityKeys.map((entityKey) => {
            const entityData = holdingsByEntity[entityKey];
            const rows = createRowsForEntity(entityData);
            const isExpanded = expanded[entityKey] !== false;

            return (
              <Accordion
                key={entityKey}
                expanded={isExpanded}
                onChange={handleAccordionChange(entityKey)}
                sx={{
                  mb: { xs: 1, sm: 1.5, md: 2 },
                  boxShadow: { xs: 0, sm: 1 },
                  border: { xs: '1px solid', sm: 'none' },
                  borderColor: { xs: 'divider', sm: 'transparent' },
                  '&:before': {
                    display: 'none',
                  },
                  borderRadius: { xs: '4px !important', sm: '6px !important', md: '8px !important' },
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />}
                  sx={{
                    minHeight: { xs: 44, sm: 48, md: 56 },
                    borderBottom: isExpanded ? '2px solid' : 'none',
                    borderColor: 'secondary.main',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                      my: { xs: 0.75, sm: 1, md: 1.5 },
                      mx: 0,
                    },
                    px: { xs: 1.25, sm: 1.5, md: 2 },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      gap: 1,
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        component="h2"
                        sx={{
                          fontWeight: 600,
                          color: 'primary.main',
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: { xs: 'normal', sm: 'nowrap' },
                        }}
                      >
                        {entityData.entity_name}
                      </Typography>
                      <Chip
                        label={entityData.holdings.length}
                        size="small"
                        color="primary"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          height: { xs: 20, sm: 24 },
                          minWidth: { xs: 28, sm: 32 },
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatCurrency(entityData.totalMarketValue)}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <ScrollContainer
                    sx={{
                      pt: { xs: 1, sm: 1.5, md: 2 },
                      pb: { xs: 1.5, sm: 2, md: 3 },
                      px: { xs: 0.75, sm: 1, md: 2 },
                      maxHeight: 'calc(100vh - 350px)',
                      overflowX: 'hidden',
                    }}
                  >
                    <DataTable
                      columns={columns}
                      rows={rows}
                      emptyState={{
                        title:
                          language === 'es'
                            ? 'No hay posiciones para esta entidad'
                            : 'No holdings for this entity',
                        description: '',
                      }}
                    />
                  </ScrollContainer>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </PageLayout>
  );
};

export default HoldingsListView;

import { useState, memo, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import FilterChip from '../../common/FilterChip';
import CategoryTabs, { CATEGORY_ICONS } from '../../common/CategoryTabs';
import DataTable from '../../layout/table/DataTable';
import ExpandableRow from '../../common/ExpandableRow';
import FilterFAB from '../../common/FilterFAB';
import FilterDrawer from '../../common/FilterDrawer';
import { DEFAULT_LANGUAGE, getCategoryLabel, getUIText } from '../../../utils/i18nHelpers';
import { getCategorySlug, getTabSlug } from '../../../utils/routing';
import { useDomain } from '../../../contexts/DomainContext';
import { useStatusHelpers } from '../../../utils/domainStatus';

// Import STATUS_METADATA from status.js instead of hardcoding colors
// This will be used to get bgColor and textColor for custom status rendering

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).toLowerCase();
};

// Map legacy asset status values to compliance dimension values
const mapLegacyStatusToCompliance = (status) => {
  const statusMap = {
    'active': 'current',
    'warning': 'expiring',
    'pending': 'expiring',
    'expired': 'expired',
  };
  return statusMap[status] || status;
};

const createColumnDefinitions = (language, renderTypeChip, renderStatusChip, getMetadata) => {
  const baseColumns = [
    {
      key: 'razonSocial',
      label: getUIText('columnLegalName', language),
      sortable: true,
      sortAccessor: (row) => row.asset.razonSocial || row.asset.name || '',
      render: (row) => row.asset.razonSocial || row.asset.name || '-',
    },
    {
      key: 'rif',
      label: getUIText('columnTaxId', language),
      sortable: true,
      sortAccessor: (row) => row.asset.rif || row.asset.code || '',
      render: (row) => row.asset.rif || row.asset.code || '-',
    },
    {
      key: 'ciudad',
      label: getUIText('columnCity', language),
      sortable: true,
      sortAccessor: (row) => row.asset.ciudad || row.asset.city || '',
      render: (row) => row.asset.ciudad || row.asset.city || '-',
    },
    {
      key: 'pais',
      label: getUIText('columnCountry', language),
      sortable: true,
      sortAccessor: (row) => row.asset.pais || row.asset.country || '',
      render: (row) => row.asset.pais || row.asset.country || '-',
    },
  ];

  const getBaseColumns = () => baseColumns.map((column) => ({ ...column }));

  return {
    default: [
      {
        key: 'type',
        label: getUIText('columnType', language),
        sortable: true,
        sortAccessor: (row) => row.asset.category ?? '',
        render: (row) => renderTypeChip(row.asset),
      },
      {
        key: 'name',
        label: getUIText('columnName', language),
        sortable: true,
        sortAccessor: (row) => row.asset.name ?? '',
        render: (row) => row.asset.name,
      },
      {
        key: 'info',
        label: getUIText('columnInfo', language),
        sortable: true,
        sortAccessor: (row) => row.asset.activities || row.asset.descripcion || '',
        render: (row) => row.asset.activities || row.asset.descripcion || '-',
      },
      {
        key: 'status',
        label: getUIText('columnStatus', language),
        sortable: true,
        sortAccessor: (row) => {
          const rawStatus = row.asset?.complianceStatus ?? row.asset?.status;
          if (!rawStatus) {
            return '';
          }
          const statusKey = mapLegacyStatusToCompliance(rawStatus);
          const metadata = getMetadata('compliance', statusKey, language) || {};
          return metadata?.label ?? statusKey ?? '';
        },
        render: (row) => renderStatusChip(row.asset),
      },
    ],
    company: getBaseColumns(),
    supplier: getBaseColumns(),
    customer: getBaseColumns(),
    product: [
      {
        key: 'name',
        label: getUIText('columnProduct', language),
        sortable: true,
        sortAccessor: (row) => row.asset.name ?? '',
        render: (row) => row.asset.name,
      },
      {
        key: 'code',
        label: getUIText('columnCode', language),
        sortable: true,
        sortAccessor: (row) => row.asset.code || '',
        render: (row) => row.asset.code || '-',
      },
      {
        key: 'brand',
        label: getUIText('columnBrand', language),
        sortable: true,
        sortAccessor: (row) => row.asset.marca || '',
        render: (row) => row.asset.marca || '-',
      },
      {
        key: 'description',
        label: getUIText('columnDescription', language),
        sortable: true,
        sortAccessor: (row) => row.asset.descripcion || row.asset.activities || '',
        render: (row) => row.asset.descripcion || row.asset.activities || '-',
      },
      {
        key: 'status',
        label: getUIText('columnStatus', language),
        sortable: true,
        sortAccessor: (row) => {
          const rawStatus = row.asset?.complianceStatus ?? row.asset?.status;
          if (!rawStatus) {
            return '';
          }
          const statusKey = mapLegacyStatusToCompliance(rawStatus);
          const metadata = getMetadata('compliance', statusKey, language) || {};
          return metadata?.label ?? statusKey ?? '';
        },
        render: (row) => renderStatusChip(row.asset),
      },
    ],
  };
};

const RelatedTab = ({
  relatedAssets = [],
  currentCategory: currentCategoryKey,
  activeFilters = {},
  onCategoryChange,
  onFilterChange,
  language = DEFAULT_LANGUAGE,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentConfig } = useDomain();
  const { getMetadata } = useStatusHelpers();
  const categories = useMemo(() => {
    if (currentConfig?.routing?.categoryOrder?.length) {
      return currentConfig.routing.categoryOrder;
    }
    if (currentConfig?.entities) {
      return Object.keys(currentConfig.entities);
    }
    return [];
  }, [currentConfig]);
  const categoryFromPath = useMemo(() => {
    if (!currentCategoryKey) {
      return null;
    }
    return categories.includes(currentCategoryKey) ? currentCategoryKey : null;
  }, [currentCategoryKey, categories]);

  const [activeCategory, setActiveCategory] = useState(categoryFromPath);
  const [sortStates, setSortStates] = useState(() => ({
    default: { orderBy: 'type', order: 'asc' },
  }));
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const resolveCategoryIcon = useCallback(
    (category) => {
      const iconName = currentConfig?.entities?.[category]?.icon;
      if (iconName && MuiIcons[iconName]) {
        const IconComponent = MuiIcons[iconName];
        return <IconComponent fontSize="inherit" />;
      }
      return CATEGORY_ICONS[category];
    },
    [currentConfig],
  );

  useEffect(() => {
    setActiveCategory(categoryFromPath);
  }, [categoryFromPath]);

  const renderStatusChip = useCallback(
    (asset) => {
      // Related assets show compliance status (current/expiring/expired)
      // Map legacy status values to compliance dimension values
      const rawStatus = asset.complianceStatus ?? asset.status ?? 'unknown';
      const statusKey = mapLegacyStatusToCompliance(rawStatus);
      const statusMetadata =
        getMetadata('compliance', statusKey, language) || {};
      const label =
        statusMetadata?.label ??
        (statusKey ? statusKey : getUIText('unknownStatus', language));
      const bgColor = statusMetadata?.color;

      return (
        <FilterChip
          label={label}
          color="default"
          size="small"
          filterKey="status"
          filterValue={statusKey}
          activeFilters={activeFilters}
          onFilterChange={onFilterChange}
          sx={{
            fontSize: '0.75rem',
            height: 22,
            ...(bgColor && {
              backgroundColor: bgColor,
              color: '#fff',
              '&:hover': {
                backgroundColor: bgColor,
                filter: 'brightness(0.9)',
              },
            }),
          }}
        />
      );
    },
    [activeFilters, language, onFilterChange, getMetadata]
  );

  const renderTypeChip = useCallback(
    (asset) => (
      <FilterChip
        icon={resolveCategoryIcon(asset.category)}
        label={
          currentConfig?.entities?.[asset.category]?.label?.[language] ??
          getCategoryLabel(asset.category, language) ??
          asset.category
        }
        size="small"
        variant="outlined"
        filterKey="category"
        filterValue={asset.category}
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
        sx={{ fontSize: '0.75rem', height: 22 }}
      />
    ),
    [activeFilters, language, onFilterChange, resolveCategoryIcon, currentConfig]
  );

  const columnDefinitions = useMemo(
    () => createColumnDefinitions(language, renderTypeChip, renderStatusChip, getMetadata),
    [language, renderStatusChip, renderTypeChip, getMetadata]
  );

  const handleTabChange = (event, nextCategory) => {
    setActiveCategory(nextCategory ?? null);

    if (!onCategoryChange) {
      return;
    }

    onCategoryChange(nextCategory ?? null);
  };

  const categoryFilteredAssets = useMemo(() => {
    if (!activeCategory) {
      return relatedAssets;
    }
    return relatedAssets.filter(item => item.asset.category === activeCategory);
  }, [activeCategory, relatedAssets]);

  const filteredAssets = useMemo(() => {
    if (!activeFilters || Object.keys(activeFilters).length === 0) {
      return categoryFilteredAssets;
    }

    return categoryFilteredAssets.filter((item) => {
      return Object.entries(activeFilters).every(([key, rawValue]) => {
        if (rawValue === null || rawValue === undefined || rawValue === '') {
          return true;
        }

        const value = normalizeValue(rawValue);

        switch (key) {
          case 'status':
            const rawStatus = item.asset.complianceStatus ?? item.asset.status ?? 'unknown';
            const mappedStatus = mapLegacyStatusToCompliance(rawStatus);
            return normalizeValue(mappedStatus) === value;
          case 'category':
            return normalizeValue(item.asset.category) === value;
          default:
            return true;
        }
      });
    });
  }, [activeFilters, categoryFilteredAssets]);

  const selectedCategory = activeCategory ?? null;

  const activeColumnDefinitions = useMemo(() => {
    if (!selectedCategory) {
      return columnDefinitions.default;
    }
    return columnDefinitions[selectedCategory] ?? columnDefinitions.default;
  }, [columnDefinitions, selectedCategory]);

  const sortKey = selectedCategory ?? 'default';

  const currentSort = useMemo(
    () => sortStates[sortKey] ?? { orderBy: null, order: 'asc' },
    [sortStates, sortKey]
  );

  const handleSortChange = useCallback(
    (nextSort) => {
      setSortStates((prev) => ({
        ...prev,
        [sortKey]: nextSort,
      }));
    },
    [sortKey]
  );

  const rows = useMemo(
    () =>
      filteredAssets.map((item) => ({
        id: item.asset.id,
        asset: item.asset,
        relations: item.relations,
        onClick: () => {
          const categorySlug = getCategorySlug(item.asset.category, language, currentConfig);
          const infoSlug = getTabSlug('info', 'asset', language, currentConfig);
          navigate(`/${categorySlug}/${item.asset.id}/${infoSlug}`);
        },
      })),
    [filteredAssets, navigate, language]
  );

  // Mobile view with ExpandableRow
  if (isMobile) {
    const hasActiveFilters = activeFilters && Object.keys(activeFilters).length > 0;
    const activeFilterCount = hasActiveFilters ? Object.keys(activeFilters).length : 0;

    // Generate active filter chips
    const activeFilterChips = [];
    if (activeFilters?.status) {
      const statusMeta = getMetadata('compliance', activeFilters.status, language) || {};
      const statusLabel = statusMeta.label;
      activeFilterChips.push(
        <FilterChip
          key="status"
          label={statusLabel}
          color="default"
          size="small"
          mode="selected"
          onDelete={(e) => {
            e.stopPropagation();
            onFilterChange('status', null);
          }}
          sx={{
            fontSize: '0.7rem',
            height: 24,
            ...(statusMeta.color && {
              backgroundColor: statusMeta.color,
              color: '#fff',
              '& .MuiChip-deleteIcon': {
                color: '#fff',
                opacity: 0.7,
                '&:hover': {
                  opacity: 1,
                },
              },
            }),
          }}
        />
      );
    }
    if (activeFilters?.category) {
      activeFilterChips.push(
        <FilterChip
          key="category"
          label={
            currentConfig?.entities?.[activeFilters.category]?.label?.[language] ||
            currentConfig?.entities?.[activeFilters.category]?.label?.en ||
            activeFilters.category
          }
          size="small"
          variant="outlined"
          color="primary"
          mode="selected"
          onDelete={(e) => {
            e.stopPropagation();
            onFilterChange('category', null);
          }}
          sx={{ fontSize: '0.7rem', height: 24 }}
        />
      );
    }

    // Available filter options
    const availableFilterOptions = useMemo(() => {
      const statuses = [...new Set(
        filteredAssets.map(item => {
          const rawStatus = item.asset.complianceStatus ?? item.asset.status;
          return mapLegacyStatusToCompliance(rawStatus);
        })
      )].filter(Boolean);
      const categoriesSet = [...new Set(filteredAssets.map(item => item.asset.category))].filter(Boolean);

      return {
        statuses,
        categories: categoriesSet,
      };
    }, [filteredAssets]);

    return (
      <>
        <Box sx={{ p: 2, pb: 2 }}>
          {/* Active Filter Chips */}
          {hasActiveFilters && activeFilterChips.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.65, flexWrap: 'wrap', mb: 1.5 }}>
              {activeFilterChips}
            </Box>
          )}

          {/* Related Assets List or Empty State */}
          {filteredAssets.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                {getUIText('relatedEmptyTitle', language)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 1, display: 'block' }}>
                {getUIText('relatedEmptyDescription', language)}
              </Typography>
            </Box>
          ) : (
            filteredAssets.map((item) => {
              const asset = item.asset;
              const rawStatus = asset.complianceStatus ?? asset.status;
              const statusKey = mapLegacyStatusToCompliance(rawStatus);
              const statusMeta = getMetadata('compliance', statusKey, language) || {};
              const categoryLabel = getCategoryLabel(asset.category, language);

              return (
                <ExpandableRow
                  key={asset.id}
                  title={asset.name}
                  borderColor={statusMeta.color || 'divider'}
                  details={[
                    { label: getUIText('columnType', language), value: categoryLabel },
                    { label: getUIText('columnInfo', language), value: asset.activities || asset.descripcion || '-' },
                    { label: getUIText('columnStatus', language), value: statusMeta.label },
                    ...(asset.razonSocial || asset.rif || asset.ciudad ? [
                      { label: getUIText('columnLegalName', language), value: asset.razonSocial || '-' },
                      { label: getUIText('columnTaxId', language), value: asset.rif || asset.code || '-' },
                      { label: getUIText('columnCity', language), value: asset.ciudad || asset.city || '-' },
                    ] : []),
                  ]}
                  onClick={() => {
                    const categorySlug = getCategorySlug(asset.category, language, currentConfig);
                    const infoSlug = getTabSlug('info', 'asset', language, currentConfig);
                    navigate(`/${categorySlug}/${asset.id}/${infoSlug}`);
                  }}
                  language={language}
                />
              );
            })
          )}
        </Box>

        {/* Filter FAB - Always show on mobile */}
        <FilterFAB
          onClick={() => setIsFilterDrawerOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* Filter Drawer with Categories */}
      <FilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={activeFilters}
        onFilterChange={onFilterChange}
          availableOptions={availableFilterOptions}
          language={language}
          sections={[
            {
              key: 'category',
              label: getUIText('filterByCategory', language),
              type: 'category',
              options: categories, // All categories available
            },
            {
              key: 'status',
              label: getUIText('filterByStatus', language),
              type: 'status',
              options: availableFilterOptions.statuses,
            },
          ]}
        />
      </>
    );
  }

  // Desktop view with DataTable
  return (
    <Paper elevation={0} sx={{ borderRadius: 0, overflow: 'hidden', height: '100%' }}>
      <CategoryTabs
        value={activeCategory}
        onChange={handleTabChange}
        language={language}
        categories={categories}
        domainConfig={currentConfig}
      />

      <DataTable
        columns={activeColumnDefinitions}
        rows={rows}
        sortState={currentSort}
        onSortChange={handleSortChange}
        emptyState={{
          title: getUIText('relatedEmptyTitle', language),
          description: getUIText('relatedEmptyDescription', language),
        }}
      />
    </Paper>
  );
};

export default memo(RelatedTab);

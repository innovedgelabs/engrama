import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  VisibilityOutlined as VisibilityIcon,
  FileDownloadOutlined as DownloadIcon,
  IosShare as ShareIcon,
} from '@mui/icons-material';
import {
  calculateComplianceStatus,
  calculateWorkflowStatus,
  COMPLIANCE_STATUS,
  WORKFLOW_STATUS,
  formatDisplayDate,
} from '../utils/status';
import { getUIText, getCategoryLabel } from '../utils/i18nHelpers';
import { getRouteSegment, getTabSlug } from '../utils/routing';
import CategoryTabs, { CATEGORY_ORDER } from '../components/common/CategoryTabs';
import FilterChip from '../components/common/FilterChip';
import FilterDrawer from '../components/common/FilterDrawer';
import FilterFAB from '../components/common/FilterFAB';
import DataTable from '../components/layout/table/DataTable';
import ExpandableRow from '../components/common/ExpandableRow';
import UpcomingExpirationsList from '../components/common/UpcomingExpirationsList';
import ContentPanel from '../components/layout/ContentPanel';
import PageLayout from '../components/layout/PageLayout';
import { aggregateDashboardStats } from '../utils/dashboardCalculations';
import { useDomain } from '../contexts/DomainContext';
import { useStatusHelpers } from '../utils/domainStatus';

const COMPLIANCE_SORT_PRIORITY = {
  [COMPLIANCE_STATUS.EXPIRED]: 0,
  [COMPLIANCE_STATUS.EXPIRING]: 1,
  [COMPLIANCE_STATUS.CURRENT]: 2,
  [COMPLIANCE_STATUS.PERMANENT]: 3,
};

const createEmptyAffairFilters = () => ({
  complianceStatus: [],
  affairType: [],
  affairAsset: [],
  affairCategory: [],
  affairExpiryDate: [],
  affairResponsible: [],
});

const ControlPanelContent = ({
  language = 'es'
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = !(isMobile || isTablet);
  const isCompactLayout = isMobile || isTablet;
  const { currentData, currentConfig } = useDomain();
  const assets = currentData?.assets ?? [];
  const regulatoryAffairs = currentData?.regulatory_affairs ?? [];
  const renewals = currentData?.renewals ?? [];
  const { getMetadata } = useStatusHelpers();

  // Calculate dashboard stats to get urgency groups
  const dashboardStats = useMemo(() => {
    const stats = aggregateDashboardStats(renewals);
    return stats;
  }, [renewals]);

  // Table state
  const [activeAffairCategory, setActiveAffairCategory] = useState(null);
  const [affairFilters, setAffairFilters] = useState(() => createEmptyAffairFilters());
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Data transformation
  const assetsById = useMemo(() => {
    const map = new Map();
    assets.forEach((asset) => {
      map.set(asset.id, asset);
    });
    return map;
  }, [assets]);

  const latestRenewalByAffair = useMemo(() => {
    const grouped = new Map();
    renewals.forEach((renewal) => {
      const list = grouped.get(renewal.affairId);
      if (list) {
        list.push(renewal);
      } else {
        grouped.set(renewal.affairId, [renewal]);
      }
    });

    const map = new Map();
    grouped.forEach((list, affairId) => {
      list.sort((a, b) => {
        const dateA = new Date(a.approvalDate || a.submissionDate || a.expiryDate || 0);
        const dateB = new Date(b.approvalDate || b.submissionDate || b.expiryDate || 0);
        return dateB - dateA;
      });
      map.set(affairId, list[0]);
    });

    return map;
  }, [renewals]);

  const affairsDataset = useMemo(() => {
    return regulatoryAffairs.map((affair) => {
      const asset = assetsById.get(affair.assetId) ?? null;
      const latestRenewal = latestRenewalByAffair.get(affair.id) ?? null;
      const complianceStatus = latestRenewal
        ? calculateComplianceStatus(latestRenewal)
        : COMPLIANCE_STATUS.EXPIRED;
      const workflowStatus = latestRenewal
        ? calculateWorkflowStatus(latestRenewal, complianceStatus) ?? WORKFLOW_STATUS.IN_PREPARATION
        : WORKFLOW_STATUS.IN_PREPARATION;

      const complianceMeta = getMetadata('compliance', complianceStatus, language);
      const workflowMeta = getMetadata('workflow', workflowStatus, language);

      return {
        id: affair.id,
        affair,
        asset,
        latestRenewal,
        complianceStatus,
        workflowStatus,
        complianceMeta,
        workflowMeta,
        complianceLabel: complianceMeta?.label ?? complianceStatus,
        workflowLabel: workflowMeta?.label ?? workflowStatus,
        category: asset?.category ?? null,
        statusPriority: COMPLIANCE_SORT_PRIORITY[complianceStatus] ?? 999,
      };
    });
  }, [regulatoryAffairs, assetsById, latestRenewalByAffair, language, getMetadata]);

  const affairCategories = useMemo(
    () => CATEGORY_ORDER.filter((category) => affairsDataset.some((item) => item.category === category)),
    [affairsDataset]
  );

  useEffect(() => {
    if (!activeAffairCategory) {
      return;
    }

    if (!affairCategories.includes(activeAffairCategory)) {
      setActiveAffairCategory(null);
    }
  }, [affairCategories, activeAffairCategory]);

  const filteredByCategory = useMemo(() => {
    if (!activeAffairCategory) {
      return affairsDataset;
    }

    return affairsDataset.filter((item) => item.category === activeAffairCategory);
  }, [affairsDataset, activeAffairCategory]);

  const filteredAffairs = useMemo(() => {
    let result = filteredByCategory;

    // Filter by compliance status (multi-select)
    if (affairFilters.complianceStatus?.length > 0) {
      result = result.filter((item) => affairFilters.complianceStatus.includes(item.complianceStatus));
    }

    // Filter by type (multi-select)
    if (affairFilters.affairType?.length > 0) {
      result = result.filter((item) => affairFilters.affairType.includes(item.affair.type));
    }

    // Filter by asset (multi-select)
    if (affairFilters.affairAsset?.length > 0) {
      result = result.filter((item) => affairFilters.affairAsset.includes(item.asset?.id));
    }

    // Filter by category (multi-select)
    if (affairFilters.affairCategory?.length > 0) {
      result = result.filter((item) => affairFilters.affairCategory.includes(item.asset?.category));
    }

    // Filter by expiry date (multi-select)
    if (affairFilters.affairExpiryDate?.length > 0) {
      result = result.filter((item) => affairFilters.affairExpiryDate.includes(item.latestRenewal?.expiryDate));
    }

    // Filter by responsible person (multi-select)
    if (affairFilters.affairResponsible?.length > 0) {
      result = result.filter((item) => affairFilters.affairResponsible.includes(item.latestRenewal?.responsiblePerson));
    }

    return result;
  }, [filteredByCategory, affairFilters]);

  // Context-aware filter options (only show what exists in current filtered data)
  const availableFilterOptions = useMemo(() => {
    // Use filtered affairs as base to prevent impossible filter combinations
    const baseData = filteredAffairs;

    // Extract unique values for each filter type
    const complianceStatuses = [...new Set(baseData.map(item => item.complianceStatus))].filter(Boolean);
    const types = [...new Set(baseData.map(item => item.affair.type))].filter(Boolean);
    const categories = [...new Set(baseData.map(item => item.asset?.category))].filter(Boolean);
    const assets = [...new Set(baseData.map(item => item.asset))].filter(Boolean);
    const responsible = [...new Set(baseData.map(item => item.latestRenewal?.responsiblePerson))].filter(Boolean);
    const expiryDates = [...new Set(
      baseData
        .map(item => item.latestRenewal?.expiryDate)
        .filter(Boolean)
    )];

    return {
      statuses: complianceStatuses,
      types,
      categories,
      assets,
      responsible,
      expiryDates,
    };
  }, [filteredAffairs]);

  const filterSections = useMemo(() => {
    const sectionsList = [];
    const locale = language === 'es' ? 'es-VE' : 'en-US';

    if ((availableFilterOptions.statuses ?? []).length > 0) {
      sectionsList.push({
        key: 'complianceStatus',
        label: getUIText('compliance_status', language),
        type: 'status',
        options: availableFilterOptions.statuses.map((status) => {
          const metadata = getMetadata('compliance', status, language);
          return {
            value: status,
            label: metadata?.label ?? status,
            icon: metadata?.icon,
          };
        }),
      });
    }

    if ((availableFilterOptions.categories ?? []).length > 0) {
      sectionsList.push({
        key: 'affairCategory',
        label: getUIText('affair_category', language),
        type: 'category',
        options: availableFilterOptions.categories,
      });
    }

    if ((availableFilterOptions.types ?? []).length > 0) {
      sectionsList.push({
        key: 'affairType',
        label: getUIText('columnType', language),
        options: availableFilterOptions.types.map((type) => ({
          value: type,
          label: type,
        })),
      });
    }

    if ((availableFilterOptions.assets ?? []).length > 0) {
      sectionsList.push({
        key: 'affairAsset',
        label: getUIText('belongs_to', language),
        options: availableFilterOptions.assets.map((asset) => ({
          value: asset.id,
          label: asset.name ?? asset.id,
        })),
      });
    }

    if ((availableFilterOptions.responsible ?? []).length > 0) {
      sectionsList.push({
        key: 'affairResponsible',
        label: getUIText('columnResponsible', language),
        options: availableFilterOptions.responsible.map((person) => ({
          value: person,
          label: person,
        })),
      });
    }

    if ((availableFilterOptions.expiryDates ?? []).length > 0) {
      sectionsList.push({
        key: 'affairExpiryDate',
        label: getUIText('columnNextExpiration', language),
        options: availableFilterOptions.expiryDates.map((date) => ({
          value: date,
          label: formatDisplayDate(date, { locale }),
        })),
      });
    }

    return sectionsList;
  }, [availableFilterOptions, language, getMetadata]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    const hasFilters = Object.values(affairFilters).some(val => val?.length > 0);
    return Boolean(activeAffairCategory) || hasFilters;
  }, [activeAffairCategory, affairFilters]);

  const handleAffairsTabChange = (_event, newValue) => {
    setActiveAffairCategory(newValue ?? null);

    if (newValue) {
      setAffairFilters((prev) => {
        if (!prev.affairCategory?.length) {
          return prev;
        }
        return { ...prev, affairCategory: [] };
      });
    }
  };

  const handleAffairFilterChange = useCallback((key, value) => {
    if (Array.isArray(value)) {
      setAffairFilters((prev) => {
        const currentValues = Array.isArray(prev[key]) ? prev[key] : [];

        if (value.length === 0) {
          if (currentValues.length === 0) {
            return prev;
          }
          return { ...prev, [key]: [] };
        }

        const hasSameValues =
          currentValues.length === value.length &&
          currentValues.every((item) => value.includes(item));

        if (hasSameValues) {
          return prev;
        }

        return { ...prev, [key]: value };
      });

      if (key === 'affairCategory' && activeAffairCategory) {
        setActiveAffairCategory(null);
      }
      return;
    }

    if (value === null || value === undefined) {
      setAffairFilters((prev) => {
        const currentValues = Array.isArray(prev[key]) ? prev[key] : [];
        if (currentValues.length === 0) {
          return prev;
        }
        return { ...prev, [key]: [] };
      });

      if (key === 'affairCategory' && activeAffairCategory) {
        setActiveAffairCategory(null);
      }
      return;
    }

    setAffairFilters((prev) => {
      const currentValues = Array.isArray(prev[key]) ? prev[key] : [];
      const isSelected = currentValues.includes(value);
      const newValues = isSelected
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return { ...prev, [key]: newValues };
    });

    if (key === 'affairCategory' && activeAffairCategory) {
      setActiveAffairCategory(null);
    }
  }, [activeAffairCategory]);

  const handleClearAllFilters = useCallback(() => {
    setAffairFilters(createEmptyAffairFilters());
    setActiveAffairCategory(null);
  }, []);

  const handleOpenFilterDrawer = useCallback(() => {
    setIsFilterDrawerOpen(true);
  }, []);

  const handleCloseFilterDrawer = useCallback(() => {
    setIsFilterDrawerOpen(false);
  }, []);

  const activeFilterChips = useMemo(() => {
    if (!hasActiveFilters) {
      return [];
    }

    const chips = [];

    if (activeAffairCategory) {
      chips.push(
        <FilterChip
          key="filter-tab-category"
          label={getCategoryLabel(activeAffairCategory, language)}
          color="secondary"
          variant="filled"
          size="small"
          mode="selected"
          onDelete={() => setActiveAffairCategory(null)}
          sx={{ fontSize: '0.7rem', height: 22, flexShrink: 0 }}
        />
      );
    }

    // Compliance status filters (multi-select)
    if (affairFilters.complianceStatus?.length > 0) {
      affairFilters.complianceStatus.forEach(status => {
        const metadata = getMetadata('compliance', status, language);
        chips.push(
          <FilterChip
            key={`filter-compliance-status-${status}`}
            label={metadata?.label ?? status}
            color="primary"
            variant="filled"
            size="small"
            mode="selected"
            onDelete={() => handleAffairFilterChange('complianceStatus', status)}
            sx={{
              fontSize: '0.7rem',
              height: 22,
              flexShrink: 0,
              backgroundColor: metadata?.color,
              color: metadata?.textColor ?? '#fff',
            }}
          />
        );
      });
    }

    // Type filters (multi-select)
    if (affairFilters.affairType?.length > 0) {
      affairFilters.affairType.forEach(type => {
        chips.push(
          <FilterChip
            key={`filter-affair-type-${type}`}
            label={type}
            variant="filled"
            size="small"
            mode="selected"
            onDelete={() => handleAffairFilterChange('affairType', type)}
            sx={{ fontSize: '0.7rem', height: 22, flexShrink: 0 }}
          />
        );
      });
    }

    // Asset filters (multi-select)
    if (affairFilters.affairAsset?.length > 0) {
      affairFilters.affairAsset.forEach(assetId => {
        const assetLabel =
          assets.find((asset) => asset.id === assetId)?.name || assetId;

        chips.push(
          <FilterChip
            key={`filter-affair-asset-${assetId}`}
            label={assetLabel}
            color="primary"
            variant="filled"
            size="small"
            mode="selected"
            onDelete={() => handleAffairFilterChange('affairAsset', assetId)}
            sx={{ fontSize: '0.7rem', height: 22, flexShrink: 0 }}
          />
        );
      });
    }

    // Category filters (multi-select)
    if (affairFilters.affairCategory?.length > 0) {
      affairFilters.affairCategory.forEach(category => {
        chips.push(
          <FilterChip
            key={`filter-affair-category-${category}`}
            label={getCategoryLabel(category, language)}
            color="secondary"
            variant="filled"
            size="small"
            mode="selected"
            onDelete={() => handleAffairFilterChange('affairCategory', category)}
            sx={{ fontSize: '0.7rem', height: 22, flexShrink: 0 }}
          />
        );
      });
    }

    // Expiry date filters (multi-select)
    if (affairFilters.affairExpiryDate?.length > 0) {
      affairFilters.affairExpiryDate.forEach(date => {
        chips.push(
          <FilterChip
            key={`filter-affair-expiry-${date}`}
            label={formatDisplayDate(date, {
              locale: language === 'es' ? 'es-VE' : 'en-US',
            })}
            color="warning"
            variant="filled"
            size="small"
            mode="selected"
            onDelete={() => handleAffairFilterChange('affairExpiryDate', date)}
            sx={{ fontSize: '0.7rem', height: 22, flexShrink: 0 }}
          />
        );
      });
    }

    // Responsible filters (multi-select)
    if (affairFilters.affairResponsible?.length > 0) {
      affairFilters.affairResponsible.forEach(person => {
        chips.push(
          <FilterChip
            key={`filter-affair-responsible-${person}`}
            label={person}
            color="info"
            variant="filled"
            size="small"
            mode="selected"
            onDelete={() => handleAffairFilterChange('affairResponsible', person)}
            sx={{ fontSize: '0.7rem', height: 22, flexShrink: 0 }}
          />
        );
      });
    }

    return chips;
  }, [
    hasActiveFilters,
    activeAffairCategory,
    language,
    affairFilters,
    assets,
    handleAffairFilterChange,
    getMetadata,
  ]);

  const affairColumns = useMemo(() => [
    {
      key: 'name',
      label: language === 'es' ? 'Nombre' : 'Name',
      sortable: true,
      sortAccessor: (row) => row.affair.name ?? '',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.affair.name}
        </Typography>
      ),
    },
    {
      key: 'type',
      label: language === 'es' ? 'Tipo' : 'Type',
      sortable: true,
      sortAccessor: (row) => row.affair.type ?? '',
      render: (row) => (
        row.affair.type ? (
          <FilterChip
            label={row.affair.type}
            filterKey="affairType"
            filterValue={row.affair.type}
            activeFilters={affairFilters}
            onFilterChange={handleAffairFilterChange}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem', height: 24 }}
          />
        ) : (
          <Typography variant="body2">—</Typography>
        )
      ),
    },
    {
      key: 'asset',
      label: language === 'es' ? 'Pertenece a' : 'Belongs to',
      sortable: true,
      sortAccessor: (row) => row.asset?.name ?? '',
      render: (row) => (
        row.asset ? (
          <FilterChip
            label={row.asset.name}
            filterKey="affairAsset"
            filterValue={row.asset.id}
            activeFilters={affairFilters}
            onFilterChange={handleAffairFilterChange}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontSize: '0.75rem', height: 24 }}
          />
        ) : (
          <Typography variant="body2">—</Typography>
        )
      ),
    },
    {
      key: 'category',
      label: language === 'es' ? 'Categoría' : 'Category',
      sortable: true,
      sortAccessor: (row) => row.asset?.category ?? '',
      render: (row) => {
        const categoryKey = row.asset?.category;
        if (!categoryKey) {
          return <Typography variant="body2">-</Typography>;
        }

        const isTabCategory = activeAffairCategory === categoryKey;
        const isFilterCategory = affairFilters.affairCategory?.includes(categoryKey);

        return (
          <FilterChip
            label={getCategoryLabel(categoryKey, language)}
            filterKey="affairCategory"
            filterValue={categoryKey}
            activeFilters={affairFilters}
            onFilterChange={handleAffairFilterChange}
            size="small"
            variant={isTabCategory || isFilterCategory ? 'filled' : 'outlined'}
            color="secondary"
            mode={isTabCategory && !isFilterCategory ? 'selected' : 'filter'}
            onDelete={isTabCategory ? () => setActiveAffairCategory(null) : undefined}
            sx={{ fontSize: '0.75rem', height: 24 }}
          />
        );
      },
    },
    {
      key: 'complianceStatus',
      label: getUIText('columnStatus', language),
      sortable: true,
      sortAccessor: (row) => row.statusPriority,
      render: (row) => (
        <FilterChip
          label={row.complianceLabel}
          color="primary"
          filterKey="complianceStatus"
          filterValue={row.complianceStatus}
          activeFilters={affairFilters}
          onFilterChange={handleAffairFilterChange}
          size="small"
          sx={{
            fontSize: '0.75rem',
            height: 24,
            backgroundColor: row.complianceMeta.color,
            color: row.complianceMeta.textColor ?? '#fff',
            '&:hover': {
              backgroundColor: row.complianceMeta.color,
              filter: 'brightness(0.9)',
            },
          }}
        />
      ),
    },
    {
      key: 'expiry',
      label: language === 'es' ? 'Fecha de Vencimiento' : 'Expiration Date',
      sortable: true,
      sortAccessor: (row) => (row.latestRenewal?.expiryDate ? new Date(row.latestRenewal.expiryDate).getTime() : 0),
      render: (row) => {
        const dateLabel = row.latestRenewal?.expiryDate
          ? formatDisplayDate(row.latestRenewal.expiryDate, {
              locale: language === 'es' ? 'es-VE' : 'en-US',
              fallback: language === 'es' ? 'Sin vencimiento' : 'No expiry',
            })
          : language === 'es'
          ? 'Sin vencimiento'
          : 'No expiry';

        return row.latestRenewal?.expiryDate ? (
          <FilterChip
            label={dateLabel}
            filterKey="affairExpiryDate"
            filterValue={row.latestRenewal.expiryDate}
            activeFilters={affairFilters}
            onFilterChange={handleAffairFilterChange}
            size="small"
            variant="outlined"
            color="warning"
            sx={{ fontSize: '0.75rem', height: 24 }}
          />
        ) : (
          <Typography variant="body2">{dateLabel}</Typography>
        );
      },
    },
    {
      key: 'responsible',
      label: getUIText('columnResponsible', language),
      sortable: true,
      sortAccessor: (row) => row.latestRenewal?.responsiblePerson ?? '',
      render: (row) => (
        row.latestRenewal?.responsiblePerson ? (
          <FilterChip
            label={row.latestRenewal.responsiblePerson}
            filterKey="affairResponsible"
            filterValue={row.latestRenewal.responsiblePerson}
            activeFilters={affairFilters}
            onFilterChange={handleAffairFilterChange}
            size="small"
            variant="outlined"
            color="info"
            sx={{ fontSize: '0.75rem', height: 24 }}
          />
        ) : (
          <Typography variant="body2">—</Typography>
        )
      ),
    },
  ], [affairFilters, activeAffairCategory, handleAffairFilterChange, language]);

  const affairRows = useMemo(
    () =>
      filteredAffairs.map((item) => ({
        ...item,
        onClick: () => {
          const affairSegment = getRouteSegment('affair', language, currentConfig);
          const infoSlug = getTabSlug('info', 'affair', language, currentConfig);
          navigate(`/${affairSegment}/${item.affair.id}/${infoSlug}`);
        },
      })),
    [filteredAffairs, language, navigate, currentConfig]
  );

  const mobileAffairRows = useMemo(() => {
    if (!isCompactLayout) {
      return [];
    }

    const viewLabel = language === 'es' ? 'Ver' : 'View';
    const downloadLabel = language === 'es' ? 'Descargar' : 'Download';
    const shareLabel = language === 'es' ? 'Compartir' : 'Share';
    const noExpiryLabel = language === 'es' ? 'Sin vencimiento' : 'No expiry date';
    const unassignedLabel = language === 'es' ? 'Sin asignar' : 'Unassigned';

    return affairRows.map((row) => {
      const { affair, asset, latestRenewal, complianceMeta, onClick } = row;

      const expiryLabel = latestRenewal?.expiryDate
        ? formatDisplayDate(latestRenewal.expiryDate, {
            locale: language === 'es' ? 'es-VE' : 'en-US',
          })
        : noExpiryLabel;

      const responsibleLabel = latestRenewal?.responsiblePerson || unassignedLabel;

      const details = [
        {
          label: language === 'es' ? 'Pertenece a' : 'Belongs to',
          value: asset?.name ?? '-',
        },
        {
          label: language === 'es' ? 'Tipo' : 'Type',
          value: affair?.type ?? '-',
        },
        {
          label: language === 'es' ? 'Categoría' : 'Category',
          value: asset?.category ? getCategoryLabel(asset.category, language) : '-',
        },
        {
          label: language === 'es' ? 'Vence' : 'Expires',
          value: expiryLabel,
        },
        {
          label: language === 'es' ? 'Responsable' : 'Owner',
          value: responsibleLabel,
        },
      ];

      return {
        key: affair.id,
        title: affair.name,
        borderColor: complianceMeta.color,
        details,
        actions: [
          { icon: <VisibilityIcon fontSize="small" />, label: viewLabel },
          { icon: <DownloadIcon fontSize="small" />, label: downloadLabel },
          { icon: <ShareIcon fontSize="small" />, label: shareLabel },
        ],
        onClick,
      };
    });
  }, [isCompactLayout, affairRows, language]);

  const affairsEmptyState = useMemo(() => {
    const hasAffairs = affairsDataset.length > 0;
    return {
      title: hasAffairs
        ? getUIText('noResultsTitle', language)
        : getUIText('emptyRegulatoryAffairs', language),
      description: getUIText('noResultsSubtitle', language),
    };
  }, [affairsDataset, language]);

  return (
    <>
      {/* Upcoming Expirations */}
      <ContentPanel sx={{ mb: 1.5 }} contentSx={{ p: { xs: 2, md: 2.5 } }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
          {getUIText('upcoming_expirations', language)}
        </Typography>
        <UpcomingExpirationsList
          renewals={renewals}
          regulatoryAffairs={regulatoryAffairs}
          assets={assets}
          urgencyGroups={dashboardStats.urgencyGroups}
          language={language}
        />
      </ContentPanel>

      {/* Regulatory Affairs Overview */}
      <ContentPanel fullHeight={isDesktop} contentFlex={isDesktop} contentSx={{ pt: { xs: 1.5, md: 0.75 }, '&:last-child': { pb: 2 } }}>
        {!isCompactLayout && affairsDataset.length > 0 && (
          <Box sx={{ mb: { xs: 1.25, md: 0.75 } }}>
            <CategoryTabs
              value={activeAffairCategory}
              onChange={handleAffairsTabChange}
              language={language}
              categories={affairCategories}
            />
          </Box>
        )}

        {/* Active Filter Chips (Mobile only - above list) */}
        {isCompactLayout && hasActiveFilters && activeFilterChips.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              gap: 0.65,
              flexWrap: 'wrap',
              mb: 1.5,
            }}
          >
            {activeFilterChips}
          </Box>
        )}

        {isCompactLayout ? (
          mobileAffairRows.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {mobileAffairRows.map((row) => (
                <ExpandableRow
                  key={row.key}
                  title={row.title}
                  borderColor={row.borderColor}
                  details={row.details}
                  actions={row.actions}
                  onClick={row.onClick}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {affairsEmptyState.title}
              </Typography>
              {affairsEmptyState.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  {affairsEmptyState.description}
                </Typography>
              )}
            </Box>
          )
        ) : (
          <DataTable
            columns={affairColumns}
            rows={affairRows}
            emptyState={affairsEmptyState}
            containerSx={{ height: 420 }}
            responsiveColumns={{
              mobile: ['name', 'complianceStatus', 'expiry'],
              tablet: ['name', 'asset', 'complianceStatus', 'expiry', 'responsible'],
            }}
          />
        )}
      </ContentPanel>

      {/* Filter Drawer and FAB (Mobile Only) */}
      {isCompactLayout && (
        <>
          <FilterFAB
            onClick={handleOpenFilterDrawer}
            filterCount={Object.values(affairFilters).reduce((sum, arr) => sum + (arr?.length || 0), 0)}
            isOpen={isFilterDrawerOpen}
            ariaLabel={getUIText('filters', language)}
          />
          <FilterDrawer
            open={isFilterDrawerOpen}
            onClose={handleCloseFilterDrawer}
            filters={affairFilters}
            onFilterChange={handleAffairFilterChange}
            onClearAll={handleClearAllFilters}
            sections={filterSections}
            language={language}
          />
        </>
      )}
    </>
  );
};

const ControlPanelView = (props) => (
  <PageLayout showBackButton={false}>
    <ControlPanelContent {...props} />
  </PageLayout>
);

export default ControlPanelView;

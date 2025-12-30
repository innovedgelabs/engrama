import { useState, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  IconButton,
  Button,
  Typography,
  Tooltip,
  TextField,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  ChevronRight as ChevronRightIcon,
  Send as SendIcon
} from '@mui/icons-material';
import {
  calculateComplianceStatus,
  calculateWorkflowStatus,
  LIFECYCLE_STATUS,
  COMPLIANCE_STATUS,
  WORKFLOW_STATUS,
  PRIORITY_LEVEL,
  formatDisplayDate,
} from '../../../utils/status';
import { DEFAULT_LANGUAGE, getUIText } from '../../../utils/i18nHelpers';
import { getRouteSegment, getTabSlug } from '../../../utils/routing';
import DataTable from '../../layout/table/DataTable';
import FilterChip from '../../common/FilterChip';
import ExpandableRow from '../../common/ExpandableRow';
import FilterFAB from '../../common/FilterFAB';
import FilterDrawer from '../../common/FilterDrawer';
import { useStatusHelpers } from '../../../utils/domainStatus';
import { useDomain } from '../../../contexts/DomainContext';
import * as MuiIcons from '@mui/icons-material';

const getComparableRenewalDate = (renewal) =>
  new Date(
    renewal.approvalDate ||
    renewal.submissionDate ||
    renewal.expiryDate ||
    0
  ).getTime();

const COMPLIANCE_SORT_ORDER = {
  [COMPLIANCE_STATUS.EXPIRED]: 1,
  [COMPLIANCE_STATUS.EXPIRING]: 2,
  [COMPLIANCE_STATUS.CURRENT]: 3,
  [COMPLIANCE_STATUS.PERMANENT]: 4,
};

const normalizeSortValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number') {
    return value;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  return String(value).toLowerCase();
};

const normalizeFilterValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).toLowerCase();
};

const RegulatoryAffairsTab = ({
  regulatoryAffairs = [],
  renewals = [],
  attachments = [],
  assetId,
  activeFilters = {},
  onFilterChange,
  language = DEFAULT_LANGUAGE,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentConfig } = useDomain();
  const { getMetadata } = useStatusHelpers();
  const [sortState, setSortState] = useState({ orderBy: null, order: 'asc' });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const renewalsByAffair = useMemo(() => {
    const map = new Map();
    renewals.forEach(renewal => {
      const list = map.get(renewal.affairId);
      if (list) {
        list.push(renewal);
      } else {
        map.set(renewal.affairId, [renewal]);
      }
    });

    map.forEach((list, affairId, target) => {
      target.set(
        affairId,
        list.sort((a, b) => getComparableRenewalDate(b) - getComparableRenewalDate(a))
      );
    });

    return map;
  }, [renewals]);

  const latestRenewalByAffair = useMemo(() => {
    const map = new Map();
    renewalsByAffair.forEach((list, affairId) => {
      if (list.length > 0) {
        map.set(affairId, list[0]);
      }
    });
    return map;
  }, [renewalsByAffair]);

  const attachmentsByRenewal = useMemo(() => {
    const map = new Map();
    attachments.forEach(doc => {
      const list = map.get(doc.renewalId);
      if (list) {
        list.push(doc);
      } else {
        map.set(doc.renewalId, [doc]);
      }
    });
    return map;
  }, [attachments]);

  const primaryAttachmentByRenewal = useMemo(() => {
    const map = new Map();
    attachmentsByRenewal.forEach((list, renewalId) => {
      map.set(renewalId, list.find(doc => doc.isPrimary) ?? null);
    });
    return map;
  }, [attachmentsByRenewal]);

  const getLatestRenewal = useCallback(
    (affairId) => latestRenewalByAffair.get(affairId) ?? null,
    [latestRenewalByAffair]
  );

  const getPrimaryAttachment = useCallback(
    (renewalId) => primaryAttachmentByRenewal.get(renewalId) ?? null,
    [primaryAttachmentByRenewal]
  );

  const handleSortChange = useCallback((nextSort) => {
    setSortState(nextSort);
  }, []);

  const affairSortAccessors = useMemo(
    () => ({
      name: (affair) => affair.name ?? '',
      category: (affair) => affair.category ?? '',
      lastUpdate: (affair) => {
        const latest = getLatestRenewal(affair.id);
        return latest ? getComparableRenewalDate(latest) : 0;
      },
      expiryDate: (affair) => {
        const latest = getLatestRenewal(affair.id);
        return latest?.expiryDate ? new Date(latest.expiryDate).getTime() : 0;
      },
    }),
    [getLatestRenewal]
  );

  const compareAffairStatus = useCallback(
    (affairA, affairB, order) => {
      const aLatest = getLatestRenewal(affairA.id);
      const bLatest = getLatestRenewal(affairB.id);

      const aStatus = aLatest ? calculateComplianceStatus(aLatest) : COMPLIANCE_STATUS.EXPIRED;
      const bStatus = bLatest ? calculateComplianceStatus(bLatest) : COMPLIANCE_STATUS.EXPIRED;

      const aValue = COMPLIANCE_SORT_ORDER[aStatus] || 999;
      const bValue = COMPLIANCE_SORT_ORDER[bStatus] || 999;

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    },
    [getLatestRenewal]
  );

  const filteredRegulatoryAffairs = useMemo(() => {
    if (!regulatoryAffairs) {
      return [];
    }

    if (!activeFilters || Object.keys(activeFilters).length === 0) {
      return regulatoryAffairs;
    }

    return regulatoryAffairs.filter((affair) => {
      // Filter by lifecycle status (active/archived)
      if (activeFilters.lifecycleStatus) {
        const lifecycleStatus = affair.lifecycleStatus ?? LIFECYCLE_STATUS.ACTIVE;
        if (normalizeFilterValue(lifecycleStatus) !== normalizeFilterValue(activeFilters.lifecycleStatus)) {
          return false;
        }
      }

      if (
        activeFilters.affairCategory &&
        normalizeFilterValue(affair.category) !== normalizeFilterValue(activeFilters.affairCategory)
      ) {
        return false;
      }

      if (activeFilters.complianceStatus) {
        const latestRenewal = getLatestRenewal(affair.id);
        const complianceStatus = latestRenewal
          ? calculateComplianceStatus(latestRenewal)
          : COMPLIANCE_STATUS.EXPIRED;

        if (
          normalizeFilterValue(complianceStatus) !== normalizeFilterValue(activeFilters.complianceStatus)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [regulatoryAffairs, activeFilters, getLatestRenewal]);

  const sortedRegulatoryAffairs = useMemo(() => {
    if (!filteredRegulatoryAffairs) {
      return [];
    }

    const sourceAffairs = filteredRegulatoryAffairs;
    const { orderBy, order } = sortState;

    if (!orderBy) {
      return sourceAffairs;
    }

    if (orderBy === 'status') {
      return [...sourceAffairs].sort((a, b) => compareAffairStatus(a, b, order));
    }

    const accessor = affairSortAccessors[orderBy];

    if (!accessor) {
      return sourceAffairs;
    }

    return [...sourceAffairs].sort((a, b) => {
      const aValue = normalizeSortValue(accessor(a));
      const bValue = normalizeSortValue(accessor(b));

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredRegulatoryAffairs, sortState, affairSortAccessors, compareAffairStatus]);

  const complianceMetaFor = useCallback(
    (statusKey) => {
      const meta = getMetadata('compliance', statusKey, language);
      if (meta) {
        return meta;
      }
      return null;
    },
    [getMetadata, language]
  );

  const workflowMetaFor = useCallback(
    (statusKey) => {
      const meta = getMetadata('workflow', statusKey, language);
      if (meta) return meta;
      return null;
    },
    [getMetadata, language]
  );

  const priorityMetaFor = useCallback(
    (statusKey) => {
      const meta = getMetadata('priority', statusKey, language);
      if (meta) return meta;
      return null;
    },
    [getMetadata, language]
  );

  // Context-aware filter options (only show options that exist in filtered data)
  const availableFilterOptions = useMemo(() => {
    const statuses = new Set();
    const categories = new Set();
    const types = new Set();
    const authorities = new Set();

    sortedRegulatoryAffairs.forEach((affair) => {
      const latestRenewal = getLatestRenewal(affair.id);
      const complianceStatus = latestRenewal
        ? calculateComplianceStatus(latestRenewal)
        : COMPLIANCE_STATUS.EXPIRED;

      statuses.add(complianceStatus);

      if (affair.category) categories.add(affair.category);
      if (affair.type) types.add(affair.type);
      if (affair.authority) authorities.add(affair.authority);
    });

    return {
      statuses: Array.from(statuses),
      categories: Array.from(categories),
      types: Array.from(types),
      authorities: Array.from(authorities),
    };
  }, [sortedRegulatoryAffairs, getLatestRenewal]);

  const desktopRows = useMemo(
    () =>
      sortedRegulatoryAffairs.map((affair) => {
        const latestRenewal = getLatestRenewal(affair.id);

        // Calculate all 4 dimensions
        const lifecycleStatus = affair.lifecycleStatus ?? LIFECYCLE_STATUS.ACTIVE;
        const complianceStatus = latestRenewal
          ? calculateComplianceStatus(latestRenewal)
          : COMPLIANCE_STATUS.EXPIRED;
        const workflowStatus = latestRenewal
          ? calculateWorkflowStatus(latestRenewal, complianceStatus)
          : WORKFLOW_STATUS.IN_PREPARATION;
        const priorityLevel = affair.priorityLevel ?? PRIORITY_LEVEL.MEDIUM;

        // Get metadata and labels for all dimensions
        const lifecycleMeta = getMetadata('lifecycle', lifecycleStatus, language);
        const complianceMeta = complianceMetaFor(complianceStatus);
        const workflowMeta = workflowMetaFor(workflowStatus);
        const priorityMeta = priorityMetaFor(priorityLevel);

        const lifecycleLabel = lifecycleMeta?.label ?? lifecycleStatus;
        const complianceLabel = complianceMeta?.label ?? complianceStatus;
        const workflowLabel = workflowMeta?.label ?? workflowStatus;
        const priorityLabel = priorityMeta?.label ?? priorityLevel;

        const primaryAttachment = latestRenewal ? getPrimaryAttachment(latestRenewal.id) : null;

        return {
          id: affair.id,
          affair,
          latestRenewal,
          lifecycleStatus,
          lifecycleMeta,
          lifecycleLabel,
          complianceStatus,
          complianceMeta,
          complianceLabel,
          workflowStatus,
          workflowMeta,
          workflowLabel,
          priorityLevel,
          priorityMeta,
          priorityLabel,
          primaryAttachment,
          onClick: () => {
            const affairSegment = getRouteSegment('affair', language, currentConfig);
            const infoSlug = getTabSlug('info', 'affair', language, currentConfig);
            navigate(`/${affairSegment}/${affair.id}/${infoSlug}`);
          },
        };
      }),
    [sortedRegulatoryAffairs, getLatestRenewal, getPrimaryAttachment, navigate, language, currentConfig]
  );

  const desktopColumns = useMemo(
    () => [
      {
        key: 'name',
        label: getUIText('columnRegulatoryAffair', language),
        sortable: true,
        sortAccessor: (row) => row.affair.name ?? '',
        render: ({ affair }) => (
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
              {affair.name}
            </Typography>
          </Box>
        ),
      },
      {
        key: 'category',
        label: getUIText('columnCategory', language),
        sortable: true,
        sortAccessor: (row) => row.affair.category ?? '',
        render: ({ affair }) => (
          <FilterChip
            label={affair.category}
            size="small"
            variant="outlined"
            filterKey="affairCategory"
            filterValue={affair.category ?? ''}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        ),
      },
      {
        key: 'lastUpdate',
        label: getUIText('columnLastUpdate', language),
        sortable: true,
        sortAccessor: (row) => (row.latestRenewal ? getComparableRenewalDate(row.latestRenewal) : 0),
        render: ({ latestRenewal }) =>
          latestRenewal ? (
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                {formatDisplayDate(latestRenewal.approvalDate || latestRenewal.submissionDate)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {latestRenewal.name}
              </Typography>
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Sin actualizaciones
            </Typography>
          ),
      },
      {
        key: 'expiryDate',
        label: getUIText('columnNextExpiration', language),
        sortable: true,
        sortAccessor: (row) => (row.latestRenewal?.expiryDate ? new Date(row.latestRenewal.expiryDate).getTime() : 0),
        render: ({ latestRenewal }) => (latestRenewal ? formatDisplayDate(latestRenewal.expiryDate) : 'N/A'),
      },
      {
        key: 'compliance',
        label: getUIText('compliance_status', language),
        sortable: true,
        sortComparator: (a, b, order) => compareAffairStatus(a.affair, b.affair, order),
        render: ({ complianceMeta, complianceLabel, complianceStatus }) => (
          <FilterChip
            label={complianceLabel}
            color="primary"
            size="small"
            filterKey="complianceStatus"
            filterValue={complianceStatus}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            sx={{
              fontSize: '0.7rem',
              height: 20,
              backgroundColor: complianceMeta.color,
              color: complianceMeta.textColor ?? '#fff',
              '&:hover': {
                backgroundColor: complianceMeta.color,
                filter: 'brightness(0.9)',
              },
            }}
          />
        ),
      },
      {
        key: 'workflow',
        label: getUIText('workflow_status', language),
        render: ({ workflowMeta, workflowLabel, workflowStatus }) => (
          <FilterChip
            label={workflowLabel}
            color="primary"
            size="small"
            filterKey="workflowStatus"
            filterValue={workflowStatus}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            sx={{
              fontSize: '0.7rem',
              height: 20,
              backgroundColor: workflowMeta.color,
              color: workflowMeta.textColor ?? '#fff',
              '&:hover': {
                backgroundColor: workflowMeta.color,
                filter: 'brightness(0.9)',
              },
            }}
          />
        ),
      },
      {
        key: 'priority',
        label: getUIText('priority_level', language),
        render: ({ priorityMeta, priorityLabel, priorityLevel }) => (
          <FilterChip
            label={priorityLabel}
            color="primary"
            size="small"
            filterKey="priorityLevel"
            filterValue={priorityLevel}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            sx={{
              fontSize: '0.7rem',
              height: 20,
              backgroundColor: priorityMeta.color,
              color: priorityMeta.textColor ?? '#fff',
              '&:hover': {
                backgroundColor: priorityMeta.color,
                filter: 'brightness(0.9)',
              },
            }}
          />
        ),
      },
      {
        key: 'authority',
        label: getUIText('columnAuthority', language),
        render: ({ affair }) => (
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
              {affair.authority}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Renovacion: {affair.renewalFrequency}
            </Typography>
          </Box>
        ),
      },
      {
        key: 'primaryAttachment',
        label: getUIText('columnPrimaryAttachment', language),
        align: 'right',
        render: ({ primaryAttachment }) =>
          primaryAttachment ? (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={`Ver ${primaryAttachment.name}`}>
                <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                  <ViewIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={`Descargar ${primaryAttachment.name}`}>
                <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                  <DownloadIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={`Enviar ${primaryAttachment.name}`}>
                <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                  <SendIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            </Box>
          ) : null,
      },
    ],
    [language, activeFilters, onFilterChange, compareAffairStatus]
  );


  // Mobile Expandable Row View
  if (isMobile) {
    const hasActiveFilters = activeFilters && Object.keys(activeFilters).length > 0;
    const activeFilterCount = hasActiveFilters ? Object.keys(activeFilters).length : 0;

    // Generate active filter chips
    const activeFilterChips = [];
    if (activeFilters?.complianceStatus) {
      const complianceMeta = complianceMetaFor(activeFilters.complianceStatus);
      activeFilterChips.push(
        <FilterChip
          key="status"
          label={complianceMeta.label}
          color="primary"
          size="small"
          mode="selected"
          onDelete={(e) => {
            e.stopPropagation();
            onFilterChange('complianceStatus', null);
          }}
          sx={{
            fontSize: '0.7rem',
            height: 24,
            backgroundColor: complianceMeta.color,
            color: complianceMeta.textColor ?? '#fff',
            '& .MuiChip-deleteIcon': {
              color: complianceMeta.textColor ?? '#fff',
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          }}
        />
      );
    }
    if (activeFilters?.affairCategory) {
      activeFilterChips.push(
        <FilterChip
          key="category"
          label={activeFilters.affairCategory}
          size="small"
          variant="outlined"
          color="primary"
          mode="selected"
          onDelete={(e) => {
            e.stopPropagation();
            onFilterChange('affairCategory', null);
          }}
          sx={{ fontSize: '0.7rem', height: 24 }}
        />
      );
    }

    return (
      <>
        <Box sx={{
          p: 2,
          pb: 2, // Normal bottom padding (PageLayout handles BottomTabBar spacing)
        }}>
          {/* Active Filter Chips (mobile only) */}
          {hasActiveFilters && activeFilterChips.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.65, flexWrap: 'wrap', mb: 1.5 }}>
              {activeFilterChips}
            </Box>
          )}

          {sortedRegulatoryAffairs.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                {getUIText('emptyRegulatoryAffairs', language)}
              </Typography>
            </Box>
          ) : (
            sortedRegulatoryAffairs.map((affair) => {
              const latestRenewal = getLatestRenewal(affair.id);

              // Calculate all 4 dimensions
              const lifecycleStatus = affair.lifecycleStatus ?? LIFECYCLE_STATUS.ACTIVE;
              const complianceStatus = latestRenewal
                ? calculateComplianceStatus(latestRenewal)
                : COMPLIANCE_STATUS.EXPIRED;
              const workflowStatus = latestRenewal
                ? calculateWorkflowStatus(latestRenewal, complianceStatus)
                : WORKFLOW_STATUS.IN_PREPARATION;
              const priorityLevel = affair.priorityLevel ?? PRIORITY_LEVEL.MEDIUM;

              // Get metadata
              const lifecycleMeta = getMetadata('lifecycle', lifecycleStatus, language);
              const complianceMeta = complianceMetaFor(complianceStatus);
              const workflowMeta = workflowMetaFor(workflowStatus);
              const priorityMeta = priorityMetaFor(priorityLevel);

              return (
                <ExpandableRow
                  key={affair.id}
                  title={affair.name}
                  borderColor={complianceMeta.color || 'divider'}
                  details={[
                    { label: getUIText('columnCategory', language), value: affair.category },
                    { label: getUIText('columnAuthority', language), value: affair.authority },
                    { label: getUIText('lifecycle_status', language), value: lifecycleMeta?.label ?? lifecycleStatus },
                    { label: getUIText('compliance_status', language), value: complianceMeta.label },
                    { label: getUIText('workflow_status', language), value: workflowMeta?.label ?? workflowStatus },
                    { label: getUIText('priority_level', language), value: priorityMeta?.label ?? priorityLevel },
                    ...(latestRenewal ? [
                      { label: getUIText('columnLastUpdate', language), value: `${formatDisplayDate(latestRenewal.approvalDate || latestRenewal.submissionDate)} - ${latestRenewal.name}` },
                      { label: getUIText('columnNextExpiration', language), value: latestRenewal.expiryDate ? formatDisplayDate(latestRenewal.expiryDate) : 'N/A' },
                    ] : []),
                    { label: getUIText('field_renewal_frequency', language), value: affair.renewalFrequency },
                  ]}
                  onClick={() => {
                    const affairSegment = getRouteSegment('affair', language, currentConfig);
                    const infoSlug = getTabSlug('info', 'affair', language, currentConfig);
                    navigate(`/${affairSegment}/${affair.id}/${infoSlug}`);
                  }}
                  language={language}
                />
              );
            })
          )}
        </Box>

        {/* Filter FAB */}
        <FilterFAB
          onClick={() => setIsFilterDrawerOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* Filter Drawer */}
        <FilterDrawer
          open={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={activeFilters}
          onFilterChange={onFilterChange}
          availableOptions={availableFilterOptions}
          language={language}
          sections={[
            {
              key: 'complianceStatus',
              label: getUIText('compliance_status', language),
              type: 'status',
              options: availableFilterOptions.statuses.map((status) => {
                const metadata = complianceMetaFor(status);
                return {
                  value: status,
                  label: metadata?.label ?? status,
                  icon:
                    typeof metadata.icon === 'string'
                      ? MuiIcons[metadata.icon] ?? null
                      : metadata.icon,
                };
              }),
            },
            {
              key: 'affairCategory',
              label: getUIText('affair_category', language),
              options: availableFilterOptions.categories.map((cat) => ({
                value: cat,
                label: cat,
              })),
            },
            {
              key: 'type',
              label: getUIText('type', language),
              options: availableFilterOptions.types.map((type) => ({
                value: type,
                label: type,
              })),
            },
          ]}
        />
      </>
    );
  }

  // Desktop Table View
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={0} sx={{ borderRadius: 0, overflow: 'hidden', flex: 1 }}>
        <DataTable
          columns={desktopColumns}
          rows={desktopRows}
          sortState={sortState}
          onSortChange={handleSortChange}
          emptyState={{
            title: getUIText('emptyRegulatoryAffairs', language),
          }}
        />
      </Paper>
    </Box>
  );
};

export default memo(RegulatoryAffairsTab);

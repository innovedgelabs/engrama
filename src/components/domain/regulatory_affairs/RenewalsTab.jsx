import { useState, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  IconButton,
  Typography,
  Tooltip,
  Card,
  CardContent,
  Stack,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import {
  calculateComplianceStatus,
  calculateWorkflowStatus,
  COMPLIANCE_STATUS,
  WORKFLOW_STATUS,
  formatDisplayDate,
} from '../../../utils/status';
import { DEFAULT_LANGUAGE, getUIText } from '../../../utils/i18nHelpers';
import { getRouteSegment, getTabSlug } from '../../../utils/routing';
import { useDomain } from '../../../contexts/DomainContext';
import DataTable from '../../layout/table/DataTable';
import FilterChip from '../../common/FilterChip';
import ExpandableRow from '../../common/ExpandableRow';
import FilterFAB from '../../common/FilterFAB';
import FilterDrawer from '../../common/FilterDrawer';
import { useStatusHelpers } from '../../../utils/domainStatus';
import * as MuiIcons from '@mui/icons-material';

const WORKFLOW_SORT_ORDER = {
  [WORKFLOW_STATUS.NEEDS_RENEWAL]: 1,
  [WORKFLOW_STATUS.IN_PREPARATION]: 2,
  [WORKFLOW_STATUS.SUBMITTED]: 3,
  [WORKFLOW_STATUS.COMPLETED]: 4,
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

const RenewalsTab = ({
  renewals = [],
  attachments = [],
  affairId,
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

  const getPrimaryAttachment = useCallback(
    (renewalId) => primaryAttachmentByRenewal.get(renewalId) ?? null,
    [primaryAttachmentByRenewal]
  );

  const handleSortChange = useCallback((nextSort) => {
    setSortState(nextSort);
  }, []);

  const sortAccessors = useMemo(
    () => ({
      name: (item) => item.name ?? '',
      type: (item) => item.type ?? '',
      approvalDate: (item) => {
        const value = item.approvalDate || item.submissionDate;
        return value ? new Date(value).getTime() : 0;
      },
      expiryDate: (item) => {
        const value = item.expiryDate;
        return value ? new Date(value).getTime() : 0;
      },
    }),
    []
  );

  const compareRenewalStatus = useCallback((renewalA, renewalB, order) => {
    const aCompliance = calculateComplianceStatus(renewalA);
    const bCompliance = calculateComplianceStatus(renewalB);
    const aStatus = calculateWorkflowStatus(renewalA, aCompliance) ?? WORKFLOW_STATUS.IN_PREPARATION;
    const bStatus = calculateWorkflowStatus(renewalB, bCompliance) ?? WORKFLOW_STATUS.IN_PREPARATION;
    const aValue = WORKFLOW_SORT_ORDER[aStatus] || 999;
    const bValue = WORKFLOW_SORT_ORDER[bStatus] || 999;

    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  }, []);

  const complianceMetaFor = useCallback(
    (statusKey) => getMetadata('compliance', statusKey, language) || {},
    [getMetadata, language]
  );

  const workflowMetaFor = useCallback(
    (statusKey) => getMetadata('workflow', statusKey, language) || {},
    [getMetadata, language]
  );

  const filteredRenewals = useMemo(() => {
    if (!renewals) {
      return [];
    }

    if (!activeFilters || Object.keys(activeFilters).length === 0) {
      return renewals;
    }

    return renewals.filter((renewal) => {
      if (
        activeFilters.renewalType &&
        normalizeFilterValue(renewal.type) !== normalizeFilterValue(activeFilters.renewalType)
      ) {
        return false;
      }

      if (activeFilters.workflowStatus) {
        const complianceStatus = calculateComplianceStatus(renewal);
        const workflowStatus = calculateWorkflowStatus(renewal, complianceStatus) ?? WORKFLOW_STATUS.IN_PREPARATION;
        if (
          normalizeFilterValue(workflowStatus) !== normalizeFilterValue(activeFilters.workflowStatus)
        ) {
          return false;
        }
      }

      if (activeFilters.renewalAttachments) {
        const attachments = attachmentsByRenewal.get(renewal.id) ?? [];
        const attachmentCount = attachments.length || renewal.attachmentCount || 0;
        if (
          normalizeFilterValue(String(attachmentCount)) !==
          normalizeFilterValue(activeFilters.renewalAttachments)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [renewals, activeFilters, attachmentsByRenewal]);

  const sortedRenewals = useMemo(() => {
    if (!filteredRenewals) {
      return [];
    }

    const sourceRenewals = filteredRenewals;
    const { orderBy, order } = sortState;

    if (!orderBy) {
      return sourceRenewals;
    }

    if (orderBy === 'status') {
      return [...sourceRenewals].sort((a, b) => compareRenewalStatus(a, b, order));
    }

    const accessor = sortAccessors[orderBy];

    if (!accessor) {
      return sourceRenewals;
    }

    return [...sourceRenewals].sort((a, b) => {
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
  }, [filteredRenewals, sortState, sortAccessors, compareRenewalStatus]);

  // Context-aware filter options (only show options that exist in filtered data)
  const availableFilterOptions = useMemo(() => {
    const statuses = new Set();
    const types = new Set();
    const responsible = new Set();

    sortedRenewals.forEach((renewal) => {
      const complianceStatus = calculateComplianceStatus(renewal);
      const workflowStatus = calculateWorkflowStatus(renewal, complianceStatus) ?? WORKFLOW_STATUS.IN_PREPARATION;
      statuses.add(workflowStatus);

      if (renewal.type) types.add(renewal.type);
      if (renewal.responsiblePerson) responsible.add(renewal.responsiblePerson);
    });

    return {
      statuses: Array.from(statuses),
      types: Array.from(types),
      responsible: Array.from(responsible),
    };
  }, [sortedRenewals]);

  const desktopRows = useMemo(
    () =>
      sortedRenewals.map((renewal) => {
        const complianceStatus = calculateComplianceStatus(renewal);
        const workflowStatus = calculateWorkflowStatus(renewal, complianceStatus) ?? WORKFLOW_STATUS.IN_PREPARATION;

              const complianceMeta = complianceMetaFor(complianceStatus);
              const workflowMeta = workflowMetaFor(workflowStatus);

              const complianceLabel = complianceMeta?.label ?? complianceStatus;
              const workflowLabel = workflowMeta?.label ?? workflowStatus;

        const attachments = attachmentsByRenewal.get(renewal.id) ?? [];
        const attachmentCount = attachments.length || renewal.attachmentCount || 0;
        const primaryAttachment = getPrimaryAttachment(renewal.id);

        return {
          id: renewal.id,
          renewal,
          complianceStatus,
          complianceMeta,
          complianceLabel,
          workflowMeta,
          workflowLabel,
          workflowStatus,
          attachmentCount,
          primaryAttachment,
          onClick: () => {
            const renewalSegment = getRouteSegment('renewal', language, currentConfig);
            const infoSlug = getTabSlug('info', 'renewal', language, currentConfig);
            navigate(`/${renewalSegment}/${renewal.id}/${infoSlug}`);
          },
        };
      }),
    [sortedRenewals, attachmentsByRenewal, getPrimaryAttachment, navigate, language, currentConfig]
  );

  const desktopColumns = useMemo(
    () => [
      {
        key: 'name',
        label: getUIText('columnRenewal', language),
        sortable: true,
        sortAccessor: (row) => sortAccessors.name(row.renewal),
        render: ({ renewal }) => (
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
              {renewal.name}
            </Typography>
            {renewal.notes && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                {renewal.notes}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        key: 'type',
        label: getUIText('columnRenewalType', language),
        sortable: true,
        sortAccessor: (row) => sortAccessors.type(row.renewal),
        render: ({ renewal }) => (
          <FilterChip
            label={renewal.type}
            size="small"
            variant="outlined"
            filterKey="renewalType"
            filterValue={renewal.type ?? ''}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        ),
      },
      {
        key: 'approvalDate',
        label: getUIText('columnApprovalDate', language),
        sortable: true,
        sortAccessor: (row) => sortAccessors.approvalDate(row.renewal),
        render: ({ renewal }) => formatDisplayDate(renewal.approvalDate || renewal.submissionDate),
      },
      {
        key: 'expiryDate',
        label: getUIText('columnExpiration', language),
        sortable: true,
        sortAccessor: (row) => sortAccessors.expiryDate(row.renewal),
        render: ({ renewal }) => formatDisplayDate(renewal.expiryDate),
      },
      {
        key: 'compliance',
        label: getUIText('compliance_status', language),
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
              backgroundColor: complianceMeta?.color ?? theme.palette.primary.main,
              color: complianceMeta?.textColor ?? '#fff',
              '&:hover': {
                backgroundColor: complianceMeta?.color ?? theme.palette.primary.main,
                filter: 'brightness(0.9)',
              },
            }}
          />
        ),
      },
      {
        key: 'workflow',
        label: getUIText('workflow_status', language),
        sortable: true,
        sortComparator: (a, b, order) => compareRenewalStatus(a.renewal, b.renewal, order),
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
              backgroundColor: workflowMeta?.color ?? theme.palette.primary.main,
              color: workflowMeta?.textColor ?? '#fff',
              '&:hover': {
                backgroundColor: workflowMeta?.color ?? theme.palette.primary.main,
                filter: 'brightness(0.9)',
              },
            }}
          />
        ),
      },
      {
        key: 'responsible',
        label: getUIText('columnResponsible', language),
        render: ({ renewal }) => (
          <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
            {renewal.responsiblePerson}
          </Typography>
        ),
      },
      {
        key: 'attachments',
        label: getUIText('columnAttachmentsCount', language),
        render: ({ attachmentCount }) => (
          <FilterChip
            label={`${attachmentCount} docs`}
            size="small"
            color="primary"
            variant="outlined"
            filterKey="renewalAttachments"
            filterValue={String(attachmentCount)}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        ),
      },
      {
        key: 'primaryAttachment',
        label: getUIText('columnPrimaryAttachment', language),
        align: 'right',
        render: ({ primaryAttachment }) =>
          primaryAttachment ? (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={`${getUIText('tooltipView', language)} ${primaryAttachment.name}`}>
                <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                  <ViewIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={`${getUIText('tooltipDownload', language)} ${primaryAttachment.name}`}>
                <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                  <DownloadIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={`${getUIText('tooltipSend', language)} ${primaryAttachment.name}`}>
                <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                  <SendIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            </Box>
          ) : null,
      },
    ],
    [sortAccessors, compareRenewalStatus, activeFilters, onFilterChange]
  );


  // Mobile Expandable Row View
  if (isMobile) {
    const hasActiveFilters = activeFilters && Object.keys(activeFilters).length > 0;
    const activeFilterCount = hasActiveFilters ? Object.keys(activeFilters).length : 0;

    // Generate active filter chips
    const activeFilterChips = [];
    if (activeFilters?.workflowStatus) {
      const workflowMeta = workflowMetaFor(activeFilters.workflowStatus);
      activeFilterChips.push(
        <FilterChip
          key="status"
          label={workflowMeta?.label ?? activeFilters.workflowStatus}
          color="primary"
          size="small"
          mode="selected"
          onDelete={(e) => {
            e.stopPropagation();
            onFilterChange('workflowStatus', null);
          }}
          sx={{
            fontSize: '0.7rem',
            height: 24,
            backgroundColor: workflowMeta?.color ?? theme.palette.primary.main,
            color: workflowMeta?.textColor ?? '#fff',
            '& .MuiChip-deleteIcon': {
              color: workflowMeta?.textColor ?? '#fff',
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          }}
        />
      );
    }
    if (activeFilters?.renewalType) {
      activeFilterChips.push(
        <FilterChip
          key="type"
          label={activeFilters.renewalType}
          size="small"
          variant="outlined"
          color="primary"
          mode="selected"
          onDelete={(e) => {
            e.stopPropagation();
            onFilterChange('renewalType', null);
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

          {sortedRenewals.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                {getUIText('emptyRenewals', language)}
              </Typography>
            </Box>
          ) : (
            sortedRenewals.map((renewal) => {
              const complianceStatus = calculateComplianceStatus(renewal);
              const workflowStatus = calculateWorkflowStatus(renewal, complianceStatus) ?? WORKFLOW_STATUS.IN_PREPARATION;

              const complianceMeta = complianceMetaFor(complianceStatus);
              const workflowMeta = workflowMetaFor(workflowStatus);

              const attachments = attachmentsByRenewal.get(renewal.id) ?? [];
              const attachmentCount = attachments.length || renewal.attachmentCount || 0;

              return (
                <ExpandableRow
                  key={renewal.id}
                  title={renewal.name}
                  borderColor={workflowMeta?.color || 'divider'}
                  details={[
                    { label: getUIText('columnRenewalType', language), value: renewal.type },
                    { label: getUIText('compliance_status', language), value: complianceMeta?.label ?? complianceStatus },
                    { label: getUIText('workflow_status', language), value: workflowMeta?.label ?? workflowStatus },
                    { label: getUIText('columnApprovalDate', language), value: formatDisplayDate(renewal.approvalDate || renewal.submissionDate) },
                    { label: getUIText('columnExpiration', language), value: renewal.expiryDate ? formatDisplayDate(renewal.expiryDate) : 'N/A' },
                    { label: getUIText('columnResponsible', language), value: renewal.responsiblePerson || 'N/A' },
                    { label: getUIText('columnAttachmentsCount', language), value: `${attachmentCount} docs` },
                    ...(renewal.notes ? [{ label: getUIText('field_notes', language), value: renewal.notes }] : []),
                  ]}
                  onClick={() => {
                    const renewalSegment = getRouteSegment('renewal', language, currentConfig);
                    const infoSlug = getTabSlug('info', 'renewal', language, currentConfig);
                    navigate(`/${renewalSegment}/${renewal.id}/${infoSlug}`);
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
          key: 'workflowStatus',
          label: getUIText('status', language),
          type: 'status',
          options: availableFilterOptions.statuses.map((status) => {
            const metadata = workflowMetaFor(status);
            return {
              value: status,
              label: metadata?.label ?? status,
              icon: typeof metadata?.icon === 'string' ? MuiIcons[metadata.icon] ?? null : metadata?.icon,
            };
          }),
        },
            {
              key: 'renewalType',
              label: getUIText('type', language),
              options: availableFilterOptions.types.map((type) => ({
                value: type,
                label: type,
              })),
            },
            {
              key: 'responsible',
              label: getUIText('responsible', language),
              options: availableFilterOptions.responsible.map((person) => ({
                value: person,
                label: person,
              })),
            },
          ]}
        />
      </>
    );
  }

  // Desktop Table View
  return (
    <Paper elevation={0} sx={{ borderRadius: 0, overflow: 'hidden', height: '100%' }}>
      <DataTable
        columns={desktopColumns}
        rows={desktopRows}
        sortState={sortState}
        onSortChange={handleSortChange}
        emptyState={{
          title: getUIText('emptyRenewals', language),
        }}
      />
    </Paper>
  );
};

export default memo(RenewalsTab);

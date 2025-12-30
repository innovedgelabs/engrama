import { useState, useMemo, useCallback, memo } from 'react';
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
  useMediaQuery,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatDisplayDate } from '../../../utils/status';
import { DEFAULT_LANGUAGE, getUIText } from '../../../utils/i18nHelpers';
import ExpandableRow from '../../common/ExpandableRow';
import DataTable from '../../layout/table/DataTable';
import FilterChip from '../../common/FilterChip';
import FilterFAB from '../../common/FilterFAB';
import FilterDrawer from '../../common/FilterDrawer';

const normalizeFilterValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).toLowerCase();
};

const AttachmentsTabComponent = ({ attachments = [], activeFilters = {}, onFilterChange, language = DEFAULT_LANGUAGE }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sortState, setSortState] = useState({ orderBy: null, order: 'asc' });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const normalizeSortValue = useCallback((value) => {
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
  }, []);

  const sortAccessors = useMemo(
    () => ({
      name: (doc) => doc.name ?? '',
      type: (doc) => doc.type ?? '',
      fileSize: (doc) => doc.fileSize ?? '',
      uploadedAt: (doc) => {
        const value = doc.uploadedAt;
        return value ? new Date(value).getTime() : 0;
      },
      uploadedBy: (doc) => doc.uploadedBy ?? '',
    }),
    []
  );

  const handleSortChange = useCallback((nextSort) => {
    setSortState(nextSort);
  }, []);

  const filteredAttachments = useMemo(() => {
    if (!attachments) {
      return [];
    }

    if (!activeFilters || Object.keys(activeFilters).length === 0) {
      return attachments;
    }

    return attachments.filter((doc) => {
      if (
        activeFilters.attachmentType &&
        normalizeFilterValue(doc.type) !== normalizeFilterValue(activeFilters.attachmentType)
      ) {
        return false;
      }

      if (activeFilters.attachmentPrimary) {
        const wantsPrimary = normalizeFilterValue(activeFilters.attachmentPrimary) === 'true';
        if (Boolean(doc.isPrimary) !== wantsPrimary) {
          return false;
        }
      }

      return true;
    });
  }, [attachments, activeFilters]);

  const sortedAttachments = useMemo(() => {
    if (!filteredAttachments) {
      return [];
    }

   const sourceAttachments = filteredAttachments;
    const { orderBy, order } = sortState;

    if (!orderBy) {
      return sourceAttachments;
    }

    const accessor = sortAccessors[orderBy];

    if (!accessor) {
      return sourceAttachments;
    }

    return [...sourceAttachments].sort((a, b) => {
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
  }, [filteredAttachments, sortState, sortAccessors, normalizeSortValue]);

  // Context-aware filter options (only show options that exist in filtered data)
  const availableFilterOptions = useMemo(() => {
    const types = new Set();
    const uploadedBy = new Set();

    sortedAttachments.forEach((doc) => {
      if (doc.type) types.add(doc.type);
      if (doc.uploadedBy) uploadedBy.add(doc.uploadedBy);
    });

    return {
      types: Array.from(types),
      uploadedBy: Array.from(uploadedBy),
    };
  }, [sortedAttachments]);

  // Mobile Expandable Row View
  if (isMobile) {
    const hasActiveFilters = activeFilters && Object.keys(activeFilters).length > 0;
    const activeFilterCount = hasActiveFilters ? Object.keys(activeFilters).length : 0;

    // Generate active filter chips
    const activeFilterChips = [];
    if (activeFilters?.attachmentType) {
      activeFilterChips.push(
        <FilterChip
          key="type"
          label={activeFilters.attachmentType}
          size="small"
          variant="outlined"
          color="primary"
          mode="selected"
          onDelete={(e) => {
            e.stopPropagation();
            onFilterChange('attachmentType', null);
          }}
          sx={{ fontSize: '0.7rem', height: 24 }}
        />
      );
    }
    if (activeFilters?.attachmentPrimary) {
      activeFilterChips.push(
        <FilterChip
          key="primary"
          label="Principal"
          size="small"
          color="primary"
          mode="selected"
          onDelete={(e) => {
            e.stopPropagation();
            onFilterChange('attachmentPrimary', null);
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

          {sortedAttachments.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                {getUIText('emptyAttachments', language)}
              </Typography>
            </Box>
          ) : (
            sortedAttachments.map((doc) => {
              return (
                <ExpandableRow
                  key={doc.id}
                  title={doc.name}
                  borderColor={doc.isPrimary ? 'primary.main' : 'divider'}
                  details={[
                    { label: getUIText('columnAttachmentType', language), value: doc.type },
                    { label: getUIText('columnFileSize', language), value: doc.fileSize },
                    { label: getUIText('columnUploadedAt', language), value: formatDisplayDate(doc.uploadedAt, { fallback: '' }) },
                    { label: getUIText('columnUploadedBy', language), value: doc.uploadedBy },
                    ...(doc.isPrimary ? [{ label: 'Principal', value: 'Sí' }] : []),
                    ...(doc.notes ? [{ label: getUIText('field_notes', language), value: doc.notes }] : []),
                  ]}
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
              key: 'attachmentType',
              label: getUIText('type', language),
              options: availableFilterOptions.types.map((type) => ({
                value: type,
                label: type,
              })),
            },
            {
              key: 'attachmentPrimary',
              label: getUIText('columnPrimaryAttachment', language),
              options: [
                { value: 'true', label: 'Sí' },
                { value: 'false', label: 'No' },
              ],
            },
          ]}
        />
      </>
    );
  }

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: getUIText('columnAttachmentName', language),
        sortable: true,
        sortAccessor: sortAccessors.name,
        render: (doc) => (
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
              {doc.name}
            </Typography>
            {doc.notes && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                {doc.notes}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        key: 'type',
        label: getUIText('columnAttachmentType', language),
        sortable: true,
        sortAccessor: sortAccessors.type,
        render: (doc) => (
          <FilterChip
            label={doc.type}
            size="small"
            variant="outlined"
            filterKey="attachmentType"
            filterValue={doc.type ?? ''}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        ),
      },
      {
        key: 'fileSize',
        label: getUIText('columnFileSize', language),
        sortable: true,
        sortAccessor: sortAccessors.fileSize,
        render: (doc) => doc.fileSize,
      },
      {
        key: 'uploadedAt',
        label: getUIText('columnUploadedAt', language),
        sortable: true,
        sortAccessor: sortAccessors.uploadedAt,
        render: (doc) => formatDisplayDate(doc.uploadedAt, { fallback: '' }),
      },
      {
        key: 'uploadedBy',
        label: getUIText('columnUploadedBy', language),
        sortable: true,
        sortAccessor: sortAccessors.uploadedBy,
        render: (doc) => (
          <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
            {doc.uploadedBy}
          </Typography>
        ),
      },
      {
        key: 'actions',
        label: getUIText('columnActions', language),
        align: 'right',
        render: () => (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
            <Tooltip title={getUIText('tooltipViewAttachment', language)}>
              <IconButton size="small">
                <ViewIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={getUIText('tooltipDownload', language)}>
              <IconButton size="small">
                <DownloadIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={getUIText('tooltipDelete', language)}>
              <IconButton size="small" color="error">
                <DeleteIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [sortAccessors, activeFilters, onFilterChange]
  );


  return (
    <Paper elevation={0} sx={{ borderRadius: 0, overflow: 'hidden', height: '100%' }}>
      <DataTable
        columns={columns}
        rows={sortedAttachments}
        sortState={sortState}
        onSortChange={handleSortChange}
        emptyState={{
          title: getUIText('emptyAttachments', language),
        }}
      />
    </Paper>
  );
};

export default memo(AttachmentsTabComponent);

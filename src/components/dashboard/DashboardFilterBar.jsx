import { Box, Button, Chip, Typography, useTheme } from '@mui/material';
import { FilterList as FilterListIcon } from '@mui/icons-material';
import {
  getUIText,
  getCategoryLabel,
  getComplianceLabel,
  getPriorityLabel,
  getWorkflowLabel,
} from '../../utils/i18nHelpers';

/**
 * DashboardFilterBar
 *
 * A modern toolbar-style filter bar with:
 * - Filter drawer toggle
 * - Active filter chips grouped by category (e.g., "Category: [Vehicle] [Company]")
 * 
 * Layout: Single row, left-aligned, no card wrapper to save vertical space.
 */
const DashboardFilterBar = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onOpenFilterDrawer,
  activeFilterCount,
  language = 'es',
}) => {
  const theme = useTheme();

  const handlePartialChange = (partial) => {
    if (typeof onFiltersChange === 'function') {
      onFiltersChange({ ...filters, ...partial });
    }
  };

  const handleRemoveFilter = (key, value) => {
    const current = filters[key];
    if (Array.isArray(current)) {
      handlePartialChange({ [key]: current.filter((v) => v !== value) });
    } else {
      handlePartialChange({ [key]: '' }); // Or null depending on filter type
    }
  };

  // Helper to generate a group of chips for a specific filter category
  const renderFilterGroup = (key, labelKey, values, getLabel) => {
    if (!values || !Array.isArray(values) || values.length === 0) return null;

    const label = getUIText(labelKey, language);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mr: 0.5 }}>
          {label}:
        </Typography>
        {values.map((val) => (
          <Chip
            key={`${key}-${val}`}
            label={getLabel ? getLabel(val) : val}
            onDelete={() => handleRemoveFilter(key, val)}
            size="small"
            sx={{ 
              bgcolor: 'white', 
              border: 1, 
              borderColor: 'divider',
              '& .MuiChip-label': { px: 1 }
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
      {/* Filters Toggle Button */}
      <Button
        variant="outlined"
        startIcon={<FilterListIcon />}
        onClick={onOpenFilterDrawer}
        color={activeFilterCount > 0 ? 'primary' : 'inherit'}
        sx={{ 
          borderRadius: 99, 
          borderColor: activeFilterCount > 0 ? 'primary.main' : 'divider',
          color: activeFilterCount > 0 ? 'primary.main' : 'text.secondary',
          whiteSpace: 'nowrap',
          bgcolor: 'background.paper'
        }}
      >
        {getUIText('filters', language)}
        {activeFilterCount > 0 && (
          <Box
            component="span"
            sx={{
              ml: 1,
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
            }}
          >
            {activeFilterCount}
          </Box>
        )}
      </Button>

      {/* Clear Button */}
      {activeFilterCount > 0 && (
        <Button 
          size="small" 
          onClick={onClearFilters}
          color="error"
          sx={{ minWidth: 'auto', px: 1 }}
        >
          {language === 'es' ? 'Borrar' : 'Clear'}
        </Button>
      )}

      {/* Active Filter Groups */}
      {activeFilterCount > 0 && (
        <>
          {renderFilterGroup('assetCategories', 'asset_category', filters.assetCategories, (val) => getCategoryLabel(val, language))}
          {renderFilterGroup('affairTypes', 'columnType', filters.affairTypes)}
          {renderFilterGroup('authorities', 'columnAuthority', filters.authorities)}
          {renderFilterGroup('responsiblePeople', 'responsible_person', filters.responsiblePeople)}
          {renderFilterGroup('complianceStatuses', 'status', filters.complianceStatuses, (val) => getComplianceLabel(val, language))}
          {renderFilterGroup('workflowStatuses', 'workflow_status', filters.workflowStatuses, (val) => getWorkflowLabel(val, language))}
          {renderFilterGroup('priorityLevels', 'priority', filters.priorityLevels, (val) => getPriorityLabel(val, language))}
          
          {/* Asset ID Special Case */}
          {filters.assetId && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mr: 0.5 }}>
                  ID:
                </Typography>
                <Chip
                    label={filters.assetId} 
                    onDelete={() => handleRemoveFilter('assetId')}
                    size="small"
                    sx={{ bgcolor: 'white', border: 1, borderColor: 'divider' }}
                />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default DashboardFilterBar;

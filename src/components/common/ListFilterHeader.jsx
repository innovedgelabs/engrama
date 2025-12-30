import { memo, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Autocomplete,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import FilterChip from './FilterChip';

/**
 * ListFilterHeader - Reusable header component for list views with filters
 *
 * Provides a consistent pattern for list views that need:
 * - Title with optional count badge (like accordions)
 * - Subtitle description
 * - Optional action button (e.g., "New Request")
 * - Configurable filter controls
 * - Clear filters functionality
 * - Responsive layout (pills on desktop, dropdowns on mobile)
 *
 * @param {string} title - Main title for the header
 * @param {string} subtitle - Secondary description text
 * @param {number|string} countBadge - Count badge next to title (small blue primary chip like accordions)
 * @param {ReactNode} actionButton - Optional action button (right side)
 * @param {Array} filters - Filter configuration array
 * @param {Object} activeFilters - Current filter values
 * @param {Function} onFilterChange - Callback when filter changes (key, value)
 * @param {Function} onClearFilters - Callback to clear all filters
 * @param {string} language - Current language ('en' or 'es')
 * @param {Object} sx - Additional styles for the Paper container
 */
const ListFilterHeader = ({
  title,
  subtitle,
  countBadge,
  actionButton,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  language = 'en',
  sx = {},
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(activeFilters).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
  }, [activeFilters]);

  // Handle chip click for toggle behavior
  const handleChipClick = useCallback(
    (filterKey, filterValue) => {
      const currentValues = activeFilters[filterKey] || [];
      const isArray = Array.isArray(currentValues);

      if (isArray) {
        // Multi-select: toggle value in array
        const newValues = currentValues.includes(filterValue)
          ? currentValues.filter((v) => v !== filterValue)
          : [...currentValues, filterValue];
        onFilterChange(filterKey, newValues.length > 0 ? newValues : null);
      } else {
        // Single-select: toggle on/off
        onFilterChange(
          filterKey,
          currentValues === filterValue ? null : filterValue
        );
      }
    },
    [activeFilters, onFilterChange]
  );

  // Handle mobile dropdown change
  const handleDropdownChange = useCallback(
    (filterKey, multiple) => (event) => {
      const value = event.target.value;
      if (multiple) {
        onFilterChange(filterKey, value.length > 0 ? value : null);
      } else {
        onFilterChange(filterKey, value || null);
      }
    },
    [onFilterChange]
  );

  // Handle autocomplete change
  const handleAutocompleteChange = useCallback(
    (filterKey) => (_event, newValue) => {
      onFilterChange(filterKey, newValue);
    },
    [onFilterChange]
  );

  // Render a single filter control
  const renderFilter = useCallback(
    (filter) => {
      const {
        key,
        label,
        type = 'chips',
        options = [],
        multiple = true,
        placeholder,
        getOptionLabel,
        renderOption,
        isOptionEqualToValue,
      } = filter;

      const currentValue = activeFilters[key];
      const currentArray = Array.isArray(currentValue)
        ? currentValue
        : currentValue
        ? [currentValue]
        : [];

      // Filter label styling
      const labelSx = {
        display: 'block',
        mb: 1,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: '0.7rem',
        color: 'text.secondary',
      };

      if (type === 'autocomplete') {
        return (
          <Box key={key} sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
            <Typography variant="caption" sx={labelSx}>
              {label}
            </Typography>
            <Autocomplete
              options={options}
              getOptionLabel={getOptionLabel || ((option) => option?.label || option?.name || '')}
              value={currentValue || null}
              onChange={handleAutocompleteChange(key)}
              isOptionEqualToValue={isOptionEqualToValue || ((option, value) => option?.id === value?.id)}
              renderOption={renderOption}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={placeholder || (language === 'es' ? 'Todos' : 'All')}
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              size="small"
            />
          </Box>
        );
      }

      // Select type always renders as dropdown
      if (type === 'select') {
        return (
          <Box key={key} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={labelSx}>
              {label}
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                multiple={multiple}
                value={multiple ? currentArray : currentValue || ''}
                onChange={handleDropdownChange(key, multiple)}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected || (Array.isArray(selected) && selected.length === 0)) {
                    return (
                      <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {placeholder || (language === 'es' ? 'Todos' : 'All')}
                      </Typography>
                    );
                  }
                  if (Array.isArray(selected)) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const opt = options.find(
                            (o) => (typeof o === 'object' ? o.value : o) === value
                          );
                          const optLabel = typeof opt === 'object' ? opt.label : opt;
                          return <Chip key={value} label={optLabel} size="small" />;
                        })}
                      </Box>
                    );
                  }
                  const opt = options.find(
                    (o) => (typeof o === 'object' ? o.value : o) === selected
                  );
                  return typeof opt === 'object' ? opt.label : opt;
                }}
              >
                {/* Add "All" option for single-select dropdowns */}
                {!multiple && (
                  <MenuItem value="">
                    <Typography color="text.secondary">
                      {placeholder || (language === 'es' ? 'Todos' : 'All')}
                    </Typography>
                  </MenuItem>
                )}
                {options.map((option) => {
                  const optionValue = typeof option === 'object' ? option.value : option;
                  const optionLabel = typeof option === 'object' ? option.label : option;
                  return (
                    <MenuItem key={optionValue} value={optionValue}>
                      {optionLabel}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        );
      }

      // Chips on desktop, dropdown on mobile
      if (isDesktop || type === 'chips-only') {
        return (
          <Box key={key} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={labelSx}>
              {label}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {options.map((option) => {
                const optionValue = typeof option === 'object' ? option.value : option;
                const optionLabel = typeof option === 'object' ? option.label : option;
                const isActive = currentArray.includes(optionValue);

                return (
                  <FilterChip
                    key={optionValue}
                    label={optionLabel}
                    filterKey={key}
                    filterValue={optionValue}
                    activeFilters={{ [key]: isActive ? optionValue : null }}
                    onFilterChange={() => handleChipClick(key, optionValue)}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                );
              })}
            </Box>
          </Box>
        );
      }

      // Mobile: dropdown
      return (
        <Box key={key} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={labelSx}>
            {label}
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              multiple={multiple}
              value={multiple ? currentArray : currentValue || ''}
              onChange={handleDropdownChange(key, multiple)}
              displayEmpty
              renderValue={(selected) => {
                if (!selected || (Array.isArray(selected) && selected.length === 0)) {
                  return (
                    <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {placeholder || (language === 'es' ? 'Todos' : 'All')}
                    </Typography>
                  );
                }
                if (Array.isArray(selected)) {
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const opt = options.find(
                          (o) => (typeof o === 'object' ? o.value : o) === value
                        );
                        const optLabel = typeof opt === 'object' ? opt.label : opt;
                        return <Chip key={value} label={optLabel} size="small" />;
                      })}
                    </Box>
                  );
                }
                const opt = options.find(
                  (o) => (typeof o === 'object' ? o.value : o) === selected
                );
                return typeof opt === 'object' ? opt.label : opt;
              }}
            >
              {options.map((option) => {
                const optionValue = typeof option === 'object' ? option.value : option;
                const optionLabel = typeof option === 'object' ? option.label : option;
                return (
                  <MenuItem key={optionValue} value={optionValue}>
                    {optionLabel}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      );
    },
    [
      activeFilters,
      isDesktop,
      language,
      handleChipClick,
      handleDropdownChange,
      handleAutocompleteChange,
    ]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        px: { xs: 2, sm: 2.5 },
        pt: { xs: 2, sm: 2.5 },
        pb: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        ...sx,
      }}
    >
      {/* Header Row: Title + Badge + Clear Button + Action Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: filters.length > 0 ? 2 : 0,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                fontSize: { xs: '1rem', sm: '1.125rem' },
              }}
            >
              {title}
            </Typography>
            {countBadge !== undefined && countBadge !== null && (
              <Chip
                label={countBadge}
                size="small"
                color="primary"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: { xs: 20, sm: 24 },
                  minWidth: { xs: 28, sm: 32 },
                }}
              />
            )}
            {hasActiveFilters && (
              <Chip
                label={language === 'es' ? 'Limpiar' : 'Clear'}
                onClick={onClearFilters}
                onDelete={onClearFilters}
                deleteIcon={<ClearIcon sx={{ fontSize: 16 }} />}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ height: 28, cursor: 'pointer' }}
              />
            )}
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {actionButton && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {actionButton}
          </Box>
        )}
      </Box>

      {/* Filters Row */}
      {filters.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 3 },
            alignItems: { xs: 'stretch', md: 'flex-end' },
          }}
        >
          {filters.map(renderFilter)}
        </Box>
      )}
    </Paper>
  );
};

export default memo(ListFilterHeader);

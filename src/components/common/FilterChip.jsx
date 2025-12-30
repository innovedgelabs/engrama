import { memo, useMemo, useCallback } from 'react';
import { Chip } from '@mui/material';

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).toLowerCase();
};

/**
 * FilterChip Component
 *
 * @param {string} mode - 'filter' (default, clickable to toggle) or 'selected' (shows delete icon)
 * @param {function} onDelete - Callback for delete action (used in 'selected' mode)
 */
const FilterChip = ({
  label,
  color = 'default',
  variant = 'filled',
  size = 'small',
  icon,
  filterKey,
  filterValue,
  activeFilters,
  onFilterChange,
  activeVariant = 'filled',
  activeColor,
  disabled,
  sx,
  onClick,
  clickable,
  mode = 'filter', // 'filter' or 'selected'
  onDelete,
  ...rest
}) => {
  const isFilterEnabled = Boolean(filterKey && onFilterChange);

  const activeValue = useMemo(() => {
    if (!isFilterEnabled || !activeFilters) {
      return undefined;
    }
    return activeFilters[filterKey];
  }, [activeFilters, filterKey, isFilterEnabled]);

  const isActive = useMemo(() => {
    if (!isFilterEnabled) {
      return false;
    }
    if (activeValue === undefined || activeValue === null) {
      return false;
    }
    return (
      normalizeValue(activeValue) === normalizeValue(filterValue)
    );
  }, [activeValue, filterValue, isFilterEnabled]);

  const computedVariant = isActive ? activeVariant : variant;
  const computedColor = isActive
    ? activeColor || (color === 'default' ? 'primary' : color)
    : color;

  const handleClick = useCallback(
    (event) => {
      if (event?.stopPropagation) {
        event.stopPropagation();
      }

      if (onClick) {
        onClick(event);
      }

      if (event?.defaultPrevented || !isFilterEnabled || disabled) {
        return;
      }

      // In 'selected' mode, clicking doesn't toggle - only delete does
      if (mode === 'selected') {
        return;
      }

      onFilterChange(filterKey, isActive ? null : filterValue);
    },
    [disabled, filterKey, filterValue, isActive, isFilterEnabled, onClick, onFilterChange, mode]
  );

  const handleDelete = useCallback(
    (event) => {
      if (event?.stopPropagation) {
        event.stopPropagation();
      }

      if (onDelete) {
        onDelete(event);
      } else if (isFilterEnabled) {
        // If no onDelete provided, use filter change mechanism
        onFilterChange(filterKey, null);
      }
    },
    [onDelete, isFilterEnabled, onFilterChange, filterKey]
  );

  // In 'selected' mode, show as deletable chip
  if (mode === 'selected') {
    return (
      <Chip
        {...rest}
        label={label}
        icon={icon}
        size={size}
        variant={variant}
        color={color}
        disabled={disabled}
        onDelete={handleDelete}
        sx={sx}
      />
    );
  }

  // Default 'filter' mode - clickable to toggle when inactive, shows X when active
  return (
    <Chip
      {...rest}
      label={label}
      icon={icon}
      size={size}
      variant={computedVariant}
      color={computedColor}
      disabled={disabled}
      onClick={isActive ? undefined : (isFilterEnabled || onClick ? handleClick : undefined)}
      onDelete={isActive && isFilterEnabled ? handleDelete : undefined}
      clickable={!isActive && (isFilterEnabled ? true : clickable)}
      sx={sx}
    />
  );
};

export default memo(FilterChip);

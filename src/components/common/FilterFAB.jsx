import { Fab, Badge } from '@mui/material';
import { FilterList as FilterListIcon } from '@mui/icons-material';

/**
 * FilterFAB - Floating Action Button for opening filter drawer
 *
 * Fixed position button in bottom-right corner with badge showing active filter count.
 *
 * @param {Function} onClick - Callback when FAB is clicked
 * @param {number} filterCount - Number of active filters (for badge)
 * @param {boolean} isOpen - Whether drawer is currently open (hides FAB)
 * @param {string} ariaLabel - Accessible label for button
 */
const FilterFAB = ({
  onClick,
  filterCount = 0,
  isOpen = false,
  ariaLabel = 'Filter',
}) => {
  // Hide FAB when drawer is open
  if (isOpen) {
    return null;
  }

  return (
    <Badge
      badgeContent={filterCount}
      color="secondary"
      max={99}
      sx={{
        position: 'fixed',
        bottom: { xs: 80, sm: 24 }, // On mobile: 64px (BottomTabBar) + 16px spacing
        right: { xs: 16, sm: 20 },
        zIndex: (theme) => theme.zIndex.speedDial,
        '& .MuiBadge-badge': {
          fontSize: '0.75rem',
          height: 20,
          minWidth: 20,
          borderRadius: '10px',
        },
      }}
    >
      <Fab
        color="primary"
        aria-label={ariaLabel}
        onClick={onClick}
        sx={{
          width: { xs: 56, sm: 60 },
          height: { xs: 56, sm: 60 },
          boxShadow: 3,
          '&:hover': {
            boxShadow: 6,
          },
          '&:active': {
            boxShadow: 8,
          },
        }}
      >
        <FilterListIcon />
      </Fab>
    </Badge>
  );
};

export default FilterFAB;

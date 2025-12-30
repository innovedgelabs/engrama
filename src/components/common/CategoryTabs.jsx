import { useMemo } from 'react';
import { Box, Tabs, Tab, Tooltip, Badge } from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import {
  Apps as AppsIcon,
  Business as BusinessIcon,
  LocalShipping as LocalShippingIcon,
  Handshake as HandshakeIcon,
  Inventory as InventoryIcon,
  Apartment as ApartmentIcon,
  Handyman as HandymanIcon,
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { DEFAULT_LANGUAGE, getUIText } from '../../utils/i18nHelpers';

export const CATEGORY_ORDER = [
  'company',
  'supplier',
  'customer',
  'product',
  'facility',
  'equipment',
  'vehicle',
  'person',
  'other_asset',
];

export const CATEGORY_ICONS = {
  company: <BusinessIcon fontSize="small" />,
  supplier: <LocalShippingIcon fontSize="small" />,
  customer: <HandshakeIcon fontSize="small" />,
  product: <InventoryIcon fontSize="small" />,
  facility: <ApartmentIcon fontSize="small" />,
  equipment: <HandymanIcon fontSize="small" />,
  vehicle: <DirectionsCarIcon fontSize="small" />,
  person: <PersonIcon fontSize="small" />,
  other_asset: <CategoryIcon fontSize="small" />,
};

const CategoryTabs = ({
  value, // Now accepts category key (e.g., 'company') or null/'all' for All tab
  onChange, // Now receives (event, categoryKey) where categoryKey is the actual category or null for All
  language = DEFAULT_LANGUAGE,
  categories = null,
  domainConfig = null,
  includeAll = true,
  allTooltipKey = 'allCategories',
  tabsSx,
  tabSx,
  tabsProps = {},
  categoryCounts = {}, // Optional: { company: 5, supplier: 3, ... }
  showOnlyWithResults = false, // Optional: only show categories with count > 0
  showBadges = false, // Optional: show count badges on tabs
}) => {
  const derivedCategories = useMemo(() => {
    if (categories && categories.length) return categories;
    if (domainConfig?.routing?.categoryOrder?.length) {
      return domainConfig.routing.categoryOrder;
    }
    if (domainConfig?.entities) {
      return Object.keys(domainConfig.entities);
    }
    return [];
  }, [categories, domainConfig]);

  const resolveIcon = (category) => {
    const iconName = domainConfig?.entities?.[category]?.icon;
    if (iconName && MuiIcons[iconName]) {
      const IconComponent = MuiIcons[iconName];
      return <IconComponent fontSize="small" />;
    }
    return CATEGORY_ICONS[category] ?? <CategoryIcon fontSize="small" />;
  };

  const resolveLabel = (category) =>
    domainConfig?.entities?.[category]?.label?.[language] ??
    domainConfig?.entities?.[category]?.label?.en ??
    category;

  // Filter categories to only show those with results (if enabled)
  const visibleCategories = showOnlyWithResults
    ? derivedCategories.filter((category) => (categoryCounts[category] || 0) > 0)
    : derivedCategories;

  // Calculate total count for "All" tab
  const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

  // Convert category key to tab index for MUI Tabs
  const getTabIndex = (categoryKey) => {
    if (!categoryKey || categoryKey === 'all') return 0;
    const index = visibleCategories.indexOf(categoryKey);
    return index >= 0 ? index + (includeAll ? 1 : 0) : 0;
  };

  // Convert tab index to category key
  const getCategoryFromIndex = (tabIndex) => {
    if (tabIndex === 0 && includeAll) return null; // "All" tab
    const categoryIndex = includeAll ? tabIndex - 1 : tabIndex;
    return visibleCategories[categoryIndex] || null;
  };

  // Handle tab change and convert index to category key
  const handleTabChange = (event, newTabIndex) => {
    const categoryKey = getCategoryFromIndex(newTabIndex);
    onChange?.(event, categoryKey);
  };

  const tabValue = getTabIndex(value);

  const mergedTabsSx = {
    minHeight: 42,
    '& .MuiTabs-flexContainer': {
      justifyContent: 'center',
    },
    '& .MuiTabs-indicator': {
      height: 2,
    },
    ...tabsSx,
  };

  const mergedTabSx = {
    minHeight: 42,
    minWidth: 48,
    px: 1.5,
    py: 0.75,
    ...tabSx,
  };

  const renderCategoryTab = (category) => {
    const icon = resolveIcon(category);
    const count = categoryCounts[category] || 0;
    const label = resolveLabel(category);

    // Wrap icon in Badge if showBadges is enabled and count > 0
    const iconWithBadge = showBadges && count > 0 ? (
      <Badge
        badgeContent={count}
        color="secondary"
        max={99}
        sx={{
          '& .MuiBadge-badge': {
            transform: 'scale(0.65) translate(50%, -50%)', // 35% smaller
            transformOrigin: '100% 0%',
          }
        }}
      >
        {icon}
      </Badge>
    ) : (
      icon
    );

    return (
      <Tooltip key={category} title={label} placement="top">
        <Tab icon={iconWithBadge} sx={mergedTabSx} />
      </Tooltip>
    );
  };

  // Render "All" tab with optional badge
  const renderAllTab = () => {
    const allIcon = <AppsIcon fontSize="small" />;
    const allIconWithBadge = showBadges && totalCount > 0 ? (
      <Badge
        badgeContent={totalCount}
        color="secondary"
        max={99}
        sx={{
          '& .MuiBadge-badge': {
            transform: 'scale(0.65) translate(50%, -50%)', // 35% smaller
            transformOrigin: '100% 0%',
          }
        }}
      >
        {allIcon}
      </Badge>
    ) : (
      allIcon
    );

    return (
      <Tooltip title={getUIText(allTooltipKey, language)} placement="top">
        <Tab icon={allIconWithBadge} sx={mergedTabSx} />
      </Tooltip>
    );
  };

  if (visibleCategories.length === 0 && !includeAll) {
    return null;
  }

  return (
    <Box sx={{ borderBottom: 0 }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={mergedTabsSx}
        {...tabsProps}
      >
        {includeAll && renderAllTab()}
        {visibleCategories.map(renderCategoryTab)}
      </Tabs>
    </Box>
  );
};

export default CategoryTabs;










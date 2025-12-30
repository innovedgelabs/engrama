import { useState, useMemo, useEffect } from 'react';
import { Box, Paper, Typography, List, Tabs, Tab, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import SearchResultItem from './SearchResultItem';
import ScrollContainer from './ScrollContainer';
import CategoryTabs from './CategoryTabs';
import { getUIText, getCategoryLabel } from '../../utils/i18nHelpers';
import { useDomain } from '../../contexts/DomainContext';

const SearchDropdown = ({ results, query, loading, language, onClose }) => {
  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentConfig } = useDomain();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null); // null = all categories, or category key like 'company'

  // Reset filters when query changes
  useEffect(() => {
    setActiveTab(0);
    setSelectedCategory(null);
  }, [query]);

  const tabMode = currentConfig?.search?.tabMode || 'entityTypes';

  // Map entity types to tab indices based on domain
  const entityTypes =
    currentConfig?.search?.entityTypes && currentConfig.search.entityTypes.length
      ? currentConfig.search.entityTypes
      : ['asset', 'affair', 'renewal', 'attachment'];

  // Calculate category counts from asset results
  const categoryCounts = useMemo(() => {
    const assetGroup = results.groups?.find(g => g.entityType === 'asset');
    const assetResults = assetGroup?.results || [];

    const counts = {};
    assetResults.forEach(asset => {
      const category = asset.category;
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  }, [results]);

  // Get results for each entity type (even if 0)
  const resultsByType = useMemo(() => {
    return entityTypes.map(type => {
      const group = results.groups?.find(g => g.entityType === type);
      let groupResults = group?.results || [];

      // Filter assets by category if Assets tab is active and category is selected
      if (tabMode === 'entityTypes' && type === 'asset' && selectedCategory) {
        groupResults = groupResults.filter(asset => asset.category === selectedCategory);
      }

      return {
        entityType: type,
        results: groupResults,
        count: groupResults.length
      };
    });
  }, [results, selectedCategory, entityTypes, tabMode]);

  const categoryTabs = useMemo(() => {
    if (tabMode !== 'categories') return [];
    const assetGroup = resultsByType.find((g) => g.entityType === 'asset');
    if (!assetGroup || !assetGroup.results.length) return [];
    const counts = {};
    assetGroup.results.forEach((asset) => {
      const cat = asset.category || 'uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
      results: assetGroup.results.filter((r) => (r.category || 'uncategorized') === category),
    }));
  }, [resultsByType, tabMode]);

  // Filter to only show tabs with results (hide empty tabs on mobile)
  const visibleTabs = useMemo(() => {
    if (tabMode === 'categories') {
      return isMobile ? categoryTabs.filter((c) => c.count > 0) : categoryTabs;
    }
    return isMobile ? resultsByType.filter(group => group.count > 0) : resultsByType;
  }, [resultsByType, isMobile, tabMode, categoryTabs]);

  // Don't show dropdown if no query (AFTER all hooks)
  if (!query || query.length < 2) {
    return null;
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset category filter when switching away from Assets tab
    if (tabMode === 'entityTypes' && newValue !== 0) {
      setSelectedCategory(null);
    }
  };

  const handleCategoryChange = (event, categoryKey) => {
    setSelectedCategory(categoryKey);
  };

  // Check if Assets tab is active
  const isAssetsTabActive = tabMode === 'entityTypes' ? activeTab === 0 : false;

  // Calculate scroll container height based on whether CategoryTabs is shown
  // Mobile: 60vh max height, Desktop: 70vh max height
  const maxVh = isMobile ? '60vh' : '70vh';
  const scrollMaxHeight = tabMode === 'entityTypes' && isAssetsTabActive && resultsByType[0].count > 0
    ? `calc(${maxVh} - 48px - 42px)` // Main tabs + CategoryTabs
    : `calc(${maxVh} - 48px)`; // Main tabs only

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        right: 0,
        maxHeight: maxVh,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1300,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {loading ? (
        // Loading state
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4
          }}
        >
          <CircularProgress size={32} />
        </Box>
      ) : results.total === 0 ? (
        // Empty state
        <Box sx={{ py: 4, px: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {getUIText('searchNoResults', language) || `No se encontraron resultados para "${query}"`}
          </Typography>
        </Box>
      ) : (
        // Results with tabs
        <>
          {/* Tabs header */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
              <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }
              }}
            >
              {visibleTabs.map((group, index) => {
                const label = tabMode === 'categories'
                  ? getCategoryLabel(group.category, language) || group.category
                  : (group.entityType === 'asset' && getUIText('assetsPlural', language)) ||
                    getUIText(group.entityType, language) ||
                    group.entityType;
                const count = tabMode === 'categories' ? group.count : group.count;
                return (
                  <Tab
                    key={tabMode === 'categories' ? group.category : group.entityType}
                    label={`${label} (${count})`}
                  />
                );
              })}
            </Tabs>
          </Box>

          {/* Category Tabs - Only show for Assets tab when there are results */}
          {tabMode === 'entityTypes' && isAssetsTabActive && resultsByType[0].count > 0 && (
            <Box
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'grey.50'
              }}
            >
              <CategoryTabs
                value={selectedCategory}
                onChange={handleCategoryChange}
                language={language}
                domainConfig={currentConfig}
                includeAll={true}
                categoryCounts={categoryCounts}
                showBadges={true}
                showOnlyWithResults={true}
                tabsSx={{
                  minHeight: 42,
                  '& .MuiTabs-indicator': {
                    height: 2,
                  }
                }}
                tabSx={{
                  minHeight: 42,
                  minWidth: 48,
                  px: 1.5,
                  py: 0.75
                }}
              />
            </Box>
          )}

          {/* Tab content */}
          <ScrollContainer
            sx={{
              flex: 1,
              maxHeight: scrollMaxHeight,
              overflowY: 'auto'
            }}
          >
            {visibleTabs.map((group, index) => (
              <Box
                key={tabMode === 'categories' ? group.category : group.entityType}
                role="tabpanel"
                hidden={activeTab !== index}
                sx={{
                  display: activeTab === index ? 'block' : 'none'
                }}
              >
                {activeTab === index && (
                  <List disablePadding>
                    {(tabMode === 'categories'
                      ? group.results
                      : group.results
                    ).map((result) => (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        language={language}
                        onClose={onClose}
                      />
                    ))}
                  </List>
                )}
              </Box>
            ))}
          </ScrollContainer>
        </>
      )}
    </Paper>
  );
};

export default SearchDropdown;

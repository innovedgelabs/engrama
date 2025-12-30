import { useState, useRef, useEffect, memo } from 'react';
import { 
  Box, 
  Typography, 
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import AssetTile from '../common/AssetTile';
import { DEFAULT_LANGUAGE, getUIText } from '../../utils/i18nHelpers';
import { useDomain } from '../../contexts/DomainContext';

const AssetCarousel = ({ assetsByCategory, viewMode, language = DEFAULT_LANGUAGE }) => {
  const categories = Object.keys(assetsByCategory);
  const { currentConfig } = useDomain();
  const scrollRefs = useRef({});

  // Keep track of which accordions are expanded (all expanded by default)
  const [expanded, setExpanded] = useState(() => {
    return categories.reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {});
  });

  // Track scroll positions to show/hide arrows (initialize as at start)
  const [scrollPositions, setScrollPositions] = useState({});

  // Reset expanded state when assetsByCategory changes (e.g., navigating between routes)
  useEffect(() => {
    const newExpanded = Object.keys(assetsByCategory).reduce((acc, category) => {
      acc[category] = true; // All categories start expanded
      return acc;
    }, {});
    setExpanded(newExpanded);
  }, [assetsByCategory]); // Trigger when the assets object changes

  const handleAccordionChange = (category) => (event, isExpanded) => {
    setExpanded(prev => ({
      ...prev,
      [category]: isExpanded
    }));
  };

  const updateScrollPosition = (category) => {
    const container = scrollRefs.current[category];
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const atStart = scrollLeft <= 5; // Allow for small rounding errors
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 5; // Allow for small rounding errors

    setScrollPositions(prev => ({
      ...prev,
      [category]: { atStart, atEnd }
    }));
  };

  const scroll = (category, direction) => {
    const container = scrollRefs.current[category];
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8; // Scroll 80% of container width
    const newPosition = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    // Temporarily remove scroll listener to prevent interference
    const originalScrollListener = container.onscroll;
    container.onscroll = null;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });

    // Update position after scroll animation completes and restore listener
    setTimeout(() => {
      updateScrollPosition(category);
      container.onscroll = originalScrollListener;
    }, 350);
  };

  if (categories.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 4, sm: 6 },
          px: 2,
          color: 'text.secondary'
        }}
      >
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            fontSize: { xs: '0.9rem', sm: '1rem' },
            mb: { xs: 1, sm: 2 }
          }}
        >
          {getUIText('noResultsTitle', language)}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
            maxWidth: { xs: '100%', sm: 400 },
            mx: 'auto'
          }}
        >
          {getUIText('noResultsSubtitle', language)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {categories.map(category => (
        <Accordion 
          key={category}
          expanded={expanded[category]}
          onChange={handleAccordionChange(category)}
          sx={{
            mb: { xs: 1, sm: 1.5, md: 2 },
            boxShadow: { xs: 0, sm: 1 },
            border: { xs: '1px solid', sm: 'none' },
            borderColor: { xs: 'divider', sm: 'transparent' },
            '&:before': {
              display: 'none', // Remove default MUI accordion divider
            },
            borderRadius: { xs: '4px !important', sm: '6px !important', md: '8px !important' },
            overflow: 'hidden',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />}
            sx={{
              minHeight: { xs: 48, sm: 52, md: 56 },
              borderBottom: expanded[category] ? '2px solid' : 'none',
              borderColor: 'secondary.main',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&:active': {
                backgroundColor: 'action.selected',
              },
              '& .MuiAccordionSummary-content': {
                alignItems: 'center',
                my: { xs: 1, sm: 1.25, md: 1.5 },
                mx: 0,
              },
              px: { xs: 1.5, sm: 1.75, md: 2 },
              touchAction: 'pan-y' // Allow vertical scrolling while preventing horizontal
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="subtitle1"
                component="h2"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                }}
              >
                {currentConfig?.entities?.[category]?.label?.[language] ||
                  currentConfig?.entities?.[category]?.label?.en ||
                  category}
              </Typography>
              <Chip
                label={assetsByCategory[category].length}
                size="small"
                color="primary"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                  height: { xs: 18, sm: 20, md: 24 },
                  minWidth: { xs: 24, sm: 28, md: 32 },
                }}
              />
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{
            pt: { xs: 1, sm: 1.5, md: 2 },
            pb: { xs: 1.5, sm: 2, md: 3 },
            px: { xs: 0.5, sm: 1 },
            position: 'relative'
          }}>
            {/* Carousel Container */}
            <Box sx={{ position: 'relative' }}>
              {/* Left Navigation Area - Only show if not at start */}
              {scrollPositions[category] && scrollPositions[category].atStart !== true && (
                <Box
                  onClick={() => scroll(category, 'left')}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 60,
                    zIndex: 2,
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0))',
                    transition: 'background 0.2s',
                    '&:hover': {
                      background: 'linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0.1))',
                      '& .nav-icon': {
                        color: 'secondary.dark',
                        transform: 'scale(1.2)',
                      }
                    }
                  }}
                >
                  <ChevronLeftIcon
                    className="nav-icon"
                    sx={{
                      fontSize: '2rem',
                      color: 'secondary.main',
                      transition: 'all 0.2s',
                    }}
                  />
                </Box>
              )}

              {/* Scrollable Assets Container */}
              <Box
                ref={(el) => {
                  scrollRefs.current[category] = el;
                  if (el) {
                    // Add scroll event listener (passive to not interfere with manual scrolling)
                    el.addEventListener('scroll', () => updateScrollPosition(category), { passive: true });
                    // Initialize scroll position after DOM is ready
                    setTimeout(() => {
                      updateScrollPosition(category);
                    }, 100);
                  }
                }}
                sx={{
                  display: 'flex',
                  gap: { xs: 1, sm: 1.5 },
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none', // Firefox
                  msOverflowStyle: 'none', // IE/Edge
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: 4,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: 4,
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.3)',
                    }
                  },
                  px: { xs: 0.5, sm: 2, md: 4, lg: 6, xl: 8 }, // Progressive padding based on screen size
                  py: 0.5,
                }}
              >
                {assetsByCategory[category].map(asset => (
                  <Box
                    key={asset.id}
                    sx={{
                      flex: {
                        xs: '0 0 85%',      // Mobile: 1 card visible with hint of next
                        sm: '0 0 48%',      // Small tablet: ~2 cards
                        md: '0 0 32%',      // Medium: ~3 cards
                        lg: '0 0 19%',      // Large: ~5 cards
                        xl: '0 0 16%',      // XL: ~6 cards
                      },
                      minWidth: 0, // Allow flex items to shrink below their content size
                    }}
                  >
                    <AssetTile asset={asset} viewMode={viewMode} language={language} />
                  </Box>
                ))}
              </Box>

              {/* Right Navigation Area - Only show if not at end */}
              {scrollPositions[category] && scrollPositions[category].atEnd !== true && (
                <Box
                  onClick={() => scroll(category, 'right')}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 60,
                    zIndex: 2,
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'linear-gradient(to left, rgba(255,255,255,0.95), rgba(255,255,255,0))',
                    transition: 'background 0.2s',
                    '&:hover': {
                      background: 'linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0.1))',
                      '& .nav-icon': {
                        color: 'secondary.dark',
                        transform: 'scale(1.2)',
                      }
                    }
                  }}
                >
                  <ChevronRightIcon
                    className="nav-icon"
                    sx={{
                      fontSize: '2rem',
                      color: 'secondary.main',
                      transition: 'all 0.2s',
                    }}
                  />
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default memo(AssetCarousel);












import { useMemo, useRef } from 'react';
import { Box, IconButton, Breadcrumbs, Link, Typography, useTheme, useMediaQuery } from '@mui/material';
import { ArrowBack as ArrowBackIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { LAYOUT_CONSTANTS } from '../../constants/layout';
import { isDashboardPath } from '../../utils/routing';
import { useSidebar } from '../../contexts/SidebarContext';
import { PageScrollProvider } from '../../contexts/PageScrollContext';
import ScrollContainer from '../common/ScrollContainer';

/**
 * PageLayout - Fullscreen container for page views
 *
 * Fills from the bottom-right corner of the screen, with top-left at the intersection
 * of TopBar bottom edge and Sidebar right edge. Adapts to sidebar state and screen size.
 *
 * Props:
 * - children: Page content (typically PageHeader and ContentPanel components)
 * - breadcrumbs: Optional array of breadcrumb objects [{ label, path? }]
 *   - If path is provided, breadcrumb is clickable
 *   - Last breadcrumb is always current page (not clickable)
 * - onBack: Optional custom back handler (default: navigate(-1))
 * - showBackButton: Toggles back button visibility (default: true)
 * - mobileBottomOffset: Bottom offset in pixels on mobile (e.g., for BottomTabBar = 64)
 * - mobileHeaderContent: Optional JSX to render alongside back button on mobile instead of breadcrumbs
 */
const PageLayout = ({
  children,
  breadcrumbs = [],
  onBack,
  showBackButton = true,
  autoHideNavigation = true,
  hideNavigation = false,
  mobileBottomOffset = 0,
  mobileHeaderContent = null,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const { sidebarOpen, isMobile } = useSidebar();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const scrollContainerRef = useRef(null);
  const scrollContextValue = useMemo(
    () => ({ scrollRef: scrollContainerRef }),
    []
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const shouldAutoHideNavigation = useMemo(() => {
    if (!autoHideNavigation) {
      return false;
    }

    if (location.pathname === '/') {
      return true;
    }

    return isDashboardPath(location.pathname);
  }, [autoHideNavigation, location.pathname]);

  const effectiveHideNavigation = hideNavigation || shouldAutoHideNavigation;
  const shouldShowBackButton = !effectiveHideNavigation && showBackButton;
  const showNavigationRow = !effectiveHideNavigation && (shouldShowBackButton || breadcrumbs.length > 0);

  return (
    <PageScrollProvider value={scrollContextValue}>
      <Box
        sx={{
          position: 'fixed',
          top: {
            xs: `${LAYOUT_CONSTANTS.topBar.height.mobile}px`,
            sm: `${LAYOUT_CONSTANTS.topBar.height.desktop}px`,
          },
          left: isMobile
            ? 0
            : sidebarOpen
            ? `${LAYOUT_CONSTANTS.sidebar.openWidth}px`
            : `${LAYOUT_CONSTANTS.sidebar.closedWidth}px`,
          right: 0,
          bottom: isSmallScreen && mobileBottomOffset > 0 ? `${mobileBottomOffset}px` : 0,
          overflow: 'hidden',
          backgroundColor: 'background.default',
          transition: `left ${LAYOUT_CONSTANTS.sidebar.transition}`,
        }}
      >
        <ScrollContainer
          ref={scrollContainerRef}
          sx={{
            px: { xs: 2, sm: LAYOUT_CONSTANTS.pageLayout.padding },
            pb: { xs: 2, sm: LAYOUT_CONSTANTS.pageLayout.padding },
            pt: showNavigationRow
              ? LAYOUT_CONSTANTS.spacing.navigationMargin
              : { xs: 2, sm: LAYOUT_CONSTANTS.pageLayout.padding },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
          }}
        >
          {/* Navigation: Back Button + Breadcrumbs */}
          {showNavigationRow && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: shouldShowBackButton && (breadcrumbs.length > 0 || mobileHeaderContent) ? 1.5 : 0,
                mb: LAYOUT_CONSTANTS.spacing.navigationMargin,
              }}
            >
              {/* Back Button */}
              {shouldShowBackButton && (
                <IconButton
                  onClick={handleBack}
                  size="small"
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'secondary.main',
                    },
                    '&:focus-visible': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              )}

              {/* Mobile Header Content or Breadcrumbs */}
              {isSmallScreen && mobileHeaderContent ? (
                // Mobile: Custom header content (e.g., entity name + image)
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
                  {mobileHeaderContent}
                </Box>
              ) : breadcrumbs.length > 0 && (
                isSmallScreen ? (
                  // Mobile: Show only current page name
                  <Typography
                    color="text.primary"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {breadcrumbs[breadcrumbs.length - 1].label}
                  </Typography>
                ) : (
                  // Desktop: Show full breadcrumb chain
                  <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                    sx={{
                      '& .MuiBreadcrumbs-separator': {
                        mx: 0.5,
                      },
                    }}
                  >
                    {breadcrumbs.map((crumb, index) => {
                      const isLast = index === breadcrumbs.length - 1;

                      if (isLast || !crumb.path) {
                        // Current page or non-clickable breadcrumb
                        return (
                          <Typography
                            key={index}
                            color="text.primary"
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: isLast ? 600 : 400,
                            }}
                          >
                            {crumb.label}
                          </Typography>
                        );
                      }

                      // Clickable breadcrumb
                      return (
                        <Link
                          key={index}
                          underline="hover"
                          color="inherit"
                          href={crumb.path}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(crumb.path);
                          }}
                          sx={{
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            color: 'text.secondary',
                            '&:hover': {
                              color: 'primary.main',
                            },
                          }}
                        >
                          {crumb.label}
                        </Link>
                      );
                    })}
                  </Breadcrumbs>
                )
              )}
            </Box>
          )}

          {/* Page Content */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 1.5, sm: LAYOUT_CONSTANTS.spacing.headerMargin },  // Reduced gap on mobile (12px)
              flexGrow: 1,
              minHeight: 0, // Allows flex children to shrink
              ...(showNavigationRow
                ? {}
                : { mt: 0 }),
            }}
          >
            {children}
          </Box>
        </ScrollContainer>
      </Box>
    </PageScrollProvider>
  );
};

export default PageLayout;

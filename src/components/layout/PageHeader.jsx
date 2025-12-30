import { Box, Card, CardContent, useTheme, useMediaQuery } from '@mui/material';
import { LAYOUT_CONSTANTS } from '../../constants/layout';

/**
 * PageHeader - Standardized header/summary card for page views
 *
 * Use at the top of page layouts to display hero content, summaries, or key metrics.
 * Uses a plain Card on desktop with consistent padding/min-height from layout constants.
 *
 * Mobile Optimization:
 * - On mobile (< 600px), renders as flat Box without card styling to save space
 * - Can be hidden entirely on mobile via `hideOnMobile` prop
 * - Reduces padding significantly on mobile
 *
 * Props:
 * - children: Header content
 * - hideOnMobile: Hide entire header on mobile (default: false)
 * - elevation: Shadow elevation (default: 2, desktop only)
 * - sx: Additional styles (merged with defaults)
 * - contentSx: Styles for CardContent (merged with defaults)
 * - All other props passed to Card or Box
 */
const PageHeader = ({
  children,
  hideOnMobile = false,
  elevation = 2,
  sx = {},
  contentSx = {},
  ...otherProps
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Hide entirely on mobile if requested
  if (isMobile && hideOnMobile) {
    return null;
  }

  // Mobile: Render as flat Box without card styling
  if (isMobile) {
    return (
      <Box
        sx={{
          px: 2,  // Reduced horizontal padding (16px)
          pt: 0,   // Sit tight under TopBar
          pb: 0.85,  // Keep slight breathing room below content
          backgroundColor: 'transparent',  // Keep content visible when sticky
          ...sx
        }}
        {...otherProps}
      >
        {children}
      </Box>
    );
  }

  // Desktop: Render as Card with full styling
  return (
    <Card
      elevation={elevation}
      sx={{
        borderRadius: '12px',
        minHeight: LAYOUT_CONSTANTS.pageHeader.minHeight,
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
        ...sx,
      }}
      {...otherProps}
    >
      <CardContent
        sx={{
          p: LAYOUT_CONSTANTS.pageHeader.padding,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ...contentSx,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default PageHeader;

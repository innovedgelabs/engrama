import { Box, Card, CardContent, useTheme, useMediaQuery } from '@mui/material';
import { LAYOUT_CONSTANTS } from '../../constants/layout';

/**
 * ContentPanel - Standardized content area card for page views
 *
 * Use for main content sections like tables, lists, forms, or other data displays.
 * Uses a plain Card on desktop with consistent padding from layout constants.
 *
 * Modal-like Pattern:
 * - header: Fixed at top (title, tabs, actions)
 * - children: Scrollable content area
 * - footer: Fixed at bottom (action buttons)
 *
 * Mobile Optimization:
 * - On mobile (< 600px), renders as flat Box without card styling to save space
 * - Reduces padding and removes shadows/borders
 *
 * Props:
 * - children: Content area body (scrollable when fullHeight)
 * - header: Optional fixed header content (title, tabs, etc.)
 * - footer: Optional fixed footer content (action buttons, etc.)
 * - elevation: Shadow elevation (default: 2, desktop only)
 * - sx: Additional styles (merged with defaults)
 * - contentSx: Styles for the scrollable content area (merged with defaults)
 * - maxWidth: Optional max-width to constrain and center the entire card (e.g., forms)
 * - fullHeight: Fill available height with scrollable content
 * - All other props passed to Card or Box
 */
const ContentPanel = ({
  children,
  header,
  footer,
  elevation = 2,
  sx = {},
  contentSx = {},
  fullHeight = false,
  contentFlex = false,
  forceCardOnMobile = false,
  maxWidth,
  ...otherProps
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const padding = LAYOUT_CONSTANTS.contentPanel.padding;

  // Mobile: Render as flat Box without card styling
  if (isMobile && !forceCardOnMobile) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: fullHeight ? 1 : 0,
          minHeight: fullHeight ? 0 : 'auto',
          ...(fullHeight ? { overflowY: 'auto' } : {}),
          p: 0,  // No padding on mobile (content manages its own)
          backgroundColor: 'transparent',  // No background
          ...sx,
        }}
        {...otherProps}
      >
        {/* Mobile Header */}
        {header && (
          <Box
            sx={{
              flexShrink: 0,
              pb: 2,
              mb: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            {header}
          </Box>
        )}

        {/* Mobile Body */}
        <Box
          sx={{
            flex: fullHeight ? 1 : 'none',
            minHeight: fullHeight ? 0 : 'auto',
            ...(fullHeight ? { overflowY: 'auto' } : {}),
            ...contentSx,
          }}
        >
          {children}
        </Box>

        {/* Mobile Footer */}
        {footer && (
          <Box
            sx={{
              flexShrink: 0,
              pt: 2,
              mt: 2,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            {footer}
          </Box>
        )}
      </Box>
    );
  }

  // Desktop: Render as Card with full styling
  const card = (
    <Card
      elevation={elevation}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        ...(fullHeight ? { flex: 1, minHeight: 0 } : {}),
        ...sx,
      }}
      {...otherProps}
    >
      {/* Fixed Header */}
      {header && (
        <Box
          sx={{
            flexShrink: 0,
            p: padding,
            pb: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {header}
        </Box>
      )}

      {/* Scrollable Body */}
      <CardContent
        sx={{
          p: padding,
          pt: header ? 2 : padding,
          pb: footer ? 2 : padding,
          display: 'flex',
          flexDirection: 'column',
          ...(contentFlex || fullHeight
            ? { flexGrow: 1, minHeight: 0 }
            : {}),
          ...(fullHeight ? { height: '100%', overflowY: 'auto' } : {}),
          ...contentSx,
        }}
      >
        {children}
      </CardContent>

      {/* Fixed Footer */}
      {footer && (
        <Box
          sx={{
            flexShrink: 0,
            p: padding,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          {footer}
        </Box>
      )}
    </Card>
  );

  // Wrap card in centered container if maxWidth is provided
  if (maxWidth) {
    return (
      <Box
        sx={{
          maxWidth,
          mx: 'auto',
          width: '100%',
          ...(fullHeight ? { 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0,
          } : {
            pb: LAYOUT_CONSTANTS.pageLayout.padding,
          }),
        }}
      >
        {card}
      </Box>
    );
  }

  return card;
};

export default ContentPanel;

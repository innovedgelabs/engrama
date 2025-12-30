import { forwardRef } from 'react';
import { Box } from '@mui/material';

// Reusable custom scrollbar styles matching the app's design
export const SCROLLBAR_STYLES = {
  scrollbarGutter: 'stable',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(62, 207, 160, 0.7) transparent',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(62, 207, 160, 0.7)',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'rgba(62, 207, 160, 0.9)',
    },
  },
};

/**
 * ScrollContainer - Reusable container with custom scrollbar
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render
 * @param {Object} props.sx - Additional MUI sx props
 * @param {React.Ref} ref - Forwarded ref
 */
const ScrollContainer = forwardRef(({ children, sx = {}, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        ...SCROLLBAR_STYLES,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch', // Enable smooth scrolling on iOS
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
});

ScrollContainer.displayName = 'ScrollContainer';

export default ScrollContainer;

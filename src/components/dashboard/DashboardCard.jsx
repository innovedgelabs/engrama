import { Box, Typography } from '@mui/material';
import ContentPanel from '../layout/ContentPanel';

/**
 * DashboardCard
 *
 * Standard wrapper for dashboard tiles to keep:
 *  - Title typography
 *  - Padding and spacing
 *  - Optional subtitle and icon alignment
 *
 * Props:
 *  - title: string (required)
 *  - subtitle: string (optional)
 *  - icon: MUI icon component (optional, rendered small next to title)
 *  - children: main card body
 *  - contentSx: extra styles for inner content area
 *  - ...ContentPanel props (fullHeight, contentFlex, sx, etc.)
 */
const DashboardCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  contentSx,
  ...panelProps
}) => {
  return (
    <ContentPanel
      fullHeight
      forceCardOnMobile
      contentSx={{
        pt: { xs: 1.5, md: 1.75 },
        px: { xs: 1.5, sm: 1.25, md: 2.5 },
        pb: { xs: 2, md: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        ...contentSx,
      }}
      {...panelProps}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: subtitle ? 0.5 : 0,
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.3,
              fontSize: { xs: '0.75rem', sm: '0.65rem', md: '0.8rem' },
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.25,
                fontSize: '0.7rem',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {Icon && (
          <Icon
            sx={{
              fontSize: { xs: 18, md: 20 },
              color: 'text.disabled',
            }}
          />
        )}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
    </ContentPanel>
  );
};

export default DashboardCard;



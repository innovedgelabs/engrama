import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

/**
 * DonutChart - Generic reusable donut chart component
 *
 * Props:
 *  - data: Array<{ id: string, value: number, label: string, color: string }>
 *  - size: number (default 130) - width and height of the chart
 *  - innerRadius: number (default 42) - inner radius of the donut
 *  - outerRadius: number (default 60) - outer radius of the donut
 *  - centerLabel: string (optional) - small label above the center value
 *  - centerValue: string | number (optional) - main value displayed in center
 *  - centerValueColor: string (optional) - color for the center value
 *  - emptyMessage: string (optional) - message to show when no data
 *  - onSegmentClick: (id: string) => void (optional) - callback when segment is clicked
 */
const DonutChart = ({
  data = [],
  size = 130,
  innerRadius = 42,
  outerRadius = 60,
  centerLabel,
  centerValue,
  centerValueColor = 'text.primary',
  emptyMessage = 'No data',
  onSegmentClick,
}) => {
  const filteredData = data.filter((item) => item && item.value > 0);

  const handleSegmentClick = (params) => {
    if (!onSegmentClick || !params?.id) {
      return;
    }
    onSegmentClick(params.id);
  };

  // Responsive resizing can be handled by passing size/radius props from parent,
  // or we could add internal ResizeObserver if needed.
  // Since parent handles "isTablet" logic, we just use the passed props.
  if (!filteredData.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: size,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', fontSize: '0.8rem' }}
        >
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        <PieChart
          width={size}
          height={size}
          slots={{
            legend: () => null,
          }}
          series={[
            {
              innerRadius,
              outerRadius,
              paddingAngle: 2,
              cornerRadius: 3,
              data: filteredData,
              valueKey: 'value',
              idKey: 'id',
            },
          ]}
          margin={{ top: 1, bottom: 1, left: 1, right: 1 }}
          slotProps={{
            legend: { hidden: true },
          }}
          onItemClick={(_, params) => handleSegmentClick(params?.data)}
        />
        {/* Center content */}
        {(centerLabel || centerValue !== undefined) && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              textAlign: 'center',
            }}
          >
            {centerLabel && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.55rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 0.15,
                }}
              >
                {centerLabel}
              </Typography>
            )}
            {centerValue !== undefined && (
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1,
                  color: centerValueColor,
                  fontSize: { xs: '1.25rem', md: '1.4rem' },
                }}
              >
                {centerValue}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

DonutChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      value: PropTypes.number.isRequired,
      label: PropTypes.string,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  size: PropTypes.number,
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
  centerLabel: PropTypes.string,
  centerValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  centerValueColor: PropTypes.string,
  emptyMessage: PropTypes.string,
  onSegmentClick: PropTypes.func,
};

export default DonutChart;


import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import DashboardCard from './DashboardCard';

/**
 * TrendChart - Stacked area chart for time-series data
 *
 * Props:
 * - title: Card title (required)
 * - subtitle: Optional subtitle
 * - data: Array of data points
 * - xKey: Key for X axis values
 * - series: Array of { id, label, dataKey, color, stackId, area }
 * - height: Chart height in pixels (default 140)
 * - showAxes: Whether to show axis labels (default false)
 * - onPointClick: Click handler
 */
const TrendChart = ({
  title,
  subtitle,
  data = [],
  xKey,
  series = [],
  height = 140,
  showAxes = false,
  showTooltip = true,
  cardContentSx,
  chartOffsetY = 0,
  chartSx,
  yAxisMax,
  formatYAxisAsPercent = false,
  onPointClick,
}) => {
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateWidth = () => {
      const rect = node.getBoundingClientRect();
      setChartWidth(Math.floor(rect.width));
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const safeData = Array.isArray(data) ? data : [];
  const xValues = safeData.map((item) => item?.[xKey] ?? '');
  const axisTickLabelStyle = showAxes
    ? {
        fontSize: 10,
        fill: 'rgba(71, 85, 105, 0.9)',
      }
    : { display: 'none' };
  const yAxisValueFormatter = formatYAxisAsPercent
    ? (value) => `${Math.round(value ?? 0)}%`
    : undefined;
  const resolvedYAxisMax = formatYAxisAsPercent
    ? yAxisMax ?? 100
    : yAxisMax;
  const chartMargin = showAxes
    ? {
        top: 8,
        right: 0,
        bottom: 32,
        left: formatYAxisAsPercent ? 10 : 6,
      }
    : { top: 0, right: 0, bottom: 0, left: 0 };

  const chartSeries = series.map((s) => ({
    id: s.id,
    label: s.label,
    data: safeData.map((row) => Number(row?.[s.dataKey] ?? 0)),
    color: s.color,
    stack: s.stackId,
    area: s.area !== false,
    showMark: false,
    curve: 'linear',
    valueFormatter: (value) => `${Math.round((value ?? 0) * 10) / 10}%`,
  }));

  const handleClick = (event, params) => {
    if (!onPointClick || !params) return;
    const seriesConfig = series.find((s) => s.id === params.seriesId);
    const dataPoint = safeData[params.dataIndex];
    if (seriesConfig && dataPoint) {
      onPointClick({ event, dataPoint, seriesConfig });
    }
  };

  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      contentSx={{
        p: { xs: 1, md: 1.5 },
        pb: { xs: 0.5, md: 0.5 },
        ...cardContentSx,
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height,
          mt: chartOffsetY,
          ...chartSx,
        }}
      >
        {chartWidth > 0 && (
          <LineChart
            width={chartWidth}
            height={height}
            series={chartSeries}
            xAxis={[
              {
                scaleType: 'point',
                data: xValues,
                disableLine: !showAxes,
                disableTicks: !showAxes,
                tickSize: showAxes ? 3 : 0,
                tickLineStyle: showAxes
                  ? { stroke: 'rgba(71, 85, 105, 0.4)' }
                  : undefined,
                tickLabelStyle: axisTickLabelStyle,
              },
            ]}
            yAxis={[
              {
                disableLine: !showAxes,
                disableTicks: !showAxes,
                tickSize: showAxes ? 3 : 0,
                tickLineStyle: showAxes
                  ? { stroke: 'rgba(71, 85, 105, 0.4)' }
                  : undefined,
                tickLabelStyle: axisTickLabelStyle,
                tickNumber: showAxes ? 4 : undefined,
                min: formatYAxisAsPercent ? 0 : undefined,
                max: resolvedYAxisMax,
                valueFormatter: yAxisValueFormatter,
              },
            ]}
            margin={chartMargin}
            slots={{
              legend: () => null,
            }}
            tooltip={showTooltip ? { trigger: 'axis' } : null}
            onItemClick={handleClick}
          />
        )}
      </Box>
    </DashboardCard>
  );
};

TrendChart.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.object),
  xKey: PropTypes.string.isRequired,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      dataKey: PropTypes.string.isRequired,
      color: PropTypes.string,
      stackId: PropTypes.string,
      area: PropTypes.bool,
    })
  ),
  height: PropTypes.number,
  showAxes: PropTypes.bool,
  showTooltip: PropTypes.bool,
  cardContentSx: PropTypes.object,
  chartOffsetY: PropTypes.number,
  chartSx: PropTypes.object,
  yAxisMax: PropTypes.number,
  formatYAxisAsPercent: PropTypes.bool,
  onPointClick: PropTypes.func,
};

export default TrendChart;

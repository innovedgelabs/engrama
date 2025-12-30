import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { ScatterChart } from '@mui/x-charts';
import DashboardCard from './DashboardCard';
import { COMPLIANCE_STATUS, PRIORITY_LEVEL } from '../../utils/status';
import { getUIText, getPriorityLabel } from '../../utils/i18nHelpers';
import { useStatusHelpers } from '../../utils/domainStatus';

const PRIORITY_ORDER = [
  PRIORITY_LEVEL.CRITICAL,
  PRIORITY_LEVEL.HIGH,
  PRIORITY_LEVEL.MEDIUM,
  PRIORITY_LEVEL.LOW,
];

const ComplianceTimeline = ({
  points = [],
  language = 'es',
  title,
  subtitle,
  height = 160,
  onPointClick,
}) => {
  const theme = useTheme();
  const { getMetadata } = useStatusHelpers();

  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry?.contentRect) return;
      const nextWidth = entry.contentRect.width;
      setWidth((prev) => (Math.abs(prev - nextWidth) > 1 ? nextWidth : prev));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const priorityIndex = useMemo(() => {
    const map = new Map();
    PRIORITY_ORDER.forEach((level, index) => {
      map.set(level, index);
    });
    return map;
  }, []);

  const chartSeries = useMemo(() => {
    if (!points.length) return [];

    const baseSize = 8;

    return PRIORITY_ORDER.map((level) => {
      const meta =
        getMetadata('priority', level, language) || { color: theme.palette.grey[400], weight: 1, label: getPriorityLabel(level, language) };
      const color = meta?.color || theme.palette.grey[400];
      const weight = meta?.weight || 1;
      const yValue = priorityIndex.get(level);

      return {
        id: level,
        label: meta?.label ?? getPriorityLabel(level, language),
        color,
        data: points
          .filter((p) => p.priority === level)
          .map((p, index) => ({
            x: p.expiryDate,
            y: yValue,
            size: baseSize + weight * 2,
            point: p,
            dataIndex: index,
          })),
      };
    }).filter((series) => series.data.length > 0);
  }, [getMetadata, language, points, priorityIndex, theme.palette.grey]);

  const hasData = points.length > 0;
  const axisLabelStyle = {
    fontSize: 10,
    fill: theme.palette.text.secondary,
  };

  const yAxis = useMemo(
    () => [
      {
        min: -0.5,
        max: PRIORITY_ORDER.length - 0.5,
        tickMinStep: 1,
        valueFormatter: (value) => {
          const level = PRIORITY_ORDER[value];
          if (!level) return '';
          return getPriorityLabel(level, language);
        },
        tickLabelStyle: axisLabelStyle,
      },
    ],
    [axisLabelStyle, language],
  );

  const xAxis = useMemo(
    () => [
      {
        scaleType: 'time',
        valueFormatter: (value) => {
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value);
          if (Number.isNaN(date.getTime())) return '';
          return date.toLocaleDateString(language === 'en' ? 'en-US' : 'es-VE', {
            month: 'short',
            year: '2-digit',
          });
        },
        tickLabelStyle: axisLabelStyle,
      },
    ],
    [axisLabelStyle, language],
  );

  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      contentSx={{
        p: { xs: 1, md: 1.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
      }}
    >
      {!hasData && (
        <Box
          sx={{
            py: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.8rem',
              textAlign: 'center',
            }}
          >
            {/* i18n key from UI_TEXT */}
            {getUIText('dashboard_no_upcoming_expiries', language)}
          </Typography>
        </Box>
      )}
      {hasData && (
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            minHeight: 0,
          }}
        >
          {width > 0 && (
            <ScatterChart
              width={Math.max(width - 16, 160)}
              height={height}
              series={chartSeries}
              xAxis={xAxis}
              yAxis={yAxis}
              margin={{
                top: 8,
                right: 4,
                bottom: 28,
                left: 56,
              }}
              tooltip={{ trigger: 'item' }}
              slots={{
                legend: () => null,
              }}
              onItemClick={(event, params) => {
                if (!onPointClick || !params) return;
                const { seriesId, dataIndex } = params;
                const series = chartSeries.find((s) => s.id === seriesId);
                const dataPoint = series?.data?.[dataIndex];
                if (dataPoint?.point) {
                  onPointClick({
                    event,
                    point: dataPoint.point,
                  });
                }
              }}
              sx={{
                '& .MuiChartsAxis-line': {
                  stroke: theme.palette.divider,
                },
                '& .MuiChartsAxis-tick': {
                  stroke: theme.palette.divider,
                },
              }}
            />
          )}
        </Box>
      )}
    </DashboardCard>
  );
};

ComplianceTimeline.propTypes = {
  points: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      affairId: PropTypes.string,
      assetId: PropTypes.string,
      expiryDate: PropTypes.instanceOf(Date),
      priority: PropTypes.oneOf(Object.values(PRIORITY_LEVEL)),
      complianceStatus: PropTypes.oneOf(Object.values(COMPLIANCE_STATUS)),
      affairName: PropTypes.string,
      assetName: PropTypes.string,
    }),
  ),
  language: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  height: PropTypes.number,
  onPointClick: PropTypes.func,
};

export default ComplianceTimeline;



import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Grid,
  Button,
} from '@mui/material';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import {
  calculateComplianceStatus,
  calculateWorkflowStatus,
  COMPLIANCE_STATUS,
  WORKFLOW_STATUS,
  PRIORITY_LEVEL,
} from '../../../utils/status';
import { getUIText, getComplianceLabel, getPriorityLabel } from '../../../utils/i18nHelpers';
import { useStatusHelpers } from '../../../utils/domainStatus';
import { useDomain } from '../../../contexts/DomainContext';
import { useScopedDomainData } from '../../../hooks/useScopedDomainData';
import { calculateHealthScore, getHealthZone } from '../../../utils/healthScore';
import DashboardCard from '../../dashboard/DashboardCard';
import DonutChart from '../../dashboard/DonutChart';
import ComplianceMiniCard from '../../dashboard/ComplianceMiniCard';
import WorkflowKanban from '../../dashboard/WorkflowKanban';
import CompliancePriorityMatrix from '../../dashboard/CompliancePriorityMatrix';
import TrendChart from '../../dashboard/TrendChart';
import ComplianceTimeline from '../../dashboard/ComplianceTimeline';
import DashboardFilterBar from '../../dashboard/DashboardFilterBar';
import FilterDrawer from '../../common/FilterDrawer';

const COMPLIANCE_SORT_PRIORITY = {
  [COMPLIANCE_STATUS.EXPIRED]: 0,
  [COMPLIANCE_STATUS.EXPIRING]: 1,
  [COMPLIANCE_STATUS.CURRENT]: 2,
  [COMPLIANCE_STATUS.PERMANENT]: 3,
};

const TABLET_DONUT_DIMENSIONS = { size: 80, innerRadius: 28, outerRadius: 40 };
import PageLayout from '../../layout/PageLayout';
const DESKTOP_DONUT_DIMENSIONS = { size: 150, innerRadius: 50, outerRadius: 70 };

const DashboardRegAffairs = ({
  assets: legacyAssets = [],
  regulatoryAffairs: legacyAffairs = [],
  renewals: legacyRenewals = [],
  attachments: legacyAttachments = [],
  language = 'es',
  onTrackedAffairsNavigate = null,
  currentUser = null,
}) => {
  const theme = useTheme();
  const { getMetadata } = useStatusHelpers();
  const { currentData } = useDomain();
  const scopedData = useScopedDomainData(currentUser);
  const data = scopedData || currentData || {};
  const assets = data.assets ?? legacyAssets;
  const regulatoryAffairs = data.regulatory_affairs ?? legacyAffairs;
  const renewals = data.renewals ?? legacyRenewals;
  const attachments = data.attachments ?? legacyAttachments;
  const { sm: mobileBreakpoint, md: tabletBreakpoint, lg: desktopBreakpoint } = theme.breakpoints.values;
  const [viewportWidth, setViewportWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return desktopBreakpoint;
  });
  const isMobile = viewportWidth < mobileBreakpoint;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [filters, setFilters] = useState({
    assetId: '',
    assetCategories: [],
    affairTypes: [],
    authorities: [],
    responsiblePeople: [],
    complianceStatuses: [],
    workflowStatuses: [],
    priorityLevels: [],
  });

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const handleClearFilters = useCallback(() => {
    setFilters({
      assetId: '',
      assetCategories: [],
      affairTypes: [],
      authorities: [],
      responsiblePeople: [],
      complianceStatuses: [],
      workflowStatuses: [],
      priorityLevels: [],
    });
  }, []);

  const metrics = useMemo(() => {
    const renewalsByAffair = new Map();
    renewals.forEach((renewal) => {
      const list = renewalsByAffair.get(renewal.affairId) || [];
      list.push(renewal);
      renewalsByAffair.set(renewal.affairId, list);
    });

    renewalsByAffair.forEach((list, affairId) => {
      list.sort((a, b) => {
        const dateA = new Date(a.approvalDate || a.submissionDate || a.expiryDate || 0);
        const dateB = new Date(b.approvalDate || b.submissionDate || b.expiryDate || 0);
        return dateB - dateA;
      });
    });

    const complianceCounts = {
      [COMPLIANCE_STATUS.CURRENT]: 0,
      [COMPLIANCE_STATUS.EXPIRING]: 0,
      [COMPLIANCE_STATUS.EXPIRED]: 0,
      [COMPLIANCE_STATUS.PERMANENT]: 0,
    };

    const workflowCounts = {
      [WORKFLOW_STATUS.IN_PREPARATION]: 0,
      [WORKFLOW_STATUS.SUBMITTED]: 0,
      [WORKFLOW_STATUS.COMPLETED]: 0,
      [WORKFLOW_STATUS.NEEDS_RENEWAL]: 0,
    };

    const complianceItems = {
      [COMPLIANCE_STATUS.CURRENT]: [],
      [COMPLIANCE_STATUS.EXPIRING]: [],
      [COMPLIANCE_STATUS.EXPIRED]: [],
      [COMPLIANCE_STATUS.PERMANENT]: [],
    };

    const affairSummaries = [];

    const criticalItems = [];
    const actionableItems = [];
    const upcomingExpirations = [];

    const today = new Date();
    const MS_IN_DAY = 1000 * 60 * 60 * 24;

    regulatoryAffairs.forEach((affair) => {
      const affairRenewals = renewalsByAffair.get(affair.id) || [];
      const latestRenewal = affairRenewals[0];
      const asset = assets.find((a) => a.id === affair.assetId);

      const complianceStatus = latestRenewal
        ? calculateComplianceStatus(latestRenewal)
        : COMPLIANCE_STATUS.EXPIRED;

      const workflowStatus = latestRenewal
        ? calculateWorkflowStatus(latestRenewal, complianceStatus) ?? WORKFLOW_STATUS.IN_PREPARATION
        : WORKFLOW_STATUS.IN_PREPARATION;

      const summary = {
        affair,
        asset,
        renewal: latestRenewal,
        complianceStatus,
        workflowStatus,
      };

      complianceCounts[complianceStatus]++;
      complianceItems[complianceStatus].push(summary);
      workflowCounts[workflowStatus] = (workflowCounts[workflowStatus] ?? 0) + 1;
      affairSummaries.push(summary);

      if (
        complianceStatus === COMPLIANCE_STATUS.EXPIRED ||
        workflowStatus === WORKFLOW_STATUS.NEEDS_RENEWAL
      ) {
        criticalItems.push(summary);
      }

      if (
        workflowStatus === WORKFLOW_STATUS.IN_PREPARATION ||
        workflowStatus === WORKFLOW_STATUS.SUBMITTED ||
        workflowStatus === WORKFLOW_STATUS.NEEDS_RENEWAL ||
        complianceStatus === COMPLIANCE_STATUS.EXPIRING
      ) {
        actionableItems.push(summary);
      }

      if (latestRenewal?.expiryDate) {
        const expiryDate = new Date(latestRenewal.expiryDate);
        const daysUntilExpiry = Math.floor((expiryDate - today) / MS_IN_DAY);

        if (daysUntilExpiry >= 0 && daysUntilExpiry <= 90) {
          upcomingExpirations.push({
            ...summary,
            expiryDate,
            daysUntilExpiry,
          });
        }
      }
    });

    criticalItems.sort((a, b) => {
      if (a.complianceStatus !== b.complianceStatus) {
        return a.complianceStatus === COMPLIANCE_STATUS.EXPIRED ? -1 : 1;
      }
      if (!a.renewal?.expiryDate) return 1;
      if (!b.renewal?.expiryDate) return -1;
      return new Date(a.renewal.expiryDate) - new Date(b.renewal.expiryDate);
    });

    actionableItems.sort((a, b) => {
      const priority = {
        [WORKFLOW_STATUS.NEEDS_RENEWAL]: 1,
        [WORKFLOW_STATUS.SUBMITTED]: 2,
        [WORKFLOW_STATUS.IN_PREPARATION]: 3,
        [WORKFLOW_STATUS.COMPLETED]: 4,
      };
      if (a.workflowStatus !== b.workflowStatus) {
        return priority[a.workflowStatus] - priority[b.workflowStatus];
      }
      if (a.complianceStatus !== b.complianceStatus) {
        return COMPLIANCE_SORT_PRIORITY[a.complianceStatus] - COMPLIANCE_SORT_PRIORITY[b.complianceStatus];
      }
      return 0;
    });

    upcomingExpirations.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    const totalAffairs = regulatoryAffairs.length;
    const complianceWeights = {
      [COMPLIANCE_STATUS.CURRENT]: 100,
      [COMPLIANCE_STATUS.PERMANENT]: 100,
      [COMPLIANCE_STATUS.EXPIRING]: 60,
      [COMPLIANCE_STATUS.EXPIRED]: 0,
    };

    const weightedScore = totalAffairs > 0
      ? Math.round(
          (
            complianceCounts[COMPLIANCE_STATUS.CURRENT] * complianceWeights[COMPLIANCE_STATUS.CURRENT] +
            complianceCounts[COMPLIANCE_STATUS.PERMANENT] * complianceWeights[COMPLIANCE_STATUS.PERMANENT] +
            complianceCounts[COMPLIANCE_STATUS.EXPIRING] * complianceWeights[COMPLIANCE_STATUS.EXPIRING] +
            complianceCounts[COMPLIANCE_STATUS.EXPIRED] * complianceWeights[COMPLIANCE_STATUS.EXPIRED]
          ) / totalAffairs
        )
      : 100;

    const categoryBreakdown = assets.reduce((acc, asset) => {
      const assetAffairs = regulatoryAffairs.filter((a) => a.assetId === asset.id);
      const counts = {
        [COMPLIANCE_STATUS.CURRENT]: 0,
        [COMPLIANCE_STATUS.EXPIRING]: 0,
        [COMPLIANCE_STATUS.EXPIRED]: 0,
        [COMPLIANCE_STATUS.PERMANENT]: 0,
      };

      assetAffairs.forEach((affair) => {
        const affairRenewals = renewalsByAffair.get(affair.id) || [];
        const latestRenewal = affairRenewals[0];
        const complianceStatus = latestRenewal
          ? calculateComplianceStatus(latestRenewal)
          : COMPLIANCE_STATUS.EXPIRED;
        counts[complianceStatus]++;
      });

      if (!acc[asset.category]) {
        acc[asset.category] = {
          category: asset.category,
          total: 0,
          ...counts,
        };
      }

      acc[asset.category].total += assetAffairs.length;
      Object.keys(counts).forEach((key) => {
        acc[asset.category][key] += counts[key];
      });

      return acc;
    }, {});

    return {
      healthScore: weightedScore,
      complianceCounts,
      workflowCounts,
      complianceItems,
      criticalItems: criticalItems.slice(0, 10),
      actionableItems: actionableItems.slice(0, 15),
      upcomingExpirations: upcomingExpirations.slice(0, 10),
      categoryBreakdown: Object.values(categoryBreakdown),
      totalAffairs,
      totalRenewals: renewals.length,
      totalAttachments: attachments.length,
      affairSummaries,
    };
  }, [assets, regulatoryAffairs, renewals, attachments]);
  const allAffairSummaries = metrics.affairSummaries || [];

  const getFilteredSummaries = (summaries, currentFilters, excludeKeys = []) => {
    return summaries.filter((summary) => {
      if (!summary) return false;
      const { affair, asset, renewal, complianceStatus, workflowStatus } = summary;

      if (!excludeKeys.includes('assetId') && currentFilters.assetId && asset?.id !== currentFilters.assetId) {
        return false;
      }

      if (
        !excludeKeys.includes('assetCategories') &&
        currentFilters.assetCategories &&
        currentFilters.assetCategories.length > 0 &&
        !currentFilters.assetCategories.includes(asset?.category)
      ) {
        return false;
      }

      if (
        !excludeKeys.includes('affairTypes') &&
        currentFilters.affairTypes &&
        currentFilters.affairTypes.length > 0 &&
        !currentFilters.affairTypes.includes(affair?.type)
      ) {
        return false;
      }

      if (
        !excludeKeys.includes('authorities') &&
        currentFilters.authorities &&
        currentFilters.authorities.length > 0 &&
        !currentFilters.authorities.includes(affair?.authority)
      ) {
        return false;
      }

      if (
        !excludeKeys.includes('responsiblePeople') &&
        currentFilters.responsiblePeople &&
        currentFilters.responsiblePeople.length > 0
      ) {
        const responsible = renewal?.responsiblePerson || null;
        if (!responsible || !currentFilters.responsiblePeople.includes(responsible)) {
          return false;
        }
      }

      if (
        !excludeKeys.includes('complianceStatuses') &&
        currentFilters.complianceStatuses &&
        currentFilters.complianceStatuses.length > 0 &&
        !currentFilters.complianceStatuses.includes(complianceStatus)
      ) {
        return false;
      }

      if (
        !excludeKeys.includes('workflowStatuses') &&
        currentFilters.workflowStatuses &&
        currentFilters.workflowStatuses.length > 0 &&
        !currentFilters.workflowStatuses.includes(workflowStatus)
      ) {
        return false;
      }

      if (
        !excludeKeys.includes('priorityLevels') &&
        currentFilters.priorityLevels &&
        currentFilters.priorityLevels.length > 0 &&
        !currentFilters.priorityLevels.includes(affair?.priorityLevel)
      ) {
        return false;
      }

      return true;
    });
  };

  const filteredAffairSummaries = useMemo(() => {
    return getFilteredSummaries(allAffairSummaries, filters);
  }, [allAffairSummaries, filters]);

  const effectiveAffairs = filteredAffairSummaries;

  const categoryOptions = useMemo(() => {
    const relevantSummaries = getFilteredSummaries(allAffairSummaries, filters, ['assetCategories']);
    const categories = new Set();
    relevantSummaries.forEach((s) => {
      if (s.asset?.category) categories.add(s.asset.category);
    });
    return Array.from(categories);
  }, [allAffairSummaries, filters]);

  const affairTypeOptions = useMemo(() => {
    const relevantSummaries = getFilteredSummaries(allAffairSummaries, filters, ['affairTypes']);
    const types = new Set();
    relevantSummaries.forEach((s) => {
      if (s.affair?.type) types.add(s.affair.type);
    });
    return Array.from(types).sort();
  }, [allAffairSummaries, filters]);

  const authorityOptions = useMemo(() => {
    const relevantSummaries = getFilteredSummaries(allAffairSummaries, filters, ['authorities']);
    const authorities = new Set();
    relevantSummaries.forEach((s) => {
      if (s.affair?.authority) authorities.add(s.affair.authority);
    });
    return Array.from(authorities).sort();
  }, [allAffairSummaries, filters]);

  const responsibleOptions = useMemo(() => {
    const relevantSummaries = getFilteredSummaries(allAffairSummaries, filters, ['responsiblePeople']);
    const people = new Set();
    relevantSummaries.forEach((s) => {
      if (s.renewal?.responsiblePerson) people.add(s.renewal.responsiblePerson);
    });
    return Array.from(people).sort();
  }, [allAffairSummaries, filters]);

  const assetOptions = useMemo(
    () => {
      const relevantSummaries = getFilteredSummaries(allAffairSummaries, filters, ['assetId']);
      const uniqueAssets = new Map();
      relevantSummaries.forEach(s => {
        if (s.asset) uniqueAssets.set(s.asset.id, s.asset);
      });
      return Array.from(uniqueAssets.values()).map(a => ({ id: a.id, name: a.name }));
    },
    [allAffairSummaries, filters]
  );

  const affairComplianceCounts = useMemo(() => {
    const counts = {
      [COMPLIANCE_STATUS.CURRENT]: 0,
      [COMPLIANCE_STATUS.EXPIRING]: 0,
      [COMPLIANCE_STATUS.EXPIRED]: 0,
      [COMPLIANCE_STATUS.PERMANENT]: 0,
    };

    effectiveAffairs.forEach((summary) => {
      const status = summary?.complianceStatus;
      if (status && counts.hasOwnProperty(status)) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [effectiveAffairs]);

  const totalAffairs = effectiveAffairs.length;

  const priorityCounts = useMemo(() => {
    const counts = {
      [PRIORITY_LEVEL.CRITICAL]: 0,
      [PRIORITY_LEVEL.HIGH]: 0,
      [PRIORITY_LEVEL.MEDIUM]: 0,
      [PRIORITY_LEVEL.LOW]: 0,
    };

    effectiveAffairs.forEach((summary) => {
      const priority =
        summary?.priorityLevel ||
        summary?.affair?.priorityLevel ||
        PRIORITY_LEVEL.MEDIUM;
      if (counts.hasOwnProperty(priority)) {
        counts[priority] += 1;
      }
    });

    return counts;
  }, [effectiveAffairs]);

  const affairHealth = useMemo(
    () => calculateHealthScore(effectiveAffairs || []),
    [effectiveAffairs]
  );

  const healthZone = getHealthZone(affairHealth.score);
  const healthScoreColor =
    healthZone === 'good'
      ? theme.palette.success.main
      : healthZone === 'warning'
      ? theme.palette.warning.main
      : theme.palette.error.main;

  const complianceDonutData = useMemo(
    () => [
      {
        id: COMPLIANCE_STATUS.CURRENT,
        value: affairComplianceCounts[COMPLIANCE_STATUS.CURRENT] || 0,
        label: getMetadata('compliance', COMPLIANCE_STATUS.CURRENT, language)?.label ?? getComplianceLabel(COMPLIANCE_STATUS.CURRENT, language),
        color: getMetadata('compliance', COMPLIANCE_STATUS.CURRENT, language)?.color,
      },
      {
        id: COMPLIANCE_STATUS.EXPIRING,
        value: affairComplianceCounts[COMPLIANCE_STATUS.EXPIRING] || 0,
        label: getMetadata('compliance', COMPLIANCE_STATUS.EXPIRING, language)?.label ?? getComplianceLabel(COMPLIANCE_STATUS.EXPIRING, language),
        color: getMetadata('compliance', COMPLIANCE_STATUS.EXPIRING, language)?.color,
      },
      {
        id: COMPLIANCE_STATUS.EXPIRED,
        value: affairComplianceCounts[COMPLIANCE_STATUS.EXPIRED] || 0,
        label: getMetadata('compliance', COMPLIANCE_STATUS.EXPIRED, language)?.label ?? getComplianceLabel(COMPLIANCE_STATUS.EXPIRED, language),
        color: getMetadata('compliance', COMPLIANCE_STATUS.EXPIRED, language)?.color,
      },
    ],
    [affairComplianceCounts, language, getMetadata]
  );

  const priorityDonutData = useMemo(
    () => [
      PRIORITY_LEVEL.CRITICAL,
      PRIORITY_LEVEL.HIGH,
      PRIORITY_LEVEL.MEDIUM,
      PRIORITY_LEVEL.LOW,
    ].map((priority) => {
      const meta = getMetadata('priority', priority, language) || {};
      return {
        id: priority,
        value: priorityCounts[priority] || 0,
        label: meta.label ?? getPriorityLabel(priority, language),
        color: meta?.color || theme.palette.grey[400],
      };
    }),
    [priorityCounts, language, theme, getMetadata]
  );

  const timelinePoints = useMemo(() => {
    const summaries = effectiveAffairs || [];
    if (!summaries.length) return [];

    const windowStart = new Date();
    const windowEnd = new Date(windowStart);
    windowEnd.setFullYear(windowStart.getFullYear() + 1);

    const points = summaries
      .map((summary) => {
        const { affair, asset, renewal, complianceStatus } = summary || {};
        if (!renewal?.expiryDate) {
          return null;
        }

        const expiry = new Date(renewal.expiryDate);
        if (Number.isNaN(expiry.getTime())) {
          return null;
        }

        if (expiry < windowStart || expiry > windowEnd) {
          return null;
        }

        if (complianceStatus === COMPLIANCE_STATUS.PERMANENT) {
          return null;
        }

        const priorityLevel = affair?.priorityLevel || 'medium';

        return {
          id: renewal.id,
          affairId: affair?.id,
          assetId: asset?.id,
          expiryDate: expiry,
          priority: priorityLevel,
          complianceStatus,
          affairName: affair?.name,
          assetName: asset?.name,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.expiryDate - b.expiryDate);

    return points;
  }, [effectiveAffairs]);

  const complianceTrendData = useMemo(() => {
    const source = currentData?.historical_compliance;
    if (!source?.length) return [];

    return source.map((entry) => {
      const total =
        (entry.current || 0) +
        (entry.expiring || 0) +
        (entry.expired || 0) +
        (entry.permanent || 0);

      if (!total) {
        return {
          ...entry,
          currentPct: 0,
          expiringPct: 0,
          expiredPct: 0,
          permanentPct: 0,
        };
      }

      return {
        ...entry,
        currentPct: (entry.current / total) * 100,
        expiringPct: (entry.expiring / total) * 100,
        expiredPct: (entry.expired / total) * 100,
        permanentPct: (entry.permanent / total) * 100,
      };
    });
  }, [currentData]);

  const monthlyComplianceData = useMemo(() => {
    const source = currentData?.historical_compliance;
    if (!source?.length) return [];

    const monthBuckets = new Map();

    source.forEach((snapshot) => {
      const referenceDate = snapshot.endDate || snapshot.startDate;
      const parsedDate = referenceDate ? new Date(referenceDate) : null;
      if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
        return;
      }

      const monthStart = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
      const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
      const bucket =
        monthBuckets.get(monthKey) || {
          monthKey,
          date: monthStart,
          current: 0,
          expiring: 0,
          expired: 0,
          permanent: 0,
        };

      bucket.current += snapshot.current || 0;
      bucket.expiring += snapshot.expiring || 0;
      bucket.expired += snapshot.expired || 0;
      bucket.permanent += snapshot.permanent || 0;

      monthBuckets.set(monthKey, bucket);
    });

    const sortedBuckets = Array.from(monthBuckets.values()).sort((a, b) => a.date - b.date);
    const lastTwelve = sortedBuckets.slice(-12);
    const locale = language === 'en' ? 'en-US' : 'es-VE';
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'short' });

    return lastTwelve.map((bucket) => {
      const total = bucket.current + bucket.expiring + bucket.expired + bucket.permanent;
      const toPct = (value) => (total > 0 ? (value / total) * 100 : 0);

      return {
        month: bucket.monthKey,
        label: `${monthFormatter.format(bucket.date)} ${String(bucket.date.getFullYear()).slice(-2)}`,
        currentPct: toPct(bucket.current),
        expiringPct: toPct(bucket.expiring),
        expiredPct: toPct(bucket.expired),
        permanentPct: toPct(bucket.permanent),
      };
    });
  }, [language, currentData]);

  const complianceTrendSeries = [
    {
      id: 'current',
      label: getMetadata('compliance', COMPLIANCE_STATUS.CURRENT, language)?.label ?? getComplianceLabel(COMPLIANCE_STATUS.CURRENT, language),
      dataKey: 'currentPct',
      color: getMetadata('compliance', COMPLIANCE_STATUS.CURRENT, language)?.color,
      stackId: 'compliance',
    },
    {
      id: 'expiring',
      label: getMetadata('compliance', COMPLIANCE_STATUS.EXPIRING, language)?.label ?? getComplianceLabel(COMPLIANCE_STATUS.EXPIRING, language),
      dataKey: 'expiringPct',
      color: getMetadata('compliance', COMPLIANCE_STATUS.EXPIRING, language)?.color,
      stackId: 'compliance',
    },
    {
      id: 'expired',
      label: getMetadata('compliance', COMPLIANCE_STATUS.EXPIRED, language)?.label ?? getComplianceLabel(COMPLIANCE_STATUS.EXPIRED, language),
      dataKey: 'expiredPct',
      color: getMetadata('compliance', COMPLIANCE_STATUS.EXPIRED, language)?.color,
      stackId: 'compliance',
    },
    {
      id: 'permanent',
      label: getMetadata('compliance', COMPLIANCE_STATUS.PERMANENT, language)?.label ?? getComplianceLabel(COMPLIANCE_STATUS.PERMANENT, language),
      dataKey: 'permanentPct',
      color: getMetadata('compliance', COMPLIANCE_STATUS.PERMANENT, language)?.color,
      stackId: 'compliance',
    },
  ];

  const handleStatusClick = useCallback(
    (status) => {
      if (!status) return;

      setFilters((prev) => {
        const current = prev.complianceStatuses || [];
        const isActive =
          current.length === 1 && current[0] === status;

        return {
          ...prev,
          complianceStatuses: isActive ? [] : [status],
        };
      });
    },
    [setFilters]
  );

  const handleWorkflowStatusClick = useCallback(
    (statusKey) => {
      if (!statusKey) return;

      setFilters((prev) => {
        const current = prev.workflowStatuses || [];
        const isActive =
          current.length === 1 && current[0] === statusKey;

        return {
          ...prev,
          workflowStatuses: isActive ? [] : [statusKey],
        };
      });
    },
    [setFilters]
  );

  const handlePriorityClick = useCallback(
    (priority) => {
      if (!priority) return;

      setFilters((prev) => {
        const current = prev.priorityLevels || [];
        const isActive =
          current.length === 1 && current[0] === priority;

        return {
          ...prev,
          priorityLevels: isActive ? [] : [priority],
        };
      });
    },
    [setFilters]
  );

  const { size: donutSize, innerRadius: donutInnerRadius, outerRadius: donutOuterRadius } = useMemo(() => {
    if (viewportWidth <= tabletBreakpoint) {
      return TABLET_DONUT_DIMENSIONS;
    }
    if (viewportWidth >= desktopBreakpoint) {
      return DESKTOP_DONUT_DIMENSIONS;
    }

    const progress = Math.min(
      1,
      Math.max(0, (viewportWidth - tabletBreakpoint) / (desktopBreakpoint - tabletBreakpoint))
    );
    const lerp = (start, end) => Math.round(start + (end - start) * progress);

    return {
      size: lerp(TABLET_DONUT_DIMENSIONS.size, DESKTOP_DONUT_DIMENSIONS.size),
      innerRadius: lerp(TABLET_DONUT_DIMENSIONS.innerRadius, DESKTOP_DONUT_DIMENSIONS.innerRadius),
      outerRadius: lerp(TABLET_DONUT_DIMENSIONS.outerRadius, DESKTOP_DONUT_DIMENSIONS.outerRadius),
    };
  }, [viewportWidth, tabletBreakpoint, desktopBreakpoint]);

  const trackedAffairsCount =
    totalAffairs - (affairComplianceCounts[COMPLIANCE_STATUS.PERMANENT] || 0);

  return (
    <PageLayout showBackButton={false}>
      <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ alignItems: 'stretch' }}>
        <Grid
          item
          xs={12}
          sx={{
            order: isMobile ? 0 : undefined,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              alignItems: { xs: 'stretch', sm: 'flex-start' },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <DashboardFilterBar
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={handleClearFilters}
                onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
                activeFilterCount={
                  (filters.assetCategories?.length || 0) +
                  (filters.affairTypes?.length || 0) +
                  (filters.authorities?.length || 0) +
                  (filters.responsiblePeople?.length || 0) +
                  (filters.assetId ? 1 : 0) +
                  (filters.complianceStatuses?.length || 0) +
                  (filters.workflowStatuses?.length || 0) +
                  (filters.priorityLevels?.length || 0)
                }
                language={language}
              />
            </Box>
            <Button
              variant="outlined"
              color="primary"
              endIcon={<ArrowForwardIosRoundedIcon sx={{ fontSize: '0.95rem' }} />}
              onClick={onTrackedAffairsNavigate}
              sx={{
                alignSelf: { xs: 'stretch', sm: 'center' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1, sm: 0.75 },
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {`${trackedAffairsCount} ${getUIText('tracked_affairs', language)}`}
            </Button>
          </Box>
        </Grid>

        <Grid
          item
          xs={isMobile ? 6 : 12}
          sm={2}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            order: isMobile ? 3 : undefined,
          }}
        >
          <DashboardCard
            title={getUIText('compliance_health', language)}
          >
            <DonutChart
              data={complianceDonutData}
              size={donutSize}
              innerRadius={donutInnerRadius}
              outerRadius={donutOuterRadius}
              centerLabel={language === 'es' ? 'Salud' : 'Health'}
              centerValue={`${affairHealth.score}%`}
              centerValueColor={healthScoreColor}
              emptyMessage={language === 'es' ? 'Sin datos' : 'No data'}
              onSegmentClick={handleStatusClick}
            />
          </DashboardCard>
        </Grid>

        <Grid
          item
          xs={6}
          sm={2}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            order: isMobile ? 1 : undefined,
          }}
        >
          <DashboardCard
            title={getUIText('dashboard_compliance', language)}
            contentSx={{
              pt: { xs: 1.25, md: 1.5 },
              pb: { xs: 1.5, md: 1.75 },
              px: { xs: 1.25, sm: 1, md: 1.75 },
              gap: 0.5,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', flex: 1, minHeight: 0 }}>
              <ComplianceMiniCard
                label={getMetadata('compliance', COMPLIANCE_STATUS.CURRENT, language)?.label ?? getComplianceLabel(COMPLIANCE_STATUS.CURRENT, language)}
                value={affairComplianceCounts[COMPLIANCE_STATUS.CURRENT] || 0}
                color={getMetadata('compliance', COMPLIANCE_STATUS.CURRENT, language)?.color}
                icon={getMetadata('compliance', COMPLIANCE_STATUS.CURRENT, language)?.icon}
                onClick={() => handleStatusClick(COMPLIANCE_STATUS.CURRENT)}
              />
              <ComplianceMiniCard
                label={getMetadata('compliance', COMPLIANCE_STATUS.EXPIRING, language)?.label ?? getComplianceLabel(COMPLIANCE_STATUS.EXPIRING, language)}
                value={affairComplianceCounts[COMPLIANCE_STATUS.EXPIRING] || 0}
                color={getMetadata('compliance', COMPLIANCE_STATUS.EXPIRING, language)?.color}
                icon={getMetadata('compliance', COMPLIANCE_STATUS.EXPIRING, language)?.icon}
                onClick={() => handleStatusClick(COMPLIANCE_STATUS.EXPIRING)}
              />
              <ComplianceMiniCard
                label={getMetadata('compliance', COMPLIANCE_STATUS.EXPIRED, language)?.label ?? getComplianceLabel(COMPLIANCE_STATUS.EXPIRED, language)}
                value={affairComplianceCounts[COMPLIANCE_STATUS.EXPIRED] || 0}
                color={getMetadata('compliance', COMPLIANCE_STATUS.EXPIRED, language)?.color}
                icon={getMetadata('compliance', COMPLIANCE_STATUS.EXPIRED, language)?.icon}
                onClick={() => handleStatusClick(COMPLIANCE_STATUS.EXPIRED)}
              />
              <ComplianceMiniCard
                label={getMetadata('compliance', COMPLIANCE_STATUS.PERMANENT, language)?.label ?? getComplianceLabel(COMPLIANCE_STATUS.PERMANENT, language)}
                value={affairComplianceCounts[COMPLIANCE_STATUS.PERMANENT] || 0}
                color={getMetadata('compliance', COMPLIANCE_STATUS.PERMANENT, language)?.color}
                icon={getMetadata('compliance', COMPLIANCE_STATUS.PERMANENT, language)?.icon}
                onClick={() => handleStatusClick(COMPLIANCE_STATUS.PERMANENT)}
              />
            </Box>
          </DashboardCard>
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            order: isMobile ? 5 : undefined,
          }}
        >
          <CompliancePriorityMatrix
            affairs={effectiveAffairs}
            language={language}
            title={`${getUIText('dashboard_compliance', language)} × ${getUIText(
              'dashboard_priority',
              language
            )}`}
          />
        </Grid>

        <Grid
          item
          xs={6}
          sm={2}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            order: isMobile ? 2 : undefined,
          }}
        >
          <DashboardCard
            title={getUIText('dashboard_priority', language)}
            contentSx={{
              pt: { xs: 1.25, md: 1.5 },
              pb: { xs: 1.5, md: 1.75 },
              px: { xs: 1.25, sm: 1, md: 1.75 },
              gap: 0.5,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', flex: 1, minHeight: 0 }}>
              <ComplianceMiniCard
                label={getMetadata('priority', PRIORITY_LEVEL.CRITICAL, language)?.label ?? getPriorityLabel(PRIORITY_LEVEL.CRITICAL, language)}
                value={priorityCounts[PRIORITY_LEVEL.CRITICAL] || 0}
                color={getMetadata('priority', PRIORITY_LEVEL.CRITICAL, language)?.color}
                icon={getMetadata('priority', PRIORITY_LEVEL.CRITICAL, language)?.icon}
                onClick={() => handlePriorityClick(PRIORITY_LEVEL.CRITICAL)}
              />
              <ComplianceMiniCard
                label={getMetadata('priority', PRIORITY_LEVEL.HIGH, language)?.label ?? getPriorityLabel(PRIORITY_LEVEL.HIGH, language)}
                value={priorityCounts[PRIORITY_LEVEL.HIGH] || 0}
                color={getMetadata('priority', PRIORITY_LEVEL.HIGH, language)?.color}
                icon={getMetadata('priority', PRIORITY_LEVEL.HIGH, language)?.icon}
                onClick={() => handlePriorityClick(PRIORITY_LEVEL.HIGH)}
              />
              <ComplianceMiniCard
                label={getMetadata('priority', PRIORITY_LEVEL.MEDIUM, language)?.label ?? getPriorityLabel(PRIORITY_LEVEL.MEDIUM, language)}
                value={priorityCounts[PRIORITY_LEVEL.MEDIUM] || 0}
                color={getMetadata('priority', PRIORITY_LEVEL.MEDIUM, language)?.color}
                icon={getMetadata('priority', PRIORITY_LEVEL.MEDIUM, language)?.icon}
                onClick={() => handlePriorityClick(PRIORITY_LEVEL.MEDIUM)}
              />
              <ComplianceMiniCard
                label={getMetadata('priority', PRIORITY_LEVEL.LOW, language)?.label ?? getPriorityLabel(PRIORITY_LEVEL.LOW, language)}
                value={priorityCounts[PRIORITY_LEVEL.LOW] || 0}
                color={getMetadata('priority', PRIORITY_LEVEL.LOW, language)?.color}
                icon={getMetadata('priority', PRIORITY_LEVEL.LOW, language)?.icon}
                onClick={() => handlePriorityClick(PRIORITY_LEVEL.LOW)}
              />
            </Box>
          </DashboardCard>
        </Grid>
        <Grid
          item
          xs={isMobile ? 6 : 12}
          sm={2}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            order: isMobile ? 4 : undefined,
          }}
        >
          <DashboardCard
            title={getUIText('priority_distribution', language)}
          >
            <DonutChart
              data={priorityDonutData}
              size={donutSize}
              innerRadius={donutInnerRadius}
              outerRadius={donutOuterRadius}
              emptyMessage={language === 'es' ? 'Sin datos' : 'No data'}
              onSegmentClick={handlePriorityClick}
            />
          </DashboardCard>
        </Grid>

        {!isMobile && (
          <Grid item xs={12} sm={4.75} sx={{ display: 'flex', flexDirection: 'column' }}>
            <TrendChart
              title={getUIText('dashboard_compliance_percentage_trend', language)}
              data={monthlyComplianceData}
              xKey="label"
              series={complianceTrendSeries}
              height={160}
              showTooltip={false}
              showAxes
              cardContentSx={{
                p: { xs: 1, md: 1.25 },
                pb: { xs: 0.75, md: 1 },
                gap: 0.25,
              }}
              chartOffsetY={0}
              chartSx={{ overflow: 'visible' }}
              formatYAxisAsPercent
              yAxisMax={105}
            />
          </Grid>
        )}
        <Grid
          item
          xs={12}
          sm={2.5}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            order: isMobile ? 6 : undefined,
          }}
        >
          <DashboardCard title={getUIText('dashboard_workflow_pipeline', language)}>
            <WorkflowKanban
              affairs={effectiveAffairs}
              language={language}
              onStatusClick={handleWorkflowStatusClick}
              getMetadata={getMetadata}
            />
          </DashboardCard>
        </Grid>
        {!isMobile && (
          <Grid item xs={12} sm={4.75} sx={{ display: 'flex', flexDirection: 'column' }}>
            <ComplianceTimeline
              points={timelinePoints}
              language={language}
              title={getUIText('dashboard_compliance_timeline', language)}
              height={160}
              onPointClick={({ point }) => {
                if (!point?.affairId) return;
              }}
            />
          </Grid>
        )}
      </Grid>
      <FilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
        onClearAll={handleClearFilters}
        language={language}
        sections={[
          { key: 'assetCategories', label: getUIText('asset_category', language), options: categoryOptions, type: 'category' },
          { key: 'affairTypes', label: getUIText('columnType', language), options: affairTypeOptions.map(t => ({ value: t, label: t })), type: 'type' },
          { key: 'authorities', label: getUIText('columnAuthority', language), options: authorityOptions.map(a => ({ value: a, label: a })) },
          { key: 'responsiblePeople', label: getUIText('responsible_person', language), options: responsibleOptions.map(r => ({ value: r, label: r })) },
        ]}
        availableOptions={{
          assets: assetOptions,
        }}
      />
    </PageLayout>
  );
};

export default DashboardRegAffairs;

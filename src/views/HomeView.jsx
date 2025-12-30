import { useMemo, useCallback } from 'react';
import AssetCarousel from '../components/layout/AssetCarousel';
import PageLayout from '../components/layout/PageLayout';
import {
  useAssetDimensionCounts,
} from '../hooks/useAssetDimensionCounts';
import { DEFAULT_LANGUAGE } from '../utils/i18nHelpers';
import { useDomain } from '../contexts/DomainContext';
import { useScopedDomainData } from '../hooks/useScopedDomainData';
import { useStatusHelpers } from '../utils/domainStatus';

/**
 * HomeView - Landing page showing all asset categories in a horizontal carousel layout
 * For single-category views, see CategoryView component
 */
const HomeView = ({ language = DEFAULT_LANGUAGE, currentUser }) => {
  const scopedData = useScopedDomainData(currentUser);
  const { currentData } = useDomain(); // fallback if scopedData is undefined
  const { getValues } = useStatusHelpers();
  const data = scopedData || currentData;
  const assets = data?.assets ?? [];
  const regulatoryAffairs = data?.regulatory_affairs ?? [];
  // Use the shared hook to calculate status counts per asset
  const dimensionCountsByAsset = useAssetDimensionCounts(regulatoryAffairs);

  const emptyCountsTemplate = useMemo(() => {
    const makeCounts = (dimensionKey) => {
      const values = getValues(dimensionKey);
      return (values && values.length
        ? values
        : dimensionKey === 'lifecycle'
        ? ['active', 'archived']
        : dimensionKey === 'compliance'
        ? ['current', 'expiring', 'expired', 'permanent']
        : dimensionKey === 'workflow'
        ? ['in_preparation', 'submitted', 'completed', 'needs_renewal']
        : ['critical', 'high', 'medium', 'low']
      ).reduce((acc, value) => {
        acc[value] = 0;
        return acc;
      }, {});
    };

    return {
      lifecycle: makeCounts('lifecycle'),
      compliance: makeCounts('compliance'),
      workflow: makeCounts('workflow'),
      priority: makeCounts('priority'),
    };
  }, [getValues]);

  const cloneEmptyCounts = useCallback(
    () => ({
      lifecycle: { ...emptyCountsTemplate.lifecycle },
      compliance: { ...emptyCountsTemplate.compliance },
      workflow: { ...emptyCountsTemplate.workflow },
      priority: { ...emptyCountsTemplate.priority },
    }),
    [emptyCountsTemplate]
  );

  // Group all assets by category and add all 4 dimension counts
  const assetsByCategory = useMemo(() => {
    return assets.reduce((acc, asset) => {
      const dimensionCounts = dimensionCountsByAsset?.get(asset.id);
      const baseCounts = dimensionCounts
        ? dimensionCounts
        : cloneEmptyCounts();

      if (!dimensionCounts) {
        const lifecycleStatus = asset.lifecycle_status || asset.status;
        if (lifecycleStatus && baseCounts.lifecycle?.[lifecycleStatus] !== undefined) {
          baseCounts.lifecycle[lifecycleStatus] += 1;
        }

        const complianceStatus = asset.compliance_status || asset.complianceStatus;
        if (complianceStatus && baseCounts.compliance?.[complianceStatus] !== undefined) {
          baseCounts.compliance[complianceStatus] += 1;
        }

        const workflowStatus = asset.workflow_status || asset.workflowStatus;
        if (workflowStatus && baseCounts.workflow?.[workflowStatus] !== undefined) {
          baseCounts.workflow[workflowStatus] += 1;
        }

        const priorityLevel = asset.priority || asset.priority_level;
        if (priorityLevel && baseCounts.priority?.[priorityLevel] !== undefined) {
          baseCounts.priority[priorityLevel] += 1;
        }
      }

      const assetWithCounts = {
        ...asset,
        dimensionCounts: baseCounts,
      };

      if (!acc[asset.category]) {
        acc[asset.category] = [];
      }

      acc[asset.category].push(assetWithCounts);
      return acc;
    }, {});
  }, [assets, dimensionCountsByAsset, cloneEmptyCounts]);

  return (
    <PageLayout showBackButton={false}>
      {/* Asset Carousel - Horizontal scrolling layout for browsing all categories */}
      <AssetCarousel
        assetsByCategory={assetsByCategory}
        viewMode="grid"
        language={language}
      />
    </PageLayout>
  );
};

export default HomeView;

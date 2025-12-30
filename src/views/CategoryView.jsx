import { useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import AssetGrid from '../components/layout/AssetGrid';
import PageLayout from '../components/layout/PageLayout';
import {
  useAssetDimensionCounts,
} from '../hooks/useAssetDimensionCounts';
import { DEFAULT_LANGUAGE } from '../utils/i18nHelpers';
import { resolveCategoryFromSlug } from '../utils/routing';
import { useDomain } from '../contexts/DomainContext';
import { useScopedDomainData } from '../hooks/useScopedDomainData';
import { useStatusHelpers } from '../utils/domainStatus';

/**
 * CategoryView - Displays assets from a single category in a grid layout
 * Used for category-specific routes like /company, /supplier, /product, etc.
 *
 * Shows a traditional grid layout (2-6 columns responsive) which is better
 * for viewing many assets at once compared to the horizontal carousel used in HomeView.
 */
const CategoryView = ({
  language = DEFAULT_LANGUAGE,
  currentUser,
}) => {
  const scopedData = useScopedDomainData(currentUser);
  const { currentData, currentConfig } = useDomain();
  const data = scopedData || currentData;
  const { getValues } = useStatusHelpers();
  const assets = data?.assets ?? [];
  const regulatoryAffairs = data?.regulatory_affairs ?? [];
  // Get category from URL params
  const { category: categorySlug } = useParams();
  const categoryKey = useMemo(
    () => (categorySlug ? resolveCategoryFromSlug(categorySlug, currentConfig) ?? null : null),
    [categorySlug, currentConfig]
  );

  // Validate category - if invalid, return error or redirect
  if (!categoryKey) {
    return (
      <PageLayout showBackButton={true}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          {language === 'es' ? 'Categoría no válida' : 'Invalid category'}
        </Box>
      </PageLayout>
    );
  }
  // Use the shared hook to calculate status counts per asset
  const dimensionCountsByAsset = useAssetDimensionCounts(regulatoryAffairs);

  const emptyCountsTemplate = useMemo(() => {
    const makeCounts = (dimensionKey, fallbackValues) => {
      const values = getValues(dimensionKey);
      const source = values && values.length ? values : fallbackValues;
      return source.reduce((acc, value) => {
        acc[value] = 0;
        return acc;
      }, {});
    };

    return {
      compliance: makeCounts('compliance', ['current', 'expiring', 'expired', 'permanent']),
      workflow: makeCounts('workflow', ['in_preparation', 'submitted', 'completed', 'needs_renewal']),
      priority: makeCounts('priority', ['critical', 'high', 'medium', 'low']),
    };
  }, [getValues]);

  const cloneEmptyCounts = useCallback(
    () => ({
      compliance: { ...emptyCountsTemplate.compliance },
      workflow: { ...emptyCountsTemplate.workflow },
      priority: { ...emptyCountsTemplate.priority },
    }),
    [emptyCountsTemplate]
  );

  // Filter assets by category and add status counts
  const assetsByCategory = useMemo(() => {
    // Filter to only show assets from this category
    const filteredAssets = assets.filter(asset => asset.category === categoryKey);

    // Group assets by category (should only be one category)
    return filteredAssets.reduce((acc, asset) => {
      const dimensionCounts = dimensionCountsByAsset?.get(asset.id);
      const baseCounts = dimensionCounts
        ? {
            compliance: { ...(dimensionCounts.compliance || {}) },
            workflow: { ...(dimensionCounts.workflow || {}) },
            priority: { ...(dimensionCounts.priority || {}) },
          }
        : cloneEmptyCounts();

      if (!dimensionCounts) {
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
        complianceCounts: baseCounts.compliance,
        workflowCounts: baseCounts.workflow,
        priorityCounts: baseCounts.priority,
      };

      if (!acc[asset.category]) {
        acc[asset.category] = [];
      }

      acc[asset.category].push(assetWithCounts);
      return acc;
    }, {});
  }, [assets, categoryKey, dimensionCountsByAsset, cloneEmptyCounts]);

  return (
    <PageLayout showBackButton={false}>
      {/* Asset Grid - Traditional grid layout for single category */}
      <AssetGrid
        key={categoryKey} // Force remount when category changes
        assetsByCategory={assetsByCategory}
        viewMode="grid"
        language={language}
      />
    </PageLayout>
  );
};

export default CategoryView;

# Hooks - Design Context

## Directory Purpose

Custom React hooks that:
- Encapsulate reusable stateful logic
- Aggregate and compute derived data (status counts, metrics)
- Implement memoization for performance optimization
- Provide clean, testable interfaces for views and components
- Handle complex data transformations in one place

**Current Hooks**:
- `useAssetDimensionCounts.js` - Aggregates 4-dimension status counts per asset
- `useRenewalStatusData.js` - Flexible aggregation hook with multiple strategies

---

## useAssetDimensionCounts.js

**Purpose**: Aggregates all 4 status dimension counts (lifecycle, compliance, workflow, priority) per asset from enriched regulatory affairs. Used primarily for traffic light indicators on asset tiles.

**Hook Signature**:
```javascript
export const useAssetDimensionCounts = (regulatoryAffairs = [])
```

**Parameters**:
- `regulatoryAffairs` (Array) - Array of **enriched** regulatory affairs (must have lifecycleStatus, complianceStatus, workflowStatus, priorityLevel already calculated)

**Returns**:
- `Map<assetId, DimensionCounts>` - Map where keys are asset IDs and values are dimension count objects

**DimensionCounts Structure**:
```typescript
interface DimensionCounts {
  lifecycle: {
    active: number;      // Count of active affairs
    archived: number;    // Count of archived affairs
  };
  compliance: {
    current: number;     // Count of current (valid) affairs
    expiring: number;    // Count of expiring soon affairs
    expired: number;     // Count of expired affairs
    permanent: number;   // Count of permanent (no expiry) affairs
  };
  workflow: {
    in_preparation: number;  // Count of affairs not yet submitted
    submitted: number;       // Count of affairs submitted, awaiting approval
    completed: number;       // Count of approved and active affairs
    needs_renewal: number;   // Count of affairs needing renewal
  };
  priority: {
    critical: number;    // Count of critical priority affairs
    high: number;        // Count of high priority affairs
    medium: number;       // Count of medium priority affairs
    low: number;         // Count of low priority affairs
  };
}
```

**Empty Count Creators**:
```javascript
const createCountsObject = (values) => values.reduce((acc, value) => {
  acc[value] = 0;
  return acc;
}, {});

export const createEmptyLifecycleCounts = () => createCountsObject(Object.values(LIFECYCLE_STATUS));
export const createEmptyComplianceCounts = () => createCountsObject(Object.values(COMPLIANCE_STATUS));
export const createEmptyWorkflowCounts = () => createCountsObject(Object.values(WORKFLOW_STATUS));
export const createEmptyPriorityCounts = () => createCountsObject(Object.values(PRIORITY_LEVEL));
```

**Purpose**: Create count objects with all possible values initialized to 0.

**Why Initialize to 0?**
- Prevents undefined errors when accessing counts
- Simplifies increment logic (no need for null checks)
- Makes empty states explicit

**Dimension Entry Creator**:
```javascript
const createDimensionEntry = () => ({
  lifecycle: createEmptyLifecycleCounts(),
  compliance: createEmptyComplianceCounts(),
  workflow: createEmptyWorkflowCounts(),
  priority: createEmptyPriorityCounts(),
});
```

**Status Normalization**:
```javascript
const normalizeLifecycleStatus = (affair) => {
  return affair?.lifecycleStatus ?? LIFECYCLE_STATUS.ACTIVE;
};

const normalizeComplianceStatus = (affair) => {
  return affair?.complianceStatus ?? COMPLIANCE_STATUS.EXPIRED;
};

const normalizeWorkflowStatus = (affair) => {
  return affair?.workflowStatus ?? WORKFLOW_STATUS.IN_PREPARATION;
};

const normalizePriorityLevel = (affair) => {
  return affair?.priorityLevel ?? PRIORITY_LEVEL.MEDIUM;
};
```

**Purpose**: Provide safe defaults for missing status values.

**Why These Defaults?**
- **Lifecycle**: Default to `active` (most common, optimistic)
- **Compliance**: Default to `expired` (conservative, fail-safe)
- **Workflow**: Default to `in_preparation` (earliest state)
- **Priority**: Default to `medium` (neutral importance)

**Main Hook Logic**:
```javascript
export const useAssetDimensionCounts = (regulatoryAffairs = []) => {
  return useMemo(() => {
    const map = new Map();

    regulatoryAffairs.forEach((affair) => {
      // Skip affairs without assetId (orphaned data)
      if (!affair?.assetId) {
        return;
      }

      // Get or create dimension entry for this asset
      const entry = map.get(affair.assetId) ?? createDimensionEntry();

      // Normalize statuses (defensive, should already be set)
      const lifecycleStatus = normalizeLifecycleStatus(affair);
      const complianceStatus = normalizeComplianceStatus(affair);
      const workflowStatus = normalizeWorkflowStatus(affair);
      const priorityLevel = normalizePriorityLevel(affair);

      // Increment all dimension counts
      incrementCounts(entry, lifecycleStatus, complianceStatus, workflowStatus, priorityLevel);

      // Store back in map
      map.set(affair.assetId, entry);
    });

    return map;
  }, [regulatoryAffairs]);
};
```

**Algorithm Walkthrough**:

**Input**: Array of enriched regulatory affairs
```javascript
[
  { id: 'AFF-001', assetId: 'EM-001', complianceStatus: 'current', workflowStatus: 'completed', lifecycleStatus: 'active', priorityLevel: 'high' },
  { id: 'AFF-002', assetId: 'EM-001', complianceStatus: 'expiring', workflowStatus: 'needs_renewal', lifecycleStatus: 'active', priorityLevel: 'critical' },
  { id: 'AFF-003', assetId: 'EM-001', complianceStatus: 'expired', workflowStatus: 'in_preparation', lifecycleStatus: 'active', priorityLevel: 'high' },
  { id: 'AFF-004', assetId: 'PR-001', complianceStatus: 'current', workflowStatus: 'completed', lifecycleStatus: 'active', priorityLevel: 'medium' },
]
```

**Output**: Map with 2 entries
```javascript
Map {
  'EM-001' => {
    lifecycle: { active: 3, archived: 0 },
    compliance: { current: 1, expiring: 1, expired: 1, permanent: 0 },
    workflow: { in_preparation: 1, submitted: 0, completed: 1, needs_renewal: 1 },
    priority: { critical: 1, high: 2, medium: 0, low: 0 }
  },
  'PR-001' => {
    lifecycle: { active: 1, archived: 0 },
    compliance: { current: 1, expiring: 0, expired: 0, permanent: 0 },
    workflow: { in_preparation: 0, submitted: 0, completed: 1, needs_renewal: 0 },
    priority: { critical: 0, high: 0, medium: 1, low: 0 }
  }
}
```

**Memoization**:
```javascript
useMemo(() => {
  // ... aggregation logic
}, [regulatoryAffairs]);
```

**Why useMemo?**
- **Performance**: Aggregation is O(n) where n = number of affairs
- **Prevent re-renders**: Only recalculate when regulatoryAffairs array changes
- **Reference stability**: Map reference stays same if input hasn't changed

**When Does it Recalculate?**
- Affairs added/removed/updated
- Enrichment runs again (status values change)

**When Does it NOT Recalculate?**
- Parent component re-renders but affairs unchanged
- Sibling components update
- Filters applied (if affairs array is same reference)

**Usage Examples**:

#### 1. HomeView - Traffic Light Indicators
```javascript
import { useAssetDimensionCounts } from '../hooks/useAssetDimensionCounts';

function HomeView({ assets, regulatoryAffairs }) {
  // Aggregate dimension counts per asset
  const dimensionCountsByAsset = useAssetDimensionCounts(regulatoryAffairs);

  // Attach compliance counts to each asset for traffic lights
  const assetsWithCounts = assets.map(asset => ({
    ...asset,
    statusCounts: {
      current: dimensionCountsByAsset.get(asset.id)?.compliance.current ?? 0,
      expiring: dimensionCountsByAsset.get(asset.id)?.compliance.expiring ?? 0,
      expired: dimensionCountsByAsset.get(asset.id)?.compliance.expired ?? 0,
    }
  }));

  return (
    <AssetCarousel
      assetsByCategory={groupByCategory(assetsWithCounts)}
      viewMode="grid"
    />
  );
}
```

**Output for AssetTile**: Shows traffic lights 🟢 3  🟡 1  🟥 1

#### 2. Access All 4 Dimensions
```javascript
const dimensionCountsByAsset = useAssetDimensionCounts(regulatoryAffairs);
const assetCounts = dimensionCountsByAsset.get('EM-001');

// Compliance (for traffic lights)
console.log(assetCounts.compliance);
// { current: 3, expiring: 1, expired: 1, permanent: 0 }

// Workflow (for process tracking)
console.log(assetCounts.workflow);
// { in_preparation: 0, submitted: 1, completed: 3, needs_renewal: 1 }

// Priority (for importance weighting)
console.log(assetCounts.priority);
// { critical: 1, high: 2, medium: 2, low: 0 }

// Lifecycle (for active vs archived)
console.log(assetCounts.lifecycle);
// { active: 5, archived: 0 }
```

---

## useRenewalStatusData.js

**Purpose**: Flexible aggregation hook providing core renewal data structures and dimension counts with multiple aggregation strategies. Used primarily by DashboardView and ControlPanelView for metrics, charts, and tables.

**Hook Signature**:
```javascript
export const useRenewalStatusData = ({
  regulatoryAffairs = [],
  renewals = [],
  assets = [],
  aggregateBy = 'none',
  includeItems = false,
  includeDerived = false,
} = {})
```

**Parameters**:
- `regulatoryAffairs` (Array) - Regulatory affairs (can be enriched or not)
- `renewals` (Array) - All renewals
- `assets` (Array) - Assets (required for `aggregateBy: 'category'`)
- `aggregateBy` (String) - Aggregation strategy: `'none'` | `'global'` | `'asset'` | `'category'`
- `includeItems` (Boolean) - Whether to include full item objects per status (future feature)
- `includeDerived` (Boolean) - Whether to calculate derived metrics like health scores (future feature)

**Returns**:
```typescript
interface RenewalStatusData {
  renewalsByAffair: Map<affairId, Renewal[]>;           // All renewals per affair (sorted by date)
  latestRenewalByAffair: Map<affairId, Renewal>;        // Latest renewal per affair
  dimensionCounts: Map | Object | null;                 // Aggregated counts (depends on aggregateBy)
}
```

**Core Data Structures**:

#### renewalsByAffair

**Purpose**: Map of all renewals grouped by affair ID, sorted by date (most recent first).

```javascript
const { renewalsByAffair, latestRenewalByAffair } = useMemo(() => {
  const renewalsMap = new Map();

  // 1. Group renewals by affair
  for (const renewal of renewals) {
    const list = renewalsMap.get(renewal.affairId);
    if (list) {
      list.push(renewal);
    } else {
      renewalsMap.set(renewal.affairId, [renewal]);
    }
  }

  // 2. Sort renewals by date (most recent first)
  renewalsMap.forEach((list, affairId, map) => {
    map.set(
      affairId,
      list.sort((a, b) => getComparableRenewalDate(b) - getComparableRenewalDate(a))
    );
  });

  // 3. Extract latest renewal per affair
  const latestMap = new Map();
  renewalsMap.forEach((list, affairId) => {
    if (list.length > 0) {
      latestMap.set(affairId, list[0]);
    }
  });

  return {
    renewalsByAffair: renewalsMap,
    latestRenewalByAffair: latestMap,
  };
}, [renewals]);
```

**Example Output**:
```javascript
renewalsByAffair.get('AFF-001')
// Returns: [REN-003 (2024), REN-002 (2023), REN-001 (2022)]  // Sorted newest → oldest

latestRenewalByAffair.get('AFF-001')
// Returns: REN-003 (2024)
```

**Why Separate Latest Map?**
- **Performance**: Avoid finding latest renewal repeatedly in components
- **Convenience**: Most components only need latest renewal, not full history
- **Pre-calculated**: O(1) lookup instead of O(n) array search

**Aggregation Strategies**:

#### aggregateBy: 'none' (Default)
```javascript
const { renewalsByAffair, latestRenewalByAffair } = useRenewalStatusData({
  regulatoryAffairs,
  renewals,
  aggregateBy: 'none'
});
```

**Returns**: Only core data structures, no dimension counts.

**Use Case**: When you only need renewals grouped by affair, not aggregated metrics.

**Example**: ExpandableRow component showing all renewals for a specific affair.

#### aggregateBy: 'global'
```javascript
const { dimensionCounts } = useRenewalStatusData({
  regulatoryAffairs,
  renewals,
  aggregateBy: 'global'
});

console.log(dimensionCounts);
// {
//   compliance: { current: 50, expiring: 10, expired: 5, permanent: 2 },
//   workflow: { in_preparation: 3, submitted: 5, completed: 50, needs_renewal: 9 },
//   priority: { critical: 5, high: 15, medium: 40, low: 7 }
// }
```

**Returns**: Single dimension counts object aggregating all affairs globally.

**Use Case**: DashboardView showing overall compliance health across entire business.

#### aggregateBy: 'asset'
```javascript
const { dimensionCounts } = useRenewalStatusData({
  regulatoryAffairs,
  renewals,
  aggregateBy: 'asset'
});

console.log(dimensionCounts);
// Map {
//   'EM-001' => { compliance: {...}, workflow: {...}, priority: {...} },
//   'PR-001' => { compliance: {...}, workflow: {...}, priority: {...} },
//   ...
// }
```

**Returns**: Map of dimension counts per asset ID.

**Use Case**: Asset-level compliance reports, charts grouped by asset.

**Note**: Similar to `useAssetDimensionCounts` but without lifecycle dimension and calculated on-the-fly (not from enriched data).

#### aggregateBy: 'category'
```javascript
const { dimensionCounts } = useRenewalStatusData({
  regulatoryAffairs,
  renewals,
  assets,  // Required for category lookup
  aggregateBy: 'category'
});

console.log(dimensionCounts);
// {
//   'empresa': { compliance: {...}, workflow: {...}, priority: {...} },
//   'producto': { compliance: {...}, workflow: {...}, priority: {...} },
//   'vehiculo': { compliance: {...}, workflow: {...}, priority: {...} },
//   ...
// }
```

**Returns**: Object of dimension counts per asset category.

**Use Case**: DashboardView with category filtering (CategoryTabs), comparing compliance across asset types.

**Status Calculation Helpers**:

#### getComplianceStatusForAffair()
```javascript
const getComplianceStatusForAffair = (affair, latestRenewal) => {
  // 1. Use affair's pre-calculated status if available (enriched data)
  if (affair.complianceStatus) {
    return affair.complianceStatus;
  }

  // 2. Calculate from latest renewal if available
  if (latestRenewal) {
    return calculateComplianceStatus(latestRenewal);
  }

  // 3. Default to expired (conservative fallback)
  return COMPLIANCE_STATUS.EXPIRED;
};
```

**Flexibility**: Works with both enriched and non-enriched affairs.

**Why This Order?**
- **Enriched data**: Use pre-calculated status (fastest, most accurate)
- **Calculate on-the-fly**: Use renewal data to calculate (slower but works)
- **Fallback**: Assume worst case (expired) if no data

#### getWorkflowStatusForAffair()
```javascript
const getWorkflowStatusForAffair = (affair, latestRenewal, complianceStatus) => {
  // 1. Use affair's pre-calculated status if available
  if (affair.workflowStatus) {
    return affair.workflowStatus;
  }

  // 2. Calculate from latest renewal if available
  if (latestRenewal) {
    return calculateWorkflowStatus(latestRenewal, complianceStatus);
  }

  // 3. Default to in_preparation (earliest state)
  return WORKFLOW_STATUS.IN_PREPARATION;
};
```

#### getPriorityLevelForAffair()
```javascript
const getPriorityLevelForAffair = (affair) => affair.priorityLevel ?? PRIORITY_LEVEL.LOW;
```

**Simple**: Priority is always manual (not calculated), just provide default.

**Usage Examples**:

#### 1. DashboardView - Global Metrics
```javascript
import { useRenewalStatusData } from '../hooks/useRenewalStatusData';

function DashboardView({ regulatoryAffairs, renewals }) {
  const { dimensionCounts } = useRenewalStatusData({
    regulatoryAffairs,
    renewals,
    aggregateBy: 'global'
  });

  // Calculate health score
  const healthScore = calculateHealthScore(dimensionCounts.compliance);

  return (
    <>
      <HealthScore value={healthScore} />
      <HealthDonut data={dimensionCounts.compliance} dimension="compliance" />
      <HealthDonut data={dimensionCounts.workflow} dimension="workflow" />
      <HorizontalStackedBar data={dimensionCounts.priority} dimension="priority" />
    </>
  );
}
```

#### 2. DashboardView - Category Filtering
```javascript
function DashboardView({ regulatoryAffairs, renewals, assets }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter affairs by category
  const filteredAffairs = selectedCategory === 'all'
    ? regulatoryAffairs
    : regulatoryAffairs.filter(affair => {
        const asset = assets.find(a => a.id === affair.assetId);
        return asset?.category === selectedCategory;
      });

  // Aggregate with category filter applied
  const { dimensionCounts } = useRenewalStatusData({
    regulatoryAffairs: filteredAffairs,
    renewals,
    aggregateBy: 'global'
  });

  return (
    <>
      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <HealthDonut data={dimensionCounts.compliance} />
    </>
  );
}
```

#### 3. Expandable Table - Show All Renewals
```javascript
function ExpandableAffairRow({ affair }) {
  const { renewalsByAffair } = useRenewalStatusData({
    renewals: allRenewals,
    aggregateBy: 'none'  // Only need data structures, not counts
  });

  const affairRenewals = renewalsByAffair.get(affair.id) ?? [];

  return (
    <TableRow expandable>
      <TableCell>{affair.name}</TableCell>
      {/* ... */}
      {expanded && (
        <Box>
          {affairRenewals.map(renewal => (
            <RenewalRow key={renewal.id} renewal={renewal} />
          ))}
        </Box>
      )}
    </TableRow>
  );
}
```

**Design Decisions**:

#### Why Two Hooks?

**useAssetDimensionCounts**:
- **Simple**: One job (aggregate by asset)
- **Fast**: Assumes enriched data (no calculation needed)
- **Complete**: All 4 dimensions including lifecycle
- **Use Case**: Asset tiles, category views

**useRenewalStatusData**:
- **Flexible**: Multiple aggregation strategies
- **Core Data**: Provides renewalsByAffair, latestRenewalByAffair
- **Calculates**: Can work with non-enriched data
- **Use Case**: Dashboard metrics, detailed tables

**When to Use Each**:
- Need traffic lights for assets? → `useAssetDimensionCounts`
- Need global metrics or category aggregation? → `useRenewalStatusData`
- Need to show all renewals per affair? → `useRenewalStatusData`
- Need lifecycle dimension? → `useAssetDimensionCounts`

#### Why Separate Core Data Structures?

**renewalsByAffair** and **latestRenewalByAffair** are calculated independently from aggregation:

```javascript
const { renewalsByAffair, latestRenewalByAffair } = useMemo(
  () => /* ... */,
  [renewals]  // Only depends on renewals
);

const dimensionCounts = useMemo(
  () => /* ... */,
  [aggregateBy, regulatoryAffairs, renewalsByAffair, assets]  // Depends on multiple inputs
);
```

**Why?**
- **Reusability**: Core structures useful even without aggregation
- **Performance**: Don't recalculate renewalsByAffair when aggregateBy changes
- **Clarity**: Separation of concerns (data grouping vs aggregation)

#### Why useMemo?

Both hooks use `useMemo` extensively:

```javascript
const { renewalsByAffair, latestRenewalByAffair } = useMemo(
  () => /* ... */,
  [renewals]
);

const dimensionCounts = useMemo(
  () => /* ... */,
  [aggregateBy, regulatoryAffairs, renewalsByAffair, assets]
);
```

**Benefits**:
- **Performance**: O(n) aggregation only runs when dependencies change
- **Reference stability**: Map/Object references stay same if inputs unchanged
- **Prevent re-renders**: Child components don't re-render unnecessarily

**Cost**: Slightly more memory (caching results), negligible for < 10,000 items.

**Performance Considerations**:

#### Current Performance

**useAssetDimensionCounts**:
- ~40 assets, ~100 affairs
- Aggregation: < 5ms
- Renders instantly

**useRenewalStatusData**:
- ~100 affairs, ~200 renewals
- Core structures: < 10ms
- Aggregation: < 10ms (depends on strategy)
- Total: < 20ms

#### Scaling (1000+ Affairs)

**At 1,000 affairs**:
- Aggregation: ~20-50ms (still acceptable)
- Memoization critical (avoids re-calculation on every render)

**At 10,000 affairs**:
- Aggregation: ~100-200ms (noticeable lag)
- Consider moving to Web Worker
- Implement pagination/virtualization

**Optimization Strategies**:
1. **Web Worker**: Move aggregation to background thread
2. **Incremental Updates**: Only recalculate changed affairs, not all
3. **Server-Side Aggregation**: Move aggregation to backend API
4. **IndexedDB Caching**: Cache aggregation results, invalidate on data change

---


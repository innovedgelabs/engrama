# Views - Design Context

## Directory Purpose

Views are **page-level components** that represent full screens/routes in the application. They manage page-level state, compose smaller components from `/components/`, handle routing and navigation, and orchestrate data flow from domain data to child components.

**Current Views**:
- `HomeView.jsx` - Landing page with asset carousel
- `CategoryView.jsx` - Single category grid view
- `DashboardView.jsx` - Analytics and compliance metrics dashboard (domain-specific)
- `DetailView.jsx` - Unified detail view for assets, affairs, renewals
- `ControlPanelView.jsx` - Control panel dashboard (domain-specific)
- `RequestQueueView.jsx` - Request queue (attorneys/admins) and "My Requests" (all users), role-based filtering (pension_fund domain)
- `CreateRequestView.jsx` - Multi-step request form with validation, draft saving (pension_fund domain)

---

## HomeView.jsx

**Purpose**: Landing page displaying all assets grouped by category with traffic light compliance indicators

**Route**: `/`

**Architecture Overview**:

HomeView is a **pure presentation component** that receives domain data and orchestrates the display of assets grouped by category. It does NOT calculate status - that's done by data enrichment before rendering. HomeView only aggregates the pre-calculated compliance statuses per asset.

**Data Flow**:
```
DomainContext (currentData)
  └── assets, regulatoryAffairs (pre-enriched)
        └── HomeView receives domain data
              └── useAssetDimensionCounts(regulatoryAffairs)
                    └── Returns compliance counts per asset
                          └── AssetCarousel renders with traffic lights
```

**Status Aggregation**:

**Hook**: `useAssetDimensionCounts(regulatoryAffairs)`

**Purpose**: Aggregate pre-calculated compliance statuses from enriched affairs into counts per asset

```javascript
import { useAssetDimensionCounts } from '../hooks/useAssetDimensionCounts';

// Inside HomeView
const dimensionCountsByAsset = useAssetDimensionCounts(regulatoryAffairs);

// Returns: Map<assetId, {
//   lifecycle: { active: 5, archived: 0 },
//   compliance: { current: 3, expiring: 1, expired: 1, permanent: 0 },
//   workflow: { in_preparation: 0, submitted: 1, completed: 3, needs_renewal: 1 },
//   priority: { critical: 1, high: 2, medium: 2, low: 0 }
// }>
```

**Key Point**: Affairs arrive already enriched with `complianceStatus`, `workflowStatus`, `lifecycleStatus`, `priorityLevel`. The hook just counts them up per asset.

**Grouping by Category**:
```javascript
const assetsByCategory = assets.reduce((acc, asset) => {
  const dimensionCounts = dimensionCountsByAsset?.get(asset.id);
  const assetWithCounts = {
    ...asset,
    dimensionCounts: dimensionCounts ?? {
      lifecycle: createEmptyLifecycleCounts(),
      compliance: createEmptyComplianceCounts(),
      workflow: createEmptyWorkflowCounts(),
      priority: createEmptyPriorityCounts(),
    },
  };

  if (!acc[asset.category]) {
    acc[asset.category] = [];
  }
  acc[asset.category].push(assetWithCounts);
  return acc;
}, {});
```

**Component Structure**:
```jsx
<PageLayout showBackButton={false}>
  <Box sx={{ py: { xs: 1.5, sm: 2 } }}>
    <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 1 } }}>
      <AssetCarousel
        assetsByCategory={assetsByCategory}
        viewMode="grid"
        language={language}
      />
    </Container>
  </Box>
</PageLayout>
```

**Layout Features**:
- `showBackButton={false}` - Home is the root, no parent page
- Minimal padding on mobile for more content space
- Uses PageLayout for consistent spacing with TopBar and Sidebar

**Why AssetCarousel?**:
- **Horizontal scrolling**: Better use of screen real estate on wide monitors
- **Natural browsing**: Like Netflix, App Store (familiar UX pattern)
- **Accordion sections**: Each category expandable/collapsible (all expanded by default)
- **Navigation arrows**: Show on desktop when content overflows
- **Touch-friendly**: Swipe gestures work on mobile/tablet
- **Progressive display**: Shows 1-6 items based on viewport

**Design Decisions**:

**Why aggregate in HomeView (not in AssetTile)?**
- **Performance**: Calculate once, not N times (one per tile)
- **Memoization**: `useAssetDimensionCounts` uses `useMemo` internally
- **Clean separation**: Status calculation in data layer, aggregation in view, display in component

**Why pass domain data as props?**
- **Testability**: Easy to pass different mock data
- **No side effects**: HomeView is pure presentation
- **API-ready**: When backend is connected, just swap data source

**Why useMemo in the hook?**
- **Expensive operation**: Nested loops over affairs (O(n) but still can be slow)
- **Only recalculates when data changes**: Prevents re-render thrashing
- **Keeps UI responsive**: No jank when filtering

**Dependencies**:
- `DomainContext` for current data
- `useAssetDimensionCounts` hook for status aggregation
- `AssetCarousel` component for display
- `PageLayout` for consistent layout

---

## CategoryView.jsx

**Purpose**: Display all assets from a single category in a traditional grid layout

**Routes**: `/:category` (e.g., `/company`, `/producto`, `/vehiculo`)

**Architecture**:

CategoryView is similar to HomeView but focuses on a **single category** instead of all categories. It uses a traditional grid layout (AssetGrid) rather than a horizontal carousel.

**Data Flow**:
```
URL param → category slug (e.g., "company")
  └── Resolve category key from slug
        └── Filter assets by category
              └── Aggregate compliance counts (useAssetDimensionCounts)
                    └── Render in traditional grid (AssetGrid component)
```

**Category Resolution**:
```javascript
import { useParams } from 'react-router-dom';
import { resolveCategoryFromSlug } from '../utils/routing';

const { category: categorySlug } = useParams();
const categoryKey = resolveCategoryFromSlug(categorySlug, domainConfig);

// Filter assets by resolved category
const categoryAssets = assets.filter(asset => asset.category === categoryKey);
```

**Why slug resolution?**
- URLs can be in Spanish or English (`/empresa` or `/company`)
- `resolveCategoryFromSlug()` handles both via domain configuration
- Consistent with bilingual routing system

**Status Aggregation**:

Same as HomeView - uses `useAssetDimensionCounts()` hook to aggregate pre-calculated compliance statuses:

```javascript
const dimensionCountsByAsset = useAssetDimensionCounts(regulatoryAffairs);

// Attach counts to each asset
const assetsWithCounts = categoryAssets.map(asset => ({
  ...asset,
  complianceCounts: dimensionCounts?.compliance ?? createEmptyComplianceCounts(),
  workflowCounts: dimensionCounts?.workflow ?? createEmptyWorkflowCounts(),
  priorityCounts: dimensionCounts?.priority ?? createEmptyPriorityCounts(),
}));
```

**Component Structure**:
```jsx
<PageLayout showBackButton={false}>
  <Box sx={{ py: { xs: 1.5, sm: 2 } }}>
    <Container maxWidth="xl">
      <AssetGrid
        key={categoryKey} // Force remount when category changes
        assetsByCategory={assetsByCategory}
        viewMode="grid"
        language={language}
      />
    </Container>
  </Box>
</PageLayout>
```

**Layout Features**:
- `showBackButton={false}` - Back navigation handled by breadcrumbs
- Category name as page title (via AssetGrid)
- Empty state when no assets in category
- Uses AssetGrid (traditional grid, not carousel)

**Why AssetGrid (not AssetCarousel)?**
- **Category-focused**: User wants to see ALL assets in this category
- **Traditional layout**: Grid is better for scanning many items
- **No horizontal scroll**: All items visible at once (wrap to next row)
- **Familiar pattern**: Matches user expectations for category views

**Navigation Flow**:
```
HomeView → User clicks category chip in Sidebar
  └── Navigate to /category
        └── CategoryView shows all assets in that category
              └── User clicks asset tile
                    └── Navigate to /:category/:id/info (DetailView)
```

**Responsive Grid**:
- **xs (< 600px)**: 1 column (single tile per row)
- **sm (600-960px)**: 2 columns
- **md (960-1280px)**: 3 columns
- **lg (1280-1920px)**: 4 columns
- **xl (1920px+)**: 5-6 columns

**Design Decisions**:

**Why separate view for categories?**
- **Better UX**: Grid is better for category-focused browsing
- **Clean URLs**: `/company` is clearer than `/?category=company`
- **Shareable**: Users can share category-specific links
- **SEO-friendly**: Each category has its own URL (when backend added)

**Why AssetGrid instead of carousel here?**
- **User intent**: User wants to see all assets in category, not just a few
- **No horizontal scroll**: Grid wraps naturally, no need to scroll horizontally
- **Familiar pattern**: Users expect grids for category browsing

**Dependencies**:
- `DomainContext` for current data
- `useAssetDimensionCounts` hook for status aggregation
- `AssetGrid` component for display
- `resolveCategoryFromSlug` from utils/routing
- `PageLayout` for consistent layout

---

## DashboardView.jsx

**Purpose**: Executive dashboard showing compliance health metrics, status breakdowns, workflow pipeline, and historical compliance trends

**Routes**:
- `/dashboard` (English)
- `/panel` (Spanish)

**Architecture**:

DashboardView is a **domain-specific wrapper** that delegates to domain-specific dashboard components via `dashboardRegistry`. This allows different business domains to have customized dashboards while sharing the same routing structure.

**Component Structure**:
```jsx
<PageLayout showBackButton={false}>
  <DomainDashboard {...props} />
</PageLayout>
```

**Domain-Specific Dashboards**:

The actual dashboard content is provided by domain-specific components registered in `dashboardRegistry`:

```javascript
const DomainDashboard = getDashboardComponent(currentDomainId, currentConfig);
```

**Why domain-specific dashboards?**
- **Flexibility**: Different business domains may need different metrics
- **Customization**: Each domain can have its own visualizations and KPIs
- **Scalability**: Easy to add new domains without modifying core views
- **Consistency**: Shared routing and layout structure

**Dependencies**:
- `DomainContext` for current domain and configuration
- `dashboardRegistry` for domain-specific dashboard components
- `PageLayout` for consistent layout

---

## ControlPanelView.jsx

**Purpose**: Control panel dashboard showing comprehensive compliance metrics, filtering, and actionable items

**Architecture**:

ControlPanelView is a **domain-specific dashboard** that provides detailed compliance analytics with multi-dimensional filtering. It calculates status on-the-fly from renewals rather than using pre-enriched data.

**Status Calculation** (Real-time):

Unlike other views that use pre-enriched affairs, ControlPanelView calculates compliance and workflow status from renewals in real-time:

```javascript
const latestRenewalByAffair = useMemo(() => {
  // Group renewals by affair and get latest
  const grouped = new Map();
  renewals.forEach((renewal) => {
    const list = grouped.get(renewal.affairId) ?? [];
    list.push(renewal);
    grouped.set(renewal.affairId, list);
  });

  const map = new Map();
  grouped.forEach((list, affairId) => {
    list.sort((a, b) => {
      const dateA = new Date(a.approvalDate || a.submissionDate || a.expiryDate || 0);
      const dateB = new Date(b.approvalDate || b.submissionDate || b.expiryDate || 0);
      return dateB - dateA;
    });
    map.set(affairId, list[0]);
  });

  return map;
}, [renewals]);

const affairsDataset = regulatoryAffairs.map((affair) => {
  const latestRenewal = latestRenewalByAffair.get(affair.id) ?? null;
  const complianceStatus = latestRenewal
    ? calculateComplianceStatus(latestRenewal)
    : COMPLIANCE_STATUS.EXPIRED;
  const workflowStatus = latestRenewal
    ? calculateWorkflowStatus(latestRenewal, complianceStatus)
    : WORKFLOW_STATUS.IN_PREPARATION;

  return {
    affair,
    latestRenewal,
    complianceStatus,
    workflowStatus,
    // ... metadata and labels
  };
});
```

**Multi-Dimensional Filtering**:

ControlPanelView supports filtering by multiple dimensions simultaneously:

- **Compliance Status**: current, expiring, expired, permanent
- **Affair Type**: Certificado, Permiso, etc.
- **Asset Category**: empresa, producto, etc.
- **Asset**: Specific asset selection
- **Responsible Person**: Person responsible for renewal
- **Expiry Date**: Filter by specific expiry dates

**Filter Architecture**:
```javascript
const [affairFilters, setAffairFilters] = useState({
  complianceStatus: [],
  affairType: [],
  affairAsset: [],
  affairCategory: [],
  affairExpiryDate: [],
  affairResponsible: [],
});

// Multi-select filtering (AND logic within dimension, OR logic across dimensions)
const filteredAffairs = affairsDataset.filter((item) => {
  if (affairFilters.complianceStatus?.length > 0) {
    if (!affairFilters.complianceStatus.includes(item.complianceStatus)) {
      return false;
    }
  }
  // ... other filters
  return true;
});
```

**Context-Aware Filter Options**:

Filter options are dynamically generated based on currently filtered data to prevent impossible filter combinations:

```javascript
const availableFilterOptions = useMemo(() => {
  const baseData = filteredAffairs; // Use filtered data as base

  return {
    statuses: [...new Set(baseData.map(item => item.complianceStatus))],
    types: [...new Set(baseData.map(item => item.affair.type))],
    categories: [...new Set(baseData.map(item => item.asset?.category))],
    // ... other options
  };
}, [filteredAffairs]);
```

**Category Filtering**:

Uses CategoryTabs to filter affairs by asset category:

```jsx
<CategoryTabs
  value={activeAffairCategory}
  onChange={setActiveAffairCategory}
  categories={affairCategories}
  language={language}
/>
```

**Mobile vs Desktop**:
- **Desktop**: Full table with all columns, inline FilterChips
- **Mobile**: ExpandableRow components, FilterFAB + FilterDrawer

**Dependencies**:
- `DomainContext` for current data
- `useStatusHelpers` for status metadata
- `aggregateDashboardStats` for urgency calculations
- `CategoryTabs` for category filtering
- `FilterDrawer` and `FilterFAB` for mobile filtering
- `DataTable` and `ExpandableRow` for display

---

## DetailView.jsx

**Purpose**: Unified detail view displaying complete information for assets, regulatory affairs, or renewals with dynamic tab configuration

**Routes**:
- `/:category/:id/:tab?` - Asset detail (e.g., `/empresa/EM-001/info`)
- `/affair/:affairId/:tab?` or `/asunto/:affairId/:tab?` - Regulatory affair detail (bilingual)
- `/renewal/:renewalId/:tab?` or `/actualizacion/:renewalId/:tab?` - Renewal detail (bilingual)

**Unified Architecture**:

**Key Innovation**: Single DetailView component handles **three entity types** dynamically with different tab configurations:

1. **Asset** (e.g., Empresa, Producto)
   - Tabs: Info, Regulatory Affairs, Dossier (direct docs), Relationships
   - Shows: Asset metadata, regulatory affairs table, asset-level attachments, related assets

2. **Regulatory Affair** (e.g., "RNC Registration")
   - Tabs: Info, Renewals
   - Shows: Affair metadata, renewals table with workflow + compliance

3. **Renewal** (e.g., "Renewal 2024")
   - Tabs: Info, Attachments
   - Shows: Renewal metadata, attachments table with view/download/delete actions

**Entity Type Detection**:
```javascript
const location = useLocation();
const primarySegment = location.pathname.split('/').filter(Boolean)[0] ?? '';
const primaryRouteKey = resolveRouteSegment(primarySegment, currentConfig);

const entityType = (primaryRouteKey === 'affair' || primaryRouteKey === 'regulatory_affair')
  ? 'affair'
  : primaryRouteKey === 'renewal'
  ? 'renewal'
  : 'asset';
```

**Why URL-based detection?**
- **Clean routing**: RESTful URLs that match entity hierarchy
- **Browser back/forward**: Works intuitively
- **Bookmarkable**: Can share links to specific entities
- **Bilingual support**: Handles Spanish and English routes via domain configuration

**Dynamic Data Loading**:
```javascript
const { relatedData, breadcrumbItems, tabConfigs } = useMemo(() => {
  if (entityType === 'asset') {
    const regulatoryAffairs = regulatoryAffairsByAsset.get(currentId) ?? [];
    const attachments = assetAttachmentsByAsset.get(currentId) ?? [];
    const relatedAssets = /* calculate from connections */;

    return {
      relatedData: { regulatoryAffairs, attachments, relatedAssets },
      tabConfigs: [
        { key: 'info', label: getUIText('tabInfo', language) },
        { key: 'regulatory', label: getUIText('tabRegulatory', language), badge: regulatoryAffairs.length },
        { key: 'dossier', label: getUIText('tabDossier', language), badge: attachments.length },
        { key: 'relations', label: getUIText('tabRelations', language), badge: relatedAssets.length },
      ],
      breadcrumbItems: [/* ... */],
    };
  }
  // ... affair and renewal cases
}, [entity, entityType, currentId, /* ... */]);
```

**Dynamic Breadcrumb Navigation**:

**Hierarchy Reflection**: Breadcrumbs show full navigation path from home to current entity

**Asset breadcrumbs**:
```
Inicio → Companies → Alimentos del Valle C.A.
```

**Affair breadcrumbs**:
```
Inicio → Companies → Alimentos del Valle C.A. → RNC Registration
```

**Renewal breadcrumbs**:
```
Inicio → Companies → Alimentos del Valle C.A. → RNC Registration → Renewal 2024
```

**Why full hierarchy?**
- **Context awareness**: User always knows where they are
- **Quick navigation**: Click any breadcrumb to go up hierarchy
- **Matches data model**: Reflects 3-level structure (asset → affair → renewal)

**Tab Configuration**:

Tabs are dynamically configured based on entity type and domain configuration:

```javascript
const tabOrder = entityConfig?.tabs || ['info', 'regulatory', 'dossier', 'relations'];

const tabConfigs = tabOrder.map((tabKey) => {
  const badgeCount =
    tabKey === 'regulatory' ? regulatoryAffairs.length
    : tabKey === 'dossier' ? attachments.length
    : tabKey === 'relations' ? relatedAssets.length
    : undefined;

  return {
    key: tabKey,
    label: getUIText(`tab${tabKey}`, language),
    badge: badgeCount,
  };
});
```

**Tab Content Rendering**:

Uses `componentRegistry` to get appropriate tab components:

```javascript
const renderTabContent = () => {
  const TabComponent = getTabComponent(entityType, activeTabKey, currentConfig);
  return <TabComponent
    entity={entity}
    relatedData={relatedData}
    activeFilters={activeFilters}
    onFilterChange={handleFilterChange}
    language={language}
  />;
};
```

**Filter Management**:

DetailView manages filters per tab context:

```javascript
const FILTER_KEYS_BY_CONTEXT = {
  asset: {
    regulatory: ['complianceStatus', 'affairCategory'],
    dossier: ['documentType', 'documentPrimary'],
    relations: ['status', 'category'],
  },
  affair: {
    renewals: ['workflowStatus', 'renewalType', 'renewalAttachments'],
  },
  renewal: {
    attachments: ['documentType', 'documentPrimary'],
  },
};

// Filters are scoped to current tab context
const filterKeys = getFilterKeysForContext(entityType, activeTabKey);
```

**URL State Management**:

Tab state is reflected in URL:

```javascript
const tabKeyFromParams = useMemo(() => {
  if (!tabSlug) return null;
  const context = entityType === 'affair' ? 'affair' : entityType === 'renewal' ? 'renewal' : 'asset';
  return resolveTabKeyFromSlug(tabSlug, context, currentConfig) ?? tabSlug;
}, [tabSlug, entityType, currentConfig]);

// Update URL when tab changes
const handleTabChange = (event, newValue) => {
  const tabKey = tabConfigs[newValue]?.key;
  const tabSlug = getTabSlug(tabKey, entityType, language, currentConfig);
  navigate(`/${pathSegments.join('/')}/${tabSlug}`, { replace: true });
};
```

**Benefits of Unified Approach**:

1. **DRY Principle**: No code duplication across 3 entity types
2. **Consistent UX**: Same layout, behavior, patterns for all entities
3. **Maintainable**: Changes in one place affect all entity types
4. **Scalable**: Easy to add new entity types (just add to entityType detection)
5. **Type-safe**: Future TypeScript will benefit from shared structure
6. **Testable**: Single component to test instead of three

**Mobile Optimizations**:

**FilterDrawer** (< md breakpoint):
- Opens from FilterFAB in RegulatoryAffairsTab and RenewalsTab
- Multi-select filters for compliance, workflow, priority
- Replaces inline FilterChips on mobile
- Bottom sheet drawer (Material Design pattern)

**Desktop FilterChips**:
- Inline chips above tables
- Click to toggle filter
- Clear all button
- More space-efficient on desktop

**Responsive Tables**:
- Fewer columns on mobile (priority columns hidden)
- Horizontal scroll for remaining columns
- Larger touch targets (48px minimum)
- Sticky headers remain visible while scrolling

**Dependencies**:
- `DomainContext` for current data and configuration
- `componentRegistry` for tab component resolution
- `resolveRouteSegment`, `resolveCategoryFromSlug`, `getTabSlug` from utils/routing
- `getUIText`, `getCategoryLabel` from utils/i18n
- All detail tab components (InfoTab, RegulatoryAffairsTab, RenewalsTab, AttachmentsTab, RelatedTab)

---

## Routing Structure

**Current implementation** in `App.jsx`:

```javascript
import { Routes, Route } from 'react-router-dom';

<Routes>
  {/* Home */}
  <Route path="/" element={<HomeView />} />

  {/* Category Views */}
  <Route path="/:category" element={<CategoryView />} />

  {/* Dashboard (bilingual) */}
  <Route path="/dashboard" element={<DashboardView />} />
  <Route path="/panel" element={<DashboardView />} />

  {/* Asset Detail */}
  <Route path="/:category/:id/:tab?" element={<DetailView />} />

  {/* Affair Detail (bilingual) */}
  <Route path="/affair/:affairId/:tab?" element={<DetailView />} />
  <Route path="/asunto/:affairId/:tab?" element={<DetailView />} />

  {/* Renewal Detail (bilingual) */}
  <Route path="/renewal/:renewalId/:tab?" element={<DetailView />} />
  <Route path="/actualizacion/:renewalId/:tab?" element={<DetailView />} />
</Routes>
```

**Route Examples**:
- `/` → HomeView (all assets in carousel)
- `/company` → CategoryView (all company assets)
- `/empresa/EM-001/info` → Asset detail, Info tab
- `/empresa/EM-001/regulatorios` → Asset detail, Regulatory Affairs tab
- `/affair/AFF-001/info` or `/asunto/AFF-001/info` → Affair detail, Info tab (bilingual)
- `/affair/AFF-001/renewals` → Affair detail, Renewals tab
- `/renewal/REN-001/info` or `/actualizacion/REN-001/info` → Renewal detail, Info tab (bilingual)
- `/renewal/REN-001/attachments` → Renewal detail, Attachments tab
- `/dashboard` or `/panel` → DashboardView (bilingual)

**Why bilingual routes?**
- **i18n-friendly**: Spanish and English URLs both work
- **User preference**: Users can type familiar words
- **SEO**: Better search engine optimization (future)
- **Flexibility**: Can add more languages later via domain configuration

---

## Performance Considerations

### Current State
- **Small dataset**: ~40 assets, ~100 affairs, ~200 renewals
- **Instant rendering**: No perceived lag
- **No optimization needed**: React handles re-renders efficiently
- **All data loaded upfront**: No lazy loading yet

### Future Optimizations (1000+ entities)

1. **Lazy load tabs**: Only render tab content when activated
2. **Memoize calculations**: Use `useMemo` for expensive derived data
3. **Code splitting**: Lazy load DetailView and DashboardView
4. **Preload data**: Prefetch on hover (anticipatory loading)
5. **Virtual scrolling**: For long tables (1000+ rows) using react-window
6. **Web Workers**: Move status aggregation to background thread
7. **IndexedDB caching**: Cache dimension counts, chart data
8. **Pagination**: Implement server-side pagination for tables
9. **Infinite scroll**: Alternative to pagination for mobile

---


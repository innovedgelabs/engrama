# Components - Design Context

## Purpose

This directory contains all reusable React components organized into three main categories: layout components for app structure, common components for shared UI patterns, and detail components for entity detail views.

**Directory Structure**:
```
components/
├── layout/          # App shell and page structure components
├── common/          # Shared/reusable components used throughout app
├── detail/         # Detail view specific tab components
├── dashboard/      # Dashboard-specific visualization components
└── domain/         # Domain-specific components
```

**Note**: Each subfolder has its own `CLAUDE.local.md` with detailed documentation:
- [layout/CLAUDE.local.md](layout/CLAUDE.local.md) - Page structure and navigation components
- [common/CLAUDE.local.md](common/CLAUDE.local.md) - Shared UI components
- [detail/CLAUDE.local.md](detail/CLAUDE.local.md) - Entity detail view tabs

---

## Component Categories

### Layout Components (`layout/`)

**Purpose**: Core app shell, page structure, and navigation components

**Key Components**:
- **TopBar**: Global navigation with SearchBar, business selector, user actions
- **Sidebar**: Left navigation drawer with category filtering and language toggle
- **MainLayout**: Root layout wrapper managing TopBar + Sidebar + content area
- **PageLayout**: Fullscreen page container with breadcrumbs and scroll management
- **PageHeader**: Hero card for entity pages (image, name, status, actions)
- **ContentPanel**: Data card wrapper for tables, charts, forms
- **AssetCarousel**: Horizontal scrolling carousel for browsing assets by category
- **AssetGrid**: Traditional responsive grid layout (alternative to carousel)
- **DataTable**: Reusable sortable table with sticky headers and filtering

**Design Philosophy**:
- Consistent spacing using LAYOUT_CONSTANTS from `src/constants/layout.js`
- Responsive behavior for mobile, tablet, desktop
- Material Design patterns (Drawer, AppBar, Paper)
- Sticky headers and breadcrumb navigation

### Common Components (`common/`)

**Purpose**: Reusable UI components shared across multiple views

**Key Components**:

**Asset & Display**:
- **AssetTile**: Asset card with traffic light status indicators (grid/list layouts)
- **AssetAvatar**: Asset image/avatar with fallback handling

**Filtering & Search**:
- **FilterChip**: Toggle chip for inline filtering
- **FilterDrawer**: Bottom sheet drawer for multi-dimensional filtering (mobile)
- **FilterFAB**: Floating action button to open FilterDrawer
- **SearchBar**: Desktop search input with dropdown results (TopBar)
- **SearchDropdown**: Search results dropdown with categorized results
- **SearchResultItem**: Individual search result item
- **MobileSearchOverlay**: Full-screen search interface for mobile

**Navigation & Layout**:
- **CategoryTabs**: Horizontal scrolling category filter tabs
- **BottomTabBar**: Material Design bottom navigation (mobile)
- **ScrollContainer**: Custom scroll container with ref forwarding

**Health & Analytics**:
- **HealthScore**: Circular percentage indicator (0-100%)
- **HealthDonut**: SVG donut chart for status distribution
- **HorizontalStackedBar**: Proportional bar chart for priority distribution
- **StickyHealthHeader**: Compact health metrics (mobile sticky header)
- **StatusTrafficLights**: Traffic light indicators with counts

**Interactive Elements**:
- **ExpandableRow**: Collapsible table rows for nested data
- **ClickableCard**: Clickable card wrapper with hover effects

**Design Philosophy**:
- Presentational components with no business logic
- Reusable across multiple views and contexts
- Material-UI Chip, Card, Badge patterns
- Responsive sizing and touch-friendly targets

### Detail Components (`detail/`)

**Purpose**: Tab components used exclusively in DetailView for displaying entity details

**Key Components**:
- **InfoTab**: Schema-driven metadata display (works for all entity types)
- **RegulatoryAffairsTab**: Affairs table with primary attachment quick actions
- **RenewalsTab**: Renewals table with status and approval info
- **AttachmentsTab**: Attachments table with view/download/delete actions
- **RelatedTab**: Related assets with category filtering

**Design Philosophy**:
- Schema-based rendering from `src/data/contexts/regulatory_affairs/schemas/`
- Consistent table patterns (sticky headers, sortable columns)
- Status chips using 4-dimension system
- Empty states with helpful CTAs

### Dashboard Components (`dashboard/`)

**Purpose**: Specialized visualization components for analytics dashboard

**Key Components**:
- **DashboardCard**: Standardized card wrapper for dashboard visualizations
- **DonutChart**: SVG donut chart for status distribution
- **TrendChart**: Time-series area chart for compliance trends
- **WorkflowKanban**: Compact workflow pipeline visualization
- **ComplianceTimeline**: Timeline visualization of compliance events
- **CompliancePriorityMatrix**: Matrix view of compliance vs priority
- **ComplianceLegendCards**: Legend cards for chart explanations

**Design Philosophy**:
- Domain-agnostic chart components (reusable across different data types)
- Consistent styling and spacing via DashboardCard wrapper
- Responsive sizing and interactive hover states
- Configurable series and data keys

---

## Shared Patterns

### Status Badge Styling

Components use consistent status chip styling:

```jsx
<Chip
  label={getUIText(metadata.labelKey, language)}
  icon={<metadata.icon />}
  sx={{
    bgcolor: metadata.color,
    color: metadata.textColor,
    fontWeight: 500,
    fontSize: '0.75rem'
  }}
  size="small"
/>
```

### Traffic Light Pattern

```jsx
<StatusTrafficLights
  counts={{
    current: 5,
    expiring: 2,
    expired: 1
  }}
  showDocument={true}
/>
```

Renders: 📄 🟢 5  🟡 2  🟥 1

### Image Handling

```jsx
// In AssetTile, AssetAvatar, PageHeader
<img
  src={asset.image}
  alt={asset.name}
  onError={(e) => { e.target.style.display = 'none'; }}
  style={{ objectFit: 'contain' }}
/>
```

- Falls back to letter avatar on error
- Uses `object-fit: contain` to preserve aspect ratio
- Avatar uses primary color background

### Hover Effects

```javascript
'&:hover': {
  boxShadow: 6,
  transform: 'translateY(-2px)',  // AssetTile (grid)
  // OR
  transform: 'translateX(2px)',   // AssetTile (list)
  // OR
  bgcolor: 'action.hover',        // FilterChip
}
```

### Internationalization

All text uses `getUIText(key, language)` from `src/utils/i18nHelpers.js`:

```jsx
import { getUIText } from '../../utils/i18n';

<Typography>{getUIText('health_score', language)}</Typography>
<Chip label={getUIText('compliance_current', language)} />
```

---

## Performance Considerations

### Current Optimizations

- **React.memo**: AssetTile memoized (prevents re-renders on parent state change)
- **useMemo/useCallback**: Used in hooks (useAssetDimensionCounts, useRenewalStatusData)
- **Lazy loading**: Views loaded on demand via React Router
- **SVG icons**: Material-UI icons are tree-shakable
- **No unnecessary re-renders**: Context providers at appropriate levels

### Future Optimizations (if dataset grows > 1000 items)

- Virtual scrolling for long lists (react-window)
- Image lazy loading with Intersection Observer
- Memoize expensive chart calculations
- Code splitting for large components
- Debounce search input (currently 300ms)
- Preload detail views on hover

---

## Component File Size Guidelines

- **Small components** (< 100 lines): FilterChip, StatusTrafficLights, AssetAvatar
- **Medium components** (100-300 lines): AssetTile, SearchBar, HealthDonut, InfoTab
- **Large components** (300-500 lines): DataTable, DashboardView, DetailView
- **Very large** (> 500 lines): Consider splitting into sub-components or hooks

**When to split**:
- Component has multiple responsibilities
- Lots of conditional rendering logic
- Complex state management
- Reusable patterns within the component

---

## Naming Conventions

**Components**:
- PascalCase: `AssetTile.jsx`, `SearchBar.jsx`
- Descriptive names: `MobileSearchOverlay` (not `MobileSearch`)
- Suffix for variants: `FilterDrawer`, `FilterFAB`, `FilterChip`

**Props**:
- camelCase: `selectedCategories`, `onBusinessChange`
- Handlers: `on*` prefix (`onClick`, `onFilterChange`)
- Boolean: `is*` or `has*` prefix (`isOpen`, `hasFilters`)

**Files**:
- One component per file (main export)
- Subcomponents in same file if < 50 lines and not reusable
- Index files for barrel exports (future consideration)


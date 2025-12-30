# Common Components - Design Context

## Purpose

Shared, reusable components used throughout the application. These are presentational components with minimal business logic dependencies, designed to be composed into larger views and layouts.

**Component Categories**:
- **Asset & Display**: AssetTile, AssetAvatar
- **Filtering & Search**: FilterChip, FilterDrawer, FilterFAB, SearchBar, SearchDropdown, SearchResultItem, MobileSearchOverlay
- **Navigation & Layout**: CategoryTabs, BottomTabBar, ScrollContainer
- **Health & Analytics**: HealthScore, HealthDonut, HorizontalStackedBar, StickyHealthHeader, StatusTrafficLights
- **Interactive Elements**: ExpandableRow, ClickableCard

---

## Asset & Display Components

### AssetTile.jsx

**Purpose**: Display individual asset with traffic light compliance status indicators

**Design Decisions**:
- **Traffic light system**: Uses `StatusTrafficLights` scoped to compliance counts by default
- **Two layouts**: Grid (vertical card) and List (horizontal row)
- **Clickable**: Entire tile navigates to asset detail view
- **Avatar fallback**: Shows letter avatar when no image available
- **Memoized**: Wrapped in React.memo for performance

**Key Innovation**: Traffic Light Compliance Indicators

Instead of a single status badge, the tile surfaces compliance counts pulled from the aggregated dimension data:
- **Green (Current)**: Regulatory affairs that are fully compliant
- **Yellow (Expiring)**: Affairs within their reminder window
- **Red (Expired)**: Affairs that are past due
- **Neutral (Permanent)**: Affairs without expiry when applicable

This provides **instant visual assessment** of compliance status without drilling down, mirroring the rest of the dashboard color language.

#### Grid View Layout

**Visual Structure**:
```
┌─────────────────┐
│                 │
│  Image/Avatar   │
│                 │
├─────────────────┤
│  Asset Name     │
│  🟢2 🟡1 🟥0    │
└─────────────────┘
```

**Design Choices**:
- **Vertical card**: Image/avatar at top
- **Centered content**: Name and status indicators below image
- **Compact name**: Limited to 2 lines with ellipsis
- **Responsive aspect ratio**: 60-80% padding-top based on viewport
- **Hover effect**: Elevation increase + slight upward translate

**Image Handling**:
- Uses `<img>` with `object-fit: contain` if image URL provided
- Falls back to Material-UI Avatar with first letter if no image
- On image error, hides img and shows letter avatar
- Avatar uses primary color background

#### List View Layout

**Visual Structure**:
```
┌──────┬─────────────────────────────────────────────┐
│Avatar│ Asset Name              🟢2 🟡1 🟥0        │
│      │ Activities description                     │
└──────┴─────────────────────────────────────────────┘
```

**Design Choices**:
- **Horizontal layout**: Avatar (48-64px) on left
- **Flex content area**: Name on top row, activities on bottom
- **Status on right**: Traffic lights right-aligned
- **Full width**: Uses available horizontal space
- **Responsive sizes**: Larger avatar and text on desktop

**Text Handling**:
- Name: Single line with ellipsis
- Activities: Single line with ellipsis (secondary color)
- Both nowrap to prevent wrapping in tight spaces

### Traffic Light Implementation

```jsx
<StatusTrafficLights
  dimensionCounts={asset.dimensionCounts}
  language={language}
  size={viewMode === 'list' ? 'medium' : 'small'}
  showDimensions={trafficLightDimensions}
/>
```

- Default `trafficLightDimensions = ['compliance']` keeps home/Carousel cards focused solely on compliance
- `StatusTrafficLights` renders colored dots, tooltips, and localized labels for each requested dimension
- Consumers can override the prop (e.g., `['compliance', 'workflow']`) if a future layout needs more context
- Compact layout ensures the indicator fits comfortably within both grid and list tiles

**Props**:
```typescript
interface AssetTileProps {
  asset: {
    id: string;
    name: string;
    category: string;
    activities: string;
    image?: string;
    dimensionCounts?: {
      compliance?: Record<string, number>;
      lifecycle?: Record<string, number>;
      workflow?: Record<string, number>;
      priority?: Record<string, number>;
    };
  };
  viewMode: 'grid' | 'list';
  language?: 'es' | 'en';
  trafficLightDimensions?: Array<'lifecycle' | 'compliance' | 'workflow' | 'priority'>;
}
```

**Note**: `dimensionCounts` are pre-aggregated using `useAssetDimensionCounts` hook.

#### Navigation

**onClick Handler**:
```javascript
const handleCardClick = () => {
  navigate(`/${asset.category}/${asset.id}/info`);
};
```

Navigates to asset detail view, Info tab by default.

#### Performance

**Memoization**:
```javascript
export default memo(AssetTile);
```

Re-renders only when props change. Important for large lists (40+ assets).

---

### AssetAvatar.jsx

**Purpose**: Reusable asset image/avatar component with consistent fallback handling

**Design Decisions**:
- **Image first**: Try to load asset image
- **Letter fallback**: Show first letter of name if image fails
- **Size variants**: Small (32px), medium (48px), large (64px), xlarge (120px)
- **Consistent styling**: Uses primary color for letter avatar background

**Props**:
```typescript
interface AssetAvatarProps {
  asset: {
    name: string;
    image?: string;
  };
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  sx?: object;
}
```

**Usage**:
```jsx
<AssetAvatar asset={asset} size="large" />
```

Used in: AssetTile, PageHeader, SearchResultItem

---

## Filtering & Search Components

### FilterChip.jsx

**Purpose**: Reusable chip component for inline filtering in detail view tabs

**Design Decisions**:
- **Clickable toggle**: Click to activate/deactivate filter
- **Visual feedback**: Color changes when selected
- **Icon support**: Can display icon before label
- **Consistent styling**: Material-UI Chip with theme colors
- **Used for 4-dimension filtering**: Compliance, workflow, priority, lifecycle

**Visual States**:

**Unselected**:
```
┌────────────┐
│  Label     │  Default color, outlined
└────────────┘
```

**Selected**:
```
┌────────────┐
│  Label     │  Primary color, filled
└────────────┘
```

#### Usage Examples

**Filter by compliance status**:
```jsx
<FilterChip
  label={getUIText('compliance_current', language)}
  selected={filters.compliance === 'current'}
  onClick={() => handleFilterChange('compliance', 'current')}
  icon={<CheckCircleIcon />}
/>
```

**Filter by workflow status**:
```jsx
<FilterChip
  label={getUIText('workflow_submitted', language)}
  selected={filters.workflow === 'submitted'}
  onClick={() => handleFilterChange('workflow', 'submitted')}
  icon={<SendIcon />}
/>
```

**Filter by priority**:
```jsx
<FilterChip
  label={getUIText('priority_critical', language)}
  selected={filters.priority === 'critical'}
  onClick={() => handleFilterChange('priority', 'critical')}
  icon={<PriorityHighIcon />}
/>
```

**Props**:
```typescript
interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
}
```

---

### FilterDrawer.jsx

**Purpose**: Bottom sheet drawer for multi-dimensional filtering on mobile and tablet

**Design Decisions**:
- **Material Design bottom sheet**: Slides up from bottom
- **Multi-select filters**: Checkboxes for multiple values per dimension
- **Expandable sections**: Accordion sections for Compliance, Workflow, Priority, Category, Type, etc.
- **Active count badges**: Shows number of active filters per section
- **Search within filters**: Filter long lists (e.g., many authorities)
- **Clear all button**: One-click to reset all filters
- **Apply/Close actions**: Explicit apply action (mobile best practice)

**Key Features**:
- Context-aware: Shows only relevant filter options for current dataset
- Persists state: Filters maintained until explicitly cleared
- Responsive: Full height on mobile, partial height on tablet
- Touch-friendly: Large touch targets (48px minimum)

**Props**:
```typescript
interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: object;
  onFiltersChange: (filters: object) => void;
  availableOptions: {
    compliance: string[];
    workflow: string[];
    priority: string[];
    category: string[];
    type: string[];
    // ... other dimensions
  };
}
```

**Usage**:
```jsx
<FilterDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  filters={activeFilters}
  onFiltersChange={setActiveFilters}
  availableOptions={availableFilterOptions}
/>
```

Used in: DashboardView (mobile), DetailView tabs (mobile)

---

### FilterFAB.jsx

**Purpose**: Floating action button to open FilterDrawer on mobile

**Design Decisions**:
- **Bottom-right position**: Standard FAB placement (16px from edges)
- **Badge count**: Shows number of active filters
- **Filter icon**: Material Design filter icon
- **Only visible on mobile**: Hidden on desktop (inline chips used instead)
- **High z-index**: Always visible above other content

**Props**:
```typescript
interface FilterFABProps {
  onClick: () => void;
  activeFilterCount: number;
}
```

**Usage**:
```jsx
<FilterFAB
  onClick={() => setDrawerOpen(true)}
  activeFilterCount={Object.keys(activeFilters).length}
/>
```

---

### SearchBar.jsx

**Purpose**: Desktop search input component with dropdown results (TopBar)

**Design Decisions**:
- **Prominent placement**: Center of TopBar for easy access
- **Fuzzy search**: Uses Fuse.js for typo-tolerant search
- **Real-time results**: Dropdown appears as user types
- **Keyboard navigation**: Arrow keys, Enter to select, Escape to close
- **Debounced**: 300ms debounce to reduce search calls
- **Multi-entity search**: Searches assets, affairs, renewals, attachments

**Key Features**:
- **Token-based matching**: Multi-word queries match all tokens (e.g., "empresa activa")
- **Weighted fields**: Prioritizes name matches over description matches
- **Score threshold**: 0.35 threshold for relevance (typo-tolerant)
- **Categorized results**: Groups results by entity type

**Props**:
```typescript
interface SearchBarProps {
  onResultSelect?: (result: SearchResult) => void;
}
```

**Internal State**:
- `query` (string): Current search query
- `results` (SearchResult[]): Categorized search results
- `isOpen` (boolean): Dropdown visibility
- `selectedIndex` (number): Keyboard navigation index

**Usage**:
```jsx
<SearchBar onResultSelect={(result) => navigate(result.path)} />
```

Used in: TopBar (desktop)

---

### SearchDropdown.jsx

**Purpose**: Search results dropdown below SearchBar

**Design Decisions**:
- **Positioned below input**: Absolute positioning relative to SearchBar
- **Categorized results**: Section headers for Assets, Affairs, Renewals, Attachments
- **Scroll if long**: Max height with scroll for many results
- **Empty states**: Helpful messages when no results or no query
- **View all action**: Future enhancement for pagination

**Props**:
```typescript
interface SearchDropdownProps {
  results: {
    assets: SearchResult[];
    affairs: SearchResult[];
    renewals: SearchResult[];
    attachments: SearchResult[];
  };
  onResultClick: (result: SearchResult) => void;
  selectedIndex: number;
}
```

---

### SearchResultItem.jsx

**Purpose**: Individual search result item in dropdown

**Design Decisions**:
- **Icon**: Category-specific icon (Business, Product, Document, etc.)
- **Two-line layout**: Name + description/metadata
- **Truncated text**: Ellipsis for long names/descriptions
- **Hover highlight**: Visual feedback on hover
- **Keyboard highlight**: Visual feedback when selected via keyboard

**Props**:
```typescript
interface SearchResultItemProps {
  result: {
    type: 'asset' | 'affair' | 'renewal' | 'attachment';
    name: string;
    description: string;
    category: string;
    path: string;
  };
  onClick: () => void;
  isSelected: boolean;
}
```

**Icon Mapping**:
```javascript
const iconMap = {
  empresa: BusinessIcon,
  producto: InventoryIcon,
  persona: PersonIcon,
  vehiculo: DirectionsCarIcon,
  regulatory_affair: GavelIcon,
  renewal: UpdateIcon,
  attachment: DescriptionIcon,
  // ... others
};
```

---

### MobileSearchOverlay.jsx

**Purpose**: Full-screen search interface for mobile devices

**Design Decisions**:
- **Full-screen modal**: Covers entire viewport
- **Large input**: Touch-friendly search input at top
- **Scrollable results**: Categorized results below input
- **Swipe to close**: Swipe down gesture to close (future enhancement)
- **Back button**: Close button at top-left

**Key Features**:
- Triggered by search icon in TopBar (mobile)
- Same Fuse.js search logic as SearchBar
- Larger touch targets for mobile
- No keyboard navigation (touch interface)

**Props**:
```typescript
interface MobileSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}
```

**Usage**:
```jsx
<MobileSearchOverlay
  open={mobileSearchOpen}
  onClose={() => setMobileSearchOpen(false)}
/>
```

Used in: TopBar (mobile)

---

## Navigation & Layout Components

### CategoryTabs.jsx

**Purpose**: Horizontal scrolling tabs for category filtering

**Design Decisions**:
- **Material-UI Tabs**: Scrollable variant for mobile
- **Icon + label**: Category icon with translated label
- **All categories tab**: "Todos" tab shows all items
- **Count badges**: Shows item count per category (future)
- **Sticky position**: Can be used as sticky header

**Props**:
```typescript
interface CategoryTabsProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: Array<{
    id: string;
    labelKey: string;
    icon: ReactElement;
    count?: number;
  }>;
}
```

**Usage**:
```jsx
<CategoryTabs
  selectedCategory={selectedCategory}
  onCategoryChange={setSelectedCategory}
  categories={ASSET_CATEGORIES}
/>
```

Used in: DashboardView, HomeView (future), CategoryView (future)

---

### BottomTabBar.jsx

**Purpose**: Material Design bottom navigation for mobile

**Design Decisions**:
- **Fixed bottom**: Always visible at bottom of screen (56px height)
- **Four primary tabs**: Home, Dashboard, Search, Profile
- **Active indicator**: Color highlight for current tab
- **Icon + label**: Icon above short label
- **Only mobile**: Hidden on desktop (>= sm breakpoint)

**Tabs**:
1. **Home**: Navigate to `/` (HomeView)
2. **Dashboard**: Navigate to `/dashboard` or `/panel` (DashboardView)
3. **Search**: Open MobileSearchOverlay
4. **Profile**: Navigate to profile (future)

**Props**:
```typescript
interface BottomTabBarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}
```

**Usage**:
```jsx
<BottomTabBar currentTab={currentTab} onTabChange={setCurrentTab} />
```

Used in: MainLayout (mobile)

---

### ScrollContainer.jsx

**Purpose**: Custom scroll container with ref forwarding

**Design Decisions**:
- **Ref forwarding**: Allows parent to control scroll position
- **Custom scrollbar**: Themed scrollbar styling
- **Performance**: Uses native scroll, not custom implementation
- **Overflow handling**: Hidden x-axis, auto y-axis

**Props**:
```typescript
interface ScrollContainerProps {
  children: ReactNode;
  sx?: object;
}
```

**Usage with ref**:
```jsx
const scrollRef = useRef(null);

<ScrollContainer ref={scrollRef}>
  <Content />
</ScrollContainer>
```

Used in: PageLayout, DashboardView, DetailView

---

## Health & Analytics Components

### HealthScore.jsx

**Purpose**: Circular percentage indicator for overall compliance health (0-100%)

**Design Decisions**:
- **SVG circle progress**: Animated circular progress ring
- **Color-coded**: Green (> 80%), Yellow (50-80%), Red (< 50%)
- **Large percentage**: Central number display with % symbol
- **Responsive size**: 80-120px diameter based on viewport
- **Animated**: Smooth transition when value changes

**Calculation**:
```javascript
healthScore = (current + permanent) / (current + expiring + expired + permanent) * 100
```

Where current/expiring/expired/permanent are compliance status counts.

**Props**:
```typescript
interface HealthScoreProps {
  score: number;  // 0-100
  size?: 'small' | 'medium' | 'large';
}
```

**Usage**:
```jsx
<HealthScore score={85} size="large" />
```

Used in: PageHeader (DashboardView), StickyHealthHeader (mobile)

---

### HealthDonut.jsx

**Purpose**: SVG donut chart for status distribution visualization

**Design Decisions**:
- **Interactive**: Hover highlights segment and shows tooltip
- **Animated**: Smooth transitions when data changes
- **Legend**: Shows labels, colors, counts, percentages
- **Responsive size**: 160-240px diameter based on viewport
- **Accessible**: Screen reader labels for each segment

**Data Structure**:
```typescript
interface DonutSegment {
  labelKey: string;  // i18n key
  value: number;     // count
  color: string;     // hex color
}
```

**Props**:
```typescript
interface HealthDonutProps {
  data: DonutSegment[];
  title?: string;
  size?: 'small' | 'medium' | 'large';
}
```

**Usage**:
```jsx
<HealthDonut
  title={getUIText('compliance_distribution', language)}
  data={[
    { labelKey: 'compliance_current', value: 25, color: '#2BA87F' },
    { labelKey: 'compliance_expiring', value: 5, color: '#FDD835' },
    { labelKey: 'compliance_expired', value: 2, color: '#EF4444' },
  ]}
  size="medium"
/>
```

Used in: DashboardView (Compliance & Workflow charts)

---

### HorizontalStackedBar.jsx

**Purpose**: 100% width bar divided into proportional segments

**Design Decisions**:
- **Proportional segments**: Width = (segment value / total) * 100%
- **Color-coded**: Each segment uses semantic color
- **Hover tooltips**: Shows segment label, count, percentage
- **Responsive height**: 24-32px based on viewport
- **Legend**: Shows all segments with colors and counts

**Props**:
```typescript
interface StackedBarSegment {
  labelKey: string;
  value: number;
  color: string;
}

interface HorizontalStackedBarProps {
  data: StackedBarSegment[];
  title?: string;
}
```

**Usage**:
```jsx
<HorizontalStackedBar
  title={getUIText('priority_distribution', language)}
  data={[
    { labelKey: 'priority_critical', value: 3, color: '#EF4444' },
    { labelKey: 'priority_high', value: 8, color: '#F59E0B' },
    { labelKey: 'priority_medium', value: 15, color: '#3B82F6' },
    { labelKey: 'priority_low', value: 6, color: '#10B981' },
  ]}
/>
```

Used in: DashboardView (Priority Distribution)

---

### StickyHealthHeader.jsx

**Purpose**: Compact health metrics header that sticks on scroll (mobile)

**Design Decisions**:
- **Mobile only**: Hidden on desktop (full PageHeader visible)
- **Sticky positioning**: Sticks to top of content area when scrolling
- **Compact layout**: Single row with health score + compliance counts
- **Smooth transitions**: Fade in/out, slide animations
- **High z-index**: Stays above scrolling content

**Key Features**:
- Appears when PageHeader scrolls out of view
- Shows mini HealthScore (40px) + traffic light counts
- Uses PageScrollContext to detect scroll position

**Props**:
```typescript
interface StickyHealthHeaderProps {
  healthScore: number;
  complianceCounts: {
    current: number;
    expiring: number;
    expired: number;
  };
}
```

**Usage**:
```jsx
<StickyHealthHeader
  healthScore={85}
  complianceCounts={{ current: 25, expiring: 5, expired: 2 }}
/>
```

Used in: DashboardView (mobile)

---

### StatusTrafficLights.jsx

**Purpose**: Reusable traffic light component showing compliance counts

**Design Decisions**:
- **Compact design**: Attachment icon + colored dots + counts
- **Three lights**: Green (current), Yellow (expiring), Red (expired)
- **Consistent styling**: Matches AssetTile implementation
- **Optional attachment icon**: Can hide icon for ultra-compact display
- **Semantic colors**: Uses theme success/warning/error colors

**Props**:
```typescript
interface StatusTrafficLightsProps {
  dimensionCounts?: {
    compliance?: Record<string, number>;
    workflow?: Record<string, number>;
    lifecycle?: Record<string, number>;
    priority?: Record<string, number>;
  };
  showDocument?: boolean;  // default: true
  size?: 'small' | 'medium' | 'large';
  language?: 'es' | 'en';
  showDimensions?: Array<'lifecycle' | 'compliance' | 'workflow' | 'priority'>;
}
```

**Visual Output**:
```
📄 🟢 5  🟡 2  🟥 1
```

**Usage**:
```jsx
<StatusTrafficLights
  dimensionCounts={asset.dimensionCounts}
  showDocument={true}
  size="medium"
  showDimensions={['compliance']}
/>
```

Used in: AssetTile, StickyHealthHeader, PageHeader (future)

---

## Interactive Elements

### ExpandableRow.jsx

**Purpose**: Collapsible table row for nested data

**Design Decisions**:
- **Two-row structure**: Main row + expandable detail row
- **Expand/collapse icon**: Chevron icon indicates state
- **Smooth animation**: Slide down/up animation
- **Nested table**: Detail row can contain another table
- **Independent state**: Each row's expand state is independent

**Props**:
```typescript
interface ExpandableRowProps {
  mainContent: ReactNode;
  detailContent: ReactNode;
  defaultExpanded?: boolean;
}
```

**Usage**:
```jsx
<ExpandableRow
  mainContent={
    <>
      <TableCell>{affair.name}</TableCell>
      <TableCell>{affair.category}</TableCell>
      <TableCell>{affair.status}</TableCell>
    </>
  }
  detailContent={
    <Table>
      {/* Nested renewals table */}
      {renewals.map(renewal => (
        <TableRow key={renewal.id}>
          <TableCell>{renewal.name}</TableCell>
          <TableCell>{renewal.expiryDate}</TableCell>
        </TableRow>
      ))}
    </Table>
  }
/>
```

Used in: DashboardView (affairs table with nested renewals)

---

### ClickableCard.jsx

**Purpose**: Clickable card wrapper with consistent hover effects

**Design Decisions**:
- **Material-UI Card**: Uses Paper component
- **Hover elevation**: Increases shadow on hover
- **Cursor pointer**: Indicates clickability
- **Ripple effect**: Material Design touch ripple
- **Flexible content**: Accepts any children

**Props**:
```typescript
interface ClickableCardProps {
  onClick: () => void;
  children: ReactNode;
  elevation?: number;  // default: 1
  sx?: object;
}
```

**Usage**:
```jsx
<ClickableCard onClick={() => navigate(`/affair/${id}`)}>
  <CardContent>
    <Typography variant="h6">{name}</Typography>
    <Typography variant="body2">{description}</Typography>
  </CardContent>
</ClickableCard>
```

Used in: Future dashboards, card grids

---

## Shared Patterns

### 4-Dimension Status System

All status-related components use the 4-dimension system:

**Compliance Colors** (from `src/utils/status.js`):
```javascript
const COMPLIANCE_COLORS = {
  current: '#2BA87F',    // Green - success.main
  expiring: '#FDD835',   // Yellow - warning
  expired: '#EF4444',    // Red - error.main
  permanent: '#6B7280',  // Gray - not shown in traffic lights
};
```

**Workflow Colors**:
```javascript
const WORKFLOW_COLORS = {
  in_preparation: '#9C27B0',  // Purple
  submitted: '#0EA5E9',       // Blue - info.main
  completed: '#2BA87F',       // Green - success.main
  needs_renewal: '#F59E0B',   // Orange - warning.main
};
```

**Priority Colors**:
```javascript
const PRIORITY_COLORS = {
  critical: '#EF4444',   // Red
  high: '#F59E0B',       // Orange
  medium: '#3B82F6',     // Blue
  low: '#10B981',        // Green
};
```

### Responsive Sizing

All components use responsive sizing with Material-UI breakpoints:

```javascript
sx={{
  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
  padding: { xs: 0.5, sm: 0.75, md: 1 },
  height: { xs: 40, sm: 48, md: 56 },
}}
```

**Breakpoints**:
- xs: 0-600px (mobile)
- sm: 600-960px (tablet portrait)
- md: 960-1280px (tablet landscape / small desktop)
- lg: 1280-1920px (desktop)
- xl: 1920px+ (large desktop)

### Hover Effects

Consistent hover behavior across clickable components:

```javascript
'&:hover': {
  boxShadow: 6,
  transform: 'translateY(-2px)',  // Cards (lift up)
  // OR
  bgcolor: 'action.hover',        // Chips, buttons (background)
  // OR
  opacity: 0.8,                   // Icons
}
```

### Internationalization

All text uses `getUIText(key, language)` from `src/utils/i18nHelpers.js`:

```jsx
import { getUIText } from '../../utils/i18n';

<Typography>{getUIText('health_score', language)}</Typography>
<FilterChip label={getUIText('compliance_current', language)} />
<CategoryTabs categories={categories.map(c => ({
  ...c,
  label: getUIText(c.labelKey, language)
}))} />
```

### Touch Targets (Mobile)

All interactive elements meet WCAG AA standards:

```javascript
// From LAYOUT_CONSTANTS
touchTargets: {
  minimum: 44,    // WCAG 2.1 Level AA minimum
  comfortable: 48,  // Material Design recommendation
  spacing: 8,     // Minimum spacing between targets
}
```

**Implementation**:
```jsx
<IconButton sx={{ minHeight: 48, minWidth: 48 }}>
  <FilterIcon />
</IconButton>
```

### Accessibility

All components follow accessibility best practices:

- **Semantic HTML**: Appropriate elements (button, nav, main, etc.)
- **Keyboard navigation**: Tab, Enter, Space, Arrow keys
- **ARIA labels**: Descriptive labels for screen readers
- **Color contrast**: WCAG AA standards (4.5:1 for text)
- **Focus indicators**: Visible outline on focus
- **Skip links**: Future enhancement for main content

---

## Component Relationships

```
App
  └── MainLayout
        ├── TopBar
        │     └── SearchBar (desktop)
        │           └── SearchDropdown
        │                 └── SearchResultItem
        │     └── MobileSearchOverlay (mobile)
        ├── Sidebar
        └── Routes
              ├── HomeView
              │     └── AssetCarousel
              │           └── AssetTile
              │                 └── StatusTrafficLights
              ├── CategoryView
              │     └── AssetGrid
              │           └── AssetTile
              ├── DashboardView
              │     ├── PageHeader
              │     │     └── HealthScore
              │     ├── CategoryTabs
              │     ├── HealthDonut (x2: compliance, workflow)
              │     ├── HorizontalStackedBar (priority)
              │     ├── ExpandableRow (affairs with nested renewals)
              │     ├── StickyHealthHeader (mobile)
              │     ├── FilterFAB (mobile)
              │     └── FilterDrawer (mobile)
              ├── DetailView
              │     ├── PageHeader
              │     │     └── AssetAvatar
              │     ├── FilterChip (desktop inline filters)
              │     ├── FilterFAB (mobile)
              │     └── FilterDrawer (mobile)
              └── BottomTabBar (mobile)
```

**Component Types**:
- **Leaf components**: AssetAvatar, FilterChip, StatusTrafficLights, HealthScore
- **Container components**: FilterDrawer, SearchDropdown, ExpandableRow
- **Compound components**: AssetTile (uses AssetAvatar + StatusTrafficLights)

---


## File Size & Complexity

**Small components** (< 100 lines):
- AssetAvatar, FilterChip, StatusTrafficLights, ClickableCard, FilterFAB

**Medium components** (100-300 lines):
- AssetTile, SearchResultItem, CategoryTabs, BottomTabBar, HealthScore, ScrollContainer

**Large components** (300-500 lines):
- SearchBar, SearchDropdown, HealthDonut, HorizontalStackedBar, FilterDrawer, ExpandableRow, StickyHealthHeader, MobileSearchOverlay

**When to split**:
- Component has multiple distinct UI sections
- Complex state management (> 5 state variables)
- Lots of conditional rendering
- Reusable sub-patterns within component

---

## Naming Conventions

**Components**:
- PascalCase: `AssetTile.jsx`, `SearchBar.jsx`, `HealthDonut.jsx`
- Descriptive names: `MobileSearchOverlay` (not `MobileSearch`)
- Purpose-based: `StickyHealthHeader` (not `MobileHeader`)
- Variant suffixes: `FilterDrawer`, `FilterFAB`, `FilterChip`

**Props**:
- camelCase: `selectedCategory`, `onCategoryChange`, `activeFilterCount`
- Handlers: `on*` prefix (`onClick`, `onFilterChange`, `onResultSelect`)
- Boolean: `is*` or `has*` prefix (`isOpen`, `hasFilters`, `showDocument`)
- Data arrays: plural (`categories`, `results`, `segments`)

**Files**:
- One component per file (main export)
- Subcomponents in same file if < 50 lines and not reused elsewhere
- No index files (explicit imports preferred)

---

## Performance Considerations

### Current Optimizations

- **React.memo**: AssetTile, SearchResultItem memoized
- **useMemo**: HealthDonut segment calculations, SearchBar filtered results
- **useCallback**: Event handlers in search and filter components
- **Lazy loading**: Views loaded on demand via React Router
- **SVG optimization**: Material-UI icons are tree-shakable
- **Debouncing**: SearchBar debounces input (300ms)

### Future Optimizations (if needed)

- Virtual scrolling for SearchDropdown with many results
- Image lazy loading with Intersection Observer for AssetTile
- Memoize chart components (HealthDonut, HorizontalStackedBar)
- Code splitting for large filter components
- Web Workers for complex search operations
- Preload detail views on AssetTile hover

---


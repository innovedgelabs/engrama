# Layout Components - Design Context

## Purpose

Core layout components that form the application shell, page structure, and main navigation. These components provide the consistent visual framework and navigation patterns used throughout the application.

**Component Categories**:
- **App Shell**: MainLayout (root wrapper with contexts)
- **Navigation**: TopBar (global nav + search), Sidebar (category filters + language)
- **Page Structure**: PageLayout (page container), PageHeader (hero card), ContentPanel (content wrapper)
- **Content Display**: AssetCarousel (horizontal scroll), AssetGrid (traditional grid)
- **Tables**: DataTable (reusable sortable table)

---

## App Shell Components

### MainLayout.jsx

**Purpose**: Root app shell wrapper providing consistent layout structure and context providers

**Design Decisions**:
- **Context providers**: SidebarContext wraps entire app
- **Flexbox layout**: TopBar + Sidebar + Content
- **Sidebar state**: Managed in SidebarContext (open/closed, isMobile)
- **Responsive**: Mobile uses temporary drawer, desktop permanent drawer
- **State lifting**: Language and business state from App passed down

**Context Providers**:
- **SidebarContext**: Provides `sidebarOpen`, `isMobile`, `toggleSidebar()`
- Used by: TopBar (hamburger menu), PageLayout (spacing), PageHeader (spacing)

**State Management**:
- `sidebarOpen` - Lives in SidebarContext (UI state)
- `language` - Lives in App (es/en)
- `selectedCategories` - Lives in App (shared between Sidebar and HomeView)
- `businesses`, `selectedBusinessId` - Lives in App

**Handlers**:
- `handleSidebarToggle` - Uses SidebarContext toggleSidebar()
- `handleSidebarClose` - Closes sidebar (mobile only)
- `handleLogoClick` - Navigates to `/` and clears filters

**Props**:
```typescript
interface MainLayoutProps {
  children: ReactNode;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  businesses: Business[];
  selectedBusinessId: string;
  onBusinessChange: (id: string) => void;
  selectedBusinessName: string;
  language: 'es' | 'en';
  onLanguageChange: (lang: string) => void;
}
```

**Why SidebarContext?**
- Avoids prop drilling for sidebar state (used by 5+ components)
- Centralizes sidebar open/closed logic
- Provides `isMobile` helper for responsive behavior

---

## Navigation Components

### TopBar.jsx

**Purpose**: Global navigation bar with search, business selection, and user actions

**Design Decisions**:
- **Fixed positioning**: Always visible at top of viewport (64px mobile, 80px desktop)
- **White background**: Clean, modern aesthetic matching sidebar
- **SearchBar integrated**: Center position on desktop, icon opens overlay on mobile
- **Business selector**: Dropdown for switching between business contexts
- **Large logo**: 42-48px on desktop for brand prominence
- **Responsive hamburger menu**: Toggles sidebar on mobile

**Key Features**:
- **Search Integration**:
  - **Desktop**: SearchBar component in center with dropdown results
  - **Mobile**: Search icon opens full-screen MobileSearchOverlay
  - Fuzzy search across all entities (assets, affairs, renewals, attachments)
  - Real-time results as user types (300ms debounce)
- **Business Selection**: Dropdown with logo when business provides `logo` property
- **Clickable Logo**: Navigates home (`/`) and clears all filters
- **User Actions**: Notifications (badge count), settings, avatar with initials
- **Responsive Layout**:
  - **Mobile**: Menu button left, logo center, search icon right, actions right
  - **Desktop**: Logo left, SearchBar center, actions right

**Props**:
```typescript
interface TopBarProps {
  onMenuClick: () => void;
  onLogoClick: () => void;
  businesses: Business[];
  selectedBusinessId: string;
  onBusinessChange: (id: string) => void;
  selectedBusinessName: string;
  showBusinessSelector: boolean;  // Hidden on detail views
}
```

**Layout Constants** (from `src/constants/layout.js`):
```javascript
topBar: {
  height: { mobile: 64, desktop: 80 }
}
```

**Dependencies**:
- SearchBar (desktop search with dropdown)
- MobileSearchOverlay (mobile full-screen search)
- Material-UI AppBar, Toolbar, IconButton
- React Router useNavigate

**Search Integration Details**:
- SearchBar uses Fuse.js for fuzzy matching (typo-tolerant)
- Token-based search: "empresa activa" matches both words
- Score threshold: 0.35 for relevance
- Keyboard navigation: Arrow keys, Enter, Escape
- Results categorized by entity type

---

### Sidebar.jsx

**Purpose**: Left navigation drawer for category filtering and language selection

**Design Decisions**:
- **Material Drawer** component (permanent on desktop, temporary on mobile)
- **Two width states**: 180px (open), 50px (closed) - narrower for efficiency
- **All 9 object types** with Material Design icons (not emojis)
- **Language toggle**: Minimal button anchored to bottom (shows current code: ES/EN)
- **Single-select filtering**: Click to filter one category, click again to clear
- **Smooth transitions**: 0.3s ease for width changes

**Category Filtering**:
- **Single-select behavior**: Only one category can be active at a time
- **Visual feedback**: Selected item has primary color background + white text
- **Clear filters button**: Appears at bottom when category is selected
- **Badge**: Shows count of active filters (0 or 1)
- **Navigation**: Clicking a category updates `selectedCategories` in App state

**Category Icons** (all 9 object types):
```javascript
const CATEGORY_ICONS = {
  empresa: BusinessIcon,
  proveedor: LocalShippingIcon,
  cliente: HandshakeIcon,
  producto: InventoryIcon,
  establecimiento: ApartmentIcon,
  equipo: HandymanIcon,
  vehiculo: DirectionsCarIcon,
  persona: PersonIcon,
  otro_activo: CategoryIcon,
};
```

**Language Toggle**:
- **Location**: Bottom of sidebar (below categories and clear button)
- **Design**: Single pill-shaped button
- **Display**: Shows current language code (ES / EN)
- **Behavior**: Click cycles to next language
- **Persistence**: Stored in App state (future: localStorage)
- **Effect**: Changes all UI text, labels, status badges throughout app

**Responsive Behavior**:
- **Mobile (< md, 960px)**: Temporary drawer, closes after category selection
- **Desktop (≥ md, 960px)**: Permanent drawer, can toggle between open (180px) and closed (50px)
- **Smooth transitions**: Width changes animated with `transition: 'width 0.3s ease'`

**Props**:
```typescript
interface SidebarProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  open: boolean;
  onClose: () => void;
  language: 'es' | 'en';
  onLanguageChange: (lang: string) => void;
}
```

**Layout Constants**:
```javascript
sidebar: {
  openWidth: 180,
  closedWidth: 50,
  transition: '0.3s ease'
}
```

**Category Label Translation**:
Uses `getCategoryLabel(category, language)` from `src/utils/i18nHelpers.js` for translated labels.

---

## Page Structure Components

### PageLayout.jsx

**Purpose**: View-level shell that provides page container, breadcrumb navigation, and scroll management

**Design Decisions**:
- **Fullscreen container**: Fills space from TopBar bottom + Sidebar right to screen edges
- **Breadcrumb navigation**: Clickable hierarchy path
- **Back button**: Optional (hidden on landing pages like Home, Dashboard)
- **Scroll management**: Provides PageScrollContext for scroll position detection
- **Responsive spacing**: Adapts to sidebar open/closed state
- **Bottom offset**: Accounts for BottomTabBar on mobile

**Key Features**:
- **PageScrollContext Provider**: Wraps content with scroll container ref
  - Used by StickyHealthHeader to detect scroll position
  - Allows programmatic scrolling from child components
- **Conditional navigation row**: Only renders when back button or breadcrumbs present
- **Consistent vertical rhythm**: Same top margin whether navigation row is shown or hidden
- **Sidebar-aware**: Adjusts left margin based on sidebar open/closed width

**Props**:
```typescript
interface PageLayoutProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  onBack?: () => void;
  showBackButton?: boolean;  // default: true
}
```

**Key features**: Adjusts margins based on sidebar state, optional back button + breadcrumbs, provides scroll context

**Responsive Behavior**:
- **Breadcrumbs**: Collapse to current label only on small screens (< sm)
- **Back button**: Remains accessible on all screen sizes (when enabled)
- **Mobile**: Adjusts for mobile TopBar height (64px), adds bottom offset for BottomTabBar
- **Desktop**: Uses desktop TopBar height (80px), no bottom offset

**Context Integration**:
- **Consumes**: SidebarContext (for sidebarOpen, isMobile)
- **Provides**: PageScrollContext (scrollContainerRef)

**When to hide back button**:
- Landing views: HomeView, DashboardView
- Any view where "back" doesn't make sense
- Views with custom navigation patterns

---

### PageHeader.jsx

**Purpose**: Hero card for entity pages showing summary, image, status, and actions

**Design Decisions**:
- **Responsive elevation**: Elevated card on desktop, flat Box on mobile
- **Tight mobile spacing**: Reduced top padding (4px) to hug TopBar closely
- **Sticky-ready**: Background + border for sticky headers to cover content beneath
- **Flexible content**: Accepts any children for custom layouts
- **Optional hiding**: `hideOnMobile` prop for secondary views

**Key Features**:
- **Entity Summary**: Image/avatar, name, status chips, description
- **Actions**: Edit button, more menu, share/export (future)
- **Status Display**: Shows 4-dimension status badges (compliance, workflow, priority, lifecycle)
- **Responsive Layout**:
  - **Mobile**: Vertical stack, tight spacing (4px top, 10px bottom)
  - **Desktop**: Horizontal layout with more breathing room

**Mobile Refinements**:
- **Top padding**: `theme.spacing(0.5)` = 4px (hugs TopBar)
- **Bottom padding**: `theme.spacing(1.25)` = 10px (breathing room)
- **Background**: `background.paper` fill to cover content when sticky
- **Border**: Bottom divider for visual separation

**Props**:
```typescript
interface PageHeaderProps {
  children: ReactNode;
  hideOnMobile?: boolean;
  sx?: object;
}
```

**Layout Constants**:
```javascript
pageHeader: {
  padding: { xs: 1.2, sm: 1.6 },
  minHeight: { xs: 110, sm: 130, md: 180 }
}
```

**Usage Examples**:

**DashboardView** (with HealthScore):
```jsx
<PageHeader>
  <Box display="flex" alignItems="center" gap={2}>
    <HealthScore score={85} size="large" />
    <Box>
      <Typography variant="h4">Panel de Control</Typography>
      <Typography variant="body2">Estado de cumplimiento regulatorio</Typography>
    </Box>
  </Box>
</PageHeader>
```

**DetailView** (asset):
```jsx
<PageHeader>
  <Box display="flex" gap={2}>
    <AssetAvatar asset={asset} size="xlarge" />
    <Box flex={1}>
      <Typography variant="h5">{asset.name}</Typography>
      <Typography variant="body2" color="text.secondary">{asset.activities}</Typography>
      <Box display="flex" gap={1} mt={1}>
        <Chip label={getUIText('compliance_current', language)} color="success" size="small" />
        <Chip label={getUIText('workflow_completed', language)} color="success" size="small" />
      </Box>
    </Box>
    <Box>
      <IconButton><EditIcon /></IconButton>
      <IconButton><MoreVertIcon /></IconButton>
    </Box>
  </Box>
</PageHeader>
```

**Sticky Behavior** (mobile):
- StickyHealthHeader appears when PageHeader scrolls out of view
- PageHeader provides full context, StickyHealthHeader shows compact version

---

### ContentPanel.jsx

**Purpose**: Wrapper component for page content sections (tables, charts, forms)

**Design Decisions**:
- **Material-UI Paper**: Elevation 1 for subtle depth
- **Consistent padding**: 16px (2 spacing units)
- **Default table height**: 420px for tables
- **Flexible**: Accepts any children
- **Optional title**: Can include section title

**Key Features**:
- **Consistent styling**: All content panels have same look
- **Responsive**: Padding adjusts for mobile/desktop
- **Height management**: Default height works for most tables, customizable via sx prop

**Props**:
```typescript
interface ContentPanelProps {
  children: ReactNode;
  title?: string;
  elevation?: number;  // default: 1
  sx?: object;
}
```

**Layout Constants**:
```javascript
contentPanel: {
  padding: 2,  // 16px
  defaultTableHeight: 420
}
```

**Usage**: Wrapper for tables, charts, or custom content. Accepts optional title prop and standard Paper elevation/sx props.

---

## Content Display Components

### AssetCarousel.jsx

**Purpose**: Horizontal scrolling carousel for browsing assets by category

**Design Decisions**:
- **Accordion sections**: One per category, all expanded by default
- **Horizontal scrolling**: Assets scroll left/right within each category
- **Navigation arrows**: Show on desktop when content overflows
- **Touch-friendly**: Swipe gestures for mobile/tablet
- **Progressive display**: Shows 1-6 items at once based on viewport
- **Count badges**: Primary color chips showing item count per category

**Responsive Tile Display**:
```javascript
// Width per tile based on breakpoint
xs: 85%    // 1 tile + hint of next
sm: 48%    // ~2 tiles
md: 32%    // ~3 tiles
lg: 19%    // ~5 tiles
xl: 16%    // ~6 tiles
```

**Key Features**:
- **Category count badges**: Primary color chip with count
- **Secondary color border**: Visual separator when accordion expanded
- **Navigation arrows**: Left/right arrows appear on desktop when content overflows
- **Scroll position tracking**: Hides arrows at start/end of scroll
- **Smooth scroll animations**: CSS scroll-behavior: smooth
- **Empty state**: Helpful message when category has no assets

**State**: Tracks accordion expansion and scroll positions per category

**Current Usage**: Default view in HomeView

**Dependencies**:
- @mui/material (Accordion, Chip, Box, IconButton)
- @mui/icons-material (ExpandMore, ChevronLeft, ChevronRight)
- AssetTile
- i18n utils (getCategoryLabel, getUIText)

**Why horizontal scroll?**
- Maximizes screen real estate for asset tiles
- Natural browsing pattern (like Netflix, App Store)
- Works better on ultra-wide monitors
- Reduces vertical scrolling
- Each category gets equal prominence

---

### AssetGrid.jsx

**Purpose**: Traditional grid layout for assets by category (alternative to AssetCarousel)

**Design Decisions**:
- **Accordion sections**: One per category, all expanded by default
- **Responsive grid**: 1-6 columns based on viewport
- **Traditional wrapping**: Assets wrap to next row (no horizontal scroll)
- **Count badges**: Shows item count per category
- **Simpler navigation**: No arrow buttons, just scroll

**Responsive Grid**:
```javascript
// Columns per breakpoint (grid view)
xs: 2 columns (6/12)
sm: 3 columns (4/12)
md: 4 columns (3/12)
lg: 5 columns (2.4/12)
xl: 6 columns (2/12)

// List view (vertical cards)
sm: 1 column (12/12)
md: 2 columns (6/12)
lg: 3 columns (4/12)
xl: 4 columns (3/12)
```

**State Management**:
```typescript
interface GridState {
  expanded: Record<string, boolean>;  // Which accordions are open
}
```

**Props**:
```typescript
interface AssetGridProps {
  assetsByCategory: Record<string, Asset[]>;
  viewMode: 'grid' | 'list';
  language: 'es' | 'en';
}
```

**Usage**:
```jsx
<AssetGrid
  assetsByCategory={groupedAssets}
  viewMode="grid"
  language={language}
/>
```

**Current Usage**: Available but not currently used in HomeView (AssetCarousel is default)

**When to use AssetGrid**:
- Alternative for users who prefer traditional grid
- Better for quick comparison across categories
- Less scrolling when category has few items
- More familiar pattern for some users

**When to use AssetCarousel**:
- Better for browsing large collections
- Works well on ultra-wide screens
- Modern, app-like experience
- Reduces vertical page length

---

## Table Components

### table/DataTable.jsx

**Purpose**: Reusable table component with filtering, sorting, and sticky headers

**Design Decisions**:
- **Material-UI TableContainer**: Simplified structure, sticky headers work correctly
- **Compact size**: `size="small"` for information density
- **Sticky headers**: Column headers remain visible while scrolling
- **Built-in filtering**: Filter chips above table (desktop) or FilterDrawer (mobile)
- **Sortable columns**: Click headers to sort ascending/descending
- **Row actions**: Icon buttons for view/download/delete

**Key Features**:
- **Sticky headers**: Fixed at top during scroll, don't go behind other elements
- **Empty states**: Helpful message when no data matches filters
- **Row click handlers**: Navigate to detail views
- **Action columns**: Icon buttons with tooltips
- **Responsive**: Horizontal scroll on mobile for wide tables
- **Custom scrollbar**: Themed scrollbar styling

**Usage Examples**:

**RegulatoryAffairsTab**:
- Shows affairs with compliance status, category, dates, primary attachment actions
- Columns: Name, Category, Last Update, Next Expiry, Status (4-dimension), Authority, Attachment Actions
- Row click navigates to affair detail view

**RenewalsTab**:
- Shows renewals with workflow status, type, dates, responsible person
- Columns: Name, Type, Approval Date, Expiry, Status (4-dimension), Responsible, Attachments Count
- Row click navigates to renewal detail view

**AttachmentsTab**:
- Shows attachments with type, size, upload info
- Columns: Name, Type, Size, Upload Date, Uploaded By, Actions (view/download/delete)
- Action icons stop propagation (don't trigger row click)

**Why Material-UI TableContainer?**
- **Sticky headers work correctly**: Rows don't scroll behind other elements
- **Built-in scrollbar styling**: Custom theme colors
- **Simpler structure**: Less custom CSS and state management
- **Better performance**: Optimized by Material-UI team
- **Follows best practices**: Material Design guidelines

---

## Design Patterns

### Accordion Pattern

Both AssetCarousel and AssetGrid use Material-UI Accordion for category sections:

**Benefits**:
- Reduce visual clutter when many categories
- Quick collapse of irrelevant categories
- Count visible even when collapsed
- Consistent with modern web app UX
- All expanded by default (progressive disclosure)

**Key features**: Expanded by default, category icon + label + count in header, left border highlight when expanded

### Responsive Width Pattern

Components adapt width/columns based on viewport using Material-UI breakpoints:

```javascript
sx={{
  width: { xs: '85%', sm: '48%', md: '32%', lg: '19%', xl: '16%' },  // AssetCarousel tiles
  // OR
  xs: 6, sm: 4, md: 3, lg: 2.4, xl: 2,  // AssetGrid columns (Grid item)
}}
```

**Progressive enhancement**:
- Mobile first: Start with smallest layout
- Add features/columns as screen size increases
- Touch-friendly targets on mobile (48px minimum)
- More information density on desktop

### Scroll Management Pattern

AssetCarousel tracks scroll position to show/hide navigation arrows:

```javascript
const updateScrollPosition = (category) => {
  const container = scrollRefs[category].current;
  if (!container) return;

  const { scrollLeft, scrollWidth, clientWidth } = container;
  const atStart = scrollLeft <= 5;  // Small buffer for precision
  const atEnd = scrollLeft + clientWidth >= scrollWidth - 5;

  setScrollPositions(prev => ({
    ...prev,
    [category]: { atStart, atEnd }
  }));
};

// Attach to scroll event
container.addEventListener('scroll', () => updateScrollPosition(category));
```

**Arrow visibility**:
- Left arrow hidden when `atStart === true`
- Right arrow hidden when `atEnd === true`
- Both visible when in middle of scroll

### Context Provider Pattern

MainLayout provides SidebarContext, PageLayout provides PageScrollContext:

```jsx
// MainLayout
<SidebarProvider>
  <Box display="flex">
    <TopBar />
    <Sidebar />
    <Box component="main">
      <Routes />
    </Box>
  </Box>
</SidebarProvider>

// PageLayout
<PageScrollProvider>
  <Box>
    {/* Navigation */}
    <ScrollContainer ref={scrollRef}>
      {children}
    </ScrollContainer>
  </Box>
</PageScrollProvider>
```

**Benefits**:
- Avoid prop drilling
- Centralize state management
- Provide helper functions (toggleSidebar, scrollToTop)
- Clean component APIs

---

## Performance Considerations

### Current Optimizations

- **Context providers**: Only re-render when state actually changes
- **React.memo**: AssetTile memoized (used in carousel/grid)
- **useMemo**: Expensive calculations (grouping assets by category)
- **useCallback**: Event handlers (accordion toggle, scroll handlers)
- **Lazy loading**: Views loaded on demand via React Router
- **Debouncing**: SearchBar debounces input (300ms)

### Future Optimizations (if dataset grows > 1000 items)

- Virtual scrolling for AssetCarousel with many tiles
- Pagination for DataTable with 100+ rows
- Intersection Observer for lazy loading images in carousel
- Memoize category grouping logic
- Code splitting for AssetGrid (if not used often)
- Web Workers for complex filtering/sorting

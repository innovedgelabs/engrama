# Contexts - Design Context

## Directory Purpose

React Context providers that:
- Manage global or shared UI state across components
- Avoid prop drilling through deeply nested component trees
- Provide clean APIs via custom hooks (useSidebar, usePageScroll, useDomain)
- Handle cross-cutting concerns (sidebar state, scroll position, domain data)
- Enable loose coupling between components

**Current Contexts**:
- `SidebarContext.jsx` - Sidebar open/closed state with localStorage persistence
- `PageScrollContext.jsx` - Scroll container ref for scroll position tracking
- `DomainContext.jsx` - Domain configuration and data management

---

## SidebarContext.jsx

**Purpose**: Manages sidebar open/closed state across the application with localStorage persistence and responsive behavior.

**Architecture Overview**:
```
App.jsx
  └── MainLayout (wraps with SidebarProvider)
        ├── TopBar (useSidebar → toggle button)
        ├── Sidebar (useSidebar → variant, open prop)
        └── Content (useSidebar → adjusts margin based on sidebar state)
              └── PageLayout (useSidebar → content area offset)
```

**Key Features**:
- **localStorage persistence**: Sidebar state survives page refreshes
- **Responsive defaults**: Closed on mobile, open on desktop
- **Automatic closing**: Closes sidebar when resizing from desktop to mobile
- **Smooth transitions**: LAYOUT_CONSTANTS.sidebar.transition applied

**Constants**:
```javascript
const SIDEBAR_STORAGE_KEY = 'ead-sidebar-state';
```

**Purpose**: Key for localStorage to persist sidebar state between sessions.

**Why localStorage?**
- User preference should persist across page refreshes
- No backend needed (client-side only state)
- Fallback to responsive default if storage fails

**Initial State Logic**:
```javascript
const getInitialSidebarState = (isMobile) => {
  try {
    // 1. Try to read from localStorage
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';  // Parse string to boolean
    }
  } catch (error) {
    console.warn('Failed to read sidebar state from localStorage:', error);
  }

  // 2. Fall back to responsive default
  return !isMobile;  // Open on desktop, closed on mobile
};
```

**Logic Flow**:
1. **localStorage exists**: Use stored preference (user's last choice)
2. **localStorage fails**: Catch error, log warning, use default
3. **No stored value**: Use responsive default based on screen size

**Responsive Default**:
- **Mobile (< md breakpoint)**: Sidebar closed by default (saves screen space)
- **Desktop (>= md breakpoint)**: Sidebar open by default (always visible)

**Why Try/Catch?**
- localStorage can fail in private browsing mode
- localStorage might be disabled by user/browser settings
- Storage quota exceeded (rare but possible)

**SidebarProvider Component**:
```javascript
export const SidebarProvider = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 1. Initialize state from localStorage or default
  const [sidebarOpen, setSidebarOpen] = useState(() => getInitialSidebarState(isMobile));
  const [previousIsMobile, setPreviousIsMobile] = useState(isMobile);

  // 2. Save to localStorage whenever sidebar state changes
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [sidebarOpen]);

  // 3. Handle responsive behavior: close sidebar when switching to mobile
  useEffect(() => {
    // Only close automatically when transitioning from desktop → mobile
    if (!previousIsMobile && isMobile) {
      setSidebarOpen(false);
    }
    // Update previous state for next comparison
    setPreviousIsMobile(isMobile);
  }, [isMobile, previousIsMobile]);

  // 4. Control methods
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  // 5. Provide context value
  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        closeSidebar,
        openSidebar,
        isMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
```

**State Management**:
- **Primary State**: `sidebarOpen` - boolean state initialized from localStorage or default
- **Tracking State**: `previousIsMobile` - tracks previous mobile state to detect transitions

**Why Lazy Initialization?**
- `useState(() => getInitialSidebarState(isMobile))` only runs once on mount
- Without arrow function, `getInitialSidebarState()` would run on every render
- Performance optimization for localStorage access

**localStorage Persistence**:
```javascript
useEffect(() => {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
  } catch (error) {
    console.warn('Failed to save sidebar state to localStorage:', error);
  }
}, [sidebarOpen]);
```

**Triggers**: Runs whenever `sidebarOpen` changes.

**String Conversion**: `String(sidebarOpen)` converts boolean to `"true"` or `"false"` (localStorage stores strings only).

**Error Handling**: Catches storage quota exceeded, private browsing errors.

**Responsive Behavior**:
```javascript
useEffect(() => {
  // Only close automatically when transitioning from desktop → mobile
  if (!previousIsMobile && isMobile) {
    setSidebarOpen(false);
  }
  // Update the previous state
  setPreviousIsMobile(isMobile);
}, [isMobile, previousIsMobile]);
```

**Behavior Matrix**:
| Previous | Current | Action |
|----------|---------|--------|
| Desktop  | Desktop | No change |
| Desktop  | Mobile  | **Close sidebar** (automatic) |
| Mobile   | Mobile  | No change |
| Mobile   | Desktop | No change (user can manually open) |

**Why Close on Desktop → Mobile?**
- Mobile has limited screen space
- Sidebar would overlap content on mobile
- Better UX to auto-close when shrinking window

**Why NOT Open on Mobile → Desktop?**
- Respect user's current preference
- User might have closed sidebar intentionally
- Less jarring (no unexpected UI changes)

**Control Methods**:
- `toggleSidebar()` - Most common (menu button in TopBar)
- `closeSidebar()` - Explicit close (e.g., click outside sidebar on mobile)
- `openSidebar()` - Explicit open (future feature: keyboard shortcut)

**Why Separate Methods?**
- Clearer intent in component code
- Easier to track usage with analytics
- More flexible than always toggling

**useSidebar Hook**:
```javascript
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};
```

**Purpose**: Convenient hook to access sidebar context with error checking.

**Error Handling**: Throws descriptive error if used outside SidebarProvider (catches developer mistakes early).

**Why Custom Hook?**
- Cleaner than `useContext(SidebarContext)` everywhere
- Enforces proper usage (must be inside provider)
- Single place to add validation, logging, debugging

**Usage Examples**:

#### 1. MainLayout - Wrapping with Provider
```javascript
import { SidebarProvider } from '../contexts/SidebarContext';

function MainLayout({ children }) {
  return (
    <SidebarProvider>
      <Box display="flex">
        <TopBar />
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </SidebarProvider>
  );
}
```

**Why at MainLayout Level?**
- Wraps entire app (all components can access)
- Initialized once at app startup
- State persists across route changes

#### 2. TopBar - Toggle Button
```javascript
import { useSidebar } from '../contexts/SidebarContext';

function TopBar() {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton onClick={toggleSidebar} edge="start">
          <MenuIcon />
        </IconButton>
        {/* ... */}
      </Toolbar>
    </AppBar>
  );
}
```

#### 3. Sidebar - Responsive Variant
```javascript
import { useSidebar } from '../contexts/SidebarContext';

function Sidebar() {
  const { sidebarOpen, closeSidebar, isMobile } = useSidebar();

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={sidebarOpen}
      onClose={closeSidebar}
      sx={{
        width: LAYOUT_CONSTANTS.sidebar.openWidth,
        '& .MuiDrawer-paper': {
          width: sidebarOpen ? LAYOUT_CONSTANTS.sidebar.openWidth : LAYOUT_CONSTANTS.sidebar.closedWidth,
          transition: LAYOUT_CONSTANTS.sidebar.transition,
        }
      }}
    >
      {/* Sidebar content */}
    </Drawer>
  );
}
```

**variant: 'temporary'** (mobile):
- Overlay on top of content
- Backdrop darkens content
- Swipe to close

**variant: 'permanent'** (desktop):
- Part of layout flow
- No backdrop
- Content adjusts margin

---

## PageScrollContext.jsx

**Purpose**: Simple context provider for sharing scroll container ref across components. Used primarily by StickyHealthHeader to detect scroll position.

**Architecture Overview**:
```
PageLayout (wraps with PageScrollProvider)
  └── ScrollContainer (forwardRef, passed as value)
        ├── Content (normal children)
        └── StickyHealthHeader (usePageScroll → detects scroll position)
```

**Key Features**:
- Minimal context (just provides ref, no state)
- Enables scroll position detection without prop drilling
- Used by sticky headers for show/hide behavior

**Provider Component**:
```javascript
export const PageScrollProvider = ({ value, children }) => (
  <PageScrollContext.Provider value={value}>
    {children}
  </PageScrollContext.Provider>
);
```

**Simple**: No state management, just passes through the `value` prop.

**value**: Typically a scroll container ref from PageLayout.

**Why So Simple?**
- Scroll container ref doesn't change (stable reference)
- No need for useState or complex logic
- Just a pipe to pass ref down component tree

**usePageScroll Hook**:
```javascript
export const usePageScroll = () => {
  const context = useContext(PageScrollContext);
  if (!context) {
    throw new Error('usePageScroll must be used within a PageScrollProvider');
  }
  return context;
};
```

**Returns**: Scroll container ref (from PageLayout's ScrollContainer).

**Error Handling**: Throws if used outside provider (developer error).

**Usage Examples**:

#### 1. PageLayout - Providing Scroll Ref
```javascript
import { useRef } from 'react';
import { PageScrollProvider } from '../contexts/PageScrollContext';
import ScrollContainer from '../components/common/ScrollContainer';

function PageLayout({ children }) {
  const scrollRef = useRef(null);

  return (
    <PageScrollProvider value={scrollRef}>
      <Box>
        {/* Breadcrumbs, Header */}
        <ScrollContainer ref={scrollRef}>
          {children}
        </ScrollContainer>
      </Box>
    </PageScrollProvider>
  );
}
```

**scrollRef**: Created in PageLayout, passed to ScrollContainer via ref forwarding.

**PageScrollProvider**: Wraps children, provides scrollRef to descendants.

#### 2. StickyHealthHeader - Detecting Scroll
```javascript
import { useEffect, useState } from 'react';
import { usePageScroll } from '../contexts/PageScrollContext';

function StickyHealthHeader({ healthScore, complianceCounts }) {
  const scrollRef = usePageScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrolled = scrollContainer.scrollTop > 100;
      setIsScrolled(scrolled);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [scrollRef]);

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        transform: isScrolled ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      <HealthScore value={healthScore} size={60} />
      {/* ... */}
    </Box>
  );
}
```

**Behavior**:
- Scroll down > 100px → Header slides in from top
- Scroll back up < 100px → Header slides out

**Why usePageScroll?**
- No need to pass scrollRef through multiple component layers (prop drilling)
- StickyHealthHeader doesn't need to know where ScrollContainer is
- Clean separation of concerns

---

## DomainContext.jsx

**Purpose**: Manages domain configuration and data across the application. Provides domain-specific settings, data, and schemas to components. Enables completely different UX/UI experiences for different business domains.

**Architecture Overview**:
```
App.jsx
  └── DomainProvider (wraps entire app)
        ├── Registers domain configurations
        ├── Stores domain data (keyed by domain ID)
        ├── Preloads domain schemas
        └── Provides current domain context
              └── All components access via useDomain()
```

**Multi-Level Architecture**:

The system supports a **3-level hierarchy**:

1. **Domain** (e.g., `regulatory_affairs`, `pension_fund`) - Completely different application experiences
   - Different entity types (companies/products vs pension plans/beneficiaries)
   - Different routing structures (`/company/:id` vs `/plan/:id`)
   - Different status systems (4-dimension compliance vs pension-specific statuses)
   - Different schemas and field definitions
   - Different UI components and workflows

2. **Business** (e.g., `acme-empresa-alimenticia`) - Different data within a domain
   - Same domain structure, different data sets
   - Same entity types, different instances
   - Same routing, different content
   - Business belongs to one domain (via `business.domainId`)

3. **Organization** (e.g., `food_manufacturing`) - Data folder structure
   - Physical organization of mock data files
   - Maps to business via `domainConfig.dataLoading.organizationMap`

**Key Features**:
- **Multi-domain support**: Can register and switch between multiple domains (completely different UX/UI)
- **Multi-business support**: Can switch businesses within a domain (same UX, different data)
- **Domain-specific data**: Each domain has its own data store (isolated by domain ID)
- **Schema management**: Preloads and caches domain schemas (different schemas per domain)
- **Configuration registry**: Stores domain configurations (routing, entities, status systems, etc.)
- **Automatic domain switching**: When switching businesses, if new business has different `domainId`, domain switches automatically

**DomainProvider Component**:
```javascript
export const DomainProvider = ({
  children,
  initialDomainId = 'regulatory_affairs',
  initialConfig = null,
  initialData = null,
}) => {
  const [currentDomainId, setCurrentDomainId] = useState(initialDomainId);
  const [domainConfigs, setDomainConfigs] = useState(() => {
    const map = new Map();
    if (initialConfig?.id) {
      map.set(initialConfig.id, initialConfig);
    }
    return map;
  });
  const [domainDataById, setDomainDataById] = useState(() => {
    const map = new Map();
    if (initialConfig?.id && initialData) {
      map.set(initialConfig.id, normalizeDomainData(initialData));
    }
    return map;
  });
  const [domainSchemasById, setDomainSchemasById] = useState(() => new Map());

  // ... methods and context value
};
```

**State Management**:
- **currentDomainId**: Currently active domain ID
- **domainConfigs**: Map of domain configurations (routing, entities, etc.)
- **domainDataById**: Map of domain data (assets, affairs, renewals, attachments)
- **domainSchemasById**: Map of domain schemas (entity field definitions)

**Key Methods**:

#### registerDomain
```javascript
const registerDomain = useCallback((config) => {
  // Validates config, stores in domainConfigs
  // Preloads schemas for this domain
  // Logs registration
}, []);
```

**Purpose**: Register a new domain configuration.

**When to Call**: On app initialization or when loading new domain.

#### setDomainData
```javascript
const setDomainData = useCallback((domainId, data) => {
  // Normalizes data structure
  // Stores in domainDataById map
}, []);
```

**Purpose**: Store data for a specific domain.

**When to Call**: When domain data is loaded from backend or mock data.

#### switchDomain
```javascript
const switchDomain = useCallback((domainId) => {
  // Validates domain exists
  // Updates currentDomainId
  // Triggers re-render of all consumers
}, [domainConfigs]);
```

**Purpose**: Switch to a different domain (completely different UX/UI experience).

**When to Call**: 
- When user selects a business with a different `domainId` (automatic in App.jsx)
- When manually switching domains (future: domain selector in UI)

**What Happens on Domain Switch**:
- `currentDomainId` updates → triggers re-render of all `useDomain()` consumers
- Components access new `currentConfig` (different routing, entities, status system)
- Components access new `currentData` (different data structure)
- Routing may change (different URL segments per domain)
- UI components may change (domain-specific components)

#### getEntityConfig
```javascript
const getEntityConfig = useCallback((entityKey) => {
  // Returns entity configuration from current domain
  // Falls back to defaults if not found
}, [currentConfig]);
```

**Purpose**: Get entity-specific configuration (tabs, fields, etc.).

**When to Call**: When rendering entity-specific components.

#### getSchema
```javascript
const getSchema = useCallback((schemaKey) => {
  // Returns schema from current domain
  // Falls back to defaults if not found
}, [currentDomainId, domainSchemasById]);
```

**Purpose**: Get schema for entity type (used by InfoTab).

**When to Call**: When rendering schema-driven components.

**Data Normalization**:
```javascript
const normalizeDomainData = (data = {}) => {
  if (!data || typeof data !== 'object') return data;
  return {
    ...data,
    assets: data.assets ?? [],
    regulatoryAffairs: data.regulatoryAffairs ?? data.regulatory_affairs ?? [],
    renewals: data.renewals ?? [],
    documents: data.documents ?? data.attachments ?? [],
    historicalCompliance: data.historicalCompliance ?? [],
    users: data.users ?? [],
  };
};
```

**Purpose**: Normalize data structure to handle different naming conventions.

**Why Normalize?**
- Backend might use different field names (regulatory_affairs vs regulatoryAffairs)
- Handles missing fields gracefully (defaults to empty arrays)
- Ensures consistent data structure across domains

**useDomain Hook**:
```javascript
export const useDomain = () => {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error('useDomain must be used within DomainProvider');
  }
  return context;
};
```

**Returns**: Domain context with:
- `currentDomainId` - Current domain ID (e.g., `'regulatory_affairs'`, `'pension_fund'`)
- `currentConfig` - Current domain configuration (routing, entities, status system, etc.)
- `currentData` - Current domain data (assets, affairs, renewals, etc. - structure varies by domain)
- `availableDomains` - Array of all registered domain configurations
- `registerDomain` - Register new domain configuration
- `setDomainData` - Store domain data (keyed by domain ID)
- `switchDomain` - Switch to different domain (triggers complete UX/UI change)
- `getPrimaryEntity` - Get primary entity config for current domain
- `getEntityConfig` - Get entity config by entity type
- `getSchemaKey` - Get schema key for entity type
- `getSchema` - Get schema object by entity type or schema key
- `getDomainData` - Get data for specific domain (or current if not specified)

**Usage Examples**:

#### 1. App.jsx - Business Change Triggers Domain Switch
```javascript
import { DomainProvider } from './contexts/DomainContext';
import { loadDomainConfig, loadDomainData } from './utils/domainLoader';

function App() {
  const [selectedBusinessId, setSelectedBusinessId] = useState(DEFAULT_BUSINESS_ID);
  const [currentDomainId, setCurrentDomainId] = useState(
    defaultBusiness?.domainId ?? 'regulatory_affairs'
  );
  const [domainConfig, setDomainConfig] = useState(null);
  const [domainData, setDomainData] = useState(null);

  // Load domain when business or domain changes
  useEffect(() => {
    const loadDomain = async () => {
      const config = await loadDomainConfig(currentDomainId);
      setDomainConfig(config);
      
      // Load business-specific data for this domain
      const data = await loadDomainData(config, selectedBusinessId);
      setDomainData(data);
    };
    loadDomain();
  }, [currentDomainId, selectedBusinessId]);

  // Business change may trigger domain change
  const handleBusinessChange = (businessId) => {
    const nextBusiness = getBusinessById(businessId);
    const nextDomainId = nextBusiness?.domainId ?? 'regulatory_affairs';
    
    setSelectedBusinessId(businessId);
    setCurrentDomainId(nextDomainId); // Domain switches if business.domainId differs
  };

  return (
    <DomainProvider
      initialDomainId={currentDomainId}
      initialConfig={domainConfig}
      initialData={domainData}
    >
      <MainLayout
        onBusinessChange={handleBusinessChange}
        selectedBusinessId={selectedBusinessId}
      >
        <Routes>
          {/* Routes use domainConfig.routing.segments for URL structure */}
        </Routes>
      </MainLayout>
    </DomainProvider>
  );
}
```

**Key Flow**:
1. User selects different business → `handleBusinessChange(businessId)`
2. App checks business's `domainId` → `nextBusiness.domainId`
3. If `domainId` differs from current → `setCurrentDomainId(nextDomainId)`
4. Domain change triggers `useEffect` → loads new domain config and data
5. `DomainProvider` receives new `initialConfig` and `initialData`
6. All components re-render with new domain context
7. Routing, entities, schemas, UI all reflect new domain

#### 2. Component - Accessing Domain Data
```javascript
import { useDomain } from '../contexts/DomainContext';

function HomeView() {
  const { currentData } = useDomain();
  const assets = currentData?.assets ?? [];
  const regulatoryAffairs = currentData?.regulatoryAffairs ?? [];

  // Use domain data
  return <AssetCarousel assets={assets} />;
}
```

#### 3. Component - Accessing Domain Config
```javascript
import { useDomain } from '../contexts/DomainContext';

function DetailView() {
  const { currentConfig, getEntityConfig } = useDomain();
  const entityConfig = getEntityConfig('regulatory_affair');
  const tabOrder = entityConfig?.tabs || ['info', 'renewals'];

  // Use domain config for tabs
  return <Tabs>{tabOrder.map(tab => <Tab key={tab} />)}</Tabs>;
}
```

**Design Decisions**:

#### Why Context for Domain State?

**Alternative 1: Prop Drilling**
- Would require passing domain data through every component
- Hard to switch domains without re-rendering entire tree
- No centralized domain management

**Alternative 2: Global State (Redux, Zustand)**
- Overkill for domain management
- Adds complexity and boilerplate
- Context is sufficient for domain state

**Context Solution**: Best fit for domain configuration and data shared across entire app.

#### Why Multi-Domain Support?

**Use Cases**:
- **Completely different business domains**: `regulatory_affairs` (compliance tracking) vs `pension_fund` (pension management) - different entity types, workflows, UI
- **Multi-tenant scenarios**: Each client may have different domain requirements
- **Demo environments**: Different demo datasets for different business verticals
- **Business switching**: When switching businesses, if they belong to different domains, entire UX/UI changes

**Benefits**:
- **Isolated domain data**: Each domain has separate data store (no cross-contamination)
- **Domain-specific customization**: 
  - Different routing (`/company/:id` vs `/plan/:id`)
  - Different entity types (companies/products vs pension plans/beneficiaries)
  - Different status systems (4-dimension compliance vs pension-specific statuses)
  - Different schemas and field definitions
  - Different UI components and workflows
- **Easy to add new domains**: Just create new `domainConfig.js` and data structure, no code changes needed
- **Business flexibility**: Same business can switch domains, or different businesses can share same domain

**Example: Domain Differences**

**regulatory_affairs Domain**:
- Entities: `company`, `product`, `regulatory_affair`, `renewal`
- Routing: `/company/:id`, `/product/:id`, `/affair/:id`
- Status: 4-dimension system (lifecycle, compliance, workflow, priority)
- Focus: Compliance tracking, expiry management

**pension_fund Domain** (future):
- Entities: `pension_plan`, `beneficiary`, `contribution`, `payment`
- Routing: `/plan/:id`, `/beneficiary/:id`, `/contribution/:id`
- Status: Pension-specific statuses (active, suspended, terminated, etc.)
- Focus: Pension management, benefit calculations

#### Why Schema Preloading?

**Problem**: Schemas might be large, loading on-demand causes delays.

**Solution**: Preload schemas when domain is registered.

**Benefits**:
- Schemas available synchronously (no async loading in components)
- Better performance (no loading delays)
- Cached for reuse

**Trade-off**: Slightly more memory, but schemas are small (< 50KB each).

---

## Design Decisions

### Why Context for Sidebar State?

**Alternative 1: Prop Drilling**
- Every component in tree needs to pass props
- Hard to maintain, error-prone

**Alternative 2: Global State (Redux, Zustand)**
- Overkill for simple UI state
- Adds complexity, boilerplate, dependencies
- Context is sufficient for sidebar (not complex, not high-frequency updates)

**Context Solution**: Best fit for UI state shared across many components.

### Why localStorage Persistence?

**User Expectation**: Sidebar preference should survive page refreshes.

**Alternative**: sessionStorage (resets on tab close) - worse UX.

**Future**: Could sync to user preferences table in backend (when authentication added).

### Why Separate useSidebar Hook?

**Without Custom Hook**: Every component needs error checking

**With Custom Hook**: Clean, error handling built-in, easier to refactor

**Benefits**: Less boilerplate, consistent error handling, easier to refactor

### Why PageScrollContext So Simple?

**Ref Doesn't Change**: ScrollContainer ref is stable (created once, doesn't change).

**No State Needed**: Scroll position tracked in components that need it (StickyHealthHeader), not globally.

**Single Purpose**: Only provides ref, nothing more.

**Why Not useState?**: Ref forwarding is more performant than state updates on every scroll event.

### Why DomainContext?

**Problem**: Domain configuration and data needed across entire app.

**Solution**: Centralized domain management via context.

**Benefits**:
- Single source of truth for domain state
- Easy to switch domains
- Domain-specific customization
- Supports multi-tenant scenarios

---

## Performance Considerations

### SidebarContext

**localStorage Access**: Synchronous (blocks main thread), but:
- Only on mount (read once)
- Only on toggle (write once per user action)
- < 1ms for localStorage operations

**Re-render Impact**:
- Sidebar toggle triggers re-render of all context consumers
- ~10-20 components consume SidebarContext
- Negligible impact (UI state, infrequent updates)

**Optimization (Future)**: Could split context into separate contexts (state vs methods) to reduce re-renders, but not needed currently.

### PageScrollContext

**No Performance Concerns**:
- Ref doesn't change (no re-renders)
- Scroll event listeners in components, not context
- Minimal overhead

### DomainContext

**Schema Preloading**: Async operation, but:
- Happens once per domain registration
- Non-blocking (doesn't prevent app from rendering)
- Cached for reuse

**Data Storage**: Map-based storage is efficient:
- O(1) lookup for domain data
- No performance impact for < 10 domains

---


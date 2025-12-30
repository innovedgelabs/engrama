# Estamos al Día - Design Context & Decisions

## Project Overview

**Type**: Document Management System (DMS)
**Architecture**: Object-based (not folder-based)
**Current Phase**: Mockup/Prototype with mock data
**Tech Stack**: React 18 + Vite + Material-UI v5 + React Router v7 + Fuse.js

### Core Concept

Attachments are organized within **records** that are attached to **objects** (Empresas, Productos, Personas, Vehículos, etc.). Each record represents a collection of related attachments (e.g., a year's tax return with multiple supporting attachments). Think Notion/Airtable/CRM rather than Google Drive/Dropbox.

---

## Design Philosophy

### 1. Modern Web App UX Patterns

- **Search-first**: Prominent search bar as primary navigation
- **Filter chips**: Quick category filters without nested menus
- **Flexible views**: Grid (visual) vs List (information-dense)
- **Status visibility**: Color-coded badges for instant status recognition across compliance/workflow dimensions
- **Progressive disclosure**: Show essential info in cards, details on click

### 2. Visual Identity

- **Navy (#002855)**: Primary brand color, trust, professionalism, main text and titles
- **Mint/Teal (#3ECFA0)**: Secondary color for accents, highlights, compliance status, "all clear" signal
- **White space**: Generous padding for clarity and modern feel
- **Typography**: Roboto for consistency with Material Design
- **Typography scale**: Global `htmlFontSize` set to 15px with tightened heading/body sizes to create a balanced, less oversized feel while preserving visual hierarchy

### 3. User Mental Model

Users manage **assets** (not files). Each asset has:
- Identity (name, code, image)
- Classification (category/type)
- Attributes (activities, location, etc.)
- Associated records (tax returns, certificates, permits, etc.)
- Status (active, pending, expired)

Each record contains:
- Record metadata (name, type, expiry date, etc.)
- Multiple attachments within the record
- Version tracking and approval workflows
- Derived compliance/workflow states for dashboards and filters

### Multi-Dimensional Status Model

The system tracks regulatory compliance across four independent dimensions, enabling granular filtering, reporting, and business logic:

1. **Lifecycle** – Manual field (`active` / `archived`)
2. **Compliance** – Calculated from expiry dates (`current`, `expiring`, `expired`, `permanent`)
3. **Workflow** – Calculated from submission/approval (`in_preparation`, `submitted`, `completed`, `needs_renewal`)
4. **Priority** – Manual weighting field (`critical`, `high`, `medium`, `low`)

**Rationale for 4 Dimensions**:
- **Separation of Concerns**: Lifecycle ≠ Compliance ≠ Workflow ≠ Priority
- **Independent Filtering**: Filter by any dimension without affecting others
- **Flexible Reporting**: Generate reports by compliance, workflow, priority, or combinations
- **Better UX**: Users understand "expired but submitted" vs "expired and not submitted"
- **Future-Proof**: Easy to add additional dimensions (e.g., audit status) without refactoring

Compliance and workflow values are derived from the latest renewal for each affair and stored on the affair object before the UI renders. Asset tiles consume aggregated compliance counts per asset (green/yellow/red) instead of recalculating status client-side.

---

## System Architecture

### Multi-Domain Architecture

The system supports **multiple business domains**, each with completely different UX/UI experiences:

**Domain Level** (e.g., `regulatory_affairs`, `pension_fund`):
- **Completely different application experiences**: Different entity types, routing, status systems, schemas, and UI components
- **Domain-specific configuration**: Each domain has its own `domainConfig.js` defining:
  - Entity types (companies/products vs pension plans/beneficiaries)
  - Routing structure (`/company/:id` vs `/plan/:id`)
  - Status system (4-dimension compliance vs pension-specific statuses)
  - Schema definitions and field structures
  - UI components and workflows

**Business Level** (e.g., `acme-empresa-alimenticia`):
- **Different data within a domain**: Same domain structure, different data sets
- **Business belongs to one domain**: Each business has a `domainId` property
- **Automatic domain switching**: When switching businesses, if the new business has a different `domainId`, the entire domain (and UX/UI) switches automatically

**Organization Level** (e.g., `food_manufacturing`):
- **Data folder structure**: Physical organization of mock data files
- **Maps to business**: Via `domainConfig.dataLoading.organizationMap`

### Data Model (regulatory_affairs Domain)

The `regulatory_affairs` domain uses a **4-entity hierarchical model** for regulatory compliance management:

1. **Assets** - The main business entities (companies, products, people, etc.)
2. **Regulatory Affairs** - Ongoing regulatory obligations attached to assets
3. **Renewals** - Specific updates/renewals of regulatory affairs
4. **Attachments** - Files attached to renewals

This structure reflects real-world compliance workflows where regulatory obligations require periodic renewals, and each renewal has its own documentation.

**Entity Relationships**:
- Assets have many Regulatory Affairs
- Regulatory Affairs have many Renewals
- Renewals have many Attachments
- The latest renewal determines the affair's compliance and workflow status

**Note**: Other domains (e.g., `pension_fund`) will have different entity hierarchies and relationships.

### Component Organization

```
src/
├── components/            # Reusable components
│   ├── layout/           # Layout components (TopBar, Sidebar, PageLayout)
│   ├── common/           # Shared UI components (AssetTile, FilterChip, SearchBar)
│   ├── detail/           # Detail view tab components (InfoTab, RegulatoryAffairsTab)
│   └── dashboard/        # Dashboard-specific components
├── views/                # Page-level components (HomeView, DetailView, DashboardView)
├── data/                 # Mock data, schemas, and enrichment logic
├── utils/                # Utility functions (i18n, status, routing)
├── services/             # Business logic services (search)
├── hooks/                # Custom React hooks (data aggregation)
├── contexts/             # React contexts (SidebarContext, DomainContext)
└── constants/            # App constants (layout spacing)
```

**Why this structure?**
- Clear separation of concerns (layout vs common vs detail)
- Easy to find components by feature area
- Scales well (subfolders for tables, charts, etc.)
- Matches common React patterns
- Domain-driven organization for data (business-specific)
- Services layer for complex business logic
- Hooks for reusable stateful logic
- Constants for app-wide values

### Data Flow

1. **Domain Loading**: App loads domain configuration and data based on selected business
2. **Data Enrichment**: Raw affairs and renewals are enriched with 4-dimension status
3. **Aggregation**: Custom hooks aggregate dimension counts per asset for traffic lights
4. **Rendering**: Views consume enriched data and display with appropriate components
5. **User Interaction**: Filters, search, and navigation update URL and component state

---

## Color System

### Palette Rationale

```javascript
primary.main: '#002855'   // Navy - main brand color for titles, text, selections
secondary.main: '#3ECFA0' // Mint/Teal - accents, highlights, borders
success.main: '#2BA87F'   // Darker mint - compliant/active status
warning.main: '#F59E0B'   // Warm amber - pending/review status
error.main: '#EF4444'     // Coral red - expired/critical status
info.main: '#0EA5E9'      // Bright blue - neutral information
background.default: '#f5f7fa' // Light gray - reduces eye strain vs pure white
text.primary: '#1a202c'   // Near-black - better readability than pure black
text.secondary: '#4a5568' // Medium gray - de-emphasized content
```

### Status Colors

- **Success (#2BA87F)**: Darker mint from brand - active, approved, compliant
- **Warning (#F59E0B)**: Warm amber - pending, review needed, expiring soon
- **Error (#EF4444)**: Modern coral red - expired, rejected, non-compliant
- **Info (#0EA5E9)**: Bright blue - neutral information, updates

### Accessibility

- All color combinations meet WCAG AA standards
- Never rely on color alone (icons + labels)
- High contrast mode compatible

---

## Technical Decisions

### Why Vite?

- Faster dev server than Create React App
- Better build performance
- Modern default (ESM)
- Official React team recommendation

### Why Material-UI?

- Comprehensive component library (less custom CSS)
- Built-in theming system
- Accessibility baked in
- Professional look out of the box
- Large community and documentation

### Why NOT TypeScript (yet)?

- Faster initial development (mockup phase)
- Less boilerplate for prototype
- Easy to add later (rename .jsx → .tsx)
- Not critical for small team/project currently

### Why Mock Data?

- Develop without backend dependency
- Fast iteration on UI/UX
- Structure reflects future API responses
- Easy to swap: `mockAssets` → `api.getAssets()`

### Why React Router v7.9.3?

- Latest stable version
- Full TypeScript support (for future migration)
- Better nested route handling than v6
- Improved data loading patterns
- Active maintenance and large community
- Cleaner API for multi-level navigation

### Why Bilingual Support (i18n)?

- Primary market is Spanish-speaking (Venezuela)
- Future expansion to English-speaking markets
- Better UX for international clients
- Demonstrates professional localization capability
- Easy to add more languages later

### Why Multi-Domain Architecture? 

**Domain Level**:
- **Completely different UX/UI per domain**: Each domain (e.g., `regulatory_affairs`, `pension_fund`) has its own entity types, routing, status systems, schemas, and UI components
- **Domain-specific configuration**: Each domain has its own `domainConfig.js` defining routing, entities, status systems, and data loading
- **Isolated data stores**: Each domain maintains separate data (no cross-contamination)
- **Easy to add new domains**: Just create new `domainConfig.js` and data structure, no code changes needed

**Business Level**:
- **Mock data organized by business**: `businesses/food_manufacturing/` contains business-specific data
- **Supports multi-business scenarios**: Multiple businesses can share same domain (same UX, different data)
- **Automatic domain switching**: When switching businesses, if new business has different `domainId`, entire domain (and UX/UI) switches automatically
- **Reflects real-world deployment**: One business per client, but businesses may belong to different domains

**Benefits**:
- **Flexibility**: Same business can switch domains, or different businesses can share same domain
- **Scalability**: Easy to add new domains or businesses without code changes
- **Clean separation**: Domain config, business data, and organization structure are clearly separated
- **Multi-tenant ready**: Supports scenarios where different clients need completely different application experiences

**Adding New Domains (How-To)**:
- Create domain skeleton under `src/data/contexts/<domain>/`: `domainConfig.js`, `schemas/`, `businesses/<org>/` data, optional `enrichment/`, and `i18n.js` with `defaultLanguage` and `uiText` (tab labels, field/section labels, empty states, request types, conflicts).
- Define schemas with `titleKey` on sections and `labelKey` on fields for translation; use `FIELD_TYPES` (TEXT/DATE/CURRENCY/ARRAY/STATUS/etc.). For statuses, set `type: STATUS` and optionally `dimension` to map to `statusSystem`.
- Configure `domainConfig.js`: `id`, `name`, `description`, `defaultLanguage`, `uiText`, `entities` (category, labels, icon, `schemaKey`, tabs, searchFields, optional tabLabels), `statusSystem` (dimensions with en/es labels, colors, icons), `routing` (segments, tabRoutes), `dataLoading` (basePath, defaultOrganization, organizationMap, sources, enrichment steps).
- Add data under `businesses/<org>/` matching `dataLoading` sources; enrichment functions under `enrichment/` if needed to derive fields/statuses.
- Register the domain: ensure `domainConfig.js` is globbed by the registry; add a business entry in `src/data/mockData.js` with `domainId` and `defaultUserId`; ensure org IDs match `dataLoading.defaultOrganization`/`organizationMap`.
- Add domain-specific tabs in `src/components/domain/<domain>/` and register them in `src/utils/componentRegistry.js`; use `getUIText` and `useStatusHelpers` for labels/status chips.
- Verify: switch to the new business/domain in the UI, confirm data loads, tabs render, labels/statuses translate in both languages, and status keys match `statusSystem` (no raw codes).

### Why Traffic Light Status Indicators? 

- Instant visual assessment at list level
- No need to drill down to see compliance status
- Red count immediately draws attention to problems
- Provides actionable information
- Familiar metaphor (green=good, yellow=warning, red=critical)

### Why Fuse.js for Search?

- Lightweight fuzzy search library (< 10KB gzipped)
- No backend required for prototype/mockup phase
- Fast performance for small-medium datasets (< 10,000 items)
- Configurable relevance scoring and thresholds
- TypeScript support (for future migration)
- Easy to replace with backend Elasticsearch/Algolia later
- Well-maintained with active community

### Why Layout Constants System?

- Single source of truth for all spacing values
- Easier to maintain consistent spacing across app
- Responsive values defined once, used everywhere
- Faster iteration (change constant, update entire app)
- Better collaboration (designers and developers share values)
- Reduces magic numbers in component code

---

## Implemented Systems

### Internationalization (i18n)

**Location**: `src/utils/i18nHelpers.js`

**Purpose**: Full bilingual support (Spanish/English)

**Features**:
- Language toggle in Sidebar
- Translation dictionaries for all UI text
- Fallback system (missing translations fall back to Spanish)
- Category labels, status labels, field labels all translated
- Section headings translated per language

**Design Decisions**:
- Spanish as default language (primary market)
- English support for international expansion
- Language preference stored in App state
- All new UI elements must include both translations

### 4-Dimension Status System

**Location**: `src/utils/status.js` + `src/data/enrichRegulatoryAffairs.js`

**Purpose**: Track regulatory compliance across four independent dimensions

**The Four Dimensions**:

1. **Lifecycle Status** (Manual field on affair):
   - `active` - Currently operational
   - `archived` - No longer active

2. **Compliance Status** (Calculated from latest renewal):
   - `current` - Attachment is valid and not expiring soon
   - `expiring` - Within reminder window (default 30 days)
   - `expired` - Past expiry date
   - `permanent` - No expiration (e.g., incorporation attachments)

3. **Workflow Status** (Calculated from renewal submission/approval):
   - `in_preparation` - Renewal not yet submitted
   - `submitted` - Submitted to authority, awaiting approval
   - `completed` - Approved and active
   - `needs_renewal` - Approaching expiry, renewal process should start

4. **Priority Level** (Manual field on affair):
   - `critical` - Business-critical, immediate attention required
   - `high` - Important for operations
   - `medium` - Standard priority (default)
   - `low` - Nice to have, low business impact

**Data Enrichment Flow**:
1. `enrichRegulatoryAffairsDataset()` processes raw affairs and renewals
2. Finds latest renewal for each affair (by date)
3. Calculates compliance and workflow statuses from latest renewal
4. Stores all 4 dimensions on affair object before rendering
5. Asset tiles aggregate compliance counts per asset for traffic lights

**Key Features**:
- Reference date: Demo uses fixed date for consistent status display
- Traffic light visualization: Green (current), Yellow (expiring), Red (expired)
- Pre-aggregated counts: Asset tiles show compliance counts without recalculation
- Hook-based aggregation: `useAssetDimensionCounts()` aggregates all 4 dimensions per asset
- Filterable: Dashboard and detail views filter by any dimension

### Schema-Based InfoTab

**Location**: `src/data/contexts/regulatory_affairs/schemas/` + `src/components/detail/InfoTab.jsx`

**Purpose**: Universal metadata display component using configuration-driven schemas

**Key Innovation**: Single InfoTab component works for all entity types (assets, affairs, renewals, attachments)

**Features**:
- Auto-detection: Detects entity type from object properties
- Explicit override: Can specify entity type via prop
- Field types: TEXT, EMAIL, LINK, PHONE, DATE, CURRENCY, ARRAY, BOOLEAN
- Responsive grid: 1-4 columns based on viewport
- Collapsible sections: Optional sections can be collapsed
- Empty value hiding: Only shows fields with values
- Copy to clipboard: Click any field to copy value
- Internationalized: All labels and sections translated

**Supported Entities**:
- **Assets** (9 types): empresa, proveedor, cliente, producto, persona, vehiculo, establecimiento, equipo, otro_activo
- **Regulatory**: regulatory_affair, renewal, attachment

**Why schema-based?**
- No code duplication across entity types
- Easy to add new entity types (just add schema)
- Consistent UX across all detail views
- Type-safe (future TypeScript)
- Maintainable (change schema, not component)

### React Router Navigation

**Location**: `src/App.jsx` (routes) + DetailView (navigation logic)

**Purpose**: Full routing system for multi-level navigation

**Routes Implemented**:
- `/` - Home view (all categories in carousel)
- `/dashboard` or `/panel` - Analytics dashboard with metrics
- `/:category` - Single category grid view (e.g., `/company`, `/producto`)
- `/:category/:id/:tab?` - Asset detail with tabs
- `/affair/:affairId/:tab?` or `/asunto/:affairId/:tab?` - Regulatory affair detail (bilingual)
- `/renewal/:renewalId/:tab?` or `/actualizacion/:renewalId/:tab?` - Renewal detail (bilingual)

**Features**:
- URL-based tabs: Tab state reflected in URL
- Query parameters: Filter state in URL (e.g., `?status=expired`)
- Breadcrumb navigation: Shows full hierarchy
- Browser back/forward: Works as expected
- Deep linking: Can share URLs to specific tabs
- Lazy loading: Views loaded on demand

### Search System

**Location**: `src/services/searchService.js` + `src/components/common/SearchBar.jsx`

**Purpose**: Global fuzzy search across all entities (assets, affairs, renewals, attachments)

**Technology**: Fuse.js (lightweight fuzzy-search library)

**Key Components**:
- **SearchService**: Core search logic with Fuse.js integration
- **SearchBar**: Desktop search component with dropdown results (TopBar)
- **SearchDropdown**: Results dropdown with categorized results
- **SearchResultItem**: Individual result item with icon, name, description, navigation
- **MobileSearchOverlay**: Full-screen search overlay for mobile devices

**Features**:
- Multi-entity search: Searches assets, regulatory affairs, renewals, and attachments
- Fuzzy matching: Typo-tolerant search (e.g., "comany" matches "company")
- Token-based search: Multi-word queries match all tokens (e.g., "empresa activa" matches both words)
- Weighted fields: Prioritizes name matches over description matches
- Keyboard navigation: Arrow keys and Enter to navigate results
- Empty states: Helpful messages when no results found

**Searchable Fields by Entity**:
- **Assets**: name, code, activities, description
- **Affairs**: name, type, category, authority, description
- **Renewals**: name, type, responsiblePerson, notes
- **Attachments**: name, type, notes, uploadedBy

### PageLayout System

**Location**: `src/components/layout/PageLayout.jsx` + `src/constants/layout.js`

**Purpose**: Unified layout system with consistent spacing, navigation, and responsive behavior

**Key Components**:
- **PageLayout**: Fullscreen container that fills from TopBar bottom + Sidebar right to screen edges
- **PageHeader**: Hero card with entity summary (image, name, status, actions)
- **ContentPanel**: Data card with tables, charts, or forms
- **ScrollContainer**: Custom scroll container with ref forwarding
- **StickyHealthHeader**: Compact health metrics that stick on mobile scroll

**Layout Constants** (`LAYOUT_CONSTANTS`):
```javascript
{
  topBar: { height: { mobile: 64, desktop: 80 } },
  sidebar: { openWidth: 180, closedWidth: 50, transition: '0.3s ease' },
  pageLayout: { padding: 3 },  // 24px
  spacing: { headerMargin: 3, navigationMargin: { xs: 1, sm: 1.5 } },
  pageHeader: { padding: { xs: 1.2, sm: 1.6 }, minHeight: { xs: 110, sm: 130, md: 180 } },
  contentPanel: { padding: 2, defaultTableHeight: 420 },
  touchTargets: { minimum: 44, comfortable: 48, spacing: 8 }
}
```

---

## Responsive Design

### Breakpoints

Based on Material-UI defaults:
- **xs (0-600px)**: Mobile - 1 column, simplified header, bottom navigation
- **sm (600-960px)**: Tablet portrait - 2 columns, hybrid patterns
- **md (960-1280px)**: Tablet landscape - 3 columns, show subtitle
- **lg (1280-1920px)**: Desktop - 4 columns, full sidebar
- **xl (1920+)**: Large desktop - Max width container

### Mobile Considerations

- Bottom navigation bar for primary navigation (instead of sidebar)
- Floating action button for filters (instead of inline chips)
- Full-screen search overlay (instead of dropdown)
- Sticky headers on scroll (instead of static headers)
- Touch targets: Minimum 44px (WCAG AA compliance)
- Swipe gestures: Horizontal carousel scrolling, drawer swipe-to-close

---

## Future Enhancements

### Attachment Upload & Management
- Drag & drop zone within records
- Multiple file upload to specific records
- Progress indicators
- Attachment versioning and approval workflows
- Set attachment-level expiry dates

### Advanced Filters
- Date range pickers (expiry dates)
- Multi-status selection
- Custom field filters
- Saved filter presets

### User Management
- Login/authentication
- Role-based permissions (admin, viewer, editor)
- Multi-tenant support (each client isolated)
- User profile settings

### Notifications
- Expiring records alerts
- Record approval workflows
- Recent activity feed
- Email/push notifications
- Notification preferences
- Smart notification grouping

---

## Known Limitations (By Design)

1. **No authentication**: Mockup/prototype phase, will add when connecting to real backend
2. **No real API**: Using mock data for now (domain-organized in `businesses/`)
3. **No error boundaries**: Will add for production stability
4. **No loading states**: Will add when API integrated (currently instant with mock data)
5. **No optimistic updates**: Will add with real mutations
6. **Limited validation**: Will add comprehensive validation with forms
7. **No offline support**: Future consideration for PWA
8. **Fixed reference date**: Demo uses fixed date for consistent status display (production will use real-time)
9. **Single business**: Currently one demo business, multi-business UI ready but needs data
10. **Mock attachments**: File URLs are placeholders, will integrate with file storage service

### DRY & Pattern Consistency

**Before making any changes**:
1. **Search for existing patterns**: Use Grep/Glob to find similar code in the codebase
2. **Follow established patterns**: Match existing naming, structure, and style conventions
3. **Understand before changing**: Read related files to understand the full context
4. **Maintain consistency**: Use the same approach as existing code, even if you'd do it differently

**When to extract reusable code**:
- Pattern appears in 3+ places → Extract to utility function or shared component
- Complex logic repeated → Move to service or hook
- Similar components → Create shared base component with props for variations

**Consistency over cleverness**:
- Maintain existing patterns rather than introducing new approaches
- If refactoring a pattern, update ALL instances, not just one
- Document WHY a pattern exists if it's not obvious (in code comments or CLAUDE files)

---

## Maintenance Notes

### When adding new categories:
1. Add to domain configuration
2. Add category to schemas
3. Update mock data with examples
4. Add translations for category labels

### When adding new asset properties:
1. Update asset schema
2. Update InfoTab display if needed
3. Update search logic
4. Plan for Detail View display

### When adding new record types:
1. Update domain configuration
2. Add record templates in mock data
3. Update DetailView for new record types
4. Plan for record-specific InfoTab fields

### When adding new attachment properties:
1. Update attachment schema
2. Update AttachmentsTab table structure
3. Update attachment upload modal (future)
4. Update attachment status calculations

### When refactoring:
1. Delete old files immediately
2. Update imports everywhere
3. Check for unused components
4. Test in browser before committing

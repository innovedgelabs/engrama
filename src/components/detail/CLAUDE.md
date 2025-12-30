# Detail Components - Design Context

## Directory Purpose

Components used exclusively in the DetailView for displaying asset, regulatory affair, and renewal details. These tab components provide specialized views for different aspects of entity data, following a consistent architecture pattern of schema-driven rendering, status display, and responsive table layouts.

**All detail tab components**:
- **InfoTab**: Universal schema-driven metadata display (works for assets, affairs, renewals, attachments)
- **RegulatoryAffairsTab**: Affairs table with 4-dimension status display
- **RenewalsTab**: Renewals table with workflow and compliance status
- **AttachmentsTab**: Attachments table with actions
- **RelatedTab**: Related assets with category filtering

---

## InfoTab.jsx

**Purpose**: Display entity metadata in a clean, organized layout using configuration-driven schemas

**Design Decisions**:
- **Schema-driven rendering**: Uses domain schemas from `DomainContext` for field definitions, enabling universal component for all entity types
- **Auto-detection**: Automatically detects entity type from object properties when explicit type not provided
- **Multi-column compact layout**: 3-4 columns on desktop, responsive on mobile
- **Collapsible sections**: Optional sections can be collapsed/expanded to save space
- **FieldDisplay component**: Reusable field renderer that hides empty values automatically
- **Minimal spacing**: Reduced margins/padding (mb: 1.5, spacing: 2) for compactness
- **Visual hierarchy**: Section titles with secondary color underline
- **Universal**: Works for assets, regulatory affairs, renewals, and attachments
- **4-dimension status display**: Shows all 4 status dimensions with appropriate chips when entity is a regulatory affair

**Entity Type Detection**:
```javascript
const type = entityType || detectEntityType(asset);
const schema = getSchema(type);
```

**Detection Logic**:
1. Use explicit `entityType` prop if provided
2. Auto-detect from object properties:
   - `renewalId` → attachment
   - `affairId` → renewal
   - `assetId` → regulatory_affair
   - `category` → asset type (empresa, producto, etc.)
3. Default to 'empresa' if detection fails

**Layout Structure**:
```
Box (responsive container)
  └── Mobile: Individual Paper cards per section
  └── Desktop: Single scrollable container
        └── Sections (from schema)
              ├── Section Title (collapsible toggle)
              └── Grid of Fields (responsive columns)
                    └── FieldDisplay components
```

**Props**:
```typescript
interface InfoTabProps {
  asset: object;  // Can be any entity type (asset, affair, renewal, attachment)
  entityType?: string;  // Optional explicit override
  renewals?: Renewal[];  // For calculating status on regulatory affairs
  language?: 'es' | 'en';
}
```

**Schema-Based Features**:
- **Conditional sections**: Only show if specified field exists (`condition` property)
- **Field fallbacks**: Use alternate field if primary is empty (`fallbackTo`)
- **Type-specific formatting**: Dates, currency, arrays, booleans formatted correctly
- **Responsive grid**: Each field has custom grid breakpoints (xs, sm, md, lg)
- **Collapsible sections**: Sections can be collapsed with `defaultExpanded` setting
- **Internationalization**: All labels translated via i18n utils
- **Status field types**: Special handling for STATUS field types with dimension metadata

**Supported Entity Types**:
- **Assets** (9 types): empresa, producto, persona, vehiculo, establecimiento, equipo, proveedor, cliente, otro_activo
- **Regulatory**: regulatory_affair, renewal, attachment

**Key Features**:
- Only renders fields that have values (FieldDisplay returns null if empty)
- Click any field to copy value to clipboard
- Website/email fields are clickable links (open in new tab)
- Collapsible sections save space (e.g., empresa registry data section)
- Responsive: 4 cols → 3 cols → 2 cols → 1 col based on screen size
- Snackbar notification on successful copy
- **4-dimension status chips**: When entity is an affair, shows all 4 status dimensions using status metadata

**Mobile vs Desktop Layout**:
- **Mobile**: Individual Paper cards per section for better touch interaction
- **Desktop**: Single scrollable container with all sections for information density

**Dependencies**:
- `DomainContext` for schema retrieval
- `useStatusHelpers` for status metadata
- `utils/i18nHelpers.js` for translations
- `utils/status.js` for status calculations (regulatory affairs only)

---

## RegulatoryAffairsTab.jsx

**Purpose**: Display regulatory affairs table for an asset with 4-dimension status and primary attachment quick actions

**Design Decisions**:
- **Sticky table headers**: Column headers remain visible while scrolling through rows
- **4-dimension status display**: Shows compliance, workflow, priority, lifecycle status
- **Real-time status calculation**: Calculates compliance and workflow from latest renewal per affair
- **Primary attachment quick actions**: View/download/send icons for latest renewal's primary attachment
- **Sortable columns**: All columns can be sorted (date, status, name, etc.)
- **Clickable rows**: Navigate to affair detail view
- **Compact table**: small size with reduced padding for information density
- **FilterChips**: Inline filtering by compliance, workflow, priority (desktop)
- **FilterDrawer**: Mobile filtering via bottom sheet
- **Mobile expandable rows**: ExpandableRow component for mobile view

**Table Columns**:
1. **Asunto Regulatorio** (with description as subtitle)
2. **Categoría** (chip - e.g., Fiscal, Health, Safety)
3. **Última Actualización** (date + renewal name from latest renewal)
4. **Próximo Vencimiento** (expiry date from latest renewal, or "Permanente")
5. **Cumplimiento** (compliance status chip: current/expiring/expired/permanent)
6. **Flujo** (workflow status chip: in_preparation/submitted/completed/needs_renewal)
7. **Prioridad** (priority badge: critical/high/medium/low)
8. **Autoridad** (authority + renewal frequency)
9. **Documento** (view/download/send icons for primary attachment)

**Status Calculation** (Real-time):

Affairs are not pre-enriched. Status is calculated on-the-fly from latest renewal:

```javascript
// Find latest renewal for affair
const latestRenewal = getLatestRenewal(affair.id);

// Calculate compliance from latest renewal
const complianceStatus = latestRenewal
  ? calculateComplianceStatus(latestRenewal)
  : COMPLIANCE_STATUS.EXPIRED;

// Calculate workflow from latest renewal
const workflowStatus = latestRenewal
  ? calculateWorkflowStatus(latestRenewal, complianceStatus)
  : WORKFLOW_STATUS.IN_PREPARATION;

// Get manual dimensions from affair
const lifecycleStatus = affair.lifecycleStatus ?? LIFECYCLE_STATUS.ACTIVE;
const priorityLevel = affair.priorityLevel ?? PRIORITY_LEVEL.MEDIUM;
```

**Status Display** (4-Dimension System):

**Filtering**:

**Desktop** (inline FilterChips):
- FilterChips embedded in table cells
- Click chip to filter by that value
- Multiple dimensions can be filtered simultaneously

**Mobile** (FilterFAB + FilterDrawer):
- FilterFAB in bottom-right corner (shows active filter count)
- Clicking FAB opens FilterDrawer bottom sheet
- Multi-select checkboxes for all dimensions
- "Clear All" and "Apply" actions

**Primary Attachment Display**:
- Shows view/download/send icons if latest renewal has a primary attachment
- Icons are small (1rem fontSize) with tooltips
- Clicking icons doesn't navigate to affair (stopPropagation)
- Shows nothing if no primary attachment

**Actions**:
- Row click navigates to `/affair/{affairId}/info` (or `/asunto/{affairId}/info` in Spanish)
- View icon opens primary attachment (future: preview modal)
- Download icon downloads primary attachment (future: actual download)
- Send icon sends attachment (future: email/share functionality)

**Empty State**:
- Shows when no regulatory affairs exist for asset
- Provides helpful message

**Data Requirements**:
- Each affair must have: id, name, category, authority, renewalFrequency
- Optional: lifecycleStatus, priorityLevel (defaults applied)
- Renewals must have: id, affairId, submissionDate, approvalDate, expiryDate
- Documents must have: id, renewalId, isPrimary

**Dependencies**:
- FilterChip (desktop inline filtering)
- FilterDrawer (mobile filtering)
- FilterFAB (mobile filter button)
- ExpandableRow (mobile view)
- DataTable (desktop table display)
- `useStatusHelpers` for status metadata
- `utils/status.js` for status calculations
- `utils/i18nHelpers.js` for translations
- `utils/routing.js` for navigation

---

## RenewalsTab.jsx

**Purpose**: Display renewals table for a regulatory affair with workflow and compliance status

**Design Decisions**:
- **Sticky table headers**: Column headers remain visible while scrolling
- **Workflow status per renewal**: Shows workflow state (in_preparation/submitted/completed/needs_renewal)
- **Compliance status per renewal**: Shows compliance state (current/expiring/expired/permanent)
- **Real-time status calculation**: Calculates status from renewal data on-the-fly
- **Sortable columns**: All columns support sorting
- **Clickable rows**: Navigate to renewal detail view
- **Compact information**: Shows key renewal info in small space
- **Mobile expandable rows**: ExpandableRow component for mobile view

**Table Columns**:
1. **Renewal** (name with notes as subtitle)
2. **Tipo** (chip - e.g., Renovation, Modificación, Certificación Inicial)
3. **Fecha de Aprobación** (approval date, or submission date if not yet approved)
4. **Vencimiento** (expiry date, or "Permanente" if no expiry)
5. **Cumplimiento** (compliance status chip)
6. **Flujo** (workflow status chip)
7. **Responsable** (person responsible for this renewal)
8. **Adjuntos** (count chip showing number of attachments)
9. **Adjunto** (view/download/send icons for primary attachment)

**Compliance Status Calculation**:

```javascript
// From utils/status.js
const complianceStatus = calculateComplianceStatus(renewal);

// calculateComplianceStatus logic:
// - No expiry date → 'permanent'
// - Past expiry → 'expired'
// - Within reminder window → 'expiring'
// - Otherwise → 'current'
```

**Workflow Status Calculation**:

```javascript
// From utils/status.js
const workflowStatus = calculateWorkflowStatus(renewal, complianceStatus);

// calculateWorkflowStatus logic:
// - Submitted but not approved → 'submitted'
// - Approved + (expired or expiring) → 'needs_renewal'
// - Approved + current → 'completed'
// - Not submitted → 'in_preparation'
```

**Status Chip Display**:

Uses status metadata from `useStatusHelpers`:

```jsx
<FilterChip
  label={complianceLabel}
  sx={{
    backgroundColor: complianceMeta.color,
    color: complianceMeta.textColor ?? '#fff',
  }}
  icon={<complianceMeta.icon />}
  size="small"
/>
```

**Date Display**: Uses `formatDisplayDate` from `utils/status.js` with locale-aware formatting

**Actions**:
- Row click navigates to `/renewal/{renewalId}/info` (or `/actualizacion/{renewalId}/info` in Spanish)
- View/download/send icons for primary attachment (stopPropagation)

**Empty State**:
- Shows "No renewals for this regulatory affair"
- Provides helpful message

**Data Requirements**:
- Each renewal should have: id, name, type, submissionDate, approvalDate, expiryDate, reminderDays, responsiblePerson
- Optional: notes, attachmentCount
- Documents must have: id, renewalId, isPrimary

**Dependencies**:
- ExpandableRow (mobile view)
- DataTable (desktop table display)
- FilterChip (filtering)
- FilterDrawer (mobile filtering)
- FilterFAB (mobile filter button)
- `formatDisplayDate` from utils/status.js
- `calculateComplianceStatus`, `calculateWorkflowStatus` from utils/status.js
- `useStatusHelpers` for status metadata
- `utils/i18nHelpers.js` for translations
- `utils/routing.js` for navigation

---

## AttachmentsTab.jsx

**Purpose**: Display attachments/files attached to a renewal

**Design Decisions**:
- **Sticky table headers**: Column headers remain visible while scrolling
- **Full attachment actions**: View, download, delete for each attachment
- **Sortable columns**: All columns support sorting
- **Compact table**: Shows attachment metadata efficiently
- **Primary badge**: Highlights primary attachment with badge/star icon
- **File type icons**: Different icons for PDF, DOC, XLS, etc. (future enhancement)
- **Mobile expandable rows**: ExpandableRow component for mobile view

**Table Columns**:
1. **Attachment Name** (with notes as subtitle, primary badge if applicable)
2. **Type** (chip - e.g., Certificado, Solicitud, Informe, Factura)
3. **Size** (human-readable file size - e.g., "2.5 MB")
4. **Upload Date** (formatted date)
5. **Uploaded By** (user name)
6. **Actions** (view, download, delete icons)

**Primary Attachment Indicator**:
```jsx
{doc.isPrimary && (
  <Chip
    label={getUIText('primary', language)}
    size="small"
    color="secondary"
    icon={<StarIcon />}
  />
)}
```

**File Size Formatting**:
```javascript
// Currently uses fileSize string from attachment object
// Future: Parse bytes and format (B, KB, MB, GB)
```

**Actions**:
- **View**: Opens attachment preview (future: PDF viewer modal, image lightbox)
- **Download**: Downloads attachment file (future: actual file download)
- **Delete**: Removes attachment with confirmation dialog (future)
- All actions use `event.stopPropagation()` (don't trigger row click)

**Action Buttons**:
```jsx
<Box display="flex" gap={0.5}>
  <IconButton
    size="small"
    onClick={(e) => { e.stopPropagation(); handleView(attachment); }}
    title={getUIText('view', language)}
  >
    <VisibilityIcon fontSize="small" />
  </IconButton>
  <IconButton
    size="small"
    onClick={(e) => { e.stopPropagation(); handleDownload(attachment); }}
    title={getUIText('download', language)}
  >
    <DownloadIcon fontSize="small" />
  </IconButton>
  <IconButton
    size="small"
    onClick={(e) => { e.stopPropagation(); handleDelete(attachment); }}
    title={getUIText('delete', language)}
    color="error"
  >
    <DeleteIcon fontSize="small" />
  </IconButton>
</Box>
```

**Empty State**:
- Shows "No attachments for this renewal"
- Provides helpful message

**Props**:
```typescript
interface AttachmentsTabProps {
  attachments: Attachment[];  // Attachments for this renewal
  activeFilters?: FilterState;
  onFilterChange?: (key: string, value: string | null) => void;
  language?: 'es' | 'en';
}
```

**Data Requirements**:
- Each attachment should have: id, name, type, fileSize, fileUrl, uploadedBy, uploadedAt
- Optional: isPrimary, notes, mimeType

**Dependencies**:
- ExpandableRow (mobile view)
- DataTable (desktop table display)
- FilterChip (filtering)
- FilterDrawer (mobile filtering)
- FilterFAB (mobile filter button)
- `formatDisplayDate` from utils/status.js
- `utils/i18nHelpers.js` for translations

---

## RelatedTab.jsx

**Purpose**: Display related assets with category filtering via tabs

**Design Decisions**:
- **Sticky header**: Title, description, and category tabs stay fixed at top (desktop)
- **Nested tabs**: Main view has "Todos" tab + one tab per category
- **Category tabs**: Show icon + translated label (e.g., 🏢 Empresas)
- **Scrollable tabs**: Horizontal scroll on mobile (variant="scrollable")
- **Table view**: Related assets displayed in table format (desktop)
- **Expandable rows**: Mobile view uses ExpandableRow component
- **Empty state**: Explains no relationships exist yet
- **Relationship types**: Future: supplier_of, customer_of, manufactured_by, etc.

**Tab Structure**:
```
[Todos] [Empresas] [Proveedores] [Clientes] [Productos] [Personas] ...
  └── Desktop: Table with category-specific columns
  └── Mobile: ExpandableRow list
```

**Table Columns** (category-specific):

**Default/General**:
- Type (category chip with icon)
- Name
- Info (activities/description)
- Status (compliance status chip)

**Company/Supplier/Customer**:
- Legal Name (razonSocial)
- Tax ID (rif)
- City (ciudad)
- Country (pais)

**Product**:
- Product Name
- Code
- Brand (marca)
- Description
- Status

**Category Filtering**:

Uses CategoryTabs component (desktop):

```jsx
<CategoryTabs
  value={activeCategory}
  onChange={handleTabChange}
  language={language}
  categories={categories}
  domainConfig={currentConfig}
/>
```

**Status Display**:

Shows compliance status (current/expiring/expired) using status metadata:

```jsx
<FilterChip
  label={statusLabel}
  sx={{
    backgroundColor: statusMeta.color,
    color: '#fff',
  }}
  size="small"
/>
```

**Empty State**:
```jsx
<Box textAlign="center" py={8}>
  <Typography variant="body2" color="text.secondary">
    {getUIText('relatedEmptyTitle', language)}
  </Typography>
  <Typography variant="caption" color="text.disabled" mt={1}>
    {getUIText('relatedEmptyDescription', language)}
  </Typography>
</Box>
```

**Props**:
```typescript
interface RelatedTabProps {
  relatedAssets: RelatedAsset[];  // Array of { asset, relations }
  currentCategory?: string;  // Selected category from URL
  activeFilters?: FilterState;
  onCategoryChange?: (category: string | null) => void;
  onFilterChange?: (key: string, value: string | null) => void;
  language?: 'es' | 'en';
}
```

**Data Requirements**:
- Each related asset should have: id, name, category, activities/description
- Optional: razonSocial, rif, ciudad, pais, marca, code, complianceStatus
- Relations array contains relationship metadata (future)

**Dependencies**:
- CategoryTabs (category filtering - desktop)
- ExpandableRow (mobile view)
- DataTable (desktop table display)
- FilterChip (filtering)
- FilterDrawer (mobile filtering)
- FilterFAB (mobile filter button)
- `getCategoryLabel`, `getUIText` from utils/i18nHelpers.js
- `getCategorySlug`, `getTabSlug` from utils/routing.js
- `useStatusHelpers` for status metadata
- `DomainContext` for category configuration

---

## Component Dependencies

```
DetailView (unified for all entity types)
  ├── InfoTab (universal schema-driven display)
  │     ├── DomainContext (schema retrieval)
  │     ├── useStatusHelpers (status metadata)
  │     ├── FieldDisplay (field renderer)
  │     └── utils/i18nHelpers.js (translations)
  ├── RegulatoryAffairsTab (for assets → shows enriched affairs)
  │     ├── FilterChip (desktop filtering)
  │     ├── FilterDrawer (mobile filtering)
  │     ├── FilterFAB (mobile filter button)
  │     ├── ExpandableRow (mobile view)
  │     ├── DataTable (desktop table display)
  │     ├── useStatusHelpers (status metadata)
  │     └── utils/status.js (status calculations)
  ├── RenewalsTab (for affairs → shows renewals)
  │     ├── ExpandableRow (mobile view)
  │     ├── DataTable (desktop table display)
  │     ├── FilterChip, FilterDrawer, FilterFAB (filtering)
  │     └── utils/status.js (compliance/workflow calculation)
  ├── AttachmentsTab (for renewals → shows attachments)
  │     ├── ExpandableRow (mobile view)
  │     ├── DataTable (desktop table display)
  │     ├── FilterChip, FilterDrawer, FilterFAB (filtering)
  │     └── formatDisplayDate from utils/status.js
  └── RelatedTab (for assets → shows relationships)
        ├── CategoryTabs (category filtering - desktop)
        ├── ExpandableRow (mobile view)
        ├── DataTable (desktop table display)
        ├── FilterChip, FilterDrawer, FilterFAB (filtering)
        └── DomainContext (category configuration)
```

---

## Shared Patterns

### 4-Dimension Status System

All status-related components use the 4-dimension system from `utils/status.js` via `useStatusHelpers`. See main CLAUDE.md for complete details on lifecycle, compliance, workflow, and priority dimensions.

**Status Chip Pattern**: Use `getMetadata()` from `useStatusHelpers` to get status label, color, icon, then render FilterChip with metadata

### Date Formatting

Use `formatDisplayDate` from `utils/status.js` for consistent locale-aware date formatting (e.g., "15 feb 2025" in Spanish, "Feb 15, 2025" in English)

### Chip Styling

All chips use size="small" consistently. Status chips use metadata colors, type chips use outlined variant, count chips use primary color outlined, primary badge uses secondary with StarIcon.

### Table Structure

All tables use `DataTable` component wrapped in Paper with sticky headers, built-in scrollbar styling, and empty state support.
- Follows Material Design guidelines

### Mobile vs Desktop Patterns

**Desktop**:
- Full table with all columns visible
- Inline FilterChips for filtering
- Sortable columns with visual indicators
- Hover states for interactive elements

**Mobile**:
- ExpandableRow components for compact display
- FilterFAB + FilterDrawer for filtering
- Active filter chips displayed above list
- Touch-friendly hit targets (44px minimum)

### Internationalization

All text uses `getUIText` and `getCategoryLabel` from `utils/i18nHelpers.js`:

```jsx
import { getUIText, getCategoryLabel } from '../../utils/i18n';

// UI text
<Typography>{getUIText('regulatory_affairs', language)}</Typography>

// Category labels
<Chip label={getCategoryLabel(affair.category, language)} />

// Status labels (uses labelKey from metadata)
const metadata = getMetadata('compliance', statusKey, language);
<Chip label={metadata.label} />
```

### Empty States

Consistent empty state pattern across all tabs:

```jsx
<Box sx={{ p: 4, textAlign: 'center' }}>
  <Typography variant="body2" color="text.secondary">
    {getUIText('emptyTitle', language)}
  </Typography>
  <Typography variant="caption" color="text.disabled" mt={1}>
    {getUIText('emptyDescription', language)}
  </Typography>
</Box>
```

### Filtering Architecture

**Desktop**:
- FilterChips embedded in table cells
- Click chip to toggle filter
- Visual feedback with selected state
- Multiple dimensions can be filtered simultaneously

**Mobile**:
- FilterFAB shows active filter count
- FilterDrawer opens on FAB click
- Multi-select checkboxes per dimension
- Active filter chips displayed above content
- "Clear All" and "Apply" actions

---

## Performance Considerations

### Current Optimizations

- **Memoized components**: All tab components wrapped in `React.memo`
- **useMemo**: Filtered/sorted data memoized
- **useCallback**: Event handlers memoized
- **Status calculation**: Only calculated when needed (not pre-enriched for affairs)
- **Sticky headers**: Material-UI optimized implementation
- **Virtual scrolling**: Not needed yet (< 100 rows per table)

### Future Optimizations (if needed for 100+ items per table)

- [ ] Virtual scrolling for large tables (react-window)
- [ ] Pagination for 100+ rows
- [ ] Debounced search input for filtering
- [ ] Memoize expensive rendering (charts, graphs)
- [ ] Code splitting for heavy components (PDF viewer, image lightbox)
- [ ] Pre-enrich affairs during data loading (reduce on-the-fly calculations)

---


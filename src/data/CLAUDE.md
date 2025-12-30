# Data Layer - Design Context

## Purpose

This directory contains the data layer architecture for the application, including mock data organization, entity schemas, data enrichment logic, and the foundation for future API integration.

**Key Responsibilities**:
- Mock data for prototype/development
- Entity type schemas for dynamic form generation
- Data enrichment logic (4-dimension status system)
- Business-specific data organization
- Domain-driven data structure

---

## Directory Structure

```
src/data/
├── contexts/
│   └── regulatory_affairs/
│       ├── businesses/
│       │   └── food_manufacturing/
│       │       ├── assets.js
│       │       ├── regulatoryAffairs.js
│       │       ├── renewals.js
│       │       ├── attachments.js
│       │       ├── users.js
│       │       └── historicalCompliance.js
│       ├── domainConfig.js
│       ├── enrichment/
│       │   └── enrichRegulatoryAffairs.js
│       └── schemas/
│           ├── company.js
│           ├── product.js
│           ├── person.js
│           └── ... (other asset schemas)
├── mockData.js              # Aggregated access point
└── enrichRegulatoryAffairs.js  # Core enrichment logic
```

**Rationale for Structure**:
- **Business-based organization**: Reflects real-world deployment (one business per client)
- **Domain-driven**: Each domain (e.g., regulatory_affairs) has its own configuration and schemas
- **Separation of concerns**: Raw data, enrichment, and schemas are separate
- **Scalability**: Easy to add new businesses or domains

---

## Data Model Philosophy

### 4-Level Hierarchy for Regulatory Compliance

The system uses a hierarchical data model that reflects real-world regulatory compliance workflows:

1. **Asset** (e.g., Empresa) - The main business entity
2. **Regulatory Affair** (e.g., "RNC Registration") - An ongoing regulatory obligation
3. **Renewal** (e.g., "Renewal 2024") - A specific update/renewal of the regulatory affair
4. **Attachment** - Files associated with a specific renewal

**Why This Structure?**
- A regulatory affair is an ongoing obligation that requires periodic renewals
- Each renewal has its own attachments (the "expediente" or "dossier")
- The affair's 4-dimension status is derived from its latest renewal
- Attachments are attached to renewals, not directly to affairs
- This matches real-world compliance workflows where renewals are discrete events with their own documentation

### Entity Relationships

```
Asset (1) ──→ (many) Regulatory Affairs
Regulatory Affair (1) ──→ (many) Renewals
Renewal (1) ──→ (many) Attachments
```

**Key Design Decision**: Affair names are generic and reusable (e.g., "RNC Registration" not "Certificado de Inscripción RNC 2024"). This makes them timeless and easier to understand across multiple renewals.

---

## Entity Schemas

### Asset Schema

**Basic Schema (all assets)**:
```javascript
{
  id: string,                        // Unique identifier (e.g., 'EM-001', 'PR-004')
  name: string,                      // Display name
  category: string,                  // Object type for grouping
  activities: string,                // Business activities/description
  code: string | null,               // Regulatory code (optional)
  image: string,                     // URL to logo/photo/product image
  regulatoryAffairsCount: number,    // Number of associated regulatory affairs
}
```

**Extended Schema for Empresa** (example of category-specific fields):
```javascript
{
  // ... basic fields above ...
  identificador: string,      // Internal ID
  razonSocial: string,        // Legal business name
  tipoEmpresa: string,        // Type (Jurídica, Natural, etc.)
  email: string,              // Contact email
  sitioWeb: string,           // Website URL
  direccion: string,          // Full address
  telefonoCentral: string,    // Main phone
  telefonoMovil: string,      // Mobile phone (optional)
  ciudad: string,             // City
  zonaPostal: string,         // Postal code
  pais: string,               // Country
  clase: string,              // Class/classification
  ubicacionFisica: string,    // Physical location code
  sectoresEconomicos: string, // Economic sectors
  observaciones: string,      // Notes/observations
  // Registry data (collapsible in InfoTab)
  registroMercantil: string,  // Mercantile registry info
  fechaRegistro: string,      // Registration date
  numeroRegistro: string,     // Registration number
  tomo: string,               // Volume
  duracion: string,           // Duration
  objeto: string,             // Corporate purpose (long text)
  capitalSocial: string       // Share capital (long text)
}
```

**Design Rationale**: Each asset category can have category-specific fields while sharing common fields. This allows for flexible data structures while maintaining consistency.

### Regulatory Affair Schema

**Raw Schema** (before enrichment):
```javascript
{
  id: 'AFF-###',                    // Unique identifier
  assetId: 'EM-001',                // Parent asset
  name: string,                     // Affair name (e.g., "RNC Registration")
  type: string,                     // Affair type (Certificado, Licencia, etc.)
  category: string,                 // Category (Fiscal, Health, Safety, etc.)
  description: string,              // Brief description
  authority: string,                // Issuing authority (e.g., SENIAT, INSAI)
  renewalFrequency: string,         // How often to renew (e.g., "Anual", "Bienal")
  lifecycleStatus: string | null,   // Manual: 'active' | 'archived' (default: 'active')
  priorityLevel: string | null,     // Manual: 'critical' | 'high' | 'medium' | 'low' (default: 'medium')
}
```

**Enriched Schema** (after enrichment):
```javascript
{
  // ... all raw fields above ...
  complianceStatus: string,         // Calculated: 'current' | 'expiring' | 'expired' | 'permanent'
  workflowStatus: string,           // Calculated: 'in_preparation' | 'submitted' | 'completed' | 'needs_renewal'
  lifecycleStatus: string,          // Defaulted to 'active' if null
  priorityLevel: string,            // Defaulted to 'medium' if null
}
```

**Design Decision**: Compliance and workflow statuses are calculated from the latest renewal, not stored directly. This ensures consistency and reduces data duplication.

### Renewal Schema

```javascript
{
  id: 'REN-###',                    // Unique identifier
  affairId: 'AFF-001',              // Parent regulatory affair
  name: string,                     // Renewal name (e.g., "Renewal 2024")
  type: string,                     // Type (Renewal, Modification, Initial Certification)
  submissionDate: string | null,    // Date submitted to authority
  approvalDate: string | null,      // Date approved by authority
  expiryDate: string | null,        // Expiry date (null = permanent)
  reminderDays: number,             // Days before expiry to trigger warning
  responsiblePerson: string,        // Person responsible
  notes: string,                    // Additional notes
  primaryAttachmentId: string | null // ID of the main attachment
}
```

**Design Decision**: Legacy `status` field is removed during normalization. Status is now calculated on-demand using `calculateComplianceStatus()` and `calculateWorkflowStatus()` from `src/utils/status.js`.

### Attachment Schema

```javascript
{
  id: 'DOC-###',                    // Unique identifier
  renewalId: 'REN-001',             // Parent renewal
  isPrimary: boolean,               // Whether this is the primary/main attachment
  name: string,                     // File name
  type: string,                     // Attachment type (Certificado, Solicitud, etc.)
  fileUrl: string,                  // File path/URL
  fileSize: string,                 // Human-readable file size
  uploadedBy: string,               // User who uploaded
  uploadedAt: string,               // Upload timestamp
  notes: string                     // Additional notes
}
```

### Category Types

All 9 asset categories are supported:
- `empresa` - Companies
- `proveedor` - Suppliers
- `cliente` - Clients/Customers
- `producto` - Products
- `persona` - People
- `vehiculo` - Vehicles
- `equipo` - Equipment
- `establecimiento` - Facilities
- `otro_activo` - Other Assets

---

## Data Enrichment

### enrichRegulatoryAffairs.js

**Location**: `src/data/enrichRegulatoryAffairs.js`

**Purpose**: Enrich raw regulatory affairs data with calculated 4-dimension status fields

**Main Function**:
```javascript
export const enrichRegulatoryAffairsDataset = (regulatoryAffairs = [], renewals = []) => {
  // 1. Normalize renewals (remove legacy fields)
  // 2. Group renewals by affair ID
  // 3. Sort renewals by date (latest first)
  // 4. Calculate compliance and workflow statuses per affair
  // 5. Apply lifecycle/priority defaults
  // 6. Return enriched affairs and normalized renewals
}
```

**Enrichment Flow**:
```
Raw Data (mockData.js)
  ↓
enrichRegulatoryAffairsDataset()
  ├─ Normalize renewals (remove legacy status field)
  ├─ Group renewals by affair ID
  ├─ Sort renewals (latest first)
  ├─ Calculate complianceStatus per affair (from latest renewal)
  ├─ Calculate workflowStatus per affair (from latest renewal)
  ├─ Apply lifecycle/priority defaults
  └─ Return enriched affairs + normalized renewals
  ↓
Enriched Affairs (with 4 dimensions)
  ↓
Used by Components (HomeView, DashboardView, DetailView)
```

**Why Enrichment on Load?**

**Benefits**:
1. **Single calculation**: Status calculated once, not on every render
2. **Consistency**: All components see same status
3. **Performance**: No recalculation in components
4. **Separation of concerns**: Data layer handles business logic
5. **Testable**: Enrichment logic isolated and testable

**Before Enrichment** (Old Approach):
```javascript
// Every component recalculates status
const HomeView = ({ affairs, renewals }) => {
  const status = calculateStatus(affair, renewals); // Repeated everywhere
};
```

**After Enrichment** (Current Approach):
```javascript
// Calculated once on load
const { regulatoryAffairs } = enrichRegulatoryAffairsDataset(rawAffairs, rawRenewals);

// Components just read the status
const HomeView = ({ regulatoryAffairs }) => {
  return regulatoryAffairs.map(affair => (
    <AssetTile complianceStatus={affair.complianceStatus} />
  ));
};
```

---

## Custom Hooks for Data Aggregation

### useAssetDimensionCounts

**Location**: `src/hooks/useAssetDimensionCounts.js`

**Purpose**: Aggregate all 4 dimension counts per asset for traffic light indicators

**Returns**: `Map<assetId, { lifecycle, compliance, workflow, priority }>`

**Structure**:
```javascript
{
  lifecycle: { active: 0, archived: 0 },
  compliance: { current: 0, expiring: 0, expired: 0, permanent: 0 },
  workflow: { in_preparation: 0, submitted: 0, completed: 0, needs_renewal: 0 },
  priority: { critical: 0, high: 0, medium: 0, low: 0 },
}
```

**Usage**:
```javascript
const dimensionCounts = useAssetDimensionCounts(regulatoryAffairs);

assets.forEach(asset => {
  const counts = dimensionCounts.get(asset.id) ?? DEFAULT_COUNTS;
  // Use counts.compliance for traffic lights
  // Use counts.workflow for workflow indicators
});
```

**Design Rationale**:
- **Map structure**: O(1) lookup by asset ID
- **Memoization**: Uses `useMemo` to prevent recalculation on every render
- **Normalization**: Handles missing or null values with defaults
- **Performance**: Critical for large datasets

### useRenewalStatusData

**Location**: `src/hooks/useRenewalStatusData.js`

**Purpose**: Aggregate renewal data for dashboard charts and metrics

**Returns**: Aggregated data including:
- Compliance/workflow/priority distributions
- Health score (0-100%)
- Categorized lists (expired, critical, actionable items)
- Total counts

**Usage**:
```javascript
const {
  complianceCounts,
  workflowCounts,
  healthScore,
  criticalItems,
} = useRenewalStatusData(regulatoryAffairs, selectedCategory);

return (
  <>
    <HealthScore value={healthScore} />
    <HealthDonut data={complianceCounts} />
    <HealthDonut data={workflowCounts} />
    <CriticalItemsList items={criticalItems} />
  </>
);
```

**Design Rationale**:
- **Memoization**: Only recalculates when dependencies change
- **Filtering**: Supports category-based filtering
- **Categorization**: Pre-categorizes items for dashboard lists
- **Health score**: Calculates overall compliance health percentage

---

## Schema System

### Schema Location

**Location**: `src/data/contexts/regulatory_affairs/schemas/`

**Purpose**: Configuration-driven schema definitions for dynamic InfoTab rendering

### Supported Entity Types

**Assets** (9 types):
- `company` (empresa) - Companies with extended fields
- `product` (producto) - Products
- `person` (persona) - People
- `vehicle` (vehiculo) - Vehicles
- `facility` (establecimiento) - Facilities
- `equipment` (equipo) - Equipment
- `supplier` (proveedor) - Suppliers
- `customer` (cliente) - Clients
- `other_asset` (otro_activo) - Other assets

**Regulatory Compliance**:
- `regulatory_affair` - Regulatory affairs
- `renewal` - Renewals/updates
- `attachment` - Attachments

### Schema Structure

```javascript
{
  label: 'Entity Type Label',
  sections: [
    {
      key: 'section_key',
      title: 'Section Title',
      collapsible: true/false,
      defaultExpanded: true/false,
      condition: 'fieldName', // Optional: only show if field exists
      fields: [
        {
          key: 'fieldName',
          label: 'Field Label',
          type: FIELD_TYPES.TEXT | DATE | CURRENCY | ARRAY | BOOLEAN | EMAIL | LINK | PHONE,
          grid: { xs: 12, sm: 6, md: 4 }, // Responsive grid layout
          fallbackTo: 'otherField' // Optional: use if primary field is empty
        }
      ]
    }
  ]
}
```

**Field Types**:
- `TEXT` - Plain text
- `EMAIL` - Email address with mailto link
- `LINK` - URL with external link icon
- `PHONE` - Phone number with tel link
- `DATE` - Date with locale formatting
- `CURRENCY` - Currency with formatting
- `ARRAY` - Array of values (comma-separated)
- `BOOLEAN` - Boolean with checkmark/cross

**Why Schema-Based?**
- **No code duplication**: Single InfoTab component works for all entity types
- **Easy to extend**: Add new entity types by adding schema files
- **Consistent UX**: All detail views use same component
- **Type-safe**: Future TypeScript migration will benefit
- **Maintainable**: Change schema, not component

---

## Mock Data Organization

### Business-Based Structure

Mock data is organized by business context:

```
src/data/contexts/regulatory_affairs/businesses/
└── food_manufacturing/
    ├── assets.js
    ├── regulatoryAffairs.js
    ├── renewals.js
    ├── attachments.js
    ├── users.js
    └── historicalCompliance.js
```

**Rationale**:
- Reflects real-world deployment (one business per client)
- Easy to add new business contexts for demos
- Clean separation of concerns
- Supports multi-business scenarios

### Current Demo Business

- **Business ID**: `acme-empresa-alimenticia`
- **Business Name**: "ACME Empresa Alimenticia"
- **Domain**: `regulatory_affairs`
- **Context**: Venezuelan food manufacturer (bakery/cookies)

**Data Volume**:
- 40 assets across 9 categories
- 8 regulatory affairs for main company
- 13 renewals with dates spanning multiple years
- 26 attachments across the renewals

---

## Design Decisions

### Why Enrichment on Load?

- **Single calculation**: Status calculated once, not repeatedly
- **Consistent data**: All views see same status
- **Better performance**: No recalculation in components
- **Separation of concerns**: Data layer handles business logic

### Why Map for Dimension Counts?

- **O(1) lookup**: Fast lookup by asset ID
- **Memory efficient**: Only stores what's needed
- **Easy to iterate**: Map.forEach() for rendering
- **Null-safe**: Easy to handle missing assets

### Why useMemo in Hooks?

- **Prevents recalculation**: Only recalculates when dependencies change
- **Critical for performance**: Essential with large datasets
- **React best practice**: Memoize expensive computations
- **Dependency tracking**: Clear dependency arrays

### Why 4 Independent Dimensions?

- **Separation of concerns**: Lifecycle ≠ Compliance ≠ Workflow ≠ Priority
- **Flexible filtering**: Filter by any dimension independently
- **Better reporting**: Generate reports by any dimension or combination
- **Better UX**: Users understand "expired but submitted" vs "expired and not submitted"
- **Future-proof**: Easy to add additional dimensions without refactoring

---

## Performance Considerations

### Current Performance

- **Small dataset**: 40 assets, 8 affairs, 13 renewals, 26 attachments
- **Enrichment**: Runs once on load (< 5ms)
- **Filtering**: Instant (< 1ms)
- **Hooks**: Use useMemo (no unnecessary recalculations)

### Future with Large Datasets (1000+ affairs)

**Optimization Strategies**:
1. **Lazy enrichment**: Enrich on demand, not upfront
2. **Worker threads**: Move enrichment to Web Worker
3. **Pagination**: Load 50 items at a time
4. **Caching**: Cache enriched results
5. **Indexing**: Pre-index for faster lookups
6. **Virtual scrolling**: Only render visible items
7. **Debouncing**: Debounce filter/search inputs

---

## API Integration Plan (Future)

### Current Approach

Import from mockData.js, enrich client-side:
```javascript
import { getBusinessData } from './data/mockData';
const { regulatoryAffairs, renewals } = getBusinessData(businessId);
const enriched = enrichRegulatoryAffairsDataset(regulatoryAffairs, renewals);
```

### Future Approach

Backend enriches data before sending:
```javascript
// Backend endpoint returns pre-enriched affairs
GET /api/assets/{id}/affairs
Response: [
  {
    id: 'AFF-001',
    // ... all fields ...
    complianceStatus: 'current',      // Pre-calculated
    workflowStatus: 'completed',      // Pre-calculated
    lifecycleStatus: 'active',
    priorityLevel: 'high',
  }
]
```

**Benefits**:
- Reduces client-side processing
- Single source of truth (backend)
- Easier to test and debug
- Supports real-time updates (WebSocket)
- Better performance for large datasets

**Migration Path**:
1. Keep enrichment function for backward compatibility
2. Add API service layer
3. Gradually migrate views to use API
4. Remove client-side enrichment when all views migrated

---

## Testing Considerations

### Unit Tests

- Test enrichment function with various renewal scenarios
- Test dimension count aggregation
- Test schema field type formatting
- Test normalization logic

### Integration Tests

- Test full data flow from mock data to enriched data
- Test hook aggregation with real data
- Test schema rendering with various entity types

### Data Validation

- Validate entity relationships (affair → renewal → attachment)
- Validate date formats and ranges
- Validate required fields
- Validate enum values (status, priority, etc.)

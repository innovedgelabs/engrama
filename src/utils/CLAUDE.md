# Utils - Design Context

## Directory Purpose

Utility modules providing reusable functions, constants, and helpers used throughout the application. These modules encapsulate pure functions, business logic, and cross-cutting concerns that don't belong in components or services.

**Current Utils**:
- `i18nHelpers.js` - Internationalization (Spanish/English)
- `status.js` - 4-dimension status system (compliance, workflow, lifecycle, priority)
- `routing.js` - Route helpers and slug resolution
- `filters.js` - Filter utilities
- `renewal.js` - Renewal utility functions
- `searchNavigation.js` - Search navigation helpers
- `domainStatus.js` - Domain-specific status helpers
- `domainLoader.js` - Domain data loading utilities
- `domainRegistry.js` - Domain configuration registry
- `componentRegistry.js` - Component resolution registry
- `dashboardRegistry.js` - Dashboard component registry
- `dashboardCalculations.js` - Dashboard metric calculations
- `healthScore.js` - Health score calculation
- `userRoles.js` - RBAC: admin/attorney/user roles, permission checks, request filtering
- `requestUtils.js` - SLA calculations: due dates, business days, overdue checks

---

## i18nHelpers.js

**Purpose**: Internationalization system for bilingual support (Spanish/English)

**Design Philosophy**:
- Spanish as default language (primary market: Venezuela)
- English support for international expansion
- Fallback system ensures no missing translations
- Comprehensive dictionaries for all UI elements
- Supports 4-dimension status system

**Supported Languages**:
```javascript
export const LANGUAGES = [
  { id: 'es', label: 'Español', shortLabel: 'ES' },
  { id: 'en', label: 'English', shortLabel: 'EN' },
];

export const DEFAULT_LANGUAGE = 'es';
```

**Translation Dictionaries**:

**Category Labels**: All 9 object types with translated labels

**Status Labels (4-Dimension System)**:
- **Lifecycle Status**: active, archived
- **Compliance Status**: current, expiring, expired, permanent
- **Workflow Status**: in_preparation, submitted, completed, needs_renewal
- **Priority Level**: critical, high, medium, low

**UI Text**: 100+ translated UI elements including navigation, actions, messages, labels, sections, and dashboard text

**Helper Functions**:
- `getCategoryLabel(category, language)` - Get translated category label
- `getUIText(key, language)` - Get translated UI text
- `translateLabel(label, language)` - Translate label with fallback

**Fallback System**:
```javascript
const fallbackLookup = (dictionary, key, language) => {
  if (!dictionary[key]) return key;
  return dictionary[key][language] ?? dictionary[key][DEFAULT_LANGUAGE] ?? key;
};
```

**Fallback Order**: Requested language → Default language (Spanish) → Key itself

**Why This Approach?**
- **Graceful degradation**: Never shows missing translation keys
- **Developer-friendly**: Missing translations are visible (key shown) for debugging
- **Production-safe**: Always shows something, even if translation missing

---

## status.js

**Purpose**: Calculate regulatory compliance across four independent dimensions

**See main CLAUDE.md** for complete 4-dimension status system details (lifecycle, compliance, workflow, priority).

**Key Functions**:
- `calculateComplianceStatus(renewal, referenceDate)` - Calculates compliance from expiry date
- `calculateWorkflowStatus(renewal, complianceStatus)` - Derives workflow from submission/approval
- `getComplianceMetadata(status)`, `getWorkflowMetadata(status)`, `getPriorityMetadata(status)` - Get display metadata
- `formatDisplayDate(dateString, options)` - Locale-aware date formatting

**Date Formatting**:
```javascript
export const formatDisplayDate = (
  dateString,
  { locale = 'es-VE', fallback = 'Sin vencimiento' } = {}
) => {
  const date = normalizeDate(dateString);
  if (!date) return fallback;
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
```

**Output Examples**:
- Spanish: "15 feb 2025"
- English: "Feb 15, 2025"
- No date: "Sin vencimiento" / "No expiration"

---

## routing.js

**Purpose**: Route helpers and slug resolution for bilingual routing

**Design Philosophy**:
- Bilingual route support (Spanish/English)
- Domain-aware routing (routes can vary by domain configuration)
- Slug normalization and resolution
- Tab slug resolution for detail views

**Key Functions**:

#### getRouteSegment
```javascript
export const getRouteSegment = (key, language, domainConfig) => {
  // Returns route segment for given key in specified language
  // Example: getRouteSegment('dashboard', 'es', config) → 'panel'
  // Falls back to domain config, then hardcoded defaults
};
```

#### getTabSlug
```javascript
export const getTabSlug = (tabKey, context, language, domainConfig) => {
  // Returns tab slug for given tab key
  // Example: getTabSlug('info', 'asset', 'es', config) → 'informacion'
  // Context: 'asset', 'affair', or 'renewal'
};
```

#### resolveCategoryFromSlug
```javascript
export const resolveCategoryFromSlug = (slug, domainConfig) => {
  // Resolves category key from URL slug
  // Example: resolveCategoryFromSlug('company', config) → 'empresa'
  // Handles both English and Spanish slugs
  // Falls back to domain config, then hardcoded defaults
};
```

#### resolveRouteSegment
```javascript
export const resolveRouteSegment = (segment, domainConfig) => {
  // Resolves route segment to internal key
  // Example: resolveRouteSegment('panel', config) → 'dashboard'
  // Used for entity type detection in DetailView
};
```

#### resolveTabKeyFromSlug
```javascript
export const resolveTabKeyFromSlug = (slug, context, domainConfig) => {
  // Resolves tab slug to tab key
  // Example: resolveTabKeyFromSlug('regulatorios', 'asset', config) → 'regulatory'
  // Context-aware (different tabs for assets vs affairs vs renewals)
};
```

#### getCategorySlug
```javascript
export const getCategorySlug = (category, language, domainConfig) => {
  // Returns URL slug for category
  // Example: getCategorySlug('empresa', 'es', config) → 'empresas'
  // Used for generating category URLs
};
```

**Bilingual Routes**:

The system supports routes in both Spanish and English:
- `/dashboard` or `/panel` → DashboardView
- `/affair/:id` or `/asunto/:id` → Affair DetailView
- `/renewal/:id` or `/actualizacion/:id` → Renewal DetailView

**Domain Configuration Support**:

Routes can be customized per domain via `domainConfig.routing`:
```javascript
{
  routing: {
    categoryOrder: ['empresa', 'producto', ...],
    routeSegments: {
      dashboard: { en: 'dashboard', es: 'panel' },
      affair: { en: 'affair', es: 'asunto' },
      // ...
    },
    tabSlugs: {
      asset: {
        info: { en: 'info', es: 'informacion' },
        // ...
      },
      // ...
    }
  }
}
```

**Why Domain-Aware Routing?**
- Different domains may have different route preferences
- Supports future multi-tenant scenarios
- Allows customization without code changes
- Maintains backward compatibility with hardcoded defaults

---

## filters.js

**Purpose**: Filter utilities for multi-dimensional filtering

**Design Philosophy**:
- Pure functions for filter application
- Supports all 4 dimensions plus custom fields
- Type-safe filter operations
- Efficient filtering algorithms

**Key Functions**:

#### applyFilters
```javascript
export const applyFilters = (items, filters) => {
  // Applies multiple filters to array of items
  // Supports all 4 dimensions plus custom fields
  // Returns filtered array
};
```

**Filter Structure**:
```javascript
const filters = {
  compliance: 'current',           // Single value
  workflow: ['submitted', 'completed'], // Array of values
  priority: null,                  // No filter
  category: 'empresa',
  // ... other filters
};
```

**Why Pure Functions?**
- Easy to test
- No side effects
- Can be memoized
- Predictable behavior

---

## renewal.js

**Purpose**: Renewal utility functions

**Key Functions**:

#### getComparableRenewalDate
```javascript
export const getComparableRenewalDate = (renewal) => {
  // Returns comparable date for sorting renewals
  // Priority: approvalDate > submissionDate > expiryDate
  const dateStr = renewal.approvalDate || renewal.submissionDate || renewal.expiryDate;
  return dateStr ? new Date(dateStr).getTime() : 0;
};
```

**Usage**: Sort renewals to find latest one

```javascript
renewals.sort((a, b) => getComparableRenewalDate(b) - getComparableRenewalDate(a));
const latestRenewal = renewals[0];
```

**Why This Priority?**
- **approvalDate** most important (when renewal became official)
- **submissionDate** fallback (when process started)
- **expiryDate** last resort (target deadline)
- Return 0 if no dates (sorts to end)

---

## searchNavigation.js

**Purpose**: Search navigation helpers for routing to search results

**Key Functions**:

#### navigateToEntity
```javascript
export const navigateToEntity = (navigate, entity, entityType, language, domainConfig) => {
  // Navigates to appropriate detail view based on entity type
  // Handles assets, affairs, renewals, attachments
  // Uses domain-aware routing for bilingual support
};
```

**Usage**: Called when user clicks search result

**Why Separate Utility?**
- Centralizes navigation logic
- Handles entity type detection
- Supports domain-aware routing
- Reusable across search components

---

## domainStatus.js

**Purpose**: Domain-specific status helpers providing metadata access

**Key Functions**:

#### useStatusHelpers
```javascript
export const useStatusHelpers = () => {
  // Provides getMetadata function for status dimensions
  // Returns metadata with label, color, icon, etc.
  // Language-aware (translates labels)
};
```

**Usage**: Components use `useStatusHelpers` to get status metadata for display

---

## domainLoader.js

**Purpose**: Domain data loading utilities

**Key Functions**:
- Load domain configuration
- Load domain-specific data
- Validate domain data structure

---

## domainRegistry.js

**Purpose**: Domain configuration registry

**Key Functions**:
- Register domain configurations
- Resolve domain by ID
- Get domain-specific settings

---

## componentRegistry.js

**Purpose**: Component resolution registry for domain-specific components

**Key Functions**:

#### getTabComponent
```javascript
export const getTabComponent = (entityType, tabKey, domainConfig) => {
  // Returns appropriate tab component for entity type and tab key
  // Falls back to default components if domain doesn't override
};
```

**Why Component Registry?**
- Allows domain-specific component overrides
- Maintains default component fallbacks
- Supports multi-tenant customization

---

## dashboardRegistry.js

**Purpose**: Dashboard component registry for domain-specific dashboards

**Key Functions**:

#### getDashboardComponent
```javascript
export const getDashboardComponent = (domainId, domainConfig) => {
  // Returns domain-specific dashboard component
  // Falls back to default ControlPanelView if domain doesn't override
};
```

**Why Dashboard Registry?**
- Different domains may need different dashboard metrics
- Allows customization without modifying core views
- Maintains default dashboard fallback

---

## dashboardCalculations.js

**Purpose**: Dashboard metric calculations

**Key Functions**:

#### aggregateDashboardStats
```javascript
export const aggregateDashboardStats = (renewals) => {
  // Aggregates renewal data for dashboard metrics
  // Calculates urgency groups, expiry distributions, etc.
  // Returns structured stats object
};
```

**Usage**: Used by ControlPanelView and domain-specific dashboards

---

## healthScore.js

**Purpose**: Health score calculation for compliance metrics

**Key Functions**:

#### calculateHealthScore
```javascript
export const calculateHealthScore = (complianceCounts) => {
  // Calculates overall compliance health percentage
  // Formula: (current + permanent) / total * 100
  // Returns 0-100 score
};
```

**Usage**: Used by DashboardView and HealthScore component

---

## Design Patterns

### Pure Functions
All utility functions are pure (no side effects):
- Same input → same output
- No external state modification
- Easy to test and reason about

### Error Handling
Utilities handle edge cases gracefully:
- Null/undefined inputs → sensible defaults
- Invalid dates → fallback values
- Missing translations → key as fallback
- Missing domain config → hardcoded defaults

### Performance
- Simple calculations (< 1ms)
- No expensive operations
- Memoization at hook level, not util level
- Can optimize later if needed

### Domain-Aware Design
Many utilities support domain configuration:
- Routing can be customized per domain
- Components can be overridden per domain
- Maintains backward compatibility with defaults

---


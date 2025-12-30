# Services - Design Context

## Directory Purpose

Services contain **business logic layer** that:
- Encapsulate complex operations independent of UI
- Interface with external libraries (Fuse.js, future API clients)
- Provide clean, testable interfaces for components
- Handle cross-cutting concerns (search, caching, analytics)
- Can be easily swapped when migrating from mock data to real backend

**Current Services**:
- `searchService.js` - Global fuzzy search using Fuse.js

---

## searchService.js

**Purpose**: Global fuzzy search engine that searches across all entity types (assets, affairs, renewals, attachments) using Fuse.js with advanced token-based matching and context building.

**Architecture Overview**:
```
SearchBar/MobileSearchOverlay
  └── searchEntities(query, options)
        ├── Token-based intersection search
        ├── Fuse.js fuzzy matching per entity type
        ├── Context building (parent/grandparent info)
        └── Performance logging
```

**Key Innovation**: Token-based search with intersection logic ensures multi-word queries match ALL tokens (e.g., "empresa activa" matches both "empresa" AND "activa"), improving relevance compared to single-string fuzzy matching.

---

### Configuration

#### Searchable Fields

```javascript
const SEARCHABLE_FIELDS = {
  asset: ['name', 'code', 'activities', 'description'],
  affair: ['name', 'type', 'category', 'authority', 'description'],
  renewal: ['name', 'type', 'responsiblePerson', 'notes'],
  attachment: ['name', 'type', 'notes', 'uploadedBy']
};
```

**Design Decisions**:
- **Assets**: Name (primary), code (RIF/ID), activities (what they do), description (optional details)
- **Affairs**: Name (primary), type/category/authority (metadata), description (details)
- **Renewals**: Name (primary), type, responsible person (who owns it), notes (additional info)
- **Attachments**: Name (filename), type (category), notes (description), uploadedBy (attribution)

**Why these fields?**
- Focus on user-visible text (not IDs or dates)
- Balance between recall (finding relevant results) and precision (avoiding false positives)
- Include both primary identifiers (name) and contextual metadata (type, category)

#### Fuse.js Options

```javascript
const FUSE_OPTIONS = {
  includeScore: true,           // Return relevance scores for ranking
  threshold: 0.35,              // Max fuzzy distance (0=exact, 1=match anything)
  distance: 1000,               // Max character distance for match
  minMatchCharLength: 2,        // Minimum characters to match
  ignoreLocation: true,         // Search entire field, not just beginning
  useExtendedSearch: false      // Keep simple for performance
};
```

**Threshold Tuning (0.35)**:
- **Too low (< 0.2)**: Misses typos, requires exact matches
- **Just right (0.3-0.4)**: Tolerates 1-2 typos, good UX balance
- **Too high (> 0.5)**: False positives, irrelevant results

**Examples**:
- Query "Alimentos" matches "Alimento" (singular typo)
- Query "certificado" matches "Certificado" (case insensitive)
- Query "senat" matches "SENIAT" (missing letters)

---

### Token-Based Search Algorithm

**Purpose**: Multi-word queries should match ALL tokens, not just one.

#### Implementation

```javascript
const TOKEN_SPLIT_REGEX = /[\s,.;:]+/;

const searchWithTokenIntersection = (fuseInstance, query) => {
  // 1. Split query into tokens
  const tokens = query
    .split(TOKEN_SPLIT_REGEX)
    .map(token => token.trim())
    .filter(Boolean);

  // 2. Single token? Use standard Fuse search
  if (tokens.length <= 1) {
    return fuseInstance.search(query);
  }

  // 3. Search each token independently
  const perTokenResults = tokens.map(token => fuseInstance.search(token));

  // 4. If all tokens have no matches, fall back to full query
  if (perTokenResults.every(results => results.length === 0)) {
    return fuseInstance.search(query);
  }

  // 5. Build result map to count token matches per item
  const resultMap = new Map();
  perTokenResults.forEach(results => {
    results.forEach(result => {
      const key = result.item?.id ?? JSON.stringify(result.item);
      if (!resultMap.has(key)) {
        resultMap.set(key, {
          result,
          count: 1,
          worstScore: result.score ?? 1,
        });
      } else {
        const entry = resultMap.get(key);
        entry.count += 1;
        entry.worstScore = Math.max(entry.worstScore, result.score ?? entry.worstScore);
      }
    });
  });

  // 6. Intersection: Keep only items that matched ALL tokens
  const intersection = [];
  resultMap.forEach(entry => {
    if (entry.count === tokens.length) {
      intersection.push({
        ...entry.result,
        score: entry.worstScore,
      });
    }
  });

  // 7. No intersection? Fall back to full query
  if (intersection.length === 0) {
    return fuseInstance.search(query);
  }

  // 8. Sort by score (best matches first)
  intersection.sort((a, b) => (a.score ?? 1) - (b.score ?? 1));
  return intersection;
};
```

#### Algorithm Walkthrough

**Example Query**: `"empresa activa"`

**Step 1**: Split into tokens → `["empresa", "activa"]`

**Step 2**: Search each token independently
- Search "empresa" → Matches: EM-001 (score: 0.1), EM-002 (score: 0.15)
- Search "activa" → Matches: EM-001 (score: 0.2), PR-005 (score: 0.18)

**Step 3**: Build result map
- EM-001: count=2 (matched both tokens), worstScore=0.2
- EM-002: count=1 (only "empresa")
- PR-005: count=1 (only "activa")

**Step 4**: Intersection filter (count === tokens.length)
- **Keep**: EM-001 (matched both)
- **Discard**: EM-002, PR-005 (only one token each)

**Step 5**: Return sorted results
- EM-001 (score: 0.2)

**Why Worst Score?**
- Conservative ranking: If one token matches poorly, the overall relevance is lower
- Example: "empresa activa" where "empresa" matches perfectly (0.05) but "activa" is weak (0.4) → use 0.4 as final score
- Prevents false confidence from one good match masking a poor match

#### Edge Cases

**Empty Intersection**:
```javascript
// Query: "empresa producto zzzz"
// "zzzz" matches nothing
// Intersection would be empty
// Fall back to full query "empresa producto zzzz" (likely no results)
```

**Single Token**:
```javascript
// Query: "empresa"
// Skip intersection logic, use standard Fuse search
// Faster, no need for complex logic
```

**All Tokens Fail**:
```javascript
// Query: "xyz abc"
// Neither token matches anything
// Fall back to full query (handles edge cases gracefully)
```

---

### Context Building

**Purpose**: Enrich search results with parent/grandparent information for hierarchical navigation breadcrumbs.

#### Hierarchy Levels

```
Asset (root)
  └── Regulatory Affair
        └── Renewal
              └── Attachment
```

**Attachments** can also attach directly to **Assets** (asset-level attachments).

#### buildContext() Function

```javascript
function buildContext(entity, entityType) {
  if (entityType === 'affair') {
    // Affairs → Find parent asset
    const parentAsset = searchState.assetMap.get(entity.assetId);
    return {
      assetId: parentAsset.id,
      assetName: parentAsset.name,
      assetCategory: parentAsset.category
    };
  }

  else if (entityType === 'renewal') {
    // Renewals → Find parent affair + grandparent asset
    const parentAffair = searchState.affairMap.get(entity.affairId);
    const grandparentAsset = searchState.assetMap.get(parentAffair.assetId);
    return {
      affairId: parentAffair.id,
      affairName: parentAffair.name,
      assetId: grandparentAsset?.id,
      assetName: grandparentAsset?.name,
      assetCategory: grandparentAsset?.category
    };
  }

  else if (entityType === 'attachment') {
    // Attachments → Can attach to renewals OR assets
    if (entity.renewalId) {
      // Renewal attachment → 3-level hierarchy
      const parentRenewal = searchState.renewalMap.get(entity.renewalId);
      const parentAffair = searchState.affairMap.get(parentRenewal.affairId);
      const grandparentAsset = searchState.assetMap.get(parentAffair.assetId);

      return {
        renewalId: parentRenewal.id,
        renewalName: parentRenewal.name,
        affairId: parentAffair?.id,
        affairName: parentAffair?.name,
        assetId: grandparentAsset?.id,
        assetName: grandparentAsset?.name,
        assetCategory: grandparentAsset?.category
      };
    }
    else if (entity.assetId) {
      // Asset attachment → Direct attachment
      const parentAsset = searchState.assetMap.get(entity.assetId);
      return {
        assetId: parentAsset.id,
        assetName: parentAsset.name,
        assetCategory: parentAsset.category
      };
    }
  }

  return null;  // Assets have no parent context
}
```

#### Context Usage in UI

**SearchResultItem Component**:
```jsx
// Display hierarchy breadcrumb below result name
{result.context && (
  <Typography variant="caption" color="text.secondary">
    {result.context.assetName}
    {result.context.affairName && ` → ${result.context.affairName}`}
    {result.context.renewalName && ` → ${result.context.renewalName}`}
  </Typography>
)}
```

**Example Output**:
- **Affair**: "RNC Registration" → *Alimentos del Valle C.A.*
- **Renewal**: "Renewal 2024" → *Alimentos del Valle C.A. → RNC Registration*
- **Attachment**: "certificate.pdf" → *Alimentos del Valle C.A. → RNC Registration → Renewal 2024*

**Why Context?**
- **User clarity**: Shows where the result lives in the hierarchy
- **Navigation aid**: Click result → navigate to correct detail view with breadcrumbs
- **Disambiguation**: Multiple results with same name can be distinguished by parent

---

### Main Search Function

#### searchEntities() API

```javascript
export function searchEntities(query, options = {})
```

**Parameters**:
```typescript
interface SearchOptions {
  entityType?: 'all' | 'asset' | 'affair' | 'renewal' | 'attachment';  // Type filter
  assetId?: string;       // Contextual search: limit to specific asset
  affairId?: string;      // Contextual search: limit to specific affair
  limit?: number;         // Max results per entity type (default: 3)
  offset?: number;        // Pagination offset (future use)
}
```

**Returns**:
```typescript
interface SearchResults {
  groups: Array<{
    entityType: string;
    results: Array<{
      ...entityFields,
      entityType: string,
      matchScore: number,    // Fuse score (lower = better)
      context: object|null   // Parent hierarchy info
    }>
  }>;
  total: number;           // Total results across all types
  query: string;           // Normalized query string
}
```

#### Implementation Flow

```javascript
export function searchEntities(query, options = {}) {
  const startTime = performance.now();

  const {
    entityType = 'all',
    assetId = null,
    affairId = null,
    limit = 3,
    offset = 0
  } = options;

  // 1. Validation: Minimum query length (2 characters)
  if (!query || query.trim().length < 2) {
    return { groups: [], total: 0 };
  }

  const trimmedQuery = query.trim();
  const results = [];

  // 2. Search each entity type (if not filtered)
  // Assets
  if (!entityType || entityType === 'all' || entityType === 'asset') {
    const assetSearchResults = searchWithTokenIntersection(assetFuseInstance, trimmedQuery);

    // Apply context filter (if searching within specific asset)
    let filteredResults = assetSearchResults;
    if (assetId) {
      filteredResults = assetSearchResults.filter(result => result.item.id === assetId);
    }

    const assetResults = filteredResults
      .slice(0, limit)  // Pagination
      .map(result => ({
        ...result.item,
        entityType: 'asset',
        matchScore: result.score,
        context: null  // Assets have no parent
      }));

    if (assetResults.length > 0) {
      results.push({ entityType: 'asset', results: assetResults });
    }
  }

  // Affairs, Renewals, Attachments (similar pattern)

  // 3. Calculate total matches
  const total = results.reduce((sum, group) => sum + group.results.length, 0);

  // 4. Performance logging
  const endTime = performance.now();
  const searchTime = (endTime - startTime).toFixed(2);
  if (searchTime > 100) {
    console.warn(`[Search Performance] Query "${trimmedQuery}" took ${searchTime}ms (threshold: 100ms)`);
  } else {
    console.log(`[Search Performance] Query "${trimmedQuery}" took ${searchTime}ms`);
  }

  // 5. Return grouped results
  return { groups: results, total, query: trimmedQuery };
}
```

---

### Data Management

#### setSearchData()

```javascript
export const setSearchData = (data = {}) => {
  const assets = data.assets || [];
  const affairs = data.regulatoryAffairs || data.affairs || [];
  const renewals = data.renewals || [];
  const attachments = data.attachments || data.documents || [];

  // Store data in searchState
  searchState.assets = assets;
  searchState.affairs = affairs;
  searchState.renewals = renewals;
  searchState.attachments = attachments;

  // Build lookup maps for context building
  searchState.assetMap = new Map(assets.map((a) => [a.id, a]));
  searchState.affairMap = new Map(affairs.map((a) => [a.id, a]));
  searchState.renewalMap = new Map(renewals.map((r) => [r.id, r]));

  // Rebuild Fuse instances with new data
  searchState.assetFuse = buildFuse(assets, SEARCHABLE_FIELDS.asset);
  searchState.affairFuse = buildFuse(affairs, SEARCHABLE_FIELDS.affair);
  searchState.renewalFuse = buildFuse(renewals, SEARCHABLE_FIELDS.renewal);
  searchState.attachmentFuse = buildFuse(attachments, SEARCHABLE_FIELDS.attachment);
};
```

**Purpose**: Initialize or update search data when domain data changes

**When to Call**: 
- On app initialization (load domain data)
- When switching domains
- When data is refreshed from backend

**Why Rebuild Fuse Instances?**
- Fuse instances are tied to specific data arrays
- When data changes, instances must be rebuilt
- Pre-creating instances at module load won't work with dynamic data

---

### Performance Optimizations

#### 1. Pre-Created Fuse Instances (Module-Level)

**Pattern**: Create Fuse instances once when data is set, reuse for all searches

```javascript
// Create once when setSearchData() is called
const assetFuseInstance = new Fuse(assets, {
  ...FUSE_OPTIONS,
  keys: SEARCHABLE_FIELDS.asset
});

// Reuse for all searches
export function searchEntities(query) {
  return assetFuseInstance.search(query);
}
```

**Performance Impact**:
- **Before**: ~50-100ms per search (instance creation + search)
- **After**: ~5-20ms per search (search only)
- **5-10x faster** for typical queries

**Trade-off**: Data must be set via `setSearchData()` before searching. When connecting to backend, call `setSearchData()` when data is fetched.

#### 2. Context Filter After Search (Not Before)

**Anti-Pattern** (slow for large datasets):
```javascript
// BAD: Filter data first, then search
const filteredAssets = mockAssets.filter(a => a.category === 'empresa');
const fuse = new Fuse(filteredAssets, FUSE_OPTIONS);
return fuse.search(query);
```

**Optimized** (fast):
```javascript
// GOOD: Search first, filter results
const allResults = assetFuseInstance.search(query);
const filteredResults = allResults.filter(result => result.item.category === 'empresa');
return filteredResults;
```

**Why?**
- Fuse instances are expensive to create (~10-50ms for 100+ items)
- Pre-filtering requires creating multiple Fuse instances (one per context)
- Post-filtering is cheap (array filter ~0.1-1ms)

#### 3. Performance Logging

```javascript
const searchTime = (endTime - startTime).toFixed(2);

if (searchTime > 100) {
  console.warn(`[Search Performance] Query "${trimmedQuery}" took ${searchTime}ms (threshold: 100ms)`);
} else {
  console.log(`[Search Performance] Query "${trimmedQuery}" took ${searchTime}ms`);
}
```

**Purpose**:
- Identify slow searches during development
- Threshold: 100ms (imperceptible to users)
- Helps catch performance regressions

**Typical Performance**:
- Simple query ("empresa"): 5-15ms
- Multi-word query ("empresa activa"): 10-30ms
- Complex query with many tokens: 20-50ms

**When it slows down**:
- Dataset grows (> 1000 items per type)
- Complex regex patterns in searchable fields
- Many search tokens (> 5 words)

---

### Usage Examples

#### 1. Global Search (SearchBar)

```javascript
import { searchEntities } from '../services/searchService';

const handleSearch = (query) => {
  const results = searchEntities(query, {
    entityType: 'all',  // Search all types
    limit: 3            // Top 3 results per type for dropdown
  });

  // results.groups:
  // [
  //   { entityType: 'asset', results: [...] },
  //   { entityType: 'affair', results: [...] },
  //   { entityType: 'renewal', results: [...] }
  // ]
};
```

#### 2. Contextual Search (Asset Detail View)

```javascript
// Search only affairs and renewals for specific asset
const results = searchEntities(query, {
  entityType: 'all',
  assetId: 'EM-001',  // Limit to affairs/renewals under EM-001
  limit: 10
});

// Only returns results related to asset EM-001
```

#### 3. Type-Filtered Search

```javascript
// Search only attachments
const results = searchEntities(query, {
  entityType: 'attachment',
  limit: 20
});

// results.groups will only contain attachment results
```

---

### Design Decisions

#### Why Fuse.js?

**Alternatives Considered**:
1. **Backend Elasticsearch** - Overkill for prototype, requires backend
2. **Backend PostgreSQL Full-Text Search** - Requires backend, complex setup
3. **Simple .includes() filter** - No fuzzy matching, poor UX
4. **Lunr.js** - Similar to Fuse but less maintained

**Fuse.js Advantages**:
- ✅ Lightweight (< 10KB gzipped)
- ✅ No backend required (works with mock data)
- ✅ Fast for small-medium datasets (< 10,000 items)
- ✅ Configurable relevance scoring
- ✅ Good TypeScript support (future migration)
- ✅ Active maintenance and large community

**Fuse.js Limitations** (acceptable for prototype):
- ❌ Slows down with > 10,000 items per type
- ❌ No stemming ("running" won't match "run")
- ❌ No synonym support ("company" won't match "business")
- ❌ Client-side only (no server-side caching)

**Migration Path**: When backend is ready, replace Fuse.js with Elasticsearch/Algolia. The `searchEntities()` API stays the same, just swap the implementation.

#### Why Token-Based Intersection?

**Problem**: Standard Fuse.js treats "empresa activa" as one fuzzy string, not two separate requirements.

**Example**:
- Query: "empresa activa"
- Standard Fuse: Matches "Empresa Alimenticia" (has "empresa", ignores "activa")
- Token-based: Only matches if BOTH "empresa" AND "activa" are present

**Better Relevance**: Multi-word queries now require all words to match, mimicking Google-style search behavior.

#### Why Context Building?

**Problem**: Search results without context are ambiguous.

**Example**:
- Three results named "Renewal 2024"
- Which affair? Which asset?
- User can't distinguish without clicking

**Solution**: Show parent hierarchy in search result description:
- "Renewal 2024" → *Alimentos del Valle C.A. → RNC Registration*
- "Renewal 2024" → *Productos La Nona → Health Permit*
- "Renewal 2024" → *Vehículo ABC-123 → Vehicle Registration*

**Better UX**: User immediately knows which result to click.

#### Why Pre-Created Fuse Instances?

**Problem**: Creating Fuse instances is expensive (10-50ms).

**Solution**: Create once when data is set, reuse for all searches.

**Trade-off**: Data must be set via `setSearchData()` before searching. When backend is connected, call `setSearchData()` when data is fetched.

**Future Options**:
1. Recreate instances when data fetched (simple, works for infrequent updates)
2. Use Fuse's `setCollection()` method (efficient for frequent updates)
3. Debounce instance recreation (avoid thrashing on rapid updates)

---


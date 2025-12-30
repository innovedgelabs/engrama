# A1: Entity Search Interface

## Purpose
Universal search interface for attorneys to find entities by name, ISIN, or LEI with autocomplete suggestions.

## User Story
As an attorney, I want to search for any entity using any identifier (name, ISIN, or LEI) so I can quickly access entity details and compliance information.

## Components

### Header Bar
- System name: "BCI Legal Compliance System"
- User indicator showing logged-in attorney name and role

### Navigation
Tabs or links to:
- Dashboard (current/active)
- Entity Registry
- Request Queue
- Reports

### Search Section
- Page title: "Entity Registry Search"
- Single search input that accepts:
  - Entity name (partial match)
  - ISIN (exact or partial)
  - LEI (exact or partial)
- Placeholder: "Search by entity name, ISIN, or LEI..."
- Search button

### Autocomplete Dropdown
Appears as user types (minimum 2-3 characters). Each result shows:
- **Entity name** (bold)
- **Entity type** (e.g., Corporation, Partnership)
- **Primary identifier** (LEI or ISIN depending on what matched)
- **Country of registration**

Results should indicate which field matched the search (useful when searching by ISIN but showing entity name).

## Behavior

### Search Logic
- Search is case-insensitive
- Matches against: legal name, any associated ISIN, LEI
- Results ranked by relevance (exact matches first)
- Maximum ~10 results in dropdown

### Navigation
- Clicking a result navigates to Entity Detail page (A2) for that entity
- Pressing Enter with text performs full search (if implementing a results page)
- First result is highlighted by default for keyboard navigation

### Empty/Error States
- No matches: "No entities found for '[query]'"
- Minimum characters: "Type at least 2 characters to search"

## Data Requirements
Each autocomplete result needs:
- `entity_id` (for navigation)
- `legal_name`
- `entity_type`
- `lei`
- `country`
- Associated ISINs (for matching)

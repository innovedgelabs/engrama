# A5: Security Holdings View

## Purpose
List view displaying all holdings grouped by investment entity, with filtering capabilities by investment strategy and entity.

## User Story
As an attorney or administrator, I want to see all security holdings organized by entity so I can quickly assess exposure across investment programs and identify holdings for specific entities.

## Components

### Filter Card
Paper card at the top containing:

#### Header Row
- **Title**: "Security Holdings" (left-aligned, primary color)
- **Summary**: "X holdings across Y entities" (secondary text below title)
- **Clear Button**: "Clear" chip with X icon (right-aligned, only visible when filters active)

#### Filters Row
Two filter controls in a responsive layout:

| Filter | Type | Description |
|--------|------|-------------|
| Investment Strategy | Multi-select | Filter by investment program (Infrastructure, Private Equity, etc.) |
| Filter by Entity | Autocomplete | Single-select entity filter with search |

**Investment Strategy Filter**:
- Desktop (md+): Horizontal row of FilterChip pills
- Mobile (< md): Select dropdown with multiple selection
- Shows all unique investment programs from holdings data

**Entity Filter**:
- Autocomplete with search icon
- Options derived from holdings (only entities with holdings shown)
- Each option displays: Entity name (primary), Entity type + Industry (secondary)
- Placeholder: "All entities"

### Holdings Accordions
Holdings grouped by entity, displayed as expandable accordion sections:

#### Accordion Header
| Element | Description |
|---------|-------------|
| Entity Name | Primary text, bold, primary color |
| Holding Count | Chip badge showing number of holdings |
| Total Market Value | Right-aligned, formatted as compact currency (e.g., "$45.2M") |

#### Accordion Content
DataTable with the following columns:

| Column | Description |
|--------|-------------|
| Security | Security name (primary) + Identifier (secondary: ISIN → CUSIP → ID) |
| Program | Investment program as clickable chip (clicking filters by that program) |
| Market Value | Formatted as compact currency |
| Capital Stack | Position in capital stack (Senior, Mezzanine, etc.) |
| As Of | Date of the holding data |

### Summary Text
Located between filter card and accordions:
- Format: "X holdings across Y entities"
- Updates dynamically based on active filters

## Appearance

### Filter Card Styling
- Paper with no elevation (`elevation={0}`)
- Subtle border (`border: 1px solid divider`)
- Rounded corners (`borderRadius: 2`)
- Internal padding: 16-20px responsive

### Filter Labels
- Uppercase text
- Letter-spacing: 0.5px
- Font size: 0.7rem
- Font weight: 600
- Color: text.secondary

### Accordion Styling
- Follows AssetGrid accordion pattern for consistency
- Border-bottom highlight when expanded (secondary color)
- Hover state on summary row
- Responsive spacing between accordions

### Table Styling
- Compact size for information density
- Clickable rows (navigate to holding detail)
- Sortable columns: Security, Market Value, As Of

## Behavior

### Data Flow
1. Load all holdings from domain data
2. Derive entity list from holdings (only entities with holdings)
3. Apply filters to holdings
4. Group filtered holdings by entity
5. Render accordions with grouped data

### Filter Logic
- **Investment Strategy**: Multi-select, OR logic (holding matches if program in selected list)
- **Entity**: Single-select, exact match on entity_id
- Filters are additive (both must match when both active)
- Filter state persisted in URL query params (`?program=X,Y&entity=Z`)

### URL Parameters
| Parameter | Format | Description |
|-----------|--------|-------------|
| program | Comma-separated | Selected investment programs |
| entity | Single ID | Selected entity ID |

### Accordion Behavior
- All accordions expanded by default
- Click header to toggle expand/collapse
- Expansion state managed locally (not in URL)

### Row Interaction
- Clicking a holding row navigates to holding detail view
- Clicking program chip in table toggles that program filter
- Route: `/{holding-segment}/{holding-id}/info`

### Responsive Behavior
- Desktop (md+): Filter pills inline, side-by-side layout
- Mobile (< md): Filter dropdown, stacked layout
- Table scrolls horizontally on small screens

## Data Requirements

### Holdings Data
Each holding record needs:
- `id` - Unique identifier
- `entity_id` - Parent entity reference
- `entity_name` - Entity display name
- `security_id` - Security reference
- `security_name` - Security display name
- `isin` - ISIN identifier (optional)
- `cusip` - CUSIP identifier (optional)
- `investment_program` - Investment strategy name
- `market_value` - Numeric market value
- `capital_stack_position` - Position string
- `as_of_date` - Date string

### Entity Data (from assets)
- `id` - Entity identifier
- `name` - Entity name
- `entity_type` - Type classification
- `industry` - Industry classification

## Empty States

### No Holdings
- Title: "No results found" (from getUIText)
- Description: Standard no results subtitle

### No Filter Matches
- Title: "No results found"
- Description: "No holdings match the selected filters."

### No Holdings for Entity (in accordion)
- Title: "No holdings for this entity"
- Description: (empty)

## Route Configuration

| Language | Path |
|----------|------|
| English | `/security` |
| Spanish | `/valor` |

Accessible via "Securities" navigation item in sidebar (pension_fund domain only).

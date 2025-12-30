# D1: Request Form (Deal Team)

## Purpose
Form for deal team members to submit legal compliance requests (NDA, MNPI, Info Sharing, NRL).

## User Story
As a deal team member, I want to submit a legal request by selecting the type and filling in details so that the legal team can review and process it.

## Routes
- `/requests/new` — New request from scratch
- `/requests/new?entity=ENTITY-001` — New request pre-populated with entity
- `/requests/edit/:id` — Edit an existing draft request

## Appearance

### Layout
- Full-height ContentPanel with fixed header and footer
- Scrollable form body between header and footer
- Max width constrained for readability

### Header
- Title: "New Legal Request" (or "Edit Request" when editing)
- Title updates to show selected type (e.g., "New Legal Request - Non-Disclosure Agreement")

### Footer (Action Buttons)
- **Save as Draft** — Outlined button with save icon, left position
- **Submit Request** — Primary contained button with send icon, right position
- On mobile: Buttons stack vertically, Submit on top

## Components

### Request Type Selector
Four card-style buttons displayed in a responsive grid:

| Type | Abbreviation | Icon |
|------|--------------|------|
| NDA | Non-Disclosure Agreement | DescriptionOutlined |
| MNPI | Material Non-Public Information | LockOutlined |
| Info Sharing | Internal Information Request | ShareOutlined |
| NRL | Non-Reliance Letter | AssignmentOutlined |

**Appearance:**
- Grid layout: 4 columns on md+, 2 columns on sm, 1 column on xs
- Cards show icon and abbreviation (full name in tooltip)
- Selected card: teal border and background tint
- Unselected cards: gray border, hover shows light border
- Minimum height 100px per card

### Common Form Fields

#### Counterparty Name * (required)
- Type: Autocomplete with search icon
- Searches investment entity registry by name, LEI, ticker (entity fields) or CUSIP, ISIN (via security lookup)
- Shows entity name with LEI and ticker below in dropdown options
- Populates `counterparty_id`, `counterparty_name`, and `entity_lei`
- **TODO**: If entity not found, show guidance on how to request new entity

#### Target Name
- Type: Text input
- Helper: "For investment due diligence or acquisition opportunities"

#### Project Name
- Type: Text input
- Helper: "Used for internal tracking and organization"

#### Office Location * (required)
- Type: Chip-style buttons (single select)
- Options: Victoria, Vancouver, London, New York
- Grid layout: 4 columns on md+, 2 columns on smaller
- Selected chip: primary color border and tint

#### Investment Strategy * (required)
- Type: Dropdown select
- Options: Infrastructure, Private Equity, Private Credit, Fixed Income, Listed Equities, FX Trading, Real Estate, Other

#### Information Will Be Shared To
- Type: Dropdown select
- Same options as Investment Strategy
- Helper: "Select the investment strategy team that will receive this information"

#### Estimated Value (optional)
- Type: Text input with $ prefix
- Accepts formatted numbers (commas, periods)
- Helper: "Approximate value of the transaction or investment"

#### Purpose of Request * (required)
- Type: Multi-line text (4 rows)
- Placeholder: "Describe the business purpose and context for this agreement..."
- Minimum 10 characters for submission

#### Urgency Level
- Type: Chip-style buttons (single select)
- Options: Normal (default), High, Urgent
- Selected chip: secondary (teal) color styling

#### Additional Details (optional)
- Type: Multi-line text (3 rows)
- Placeholder: "Any specific terms, conditions, or special requirements..."

### Help Section
**Not implemented.** Should include links to:
- Request type guidelines/policies
- FAQ
- Legal affairs contact information

### Type-Specific Fields

#### MNPI Fields
- **Information Source** * — Who is providing the material information
- **Recipients** * — Teams or individuals receiving MNPI
- **Information Scope** * — Multi-line description of what MNPI is included
- **Blackout Start** — Date picker (cannot be in the past)
- **Blackout End** — Date picker (must be after start, cannot be in the past)
- **Restrictions / Notes** — Multi-line optional notes

#### Info Sharing Fields
- **Audience / Receiving Team** * — Which teams or divisions will receive
- **Data or Information Types** * — Categories of data to be shared
- **Channels / Delivery** — How the information will be shared
- **Retention / Expiration Date** — Date picker (cannot be in the past)

#### NRL Fields
- **Transaction / Matter** * — Name of the deal or investment
- **Reliance Scope** * — Multi-line: what counterparty may or may not rely on
- **Governing Law** * — Choose applicable jurisdiction
- **Effective Date** * — Date picker (cannot be in the past)
- **Primary Counsel Contact** — Who should receive drafts and comments

## Behavior

### Form Validation
- Required fields validated on submission
- Counterparty must be selected from autocomplete
- Purpose minimum 10 characters
- Date fields: cannot be in the past, end dates must be after start dates
- Type-specific required fields validated based on selected type
- Inline error messages below fields
- Error alert at top of form on submission failure

### Draft Saving
- "Save as Draft" validates only counterparty and request type
- Saves with `workflow_status: 'draft'`
- Drafts appear in "My Requests" list
- Drafts can be edited via `/requests/edit/:id`

### Submission
- Full validation including type-specific required fields
- Creates request with `workflow_status: 'submitted'`
- Calculates due date from urgency:
  - Urgent: +1 day
  - High: +3 days
  - Normal: +7 days
- Triggers domain refresh event
- Navigates to My Requests on success

### Pre-population
- When `?entity=ENTITY-001` in URL, pre-selects entity in autocomplete
- When editing draft, all fields populated from existing data
- Estimated value converted back to display format when editing

### Error Handling
- Displays error alert at top of form
- Alert is dismissible
- Submit buttons show loading spinner during submission

## Data Requirements

### Form Submission
- `request_type` — NDA, MNPI, INFO_SHARING, NRL
- `counterparty_id` — Entity ID from autocomplete
- `counterparty_name` — Entity name
- `entity_lei` — Entity LEI (if available)
- `target_name` — Optional target name
- `project_name` — Optional project name
- `office_location` — Victoria, Vancouver, London, New York
- `investment_program` — Investment strategy
- `shared_with_team` — Receiving team
- `estimated_value` — Parsed to number
- `purpose` — Business purpose text
- `urgency` — normal, high, urgent
- `additional_details` — Optional notes
- `submitted_by` — Current user name
- `submitted_at` — ISO timestamp
- `workflow_status` — draft or submitted
- `due_date` — Calculated for submitted requests

### Type-Specific Fields
See Type-Specific Fields section above for field names and requirements.

# A2: Entity Detail Page

## Purpose
Comprehensive view of an entity showing GLEIF data, BCI holdings, board seats, compliance status, potential conflicts, and associated securities.

## User Story
As an attorney, I want to see all relevant information about an entity in one place so I can assess compliance obligations and potential conflicts before making decisions.

## Components

### Search Bar
- Same search functionality as A1 at top of page
- Allows quick navigation to another entity without going back

### Entity Header
- **Entity name** (prominent)
- **Status badge**: Active/Inactive (from GLEIF)
- **LEI** displayed below name
- **Action buttons**:
  - "Submit Request" — opens request form for this entity
  - "Export Report" — generates PDF/document of entity profile

### Section 1: Entity Information
Full-width section showing GLEIF data:
- Legal Name
- LEI
- Country
- Legal Form (Corporation, Partnership, etc.)
- Registration jurisdiction
- Last updated date (from GLEIF)

### Section 2: Summary Cards (3 columns)

#### BCI Holdings
Shows all BCI divisions with positions in this entity:
- Division name
- Position amount (e.g., "$800M")
- Position details (e.g., "14,500 shares common stock")
- Divisions with no position shown as "Evaluating" or "None"

#### Board Seats
Shows BCI personnel on entity's board:
- Person name
- BCI division/team
- Board title (Director, Observer, etc.)
- Appointment date
- Next board meeting date
- **Visual warning indicator** if board seat exists (highlights compliance implications)

#### Compliance Status
Quick summary of current compliance state:
- Active NDAs: count or "None"
- MNPI Status: "Clean" or "Restricted"
- Information Barriers: "None" or list active barriers

### Section 3: Active Obligations
Lists all active compliance obligations for this entity:
- NDAs (with counterparty, expiration)
- MNPI restrictions (with details)
- Information barriers (between which teams)
- Non-reliance letters

If no active obligations, show: "No active obligations"

### Section 4: Potential Conflicts
Displays system-detected conflicts with severity:

**Critical** (red):
- Board seat conflicts
- Active MNPI with pending transactions

**Moderate** (yellow/amber):
- Multi-division exposure
- Upcoming NDA expirations

**No Issues** (green):
- Confirmation when specific conflict types don't apply

Each conflict shows:
- Severity indicator
- Conflict type/title
- Brief description of the issue
- Implication for BCI

### Section 5: Securities & Identifiers
Table of all securities associated with this entity:
- ISIN
- Security type (Common Stock, Bond, etc.)
- Exchange
- **BCI Position** — highlighted row if BCI holds this security, showing position value

## Behavior

### Data Loading
- Entity info from GLEIF API/cache
- Holdings from internal positions database
- Board seats from internal records
- Compliance status from obligations database
- Securities from GLEIF LEI-ISIN mapping

### Conflict Detection
System automatically flags:
- Board seat present → cannot vote on certain decisions
- Multiple divisions holding/evaluating same entity → information barrier considerations
- Active MNPI → trading restrictions

### Navigation
- "Submit Request" pre-fills entity on request form
- Securities rows could link to security detail (if applicable)
- Board member names could link to personnel profiles

## Data Requirements

### Entity
- `entity_id`, `legal_name`, `lei`, `country`, `legal_form`, `registration`, `status`, `last_updated`

### Holdings
- `division`, `position_type`, `amount`, `shares`, `last_updated`

### Board Seats
- `person_name`, `person_division`, `board_title`, `appointed_date`, `term_end`, `next_meeting`

### Compliance
- `ndas[]`, `mnpi_status`, `information_barriers[]`, `nrls[]`

### Securities
- `isin`, `security_type`, `exchange`, `bci_position` (null if not held)

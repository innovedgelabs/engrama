# A3: Request Queue / My Requests

## Purpose
List view for managing legal requests. Supports two modes:
- **Request Queue** — For attorneys/admins to review pending requests
- **My Requests** — For all users to view their own submissions

## User Story
As an attorney, I want to see all requests assigned to me in a sortable list so I can prioritize my review work based on urgency and due dates.

As a deal team member, I want to see all my submitted requests so I can track their status and edit drafts.

## Routes
- `/` — Request Queue (attorneys/admins only, home page for pension_fund domain)
- `/my-requests` — My Requests (all users)

## Access Control
- General users accessing `/` are automatically redirected to `/my-requests`
- Request Queue shows requests filtered by user role (admin sees all, attorney sees by strategy)
- My Requests shows only the current user's submissions (all statuses including drafts)

## Appearance

### Layout
- PageLayout with no back button
- ListFilterHeader with title, subtitle, filters, and action button
- DataTable in bordered card container

### Header (ListFilterHeader)
- **Title**: "Request Queue" or "My Requests" based on mode
- **Subtitle**: Descriptive text about the view
- **Count Badge**: Shows filtered request count
- **New Request Button**: Primary button with + icon, navigates to `/requests/new`
- **Filter Dropdowns**: Status, Urgency, Type (single-select, persisted in URL)

### Table
DataTable with 6 columns:

| Column | Content |
|--------|---------|
| Request | Request type + ID (e.g., "NDA #REQ-001") with status badge below |
| Entity | Counterparty name with truncated LEI below |
| Submitted By | Submitter name with investment program below |
| Date | Formatted submission date and time |
| Urgency | Urgency badge with due date text below |
| Action | "View" button or "Edit" + delete icon for drafts |

### Status Badges
- **PENDING** (info/blue) — Submitted, awaiting review
- **IN REVIEW** (warning/orange) — Attorney has started reviewing
- **DRAFT** (default/gray) — Not yet submitted (My Requests only)
- Other statuses use domain status system colors

### Urgency Badges
- **URGENT** (error/red) — 1 day SLA
- **HIGH** (warning/orange) — 3 day SLA
- **NORMAL** (info/blue) — 7 day SLA

Due date shown below badge. Overdue requests show "OVERDUE - " prefix in error color with bold text.

**Not implemented:** Overdue rows should have visual distinction (background tint or left border).

## Behavior

### Default Sort
- Primary: Urgency (Urgent → High → Normal)
- Secondary: Due date (earliest first)

### Filtering
- Single-select dropdowns for Status, Urgency, Type
- Filter state persisted in URL params (`?status=pending&urgency=high&type=NDA`)
- Status options differ by mode (My Requests includes draft/approved/rejected)
- Clear filters resets URL params
- **Not implemented:** Entity filter

### Filtering by Mode
**Request Queue mode:**
- Shows only `submitted` and `in_review` status requests
- Filters by user role (admin sees all, attorney sees by assigned strategy)
- Excludes drafts, approved, and rejected

**My Requests mode:**
- Shows all statuses including drafts
- Filtered to only current user's submissions

### Row Interaction
- Clicking row or "View" button navigates to request detail view
- Draft rows navigate to edit form (`/requests/edit/:id`) instead
- Draft rows show "Edit" button + delete icon instead of "View"

### Delete Draft
- Delete icon appears only for user's own drafts
- Opens confirmation dialog
- Dialog shows warning that action cannot be undone
- Confirming deletes the draft and refreshes the list

### Empty State
- Title: "No pending requests" (queue) or "You don't have any requests" (my requests)
- Description: Contextual message based on mode
- **Not implemented:** Option to view completed/archived requests


## Data Requirements

Each request displays:
- `id` — Request ID
- `request_type` — NDA, MNPI, INFO_SHARING, NRL
- `workflow_status` — draft, submitted, in_review, approved, rejected
- `counterparty_name` — Entity name
- `entity_lei` — Entity LEI (truncated to 8 chars + "...")
- `submitted_by` — Requester name
- `investment_program` — Investment strategy/division
- `submitted_at` — Submission datetime
- `urgency` — normal, high, urgent
- `due_date` — Calculated due date
- `is_overdue` — Boolean for overdue highlighting

## Components Used
- `PageLayout` — Page container
- `ListFilterHeader` — Header with title, filters, and action button
- `DataTable` — Sortable table with sticky headers
- `Chip` — Status and urgency badges
- `Dialog` — Delete confirmation
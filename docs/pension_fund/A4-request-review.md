# A4: Request Review

## Purpose
Dedicated view for attorneys to review pending requests with full context including entity information, conflict analysis, and decision actions.

## Route
`/request/:id/review` - Only accessible to attorneys/admins (general users redirected to info view)

---

## Layout Structure

Single-page, section-based layout (not tab-based):

1. **Header** (Paper) - Title, counterparty link, status badges
2. **Request Context** (Paper, 3:2 grid) - Request Details (60%) | Entity Summary (40%)
3. **Conflicts** (Paper) - Full-width conflict cards or "no conflicts" state
4. **Review** (Paper) - Two-column (Recommended Actions | Approval Status) + Notes + Decision buttons

---

## Section 1: Header

| Element | Content |
|---------|---------|
| Title | "{Request Type} Request ({id})" - e.g., "NDA Request (REQ-001)" |
| Subtitle | Counterparty name (clickable link to entity) |
| Status badge | Workflow status chip (IN REVIEW, PENDING, etc.) |
| Urgency badge | URGENT (red), HIGH (yellow), NORMAL (outlined) |

---

## Section 2: Request Context (3:2 Grid)

### Left Column: Request Details (60%)

| Field | Description |
|-------|-------------|
| Counterparty | Entity name (link to entity detail) |
| Target Name | Target company name (shows N/A if empty) |
| Project Name | Internal project code (shows N/A if empty) |
| Investment Strategy | Requester's investment program |
| Shared To | Team receiving information (shows N/A if empty) |
| Office | Requester's office location |
| Estimated Value | Currency formatted (shows N/A if empty) |
| Submitted By | Requester name |
| Date | Submission date/time |
| Purpose | Full-width, free-text description |
| Additional Details | Only shown if present (hides when blank) |

### Right Column: Entity Summary (40%)

- **Entity name** (bold, link to entity detail)
- **Identifier row**: LEI/identifier (type) + Entity type + Country
- **Quick Facts**:
  - BCI total holdings value
  - Board member(s) if any (name + title)
  - Investment programs with holdings
- **Link**: "View full entity profile" with external icon

---

## Section 3: Conflicts

### With Conflicts
- Section title: "Conflicts Detected (N)" with warning icon
- Title color: red if critical conflicts, yellow if only warnings

**Conflict Card** (severity-based styling):
| Element | Critical | Warning |
|---------|----------|---------|
| Border | 4px left red | 4px left yellow |
| Background | Light red | Light yellow |
| Severity label | "CRITICAL" badge | "MODERATE" badge |

**Card Content**:
- Type label (translated): "Board Seat Conflict", "Multi-Division Exposure", etc.
- Message: Human-readable summary
- Details: Additional context (if present)
- Impact: Business impact description (if present)
- Recommendation: Suggested action in primary color (if present)

### No Conflicts
- Section title: "No Conflicts Detected" with green checkmark
- Green-bordered card: "No conflicts of interest detected for this request."

---

## Section 4: Review

### Two-Column Layout

**Left: Recommended Actions**
- Bullet list generated from conflict recommendations
- Standard action: "Create {type} obligation record for {entity}"

**Right: Approval Status**
- Checkbox icon (empty if pending, checked if decided)
- Reviewer name (bold) + role
- Status chip: "Pending your decision" (warning) or final status

### Notes Field
- Multiline text field
- Label: "Notes/Comments (optional)"
- Placeholder text for guidance

### Decision Buttons (horizontal stack)
| Button | Color | Icon |
|--------|-------|------|
| Approve with Conditions | Green contained | Check |
| Request More Info | Yellow outlined | Help |
| Reject Request | Red outlined | Close |

### Footer Note
"If approved, selected obligations will be automatically created in entity register"

---

## Behavior

### Decision Flow
1. Attorney clicks decision button
2. Confirmation dialog opens with:
   - Action-specific title/body
   - Request summary (type, ID, counterparty)
   - Notes preview (if entered)
3. On confirm: `updateRequest()` called with new status
4. `domain:refresh` event dispatched
5. Navigate back to queue

### Status Updates
| Action | New Status |
|--------|------------|
| Approve | `approved` |
| Request Info | `needs_info` |
| Reject | `rejected` |

### Read-Only State
If request already decided (approved/rejected):
- Review section shows "already reviewed" message
- Approval notes displayed (if any)
- No action buttons

### Navigation
- Back button returns to previous page
- Entity links open entity detail view
- After decision, returns to queue root

---

## Components

```
src/views/RequestReviewView.jsx
src/components/domain/pension_fund/request-review/
├── RequestReviewHeader.jsx
├── RequestContextSection.jsx
├── ConflictsSection.jsx
├── ConflictCard.jsx
└── ReviewSection.jsx
```

---

## Not Implemented

Features from the original spec that are not yet implemented:

### Request Details
- **Due Date with highlight** - Calculated deadline based on urgency/SLA (exists in data but not shown in review)
- **Division field** - Requester's division (not in form or review)

### Entity Summary
- **GLEIF verification status** - Entity card shows LEI but not GLEIF validation status
- **Current NDA/MNPI status** - Quick facts show holdings/board only, not existing agreements
- **Active NDA count** - Not displayed in entity summary

### Conflicts Section
- **"No Issues" green items** - Spec showed green cards for clean areas (e.g., "MNPI Status: Clean — no restrictions", "Existing NDAs: None active"). Current implementation only shows a single "no conflicts" message
- **Conflict detail expand/collapse** - All conflict details shown inline, no accordion behavior
- **Affected parties list** - Spec mentioned showing people/divisions affected; only shown in message text

### Recommendations Section
- **Interactive checklist** - Plan specified toggleable checkboxes for tracking review progress; current implementation shows static bullet list only
- **People to notify** - Spec mentioned "Notify [entity] legal counsel", "Notify [other attorney]" recommendations
- **Documentation requirements** - Spec mentioned showing required documentation actions

### Other
- **Multi-approver workflow** - Simplified to single approver (per design decision)
- **Conflict detection logic** - Currently reads pre-computed conflicts from data; no real-time detection of:
  - Active MNPI for entity
  - Existing NDAs with entity
  - Existing information barriers

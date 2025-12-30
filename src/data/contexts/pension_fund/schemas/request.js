import { FIELD_TYPES } from './fieldTypes.js';

export const requestSchema = {
  label: 'Request',
  sections: [
    {
      key: 'requestInfo',
      title: 'Request Information',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'id', label: 'Request ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'request_type', label: 'Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'counterparty_id', label: 'Counterparty Entity ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'counterparty_name', label: 'Counterparty', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'entity_lei', label: 'Entity LEI', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 }, readOnly: true },
        { key: 'target_name', label: 'Target/Project', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'investment_program', label: 'Investment Program', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'estimated_value', label: 'Estimated Value', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'submittedBy',
      title: 'Submitted By',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'submitted_by', label: 'Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'submitted_at', label: 'Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'office_location', label: 'Office', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'urgency', label: 'Priority', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'purpose',
      title: 'Purpose',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'purpose', label: 'Purpose of Request', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'additional_details', label: 'Additional Details', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
    {
      key: 'status',
      title: 'Status & Workflow',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'workflow_status', label: 'Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'assigned_to', label: 'Assigned Attorney', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'reviewed_at', label: 'Reviewed Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'approved_by', label: 'Approved By', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'approval_notes', label: 'Approval Notes', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'due_date', label: 'Due Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 }, readOnly: true, note: 'Calculated from submission date and urgency SLA' },
      ],
    },
    {
      key: 'conflicts',
      title: 'Conflict Detection',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'conflicts_detected', label: 'Conflicts', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'conflict_severity', label: 'Severity', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
  ],
};

export default requestSchema;

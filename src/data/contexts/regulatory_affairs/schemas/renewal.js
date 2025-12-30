import { FIELD_TYPES } from './fieldTypes.js';

export const renewalSchema = {
  label: 'Renewal',
  sections: [
    {
      key: 'general',
      title: 'Renewal Information',
      collapsible: false,
      fields: [
        { key: 'name', label: 'Renewal Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'type', label: 'Renewal Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'submissionDate', label: 'Submission Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'approvalDate', label: 'Approval Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'expiryDate', label: 'Expiration Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'reminderDays', label: 'Reminder Days', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'status', label: 'Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'responsiblePerson', label: 'Responsible Person', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'attachmentCount', label: 'Number of Attachments', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'notes', label: 'Notes', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
    {
      key: 'workflow',
      title: 'Workflow & Tasks',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'currentStep', label: 'Current Step', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'nextStep', label: 'Next Step', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'pendingActions', label: 'Pending Actions', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'requiredDocuments', label: 'Required Documents', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'comments', label: 'Comments', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
    {
      key: 'impact',
      title: 'Operational Impact',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'affectedSites', label: 'Affected Sites', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'affectedProducts', label: 'Affected Products', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'riskIfLate', label: 'Risk If Late', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'escalationPlan', label: 'Escalation Plan', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
  ],
};

export default renewalSchema;

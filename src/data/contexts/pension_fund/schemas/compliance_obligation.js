import { FIELD_TYPES } from './fieldTypes.js';

export const complianceObligationSchema = {
  label: 'Compliance Obligation',
  sections: [
    {
      key: 'details',
      title: 'Obligation Details',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'id', label: 'Obligation ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'entity_id', label: 'Entity ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'entity_name', label: 'Entity', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'obligation_type', label: 'Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'affected_teams', label: 'Affected Teams', type: FIELD_TYPES.ARRAY, grid: { xs: 12, sm: 6 } },
      ],
    },
    {
      key: 'timeline',
      title: 'Timeline',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'effective_date', label: 'Effective Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'expiration_date', label: 'Expiration Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
    {
      key: 'businessContext',
      title: 'Business Context',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'investment_program', label: 'Investment Program', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'deal_value', label: 'Associated Deal Value', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'deal_stage', label: 'Deal Stage', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'business_purpose', label: 'Business Purpose', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
    {
      key: 'ownership',
      title: 'Responsibility',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'created_by', label: 'Created By', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'created_at', label: 'Created Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'owner', label: 'Obligation Owner', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'owner_email', label: 'Owner Email', type: FIELD_TYPES.EMAIL, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'assigned_attorney', label: 'Assigned Attorney', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
    {
      key: 'actionItems',
      title: 'Action Items',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'days_until_expiration', label: 'Days Until Expiration', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'next_review_date', label: 'Next Review Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'needs_renewal', label: 'Needs Renewal', type: FIELD_TYPES.BOOLEAN, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'action_required', label: 'Action Required', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
    {
      key: 'description',
      title: 'Details',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'description', label: 'Description', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'scope', label: 'Scope of Information Covered', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'restrictions', label: 'Restrictions & Limitations', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'permitted_uses', label: 'Permitted Uses', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
    {
      key: 'documents',
      title: 'Documents',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'document_reference', label: 'Document Reference', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'document_url', label: 'View Document', type: FIELD_TYPES.LINK, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'document_storage_location', label: 'Storage Location', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 5 } },
        { key: 'related_documents', label: 'Related Documents', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
      ],
    },
    {
      key: 'reviewHistory',
      title: 'Review History',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'last_review_date', label: 'Last Reviewed', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'last_reviewed_by', label: 'Reviewed By', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'review_notes', label: 'Review Notes', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'review_frequency', label: 'Review Frequency', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'next_review_date', label: 'Next Review Due', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
    {
      key: 'notifications',
      title: 'Notifications & Reminders',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'reminder_days', label: 'Reminder (days before)', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'notification_recipients', label: 'Notification Recipients', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'escalation_date', label: 'Escalation Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'auto_renew', label: 'Auto-Renewable', type: FIELD_TYPES.BOOLEAN, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
    {
      key: 'status',
      title: 'Status',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'lifecycle_status', label: 'Lifecycle', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'compliance_status', label: 'Compliance', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'workflow_status', label: 'Workflow', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'originated_from_request', label: 'Originating Request', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
  ],
};

export default complianceObligationSchema;

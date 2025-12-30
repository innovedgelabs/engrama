import { FIELD_TYPES } from './fieldTypes.js';

export const regulatoryAffairSchema = {
  label: 'Regulatory Affair',
  sections: [
    {
      key: 'general',
      title: 'General Information',
      collapsible: false,
      fields: [
        { key: 'name', label: 'Affair Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 8 } },
        { key: 'type', label: 'Affair Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 4 } },
        { key: 'category', label: 'Category', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'authority', label: 'Issuing Authority', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'renewalFrequency', label: 'Renewal Frequency', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'lifecycleStatus', label: 'Lifecycle Status', type: FIELD_TYPES.STATUS, dimension: 'lifecycle', grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'priorityLevel', label: 'Priority Level', type: FIELD_TYPES.STATUS, dimension: 'priority', grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'complianceStatus', label: 'Compliance Status', type: FIELD_TYPES.STATUS, dimension: 'compliance', grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'workflowStatus', label: 'Workflow Status', type: FIELD_TYPES.STATUS, dimension: 'workflow', grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'description', label: 'Description', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'complianceRisk', label: 'Compliance Risk', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
    {
      key: 'coverage',
      title: 'Scope & Coverage',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'applicableSites', label: 'Applicable Sites', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'relatedProducts', label: 'Covered Products', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'responsible', label: 'Responsible Team', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'monitoringFrequency', label: 'Monitoring Frequency', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'lastAuditDate', label: 'Last Audit Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6 } },
        { key: 'supportingDocuments', label: 'Supporting Documents', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
      ],
    },
    {
      key: 'foodSafety',
      title: 'Food Safety Alignment',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'haccpReference', label: 'HACCP Reference', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'criticalHazards', label: 'Critical Hazards', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'controlMeasures', label: 'Control Measures', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'verificationActivities', label: 'Verification Activities', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'escalationProcess', label: 'Escalation Process', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
  ],
};

export default regulatoryAffairSchema;

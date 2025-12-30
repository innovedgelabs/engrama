import { FIELD_TYPES } from './fieldTypes.js';

export const supplierSchema = {
  label: 'Supplier',
  sections: [
    {
      key: 'supplierProfile',
      title: 'Supplier Profile',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'code', label: 'Supplier Code', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'name', label: 'Supplier Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 }, fallbackTo: 'name' },
        { key: 'activities', label: 'Capabilities', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'status', label: 'Approval Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'regulatoryAffairsCount', label: 'Regulatory Affairs Linked', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'leadTimeDays', label: 'Average Lead Time (days)', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'minimumOrderQuantity', label: 'Minimum Order Quantity', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'capacityPerMonth', label: 'Available Capacity', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'primaryIngredients', label: 'Ingredient Families', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'approvedProducts', label: 'Approved Finished Goods', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
      ],
    },
    {
      key: 'foodSafety',
      title: 'Food Safety & Compliance',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'foodSafetyCertifications', label: 'Food Safety Certifications', type: FIELD_TYPES.ARRAY, grid: { xs: 12, sm: 6 } },
        { key: 'lastAuditDate', label: 'Last Audit Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'auditScore', label: 'Audit Score', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'auditAgency', label: 'Auditing Agency', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'nonConformities', label: 'Non-Conformities', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'correctiveActions', label: 'Corrective Actions', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
      ],
    },
    {
      key: 'logistics',
      title: 'Logistics & Compliance',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'primaryTransportMode', label: 'Primary Transport Mode', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'coldChainCapability', label: 'Cold Chain Capability', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'traceabilityLevel', label: 'Traceability Level', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'contactEmail', label: 'Contact Email', type: FIELD_TYPES.EMAIL, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'contactPhone', label: 'Contact Phone', type: FIELD_TYPES.PHONE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'contactName', label: 'Contact Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'certifications',
      title: 'Certifications & Standards',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'isoCertifications', label: 'ISO Certifications', type: FIELD_TYPES.ARRAY, grid: { xs: 12, sm: 6 } },
        { key: 'industryCertifications', label: 'Industry Certifications', type: FIELD_TYPES.ARRAY, grid: { xs: 12, sm: 6 } },
        { key: 'regulatoryLicenses', label: 'Regulatory Licenses', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
      ],
    },
  ],
};

export default supplierSchema;

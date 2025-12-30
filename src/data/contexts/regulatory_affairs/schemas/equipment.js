import { FIELD_TYPES } from './fieldTypes.js';

export const equipmentSchema = {
  label: 'Equipment',
  sections: [
    {
      key: 'equipmentProfile',
      title: 'Equipment Profile',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'code', label: 'Asset Tag', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'name', label: 'Equipment Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 }, fallbackTo: 'name' },
        { key: 'purpose', label: 'Purpose', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'category', label: 'Category', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'manufacturer', label: 'Manufacturer', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'model', label: 'Model', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'serialNumber', label: 'Serial Number', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'status', label: 'Operational Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'acquisition',
      title: 'Acquisition & Warranty',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'purchaseDate', label: 'Purchase Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'purchasePrice', label: 'Purchase Price', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'supplier', label: 'Supplier', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'warrantyExpiry', label: 'Warranty Expiry', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'operations',
      title: 'Operations & Maintenance',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'location', label: 'Location', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'assignedTo', label: 'Assigned To', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'operationalStatus', label: 'Operational Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'lastMaintenanceDate', label: 'Last Maintenance Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'nextMaintenanceDate', label: 'Next Maintenance Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'maintenanceHistory', label: 'Maintenance History', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
      ],
    },
    {
      key: 'technical',
      title: 'Technical Details',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'specifications', label: 'Specifications', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'certifications', label: 'Certifications', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'operatingParameters', label: 'Operating Parameters', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
  ],
};

export default equipmentSchema;

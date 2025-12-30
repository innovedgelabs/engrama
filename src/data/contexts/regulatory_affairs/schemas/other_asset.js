import { FIELD_TYPES } from './fieldTypes.js';

export const otherAssetSchema = {
  label: 'Other Asset',
  sections: [
    {
      key: 'basicInfo',
      title: 'Basic Information',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'name', label: 'Asset Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'code', label: 'Asset Code', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'description', label: 'Description', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'assetType', label: 'Asset Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'status', label: 'Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
      ],
    },
    {
      key: 'financial',
      title: 'Financial & Ownership',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'acquisitionDate', label: 'Acquisition Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 4 } },
        { key: 'acquisitionCost', label: 'Acquisition Cost', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 4 } },
        { key: 'currentValue', label: 'Current Value', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 4 } },
        { key: 'owner', label: 'Owner', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'assignedTo', label: 'Assigned To', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
      ],
    },
    {
      key: 'location',
      title: 'Location & Condition',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'location', label: 'Location', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'condition', label: 'Condition', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'notes', label: 'Notes', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
  ],
};

export default otherAssetSchema;

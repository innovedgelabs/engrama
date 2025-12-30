import { FIELD_TYPES } from './fieldTypes.js';

export const facilitySchema = {
  label: 'Facility',
  sections: [
    {
      key: 'facilityProfile',
      title: 'Facility Profile',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'code', label: 'Facility Code', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'name', label: 'Facility Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 }, fallbackTo: 'name' },
        { key: 'operations', label: 'Operations', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'facilityType', label: 'Facility Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'openingDate', label: 'Opening Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'status', label: 'Lifecycle Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'location',
      title: 'Location & Contact',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'address', label: 'Address', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'city', label: 'City', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'state', label: 'State', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'postalCode', label: 'Postal Code', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'country', label: 'Country', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'coordinates', label: 'Coordinates', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'phone', label: 'Phone', type: FIELD_TYPES.PHONE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'email', label: 'Email', type: FIELD_TYPES.EMAIL, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'manager', label: 'Manager', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'operations',
      title: 'Operations & Capacity',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'operatingHours', label: 'Operating Hours', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'capacity', label: 'Capacity', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'floorArea', label: 'Floor Area', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'numberOfFloors', label: 'Number of Floors', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'safetyFeatures', label: 'Safety Features', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
      ],
    },
    {
      key: 'certifications',
      title: 'Certifications & Compliance',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'certifications', label: 'Certifications', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'compliancePrograms', label: 'Compliance Programs', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'inspectionDate', label: 'Last Inspection Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'nextInspectionDate', label: 'Next Inspection Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
  ],
};

export default facilitySchema;

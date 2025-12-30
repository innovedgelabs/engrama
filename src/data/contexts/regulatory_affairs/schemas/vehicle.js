import { FIELD_TYPES } from './fieldTypes.js';

export const vehicleSchema = {
  label: 'Vehicle',
  sections: [
    {
      key: 'vehicleProfile',
      title: 'Vehicle Profile',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'code', label: 'Plate Number', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'name', label: 'Vehicle Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 }, fallbackTo: 'name' },
        { key: 'usage', label: 'Usage', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'make', label: 'Make', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'model', label: 'Model', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'year', label: 'Year', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'vin', label: 'VIN', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'status', label: 'Lifecycle Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'registration',
      title: 'Registration & Ownership',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'registrationNumber', label: 'Registration Number', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'registrationDate', label: 'Registration Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'registrationExpiry', label: 'Registration Expiry', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'owner', label: 'Owner', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'insuranceProvider', label: 'Insurance Provider', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'insuranceExpiry', label: 'Insurance Expiry', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'technical',
      title: 'Technical & Maintenance',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'engineNumber', label: 'Engine Number', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'fuelType', label: 'Fuel Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'transmission', label: 'Transmission', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'mileage', label: 'Mileage', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'seatingCapacity', label: 'Seating Capacity', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'lastServiceDate', label: 'Last Service Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'nextServiceDate', label: 'Next Service Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'additional',
      title: 'Additional Info',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'notes', label: 'Notes', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
  ],
};

export default vehicleSchema;

import { FIELD_TYPES } from './fieldTypes.js';

export const companySchema = {
  label: 'Company',
  sections: [
    {
      key: 'coreProfile',
      title: 'Core Profile',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'code', label: 'Internal Identifier', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'legalName', label: 'Legal Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 }, fallbackTo: 'name' },
        { key: 'taxId', label: 'Tax ID (RIF)', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'entityType', label: 'Entity Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'classification', label: 'Corporate Classification', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'activities', label: 'Primary Activities', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'economicSectors', label: 'Economic Sectors', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'status', label: 'Lifecycle Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'keyMarkets', label: 'Key Markets Served', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'contact',
      title: 'Contact & Location',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'email', label: 'Email', type: FIELD_TYPES.EMAIL, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'sitioWeb', label: 'Website', type: FIELD_TYPES.LINK, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'telefonoCentral', label: 'Main Phone', type: FIELD_TYPES.PHONE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'telefonoMovil', label: 'Mobile Phone', type: FIELD_TYPES.PHONE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'direccion', label: 'Address', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'ciudad', label: 'City', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'zonaPostal', label: 'Postal Code', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'pais', label: 'Country', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'ubicacionFisica', label: 'Physical Location Code', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
    {
      key: 'foodSafety',
      title: 'Food Safety & Quality',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'foodSafetyCertifications', label: 'Food Safety Certifications', type: FIELD_TYPES.ARRAY, grid: { xs: 12, sm: 6 } },
        { key: 'qualityManagementSystems', label: 'Quality Management Systems', type: FIELD_TYPES.ARRAY, grid: { xs: 12, sm: 6 } },
        { key: 'haccpStatus', label: 'HACCP Program Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'gmpComplianceLevel', label: 'GMP Compliance Level', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'allergenControlProgram', label: 'Allergen Control Program', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'traceabilityLevel', label: 'Traceability Capability', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'primaryDistributionChannels', label: 'Primary Distribution Channels', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'observaciones', label: 'Operational Notes', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'complianceNotes', label: 'Regulatory & Compliance Notes', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
    {
      key: 'registration',
      title: 'Corporate Registration',
      collapsible: true,
      defaultExpanded: false,
      condition: 'registroMercantil',
      fields: [
        { key: 'registroMercantil', label: 'Commercial Registry', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'fechaRegistro', label: 'Registration Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'numeroRegistro', label: 'Registry Number', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'tomo', label: 'Book / Volume', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'duracion', label: 'Company Duration', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'objeto', label: 'Corporate Purpose', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'capitalSocial', label: 'Share Capital', type: FIELD_TYPES.CURRENCY, grid: { xs: 12 } },
      ],
    },
  ],
};

export default companySchema;

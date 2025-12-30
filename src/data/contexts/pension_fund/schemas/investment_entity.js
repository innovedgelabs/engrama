import { FIELD_TYPES } from './fieldTypes.js';

export const investmentEntitySchema = {
  label: 'Investment Entity',
  sections: [
    {
      key: 'entityIdentification',
      title: 'Entity Identification',
      titleKey: 'Entity Identification',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'id', label: 'Entity ID', labelKey: 'Entity ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'name', label: 'Legal Name', labelKey: 'Legal Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'entity_type', label: 'Entity Type', labelKey: 'Entity Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'industry', label: 'Industry', labelKey: 'Industry', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'country', label: 'Country', labelKey: 'Country', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'identifiers',
      title: 'Identifiers',
      titleKey: 'Identifiers',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'lei', label: 'LEI', labelKey: 'LEI', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'ticker', label: 'Ticker Symbol', labelKey: 'Ticker Symbol', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'website', label: 'Website', labelKey: 'Website', type: FIELD_TYPES.LINK, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'exposure',
      title: 'Exposure',
      titleKey: 'Exposure',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'total_exposure', label: 'Total Exposure', labelKey: 'Total Exposure', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'investment_programs', label: 'Investment Programs', labelKey: 'Investment Programs', type: FIELD_TYPES.ARRAY, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'first_investment_date', label: 'First Investment', labelKey: 'First Investment', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'compliance',
      title: 'Compliance Status',
      titleKey: 'Compliance Status',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'lifecycle_status', label: 'Lifecycle', labelKey: 'Lifecycle', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'compliance_status', label: 'Compliance', labelKey: 'Compliance', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'credit_rating', label: 'Credit Rating', labelKey: 'Credit Rating', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'last_reviewed', label: 'Last Reviewed', labelKey: 'Last Reviewed', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
  ],
};

export default investmentEntitySchema;

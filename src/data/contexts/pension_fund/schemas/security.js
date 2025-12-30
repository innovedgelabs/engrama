import { FIELD_TYPES } from './fieldTypes.js';

export const securitySchema = {
  label: 'Security',
  sections: [
    {
      key: 'securityIdentification',
      title: 'Security Identification',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'id', label: 'Security ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'cusip', label: 'CUSIP', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'isin', label: 'ISIN', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'ticker', label: 'Ticker', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'security_name', label: 'Security Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'security_type', label: 'Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'currency', label: 'Currency', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
    {
      key: 'issuer',
      title: 'Issuer Information',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'entity_id', label: 'Issuer ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'entity_name', label: 'Issuer Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'issuer_country', label: 'Country', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
      ],
    },
    {
      key: 'debtDetails',
      title: 'Debt Instrument Details',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'maturity_date', label: 'Maturity Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'coupon_rate', label: 'Coupon Rate', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'par_value', label: 'Par Value', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'seniority', label: 'Seniority', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'credit_rating', label: 'Credit Rating', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'rating_agency', label: 'Rating Agency', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'metadata',
      title: 'System Metadata',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'data_source', label: 'Data Source', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'last_updated', label: 'Last Updated', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6 } },
      ],
    },
  ],
};

export default securitySchema;

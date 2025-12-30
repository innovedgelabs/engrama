import { FIELD_TYPES } from './fieldTypes.js';

export const holdingSchema = {
  label: 'Holding',
  sections: [
    {
      key: 'positionInfo',
      title: 'Position Information',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'id', label: 'Holding ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'security_id', label: 'Security ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'security_name', label: 'Security Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'entity_id', label: 'Issuer Entity ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'entity_name', label: 'Issuer Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
    {
      key: 'positionDetails',
      title: 'Position Details',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'quantity', label: 'Quantity', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'market_value', label: 'Market Value', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'cost_basis', label: 'Cost Basis', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'unrealized_gain_loss', label: 'Unrealized Gain/Loss', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'position_type', label: 'Position Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'currency', label: 'Currency', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
    {
      key: 'classification',
      title: 'Classification',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'investment_program', label: 'Investment Program', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'capital_stack_position', label: 'Capital Stack', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'portfolio_code', label: 'Portfolio Code', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'portfolio_percentage', label: 'Portfolio %', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'dataSource',
      title: 'Data Source',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'as_of_date', label: 'As Of Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'data_source', label: 'Source System', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'last_updated', label: 'Last Updated', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
  ],
};

export default holdingSchema;

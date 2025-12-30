import { FIELD_TYPES } from './fieldTypes.js';

export const customerSchema = {
  label: 'Customer',
  sections: [
    {
      key: 'customerProfile',
      title: 'Customer Profile',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'code', label: 'Customer Code', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'name', label: 'Customer Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 }, fallbackTo: 'name' },
        { key: 'activities', label: 'Segments Served', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'status', label: 'Account Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'regulatoryAffairsCount', label: 'Regulatory Affairs Linked', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'firstPurchaseDate', label: 'First Purchase Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'lastPurchaseDate', label: 'Last Purchase Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'lifetimeValue', label: 'Lifetime Value', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'creditLimit', label: 'Credit Limit', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'contact',
      title: 'Contact & Accounts',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'contactName', label: 'Primary Contact', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'contactEmail', label: 'Contact Email', type: FIELD_TYPES.EMAIL, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'contactPhone', label: 'Contact Phone', type: FIELD_TYPES.PHONE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'billingAddress', label: 'Billing Address', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'shippingAddress', label: 'Shipping Address', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
        { key: 'preferredPaymentMethod', label: 'Preferred Payment Method', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'paymentTerms', label: 'Payment Terms', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
      ],
    },
    {
      key: 'sales',
      title: 'Sales & Compliance',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'preferredProducts', label: 'Preferred Products', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'contractStartDate', label: 'Contract Start Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'contractEndDate', label: 'Contract End Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'contractStatus', label: 'Contract Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'complianceRequirements', label: 'Compliance Requirements', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
      ],
    },
  ],
};

export default customerSchema;

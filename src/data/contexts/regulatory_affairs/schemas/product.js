import { FIELD_TYPES } from './fieldTypes.js';

export const productSchema = {
  label: 'Product',
  sections: [
    {
      key: 'productProfile',
      title: 'Product Profile',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'code', label: 'Product Code', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'name', label: 'Product Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 }, fallbackTo: 'name' },
        { key: 'activities', label: 'Description', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'category', label: 'Category', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'brand', label: 'Brand', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'manufacturer', label: 'Manufacturer', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'model', label: 'Model', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'status', label: 'Lifecycle Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'specifications',
      title: 'Specifications',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'sku', label: 'SKU', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'barcode', label: 'Barcode', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'weight', label: 'Weight', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'dimensions', label: 'Dimensions', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'color', label: 'Color', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'material', label: 'Material', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'storageConditions', label: 'Storage Conditions', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'shelfLife', label: 'Shelf Life', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
    {
      key: 'pricingInventory',
      title: 'Pricing & Inventory',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'unitPrice', label: 'Unit Price', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'costPrice', label: 'Cost Price', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'stockQuantity', label: 'Stock Quantity', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'reorderLevel', label: 'Reorder Level', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'packagingFormat', label: 'Packaging Format', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'palletConfig', label: 'Pallet Configuration', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
      ],
    },
    {
      key: 'quality',
      title: 'Quality & Compliance',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'qualityStandards', label: 'Quality Standards', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'certifications', label: 'Certifications', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'regulatoryRequirements', label: 'Regulatory Requirements', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'testingFrequency', label: 'Testing Frequency', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'lastTestDate', label: 'Last Test Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'nextTestDate', label: 'Next Test Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'production',
      title: 'Production & Formulation',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'productionLine', label: 'Production Line', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'productionCapacity', label: 'Production Capacity', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'ingredients', label: 'Ingredients', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'allergens', label: 'Allergens', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'formulationVersion', label: 'Formulation Version', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'traceability',
      title: 'Traceability & Packaging',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'lotNumberFormat', label: 'Lot Number Format', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'traceabilityLevel', label: 'Traceability Level', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'packagingMaterials', label: 'Packaging Materials', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'labelingRequirements', label: 'Labeling Requirements', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'sustainabilityClaims', label: 'Sustainability Claims', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
      ],
    },
  ],
};

export default productSchema;

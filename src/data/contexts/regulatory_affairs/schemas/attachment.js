import { FIELD_TYPES } from './fieldTypes.js';

export const attachmentSchema = {
  label: 'Document',
  sections: [
    {
      key: 'general',
      title: 'Document Information',
      collapsible: false,
      fields: [
        { key: 'name', label: 'File Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 8 } },
        { key: 'type', label: 'Document Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 4 } },
        { key: 'fileSize', label: 'File Size', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'uploadedAt', label: 'Uploaded At', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'uploadedBy', label: 'Uploaded By', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'isPrimary', label: 'Primary Document', type: FIELD_TYPES.BOOLEAN, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'version', label: 'Version', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'documentCategory', label: 'Document Category', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'relatedProcess', label: 'Related Process', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'notes', label: 'Notes', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
  ],
};

export default attachmentSchema;

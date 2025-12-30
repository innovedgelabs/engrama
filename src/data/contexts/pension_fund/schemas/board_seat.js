import { FIELD_TYPES } from './fieldTypes.js';

export const boardSeatSchema = {
  label: 'Board Seat',
  sections: [
    {
      key: 'boardInfo',
      title: 'Board Seat Information',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'id', label: 'Seat ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'entity_id', label: 'Company ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'entity_name', label: 'Company', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6 } },
        { key: 'representative_name', label: 'Representative', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'board_title', label: 'Board Title', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'investment_program', label: 'Investment Program', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'voting_rights', label: 'Voting Rights', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'term',
      title: 'Term',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'appointed_date', label: 'Appointed', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'term_end_date', label: 'Term End', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'meeting_frequency', label: 'Meeting Frequency', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'last_meeting_date', label: 'Last Meeting', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 3 } },
        { key: 'committee_memberships', label: 'Committee Memberships', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
      ],
    },
    {
      key: 'status',
      title: 'Status',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'status', label: 'Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'notes', label: 'Notes', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
  ],
};

export default boardSeatSchema;

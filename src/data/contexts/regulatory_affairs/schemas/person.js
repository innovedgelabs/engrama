import { FIELD_TYPES } from './fieldTypes.js';

export const personSchema = {
  label: 'Person',
  sections: [
    {
      key: 'personalInformation',
      title: 'Personal Information',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'fullName', label: 'Full Name', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 }, fallbackTo: 'name' },
        { key: 'code', label: 'Employee ID', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'role', label: 'Role', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'department', label: 'Department', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'jobTitle', label: 'Job Title', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'dateOfBirth', label: 'Date of Birth', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'nationality', label: 'Nationality', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'idNumber', label: 'ID Number', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'status', label: 'Employment Status', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'contactInfo',
      title: 'Contact Information',
      collapsible: true,
      defaultExpanded: true,
      fields: [
        { key: 'email', label: 'Email', type: FIELD_TYPES.EMAIL, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'phone', label: 'Phone', type: FIELD_TYPES.PHONE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'emergencyContact', label: 'Emergency Contact', type: FIELD_TYPES.PHONE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'address', label: 'Address', type: FIELD_TYPES.TEXT, grid: { xs: 12 } },
      ],
    },
    {
      key: 'employmentInfo',
      title: 'Employment Information',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'company', label: 'Company', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'hireDate', label: 'Hire Date', type: FIELD_TYPES.DATE, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'employmentType', label: 'Employment Type', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'salary', label: 'Salary', type: FIELD_TYPES.CURRENCY, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'supervisor', label: 'Supervisor', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'yearsOfExperience', label: 'Years of Experience', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
    {
      key: 'skills',
      title: 'Skills & Certifications',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'certifications', label: 'Certifications', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'skills', label: 'Skills', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
        { key: 'languages', label: 'Languages', type: FIELD_TYPES.ARRAY, grid: { xs: 12 } },
      ],
    },
    {
      key: 'education',
      title: 'Education',
      collapsible: true,
      defaultExpanded: false,
      fields: [
        { key: 'degree', label: 'Degree', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
        { key: 'university', label: 'University', type: FIELD_TYPES.TEXT, grid: { xs: 12, sm: 6, md: 4 } },
      ],
    },
  ],
};

export default personSchema;

/**
 * User roles:
 * - 'admin': Full access to everything
 * - 'attorney': Can search assets, view details, see filtered request queue
 * - 'user': Can create requests and view their own submissions only
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  ATTORNEY: 'attorney',
  USER: 'user',
};

export const pensionFundUsers = [
  // Admin - full access
  {
    id: 'user-admin',
    name: 'Amanda Chen',
    role: USER_ROLES.ADMIN,
    title: 'System Administrator',
    department: 'IT & Operations',
    email: 'amanda.chen@pensionfund.com',
    avatarUrl: null,
    investmentStrategies: [], // Admin sees all
  },
  // Attorney - CMCI (Capital Markets & Credit Investments)
  {
    id: 'user-atty-cmci',
    name: 'David Miller',
    role: USER_ROLES.ATTORNEY,
    title: 'Senior Legal Counsel - CMCI',
    department: 'Legal Affairs',
    email: 'david.miller@pensionfund.com',
    avatarUrl: null,
    investmentStrategies: ['Private Credit', 'Corporate Fixed Income', 'Public Equities'],
  },
  // Attorney - Private Equity
  {
    id: 'user-atty-pe',
    name: 'Jennifer Walsh',
    role: USER_ROLES.ATTORNEY,
    title: 'Legal Counsel - Private Equity',
    department: 'Legal Affairs',
    email: 'jennifer.walsh@pensionfund.com',
    avatarUrl: null,
    investmentStrategies: ['Private Markets', 'Private Equity'],
  },
  // General User - Investment Analyst
  {
    id: 'user-001',
    name: 'Sarah Johnson',
    role: USER_ROLES.USER,
    title: 'Investment Analyst',
    department: 'Private Equity',
    email: 'sarah.johnson@pensionfund.com',
    avatarUrl: null,
    investmentStrategies: [],
  },
  // General User - Portfolio Manager
  {
    id: 'user-002',
    name: 'Michael Torres',
    role: USER_ROLES.USER,
    title: 'Portfolio Manager',
    department: 'Fixed Income',
    email: 'michael.torres@pensionfund.com',
    avatarUrl: null,
    investmentStrategies: [],
  },
];

export const DEFAULT_PENSION_FUND_USER_ID = pensionFundUsers[0].id;

export default pensionFundUsers;

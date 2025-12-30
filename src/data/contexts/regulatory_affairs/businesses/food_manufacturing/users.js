import { RA_USER_ROLES } from '../../../../../utils/userRoles';

export const mockUsers = [
  {
    id: 'user-ra-admin',
    name: 'Ana María Sánchez',
    role: RA_USER_ROLES.COMPLIANCE_MANAGER,
    title: 'Compliance Manager',
    department: 'Compliance & Quality',
    email: 'ana.sanchez@acme.com',
    avatarUrl: null,
    domainId: 'regulatory_affairs',
    scopes: {
      accessAll: true,
      facilities: ['ES-001', 'ES-002', 'ES-003', 'ES-004', 'ES-005', 'ES-006'],
      products: ['PD-001', 'PD-002', 'PD-003', 'PD-004', 'PD-005', 'PD-006', 'PD-007', 'PD-008'],
      suppliers: ['PR-001', 'PR-002', 'PR-003', 'PR-004', 'PR-005', 'PR-006', 'PR-007', 'PR-008', 'PR-009'],
      vehicles: ['VH-001', 'VH-002', 'VH-003'],
      equipment: ['EQ-001', 'EQ-002', 'EQ-003', 'EQ-004', 'EQ-005', 'EQ-006', 'EQ-007', 'EQ-008'],
      people: ['PE-001', 'PE-002', 'PE-003', 'PE-004', 'PE-005', 'PE-006', 'PE-007', 'PE-008', 'PE-009'],
      customers: ['CL-001', 'CL-002', 'CL-003', 'CL-004', 'CL-005'],
    },
  },
  {
    id: 'user-ra-coordinator',
    name: 'Carlos Eduardo Pérez',
    role: RA_USER_ROLES.RA_COORDINATOR,
    title: 'Regulatory Affairs Coordinator - Alimentos del Valle',
    department: 'Regulatory Affairs',
    email: 'carlos.perez@acme.com',
    avatarUrl: null,
    domainId: 'regulatory_affairs',
    // Start at main company and include its immediate neighbors (facilities/products/suppliers/etc.)
    scopeStartNodes: ['EM-001'],
    scopes: {},
  },
  {
    id: 'user-ra-qa-lead',
    name: 'Luis Alberto Torres',
    role: RA_USER_ROLES.PLANT_QA_LEAD,
    title: 'Plant QA Lead - Planta Los Ruices',
    department: 'Quality Assurance',
    email: 'luis.torres@acme.com',
    avatarUrl: null,
    domainId: 'regulatory_affairs',
    // Start at the plant and include directly connected assets
    scopeStartNodes: ['ES-001'],
    scopes: {},
  },
];

export const DEFAULT_COMPANY_USER_ID = mockUsers[0].id;

export default mockUsers;

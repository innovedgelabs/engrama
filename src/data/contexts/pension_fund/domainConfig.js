import { domainI18n } from './i18n';

export const domainConfig = {
  id: 'pension_fund',
  name: { en: 'Pension Fund', es: 'Fondo de Pensiones' },
  description: {
    en: 'Entity intelligence and compliance tracking for Pension Fund\'s investment programs.',
    es: 'Inteligencia de entidades y seguimiento de cumplimiento para los programas de inversión del Fondo de Pensiones.',
  },
  defaultLanguage: domainI18n.defaultLanguage,
  uiText: domainI18n.uiText,

  ui: {
    showPlatformLogo: false,
    showCategories: false, // Hide category section in sidebar
  },

  // Navigation configuration for sidebar
  navigation: {
    sections: [
      {
        id: 'section_queue',
        roles: ['admin', 'attorney'],
        items: [
          { id: 'request_queue', icon: 'ListAltIcon', labelKey: 'request_queue', path: '/', routeType: 'home' },
        ],
      },
      {
        id: 'section_browse',
        roles: ['admin', 'attorney'],
        items: [
          { id: 'entities', icon: 'BusinessCenter', labelKey: 'entities', path: '/entity', routeType: 'category', routeCategory: 'investment_entity' },
          { id: 'securities', icon: 'AccountBalance', labelKey: 'securities', path: '/security', routeType: 'category', routeCategory: 'security' },
          { id: 'board_seats', icon: 'Groups', labelKey: 'board_seats', path: '/board-seat', routeType: 'category', routeCategory: 'board_seat' },
        ],
      },
      {
        id: 'section_user_actions',
        roles: null, // All roles
        items: [
          { id: 'new_request', icon: 'AddIcon', labelKey: 'new_request', path: '/requests/new', routeType: 'create_request' },
          { id: 'my_requests', icon: 'ListAltIcon', labelKey: 'my_requests', path: '/my-requests', routeType: 'my_requests' },
        ],
      },
    ],
    labels: {
      request_queue: { en: 'Request Queue', es: 'Cola de Solicitudes' },
      entities: { en: 'Entities', es: 'Entidades' },
      securities: { en: 'Securities', es: 'Valores' },
      board_seats: { en: 'Board Seats', es: 'Puestos en Junta' },
      new_request: { en: 'New Request', es: 'Nueva Solicitud' },
      my_requests: { en: 'My Requests', es: 'Mis Solicitudes' },
    },
  },

  // Form options for CreateRequestView
  forms: {
    createRequest: {
      investmentStrategies: [
        'Infrastructure',
        'Private Equity',
        'Private Credit',
        'Fixed Income',
        'Listed Equities',
        'FX Trading',
        'Real Estate',
        'Other',
      ],
      officeLocations: [
        { value: 'Victoria', label: 'Victoria' },
        { value: 'Vancouver', label: 'Vancouver' },
        { value: 'London', label: 'London' },
        { value: 'New York', label: 'New York' },
      ],
      urgencyLevels: [
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' },
      ],
    },
  },

  defaultDemo: 'pension_fund_demo',
  demos: {
    pension_fund_demo: {
      label: { en: 'Pension Fund Demo', es: 'Demo Fondo de Pensiones' },
      organizationId: 'pension_fund',
      businessId: 'pension_fund',
      schemaUsage: {
        primary: ['investment_entity'],
        secondary: ['security', 'holding', 'compliance_obligation', 'request', 'board_seat'],
        tertiary: [],
        supporting: [],
      },
    },
  },

  entities: {
    investment_entity: {
      category: 'investment_entity',
      label: { en: 'Investment Entities', es: 'Entidades de Inversión' },
      labelSingular: { en: 'Investment Entity', es: 'Entidad de Inversión' },
      icon: 'BusinessCenter',
      schemaKey: 'investment_entity',
      tabs: ['info', 'securities', 'holdings', 'compliance', 'board_seats', 'requests'],
      searchFields: ['name', 'ticker', 'lei', 'entity_type', 'industry', 'country'],
      tabLabels: {
        info: { en: 'Info', es: 'Info' },
        securities: { en: 'Securities', es: 'Valores' },
        holdings: { en: 'Holdings', es: 'Participaciones' },
        compliance: { en: 'Compliance', es: 'Cumplimiento' },
        board_seats: { en: 'Board Seats', es: 'Puestos en Junta' },
        requests: { en: 'Requests', es: 'Solicitudes' },
      },
    },
    security: {
      category: 'security',
      label: { en: 'Securities', es: 'Valores' },
      labelSingular: { en: 'Security', es: 'Valor' },
      icon: 'Description',
      schemaKey: 'security',
      tabs: ['info', 'holdings'],
      tabLabels: {
        info: { en: 'Info', es: 'Info' },
        holdings: { en: 'Holdings', es: 'Participaciones' },
      },
      searchFields: ['security_name', 'cusip', 'ticker', 'entity_name'],
    },
    holding: {
      category: 'holding',
      label: { en: 'Holdings', es: 'Participaciones' },
      labelSingular: { en: 'Holding', es: 'Participación' },
      icon: 'PieChart',
      schemaKey: 'holding',
      tabs: ['info'],
      searchFields: ['security_name', 'entity_name', 'investment_program'],
    },
    compliance_obligation: {
      category: 'compliance_obligation',
      label: { en: 'Compliance Obligations', es: 'Obligaciones de Cumplimiento' },
      labelSingular: { en: 'Compliance Obligation', es: 'Obligación de Cumplimiento' },
      icon: 'Gavel',
      schemaKey: 'compliance_obligation',
      tabs: ['info'],
      searchFields: ['entity_name', 'obligation_type', 'affected_teams'],
    },
    request: {
      category: 'request',
      label: { en: 'Requests', es: 'Solicitudes' },
      labelSingular: { en: 'Request', es: 'Solicitud' },
      icon: 'Assignment',
      schemaKey: 'request',
      tabs: ['info'],
      searchFields: ['id', 'counterparty_name', 'submitted_by', 'investment_program', 'request_type', 'purpose'],
    },
    board_seat: {
      category: 'board_seat',
      label: { en: 'Board Seats', es: 'Puestos en Junta' },
      labelSingular: { en: 'Board Seat', es: 'Puesto en Junta' },
      icon: 'EventSeat',
      schemaKey: 'board_seat',
      tabs: ['info'],
      searchFields: ['entity_name', 'representative_name', 'investment_program'],
    },
  },

  statusSystem: {
    dimensions: [
      {
        key: 'lifecycle',
        label: { en: 'Lifecycle', es: 'Ciclo de Vida' },
        values: {
          active: { label: { en: 'Active', es: 'Activo' }, color: '#2BA87F', icon: 'CheckCircle' },
          archived: { label: { en: 'Archived', es: 'Archivado' }, color: '#6B7280', icon: 'Archive' },
        },
        applicableTo: ['investment_entity', 'security', 'holding', 'compliance_obligation', 'request', 'board_seat'],
        default: 'active',
      },
      {
        key: 'compliance',
        label: { en: 'Compliance', es: 'Cumplimiento' },
        values: {
          compliant: { label: { en: 'Compliant', es: 'Conforme' }, color: '#2BA87F', icon: 'CheckCircle' },
          warning: { label: { en: 'Warning', es: 'Advertencia' }, color: '#F2C94C', icon: 'Warning' },
          critical: { label: { en: 'Critical', es: 'Crítico' }, color: '#EF4444', icon: 'Error' },
          'n/a': { label: { en: 'N/A', es: 'N/A' }, color: '#94A3B8', icon: 'RemoveCircle' },
        },
        applicableTo: ['investment_entity', 'compliance_obligation', 'request'],
      },
      {
        key: 'workflow',
        label: { en: 'Workflow', es: 'Flujo de Trabajo' },
        values: {
          draft: { label: { en: 'Draft', es: 'Borrador' }, color: '#9C27B0', icon: 'Edit' },
          submitted: { label: { en: 'Submitted', es: 'Enviado' }, color: '#0EA5E9', icon: 'Send' },
          in_review: { label: { en: 'In Review', es: 'En Revisión' }, color: '#F97316', icon: 'RateReview' },
          approved: { label: { en: 'Approved', es: 'Aprobado' }, color: '#2BA87F', icon: 'CheckCircle' },
          rejected: { label: { en: 'Rejected', es: 'Rechazado' }, color: '#DC2626', icon: 'Cancel' },
          needs_info: { label: { en: 'Needs Info', es: 'Requiere Info' }, color: '#F59E0B', icon: 'Help' },
        },
        applicableTo: ['request', 'compliance_obligation'],
      },
      {
        key: 'priority',
        label: { en: 'Priority', es: 'Prioridad' },
        values: {
          urgent: { label: { en: 'Urgent', es: 'Urgente' }, color: '#DC2626', icon: 'PriorityHigh' },
          high: { label: { en: 'High', es: 'Alta' }, color: '#F97316', icon: 'Whatshot' },
          normal: { label: { en: 'Normal', es: 'Normal' }, color: '#3B82F6', icon: 'Info' },
          low: { label: { en: 'Low', es: 'Baja' }, color: '#6B7280', icon: 'Info' },
        },
        applicableTo: ['request'],
        default: 'normal',
      },
    ],
    trafficLights: {
      dimensions: ['compliance'],
      showValues: ['compliant', 'warning', 'critical'],
    },
  },

  search: {
    entityTypes: ['asset'], // assets collection already includes securities, holdings, obligations, requests, board seats as categories

    // Which asset categories appear in search results
    searchableCategories: ['investment_entity', 'board_seat', 'request'],

    // Role-based access (categories not listed are accessible to all)
    roleRestrictions: {
      investment_entity: ['admin', 'attorney'],
      board_seat: ['admin', 'attorney'],
      // request: no restriction - all users can see requests (filtered by ownership separately)
    },

    // Security → Entity matching: searching "AAPL" returns Apple Inc. entity
    securitySearch: {
      enabled: true,
      searchFields: ['ticker', 'cusip', 'isin', 'security_name'],
      targetCategory: 'investment_entity', // Return entities, not securities
    },
  },

  routing: {
    primaryEntity: 'investment_entity',
    segments: {
      investment_entity: { en: 'entity', es: 'entidad' },
      security: { en: 'security', es: 'valor' },
      holding: { en: 'holding', es: 'posicion' },
      compliance_obligation: { en: 'obligation', es: 'obligacion' },
      request: { en: 'request', es: 'solicitud' },
      board_seat: { en: 'board-seat', es: 'puesto-junta' },
      affair: { en: 'affair', es: 'asunto' },
      renewal: { en: 'renewal', es: 'renovacion' },
    },
    tabRoutes: {
      asset: {
        info: { en: 'info', es: 'info' },
        securities: { en: 'securities', es: 'valores' },
        holdings: { en: 'holdings', es: 'participaciones' },
        compliance: { en: 'compliance', es: 'cumplimiento' },
        board_seats: { en: 'board-seats', es: 'puestos-junta' },
        requests: { en: 'requests', es: 'solicitudes' },
      },
    },
  },

  dataLoading: {
    basePath: 'businesses',
    defaultOrganization: 'bci_pension_fund',
    organizationMap: {
      pension_fund: 'bci_pension_fund',
      bci_pension_fund: 'bci_pension_fund',
    },
    sources: {
      assets: { file: 'investmentEntities.js', export: 'investment_entities' },
      securities: { file: 'securities.js', export: 'securities' },
      holdings: { file: 'holdings.js', export: 'holdings' },
      compliance_obligations: { file: 'complianceObligations.js', export: 'compliance_obligations' },
      requests: { file: 'requests.js', export: 'requests' },
      board_seats: { file: 'boardSeats.js', export: 'board_seats' },
      users: { file: 'users.js', export: 'pensionFundUsers' },
    },
    enrichment: [
      {
        processor: 'enrichment/enrichPensionFund.js',
        function: 'enrichPensionFundData',
      },
    ],
  },
};

export default domainConfig;

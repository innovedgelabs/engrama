import { domainI18n } from './i18n';

export const domainConfig = {
  id: 'regulatory_affairs',
  name: { en: 'Regulatory Affairs', es: 'Asuntos Regulatorios' },
  description: {
    en: 'Compliance and licensing across assets, facilities, suppliers, and products.',
    es: 'Cumplimiento y licencias para activos, instalaciones, proveedores y productos.',
  },
  defaultLanguage: domainI18n.defaultLanguage,
  uiText: domainI18n.uiText,

  // Demo-aware configuration so each business can select the schemas/entities it uses
  defaultDemo: 'food_manufacturing',
  demos: {
    food_manufacturing: {
      label: { en: 'Food Manufacturing Demo', es: 'Demo de Alimentos' },
      organizationId: 'food_manufacturing',
      businessId: 'acme-empresa-alimenticia',
      schemaUsage: {
        primary: [
          'company',
          'supplier',
          'customer',
          'product',
          'facility',
          'equipment',
          'vehicle',
          'person',
          'other_asset',
        ],
        secondary: ['regulatory_affair'],
        tertiary: ['renewal'],
        supporting: ['attachment'],
      },
    },
  },

  entities: {
    company: {
      category: 'company',
      label: { en: 'Companies', es: 'Empresas' },
      labelSingular: { en: 'Company', es: 'Empresa' },
      icon: 'Business',
      schemaKey: 'company',
      tabs: ['info', 'regulatory', 'dossier', 'relations'],
      searchFields: ['name', 'code', 'activities', 'legalName'],
    },
    supplier: {
      category: 'supplier',
      label: { en: 'Suppliers', es: 'Proveedores' },
      labelSingular: { en: 'Supplier', es: 'Proveedor' },
      icon: 'LocalShipping',
      schemaKey: 'supplier',
      tabs: ['info', 'regulatory', 'dossier', 'relations'],
      searchFields: ['name', 'activities', 'supplierType'],
    },
    customer: {
      category: 'customer',
      label: { en: 'Customers', es: 'Clientes' },
      labelSingular: { en: 'Customer', es: 'Cliente' },
      icon: 'Handshake',
      schemaKey: 'customer',
      tabs: ['info', 'regulatory', 'dossier', 'relations'],
      searchFields: ['name', 'activities', 'clientType'],
    },
    product: {
      category: 'product',
      label: { en: 'Products', es: 'Productos' },
      labelSingular: { en: 'Product', es: 'Producto' },
      icon: 'Category',
      schemaKey: 'product',
      tabs: ['info', 'regulatory', 'dossier', 'relations'],
      searchFields: ['name', 'code', 'category', 'brand'],
    },
    facility: {
      category: 'facility',
      label: { en: 'Facilities', es: 'Establecimientos' },
      labelSingular: { en: 'Facility', es: 'Establecimiento' },
      icon: 'Apartment',
      schemaKey: 'facility',
      tabs: ['info', 'regulatory', 'dossier', 'relations'],
      searchFields: ['name', 'code', 'operations', 'city'],
    },
    equipment: {
      category: 'equipment',
      label: { en: 'Equipment', es: 'Equipos' },
      labelSingular: { en: 'Equipment', es: 'Equipo' },
      icon: 'Handyman',
      schemaKey: 'equipment',
      tabs: ['info', 'regulatory', 'dossier', 'relations'],
      searchFields: ['name', 'code', 'category', 'model'],
    },
    vehicle: {
      category: 'vehicle',
      label: { en: 'Vehicles', es: 'Vehículos' },
      labelSingular: { en: 'Vehicle', es: 'Vehículo' },
      icon: 'DirectionsCar',
      schemaKey: 'vehicle',
      tabs: ['info', 'regulatory', 'dossier', 'relations'],
      searchFields: ['name', 'code', 'make', 'model'],
    },
    person: {
      category: 'person',
      label: { en: 'People', es: 'Personas' },
      labelSingular: { en: 'Person', es: 'Persona' },
      icon: 'Person',
      schemaKey: 'person',
      tabs: ['info', 'regulatory', 'dossier', 'relations'],
      searchFields: ['name', 'role', 'department', 'jobTitle'],
    },
    other_asset: {
      category: 'other_asset',
      label: { en: 'Other Assets', es: 'Otros Activos' },
      labelSingular: { en: 'Other Asset', es: 'Otro Activo' },
      icon: 'Inventory2',
      schemaKey: 'other_asset',
      tabs: ['info', 'regulatory', 'dossier', 'relations'],
      searchFields: ['name', 'code', 'assetType'],
    },
    regulatory_affair: {
      category: 'regulatory_affair',
      label: { en: 'Regulatory Affairs', es: 'Asuntos Regulatorios' },
      labelSingular: { en: 'Regulatory Affair', es: 'Asunto Regulatorio' },
      icon: 'Gavel',
      schemaKey: 'regulatory_affair',
      tabs: ['info', 'renewals'],
      searchFields: ['name', 'type', 'category', 'authority'],
    },
    renewal: {
      category: 'renewal',
      label: { en: 'Renewals', es: 'Renovaciones' },
      labelSingular: { en: 'Renewal', es: 'Renovación' },
      icon: 'Update',
      schemaKey: 'renewal',
      tabs: ['info', 'attachments'],
      searchFields: ['name', 'type', 'responsiblePerson'],
    },
    attachment: {
      category: 'attachment',
      label: { en: 'Attachments', es: 'Adjuntos' },
      labelSingular: { en: 'Attachment', es: 'Adjunto' },
      icon: 'AttachFile',
      schemaKey: 'attachment',
      tabs: ['info'],
      searchFields: ['name', 'type'],
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
        applicableTo: ['company', 'supplier', 'customer', 'product', 'facility', 'equipment', 'vehicle', 'person', 'other_asset', 'regulatory_affair'],
        default: 'active',
      },
      {
        key: 'compliance',
        label: { en: 'Compliance', es: 'Cumplimiento' },
        values: {
          current: { label: { en: 'Current', es: 'Vigente' }, color: '#2BA87F', icon: 'CheckCircle' },
          expiring: { label: { en: 'Expiring Soon', es: 'Por Vencer' }, color: '#F2C94C', icon: 'WatchLater' },
          expired: { label: { en: 'Expired', es: 'Vencido' }, color: '#EF4444', icon: 'Cancel' },
          permanent: { label: { en: 'Permanent', es: 'Permanente' }, color: '#D1D5DB', icon: 'AllInclusive' },
        },
        applicableTo: ['regulatory_affair', 'renewal'],
      },
      {
        key: 'workflow',
        label: { en: 'Workflow', es: 'Flujo de Trabajo' },
        values: {
          in_preparation: { label: { en: 'In Preparation', es: 'En Preparación' }, color: '#9C27B0', icon: 'Edit' },
          submitted: { label: { en: 'Submitted', es: 'Presentado' }, color: '#0EA5E9', icon: 'Schedule' },
          completed: { label: { en: 'Completed', es: 'Completado' }, color: '#2BA87F', icon: 'CheckCircle' },
          needs_renewal: { label: { en: 'Needs Renewal', es: 'Requiere Renovación' }, color: '#EF4444', icon: 'NotificationsActive' },
        },
        applicableTo: ['renewal', 'regulatory_affair'],
      },
      {
        key: 'priority',
        label: { en: 'Priority', es: 'Prioridad' },
        values: {
          critical: { label: { en: 'Critical', es: 'Crítico' }, color: '#DC2626', icon: 'Error' },
          high: { label: { en: 'High', es: 'Alto' }, color: '#F97316', icon: 'Error' },
          medium: { label: { en: 'Medium', es: 'Medio' }, color: '#3B82F6', icon: 'Info' },
          low: { label: { en: 'Low', es: 'Bajo' }, color: '#6B7280', icon: 'Info' },
        },
        applicableTo: ['regulatory_affair'],
        default: 'medium',
      },
    ],
    trafficLights: {
      dimensions: ['compliance'],
      showValues: ['current', 'expiring', 'expired'],
    },
  },

  search: {
    entityTypes: ['asset', 'affair', 'renewal', 'attachment'],
  },

  routing: {
    primaryEntity: 'company',
    segments: {
      company: { en: 'company', es: 'empresa' },
      supplier: { en: 'supplier', es: 'proveedor' },
      customer: { en: 'customer', es: 'cliente' },
      product: { en: 'product', es: 'producto' },
      facility: { en: 'facility', es: 'establecimiento' },
      equipment: { en: 'equipment', es: 'equipo' },
      vehicle: { en: 'vehicle', es: 'vehiculo' },
      person: { en: 'person', es: 'persona' },
      other_asset: { en: 'other-asset', es: 'otro-activo' },
      regulatory_affair: { en: 'affair', es: 'asunto' },
      renewal: { en: 'renewal', es: 'renovacion' },
    },
  },

  dataLoading: {
    basePath: 'businesses',
    defaultOrganization: 'food_manufacturing',
    organizationMap: {
      'acme-empresa-alimenticia': 'food_manufacturing',
    },
    sources: {
      assets: { file: 'assets.js', export: 'mockAssets' },
      regulatory_affairs: { file: 'regulatoryAffairs.js', export: 'mockRegulatoryAffairs' },
      renewals: { file: 'renewals.js', export: 'mockRenewals' },
      attachments: { file: 'attachments.js', export: 'mockAttachments' },
      historical_compliance: { file: 'historicalCompliance.js', export: 'historicalCompliance' },
      users: { file: 'users.js', export: 'mockUsers' },
    },
    enrichment: [
      {
        processor: 'enrichment/enrichRegulatoryAffairs.js',
        function: 'enrichRegulatoryAffairsData',
      },
    ],
  },
};

export default domainConfig;

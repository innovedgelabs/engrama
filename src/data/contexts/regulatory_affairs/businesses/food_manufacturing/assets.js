export const mockAssets = [
 {
    id: 'EM-001',
    name: 'Alimentos del Valle C.A.',
    category: 'company',
    activities: 'Almacenadora, Distribuidor, Fabricante',
    code: 'J-30125478-9',
    image: 'public/businesses/food_manufacturing/EM-001.svg',
    status: 'active',
    // Extended fields for company
    identifier: 'EM-0009-2017-0002',
    legalName: 'Alimentos del Valle C.A.',
    entityType: 'Jurídica',
    email: 'info@alimentosdelvalle.com',
    website: 'www.alimentosdelvalle.com',
    address: 'Torre Diamen. Piso 5. Ofc 5-2. Chuao. Caracas',
    mainPhone: '0212-9852076',
    mobilePhone: '',
    city: 'Caracas',
    postalCode: '6010',
    country: 'Venezuela',
    classification: 'Empresa del grupo',
    physicalLocationCode: 'A-D24352-8',
    economicSectors: 'Alimentos',
    notes: 'La empresa es proveedora de pasta del programa de alimentos NUTRICOM',
    // Registration data (collapsible)
    commercialRegistry: 'Registro Mercantil Segundo de la Circunscripción Judicial del Distrito capital y Estado Miranda',
    registrationDate: '2012-11-07',
    registryNumber: '32',
    volume: 'A-121',
    duration: '50 años',
    corporatePurpose: 'La sociedad tiene por objeto: A. La preparación de productos alimenticios derivados del maíz B. El establecimiento de expendios para la venta al por mayor o al detal, así como el transporte de todos los productos que elabora y de sus materias primas, en cualquiera de las formas permitidas por las leyes y reglamentos. C. La importación y exportación de alimentos, así como la representación de casas o firmas que se dediquen a objetos idénticos, similares o conexos a los de la sociedad.',
    shareCapital: 'El capital de la sociedad es la cantidad de ochocientos millones de bolívares (Bs. 800.000.000,00) dividido en ciento sesenta mil (160.000) acciones nominativas no convertibles al portador, con un valor nominal de cinco mil bolívares (Bs. 5.000,00) cada una.',
    // Connections (32 total)
    connections: [
      // Subsidiaries
      { id: 'EM-002', type: 'subsidiary' },
      { id: 'EM-003', type: 'subsidiary' },
      // Suppliers
      { id: 'PR-001', type: 'supplier' },
      { id: 'PR-002', type: 'supplier' },
      { id: 'PR-003', type: 'supplier' },
      { id: 'PR-004', type: 'supplier' },
      { id: 'PR-005', type: 'supplier' },
      // Customers
      { id: 'CL-001', type: 'customer' },
      { id: 'CL-002', type: 'customer' },
      { id: 'CL-003', type: 'customer' },
      { id: 'CL-004', type: 'customer' },
      // Products
      { id: 'PD-001', type: 'product' },
      { id: 'PD-002', type: 'product' },
      { id: 'PD-003', type: 'product' },
      { id: 'PD-004', type: 'product' },
      { id: 'PD-005', type: 'product' },
      { id: 'PD-006', type: 'product' },
      { id: 'PD-007', type: 'product' },
      { id: 'PD-008', type: 'product' },
      // Facilities
      { id: 'ES-001', type: 'facility' },
      { id: 'ES-003', type: 'facility' },
      { id: 'ES-004', type: 'facility' },
      // Employees
      { id: 'PE-001', type: 'employee' },
      { id: 'PE-002', type: 'employee' },
      { id: 'PE-003', type: 'employee' },
      { id: 'PE-004', type: 'employee' },
      // Equipment
      { id: 'EQ-001', type: 'equipment' },
      { id: 'EQ-002', type: 'equipment' },
      { id: 'EQ-003', type: 'equipment' },
      { id: 'EQ-004', type: 'equipment' },
      { id: 'EQ-005', type: 'equipment' },
      // Vehicles
      { id: 'VH-001', type: 'vehicle' },
      { id: 'VH-002', type: 'vehicle' }
    ]
  },
  {
    id: 'EM-002',
    name: 'Importadora Valle Import C.A.',
    category: 'company',
    activities: 'Importador, Distribuidor',
    code: 'J-40236589-1',
    image: 'public/businesses/food_manufacturing/EM-002.svg',
    status: 'active',
    // Connections (3 total)
    connections: [
      { id: 'EM-001', type: 'parent_company' },
      { id: 'PR-001', type: 'supplier' },
      { id: 'PR-002', type: 'supplier' }
    ]
  },
  {
    id: 'EM-003',
    name: 'Logística Valle Trans C.A.',
    category: 'company',
    activities: 'Transporte, Almacenamiento',
    code: 'J-29874563-2',
    image: 'public/businesses/food_manufacturing/EM-003.svg',
    status: 'active',
    // Connections (5 total)
    connections: [
      { id: 'EM-001', type: 'parent_company' },
      { id: 'ES-002', type: 'facility' },
      { id: 'VH-001', type: 'vehicle' },
      { id: 'VH-002', type: 'vehicle' },
      { id: 'VH-003', type: 'vehicle' }
    ]
  },

  // Suppliers
  {
    id: 'PR-001',
    name: 'Molinos de Venezuela S.A.',
    category: 'supplier',
    activities: 'Proveedor de harina de trigo',
    image: 'public/businesses/food_manufacturing/PR-001.svg',
    status: 'active',
    // Connections (4 total)
    connections: [
      { id: 'EM-001', type: 'customer' },
      { id: 'PD-001', type: 'supplies_to' },
      { id: 'PD-002', type: 'supplies_to' },
      { id: 'PD-007', type: 'supplies_to' }
    ]
  },
  {
    id: 'PR-002',
    name: 'Azucarera del Centro C.A.',
    category: 'supplier',
    activities: 'Proveedor de azúcar refinada',
    image: 'public/businesses/food_manufacturing/PR-002.svg',
    status: 'active',
    // Connections (4 total)
    connections: [
      { id: 'EM-001', type: 'customer' },
      { id: 'PD-001', type: 'supplies_to' },
      { id: 'PD-005', type: 'supplies_to' },
      { id: 'PD-006', type: 'supplies_to' }
    ]
  },
  {
    id: 'PR-003',
    name: 'Empaques Flexibles del Caribe',
    category: 'supplier',
    activities: 'Proveedor de empaques y etiquetas',
    image: 'public/businesses/food_manufacturing/PR-003.svg',
    status: 'active',
    // Connections (9 total)
    connections: [
      { id: 'EM-001', type: 'customer' },
      { id: 'PD-001', type: 'supplies_to' },
      { id: 'PD-002', type: 'supplies_to' },
      { id: 'PD-003', type: 'supplies_to' },
      { id: 'PD-004', type: 'supplies_to' },
      { id: 'PD-005', type: 'supplies_to' },
      { id: 'PD-006', type: 'supplies_to' },
      { id: 'PD-007', type: 'supplies_to' },
      { id: 'PD-008', type: 'supplies_to' }
    ]
  },
  {
    id: 'PR-004',
    name: 'Químicos Industriales Miranda',
    category: 'supplier',
    activities: 'Proveedor de aditivos alimentarios',
    image: 'public/businesses/food_manufacturing/PR-004.svg',
    status: 'warning',
    // Connections (4 total)
    connections: [
      { id: 'EM-001', type: 'customer' },
      { id: 'PD-001', type: 'supplies_to' },
      { id: 'PD-005', type: 'supplies_to' },
      { id: 'PD-006', type: 'supplies_to' }
    ]
  },
  {
    id: 'PR-005',
    name: 'Control de Plagas Seguridad Total',
    category: 'supplier',
    activities: 'Servicios de fumigación',
    image: 'public/businesses/food_manufacturing/PR-005.svg',
    status: 'expired',
    // Connections (3 total)
    connections: [
      { id: 'EM-001', type: 'customer' },
      { id: 'ES-001', type: 'service_provider' },
      { id: 'ES-002', type: 'service_provider' }
    ]
  },
  {
    id: 'PR-006',
    name: 'Electricidad Caracas C.A.',
    category: 'supplier',
    activities: 'Suministro de energía eléctrica',
    image: '',
    status: 'active',
    // Connections (5 total)
    connections: [
      { id: 'EM-001', type: 'customer' },
      { id: 'ES-001', type: 'supplies_to' },
      { id: 'ES-002', type: 'supplies_to' },
      { id: 'ES-003', type: 'supplies_to' },
      { id: 'EQ-005', type: 'backup_for' }
    ]
  },
  {
    id: 'PR-007',
    name: 'Laboratorios Control Total',
    category: 'supplier',
    activities: 'Análisis de laboratorio y certificación',
    image: '',
    status: 'active',
    // Connections (10 total)
    connections: [
      { id: 'EM-001', type: 'customer' },
      { id: 'PD-001', type: 'tests' },
      { id: 'PD-002', type: 'tests' },
      { id: 'PD-003', type: 'tests' },
      { id: 'PD-004', type: 'tests' },
      { id: 'PD-005', type: 'tests' },
      { id: 'PD-006', type: 'tests' },
      { id: 'PD-007', type: 'tests' },
      { id: 'PD-008', type: 'tests' },
      { id: 'ES-001', type: 'tests' }
    ]
  },
  {
    id: 'PR-008',
    name: 'EcoGestión Ambiental C.A.',
    category: 'supplier',
    activities: 'Gestión de residuos y reciclaje',
    image: '',
    status: 'active',
    // Connections (3 total)
    connections: [
      { id: 'EM-001', type: 'customer' },
      { id: 'ES-001', type: 'service_provider' },
      { id: 'ES-002', type: 'service_provider' }
    ]
  },
  {
    id: 'PR-009',
    name: 'Mantenimiento Industrial M&M',
    category: 'supplier',
    activities: 'Mantenimiento y reparación de equipos',
    image: '',
    status: 'active',
    // Connections (7 total)
    connections: [
      { id: 'EM-001', type: 'customer' },
      { id: 'EQ-001', type: 'maintains' },
      { id: 'EQ-002', type: 'maintains' },
      { id: 'EQ-003', type: 'maintains' },
      { id: 'EQ-004', type: 'maintains' },
      { id: 'EQ-005', type: 'maintains' },
      { id: 'ES-001', type: 'service_provider' }
    ]
  },

  // Customers
  {
    id: 'CL-001',
    name: 'Supermercados Central C.A.',
    category: 'customer',
    activities: 'Cadena de supermercados',
    image: 'public/businesses/food_manufacturing/CL-001.svg',
    status: 'active',
    // Connections (5 total)
    connections: [
      { id: 'EM-001', type: 'supplier' },
      { id: 'PD-001', type: 'purchases' },
      { id: 'PD-002', type: 'purchases' },
      { id: 'PD-003', type: 'purchases' },
      { id: 'PD-006', type: 'purchases' }
    ]
  },
  {
    id: 'CL-002',
    name: 'Distribuidora Oriente',
    category: 'customer',
    activities: 'Distribuidor mayorista regional',
    image: 'public/businesses/food_manufacturing/CL-002.svg',
    status: 'active',
    // Connections (4 total)
    connections: [
      { id: 'EM-001', type: 'supplier' },
      { id: 'PD-002', type: 'purchases' },
      { id: 'PD-004', type: 'purchases' },
      { id: 'PD-007', type: 'purchases' }
    ]
  },
  {
    id: 'CL-003',
    name: 'Abastos La Candelaria',
    category: 'customer',
    activities: 'Abasto mayorista',
    image: 'public/businesses/food_manufacturing/CL-003.svg',
    status: 'active',
    // Connections (4 total)
    connections: [
      { id: 'EM-001', type: 'supplier' },
      { id: 'PD-001', type: 'purchases' },
      { id: 'PD-003', type: 'purchases' },
      { id: 'PD-005', type: 'purchases' }
    ]
  },
  {
    id: 'CL-004',
    name: 'Mercado Los Andes',
    category: 'customer',
    activities: 'Distribuidor regional',
    image: 'public/businesses/food_manufacturing/CL-004.svg',
    status: 'warning',
    // Connections (5 total)
    connections: [
      { id: 'EM-001', type: 'supplier' },
      { id: 'PD-004', type: 'purchases' },
      { id: 'PD-006', type: 'purchases' },
      { id: 'PD-007', type: 'purchases' },
      { id: 'PD-008', type: 'purchases' }
    ]
  },
  {
    id: 'CL-005',
    name: 'Caribbean Foods Export Corp.',
    category: 'customer',
    activities: 'Exportador internacional',
    image: '',
    status: 'active',
    // Connections (5 total)
    connections: [
      { id: 'EM-001', type: 'supplier' },
      { id: 'EM-002', type: 'coordinates_with' },
      { id: 'PD-001', type: 'exports' },
      { id: 'PD-002', type: 'exports' },
      { id: 'PD-006', type: 'exports' }
    ]
  },

  // Products
  {
    id: 'PD-001',
    name: 'Galletas María Valle 400g',
    category: 'product',
    activities: 'Galleta tipo María',
    code: 'A-125.789',
    image: '',
    status: 'active',
    // Extended fields for product
    productCategory: 'Galletas Dulces',
    brand: 'Valle Tradicional',
    model: 'María 400g',
    description: 'Galletas María tradicionales con receta clásica, elaboradas con ingredientes naturales',
    weight: '400 g',
    dimensions: '25x20x8 cm',
    color: 'Dorado claro',
    material: 'Harina de trigo, azúcar, mantequilla, huevos',
    certifications: ['INSAI', 'Registro Sanitario'],
    price: 12500,
    supplier: 'Alimentos del Valle C.A.',
    launchDate: '2020-03-15',
    lifecycleStatus: 'Disponible',
    // Connections (8 total)
    connections: [
      { id: 'EM-001', type: 'product' },
      { id: 'ES-001', type: 'produced_at' },
      { id: 'PR-001', type: 'uses_material' },
      { id: 'PR-002', type: 'uses_material' },
      { id: 'PR-003', type: 'uses_material' },
      { id: 'PR-004', type: 'uses_material' },
      { id: 'CL-001', type: 'customer' },
      { id: 'CL-003', type: 'customer' }
    ]
  },
  {
    id: 'PD-002',
    name: 'Harina de Trigo Valle 1Kg',
    category: 'product',
    activities: 'Harina de trigo todo uso',
    code: 'A-089.456',
    image: '',
    status: 'active',
    // Connections (6 total)
    connections: [
      { id: 'EM-001', type: 'product' },
      { id: 'ES-001', type: 'produced_at' },
      { id: 'PR-001', type: 'uses_material' },
      { id: 'PR-003', type: 'uses_material' },
      { id: 'CL-001', type: 'customer' },
      { id: 'CL-002', type: 'customer' }
    ]
  },
  {
    id: 'PD-003',
    name: 'Pan de Sandwich Valle 500g',
    category: 'product',
    activities: 'Pan de molde tajado',
    code: 'A-234.567',
    image: '',
    status: 'active',
    // Connections (6 total)
    connections: [
      { id: 'EM-001', type: 'product' },
      { id: 'ES-001', type: 'produced_at' },
      { id: 'PR-001', type: 'uses_material' },
      { id: 'PR-003', type: 'uses_material' },
      { id: 'CL-001', type: 'customer' },
      { id: 'CL-003', type: 'customer' }
    ]
  },
  {
    id: 'PD-004',
    name: 'Galletas Saladas Soda 300g',
    category: 'product',
    activities: 'Galleta tipo soda',
    code: 'A-156.890',
    image: '',
    status: 'active',
    // Connections (6 total)
    connections: [
      { id: 'EM-001', type: 'product' },
      { id: 'ES-001', type: 'produced_at' },
      { id: 'PR-001', type: 'uses_material' },
      { id: 'PR-003', type: 'uses_material' },
      { id: 'CL-002', type: 'customer' },
      { id: 'CL-004', type: 'customer' }
    ]
  },
  {
    id: 'PD-005',
    name: 'Bizcocho Vainilla Valle 350g',
    category: 'product',
    activities: 'Bizcocho sabor vainilla',
    code: 'A-278.934',
    image: '',
    status: 'pending',
    // Connections (6 total)
    connections: [
      { id: 'EM-001', type: 'product' },
      { id: 'ES-001', type: 'produced_at' },
      { id: 'PR-002', type: 'uses_material' },
      { id: 'PR-003', type: 'uses_material' },
      { id: 'PR-004', type: 'uses_material' },
      { id: 'CL-003', type: 'customer' }
    ]
  },
  {
    id: 'PD-006',
    name: 'Galletas Avena y Miel 250g',
    category: 'product',
    activities: 'Galleta de avena',
    code: 'A-345.123',
    image: '',
    status: 'active',
    // Connections (7 total)
    connections: [
      { id: 'EM-001', type: 'product' },
      { id: 'ES-001', type: 'produced_at' },
      { id: 'PR-002', type: 'uses_material' },
      { id: 'PR-003', type: 'uses_material' },
      { id: 'PR-004', type: 'uses_material' },
      { id: 'CL-001', type: 'customer' },
      { id: 'CL-004', type: 'customer' }
    ]
  },
  {
    id: 'PD-007',
    name: 'Pan Hamburguesa Valle 6und',
    category: 'product',
    activities: 'Pan para hamburguesa',
    code: 'A-198.765',
    image: '',
    status: 'active',
    // Connections (6 total)
    connections: [
      { id: 'EM-001', type: 'product' },
      { id: 'ES-001', type: 'produced_at' },
      { id: 'PR-001', type: 'uses_material' },
      { id: 'PR-003', type: 'uses_material' },
      { id: 'CL-002', type: 'customer' },
      { id: 'CL-004', type: 'customer' }
    ]
  },
  {
    id: 'PD-008',
    name: 'Tostadas Integrales 200g',
    category: 'product',
    activities: 'Tostadas de pan integral',
    code: 'A-412.678',
    image: '',
    status: 'expired',
    // Connections (5 total)
    connections: [
      { id: 'EM-001', type: 'product' },
      { id: 'ES-001', type: 'produced_at' },
      { id: 'PR-001', type: 'uses_material' },
      { id: 'PR-003', type: 'uses_material' },
      { id: 'CL-004', type: 'customer' }
    ]
  },

  // People
  {
    id: 'PE-001',
    name: 'Ana María Sánchez',
    category: 'person',
    activities: 'Jefe de Planta',
    code: 'V-18234567',
    image: '',
    status: 'active',
    // Extended fields for person
    fullName: 'Ana María Sánchez López',
    nationalId: 'V-18.234.567',
    dateOfBirth: '1985-07-15',
    nationality: 'Venezolana',
    maritalStatus: 'Casada',
    profession: 'Ingeniera de Alimentos',
    role: 'Jefe de Planta de Producción',
    company: 'Alimentos del Valle C.A.',
    yearsOfExperience: '12 años',
    email: 'ana.sanchez@alimentosdelvalle.com',
    phone: '0414-1234567',
    address: 'Av. Principal de Los Ruices, Caracas',
    city: 'Caracas',
    state: 'Distrito Capital',
    postalCode: '1071',
    degree: 'Ingeniería de Alimentos',
    university: 'Universidad Central de Venezuela',
    certifications: ['HACCP', 'ISO 22000', 'Seguridad Alimentaria'],
    languages: ['Español (Nativo)', 'Inglés (Intermedio)'],
    // Connections (4 total)
    connections: [
      { id: 'EM-001', type: 'employee' },
      { id: 'ES-001', type: 'works_at' },
      { id: 'EQ-001', type: 'operates' },
      { id: 'EQ-004', type: 'operates' }
    ]
  },
  {
    id: 'PE-002',
    name: 'Carlos Eduardo Pérez',
    category: 'person',
    activities: 'Supervisor de Calidad',
    code: 'V-15678934',
    image: '',
    status: 'active',
    // Connections (4 total)
    connections: [
      { id: 'EM-001', type: 'employee' },
      { id: 'ES-001', type: 'works_at' },
      { id: 'EQ-002', type: 'operates' },
      { id: 'EQ-003', type: 'operates' }
    ]
  },
  {
    id: 'PE-003',
    name: 'María José Herrera',
    category: 'person',
    activities: 'Encargada de Almacén',
    code: 'V-20456789',
    image: '',
    status: 'active',
    // Connections (3 total)
    connections: [
      { id: 'EM-001', type: 'employee' },
      { id: 'ES-002', type: 'works_at' },
      { id: 'VH-003', type: 'operates' }
    ]
  },
  {
    id: 'PE-004',
    name: 'José Luis Ramírez',
    category: 'person',
    activities: 'Operador de Maquinaria',
    code: 'V-22345678',
    image: '',
    status: 'pending',
    // Connections (3 total)
    connections: [
      { id: 'EM-001', type: 'employee' },
      { id: 'ES-001', type: 'works_at' },
      { id: 'EQ-005', type: 'operates' }
    ]
  },
  {
    id: 'PE-005',
    name: 'Roberto Medina',
    category: 'person',
    activities: 'Gerente de Ventas',
    code: 'V-16789234',
    image: '',
    status: 'active',
    // Connections (8 total)
    connections: [
      { id: 'EM-001', type: 'employee' },
      { id: 'ES-003', type: 'works_at' },
      { id: 'CL-001', type: 'manages' },
      { id: 'CL-002', type: 'manages' },
      { id: 'CL-003', type: 'manages' },
      { id: 'CL-004', type: 'manages' },
      { id: 'PD-001', type: 'sells' },
      { id: 'PD-002', type: 'sells' }
    ]
  },
  {
    id: 'PE-006',
    name: 'Carmen Lucía Rojas',
    category: 'person',
    activities: 'Contadora',
    code: 'V-19456123',
    image: '',
    status: 'active',
    // Connections (7 total)
    connections: [
      { id: 'EM-001', type: 'employee' },
      { id: 'ES-003', type: 'works_at' },
      { id: 'PR-001', type: 'manages' },
      { id: 'PR-002', type: 'manages' },
      { id: 'PR-003', type: 'manages' },
      { id: 'PR-004', type: 'manages' },
      { id: 'PR-005', type: 'manages' }
    ]
  },
  {
    id: 'PE-007',
    name: 'Luis Alberto Torres',
    category: 'person',
    activities: 'Oficial de Seguridad e Higiene',
    code: 'V-17234890',
    image: '',
    status: 'active',
    // Connections (7 total)
    connections: [
      { id: 'EM-001', type: 'employee' },
      { id: 'ES-001', type: 'works_at' },
      { id: 'ES-002', type: 'oversees' },
      { id: 'VH-001', type: 'oversees' },
      { id: 'VH-002', type: 'oversees' },
      { id: 'VH-003', type: 'oversees' },
      { id: 'EQ-005', type: 'oversees' }
    ]
  },
  {
    id: 'PE-008',
    name: 'Mónica Patricia Vargas',
    category: 'person',
    activities: 'Supervisora de Línea',
    code: 'V-21567894',
    image: '',
    status: 'active',
    // Connections (8 total)
    connections: [
      { id: 'EM-001', type: 'employee' },
      { id: 'ES-001', type: 'works_at' },
      { id: 'EQ-001', type: 'supervises' },
      { id: 'EQ-002', type: 'supervises' },
      { id: 'EQ-003', type: 'supervises' },
      { id: 'PD-001', type: 'supervises' },
      { id: 'PD-004', type: 'supervises' },
      { id: 'PD-006', type: 'supervises' }
    ]
  },
  {
    id: 'PE-009',
    name: 'Jesús David Mendoza',
    category: 'person',
    activities: 'Conductor de Reparto',
    code: 'V-23678945',
    image: '',
    status: 'active',
    // Connections (4 total)
    connections: [
      { id: 'EM-003', type: 'employee' },
      { id: 'ES-002', type: 'works_at' },
      { id: 'VH-002', type: 'drives' },
      { id: 'CL-001', type: 'delivers_to' }
    ]
  },

  // Vehicles
  {
    id: 'VH-001',
    name: 'Camión Termo Valle-01',
    category: 'vehicle',
    activities: 'Transporte refrigerado',
    code: 'CAA-25D',
    image: '',
    status: 'active',
    // Connections (3 total)
    connections: [
      { id: 'EM-001', type: 'vehicle' },
      { id: 'ES-001', type: 'located_at' },
      { id: 'EM-003', type: 'operated_by' }
    ]
  },
  {
    id: 'VH-002',
    name: 'Camión Reparto Valle-02',
    category: 'vehicle',
    activities: 'Distribución local',
    code: 'CAB-12E',
    image: '',
    status: 'active',
    // Connections (3 total)
    connections: [
      { id: 'EM-001', type: 'vehicle' },
      { id: 'ES-002', type: 'located_at' },
      { id: 'EM-003', type: 'operated_by' }
    ]
  },
  {
    id: 'VH-003',
    name: 'Montacarga Toyota FL-45',
    category: 'vehicle',
    activities: 'Manejo de carga en planta',
    code: 'FL-4523',
    image: '',
    status: 'pending',
    // Connections (3 total)
    connections: [
      { id: 'EM-001', type: 'vehicle' },
      { id: 'ES-002', type: 'located_at' },
      { id: 'PE-003', type: 'operated_by' }
    ]
  },

  // Facilities
  {
    id: 'ES-001',
    name: 'Planta de Producción Los Ruices',
    category: 'facility',
    activities: 'Fabricación de galletas y panes',
    code: 'EST-PLT-001',
    image: '',
    status: 'active',
    // Connections (17 total)
    connections: [
      { id: 'EM-001', type: 'facility' },
      { id: 'PD-001', type: 'produces' },
      { id: 'PD-002', type: 'produces' },
      { id: 'PD-003', type: 'produces' },
      { id: 'PD-004', type: 'produces' },
      { id: 'PD-005', type: 'produces' },
      { id: 'PD-006', type: 'produces' },
      { id: 'PD-007', type: 'produces' },
      { id: 'PD-008', type: 'produces' },
      { id: 'EQ-001', type: 'houses' },
      { id: 'EQ-002', type: 'houses' },
      { id: 'EQ-003', type: 'houses' },
      { id: 'EQ-004', type: 'houses' },
      { id: 'EQ-005', type: 'houses' },
      { id: 'PE-001', type: 'staffed_by' },
      { id: 'PE-002', type: 'staffed_by' },
      { id: 'PE-004', type: 'staffed_by' },
      { id: 'VH-001', type: 'houses' }
    ]
  },
  {
    id: 'ES-002',
    name: 'Centro de Distribución Guatire',
    category: 'facility',
    activities: 'Almacenamiento y logística',
    code: 'EST-CD-002',
    image: '',
    status: 'active',
    // Connections (4 total)
    connections: [
      { id: 'EM-003', type: 'facility' },
      { id: 'PE-003', type: 'staffed_by' },
      { id: 'VH-002', type: 'houses' },
      { id: 'VH-003', type: 'houses' }
    ]
  },
  {
    id: 'ES-003',
    name: 'Oficinas Administrativas Caracas',
    category: 'facility',
    activities: 'Administración y ventas',
    code: 'EST-OF-003',
    image: '',
    status: 'active',
    // Connections (1 total)
    connections: [
      { id: 'EM-001', type: 'facility' }
    ]
  },
  {
    id: 'ES-004',
    name: 'Punto de Venta Fábrica',
    category: 'facility',
    activities: 'Venta directa al público',
    code: 'EST-PV-004',
    image: '',
    status: 'active',
    // Connections (1 total)
    connections: [
      { id: 'EM-001', type: 'facility' }
    ]
  },
  {
    id: 'ES-005',
    name: 'Almacén de Materias Primas',
    category: 'facility',
    activities: 'Almacenamiento de ingredientes',
    code: 'EST-ALM-005',
    image: '',
    status: 'active',
    // Connections (8 total)
    connections: [
      { id: 'EM-001', type: 'facility' },
      { id: 'PR-001', type: 'stores_from' },
      { id: 'PR-002', type: 'stores_from' },
      { id: 'PR-003', type: 'stores_from' },
      { id: 'PR-004', type: 'stores_from' },
      { id: 'EQ-008', type: 'houses' },
      { id: 'ES-001', type: 'supplies_to' },
      { id: 'PE-003', type: 'managed_by' }
    ]
  },
  {
    id: 'ES-006',
    name: 'Laboratorio de Control de Calidad',
    category: 'facility',
    activities: 'Análisis y pruebas de calidad',
    code: 'EST-LAB-006',
    image: '',
    status: 'active',
    // Connections (12 total)
    connections: [
      { id: 'EM-001', type: 'facility' },
      { id: 'PR-007', type: 'works_with' },
      { id: 'PE-002', type: 'works_at' },
      { id: 'PD-001', type: 'tests' },
      { id: 'PD-002', type: 'tests' },
      { id: 'PD-003', type: 'tests' },
      { id: 'PD-004', type: 'tests' },
      { id: 'PD-005', type: 'tests' },
      { id: 'PD-006', type: 'tests' },
      { id: 'PD-007', type: 'tests' },
      { id: 'PD-008', type: 'tests' },
      { id: 'ES-001', type: 'supports' }
    ]
  },

  // Equipment
  {
    id: 'EQ-001',
    name: 'Horno Rotatorio Werner Pfleiderer',
    category: 'equipment',
    activities: 'Horneado de productos de panadería',
    code: 'EQ-HOR-001',
    image: '',
    status: 'active',
    // Connections (6 total)
    connections: [
      { id: 'EM-001', type: 'equipment' },
      { id: 'ES-001', type: 'located_at' },
      { id: 'PE-001', type: 'operated_by' },
      { id: 'PD-001', type: 'produces' },
      { id: 'PD-004', type: 'produces' },
      { id: 'PD-006', type: 'produces' }
    ]
  },
  {
    id: 'EQ-002',
    name: 'Amasadora Industrial Diosna',
    category: 'equipment',
    activities: 'Mezclado de masa',
    code: 'EQ-AMA-002',
    image: '',
    status: 'active',
    // Connections (6 total)
    connections: [
      { id: 'EM-001', type: 'equipment' },
      { id: 'ES-001', type: 'located_at' },
      { id: 'PE-002', type: 'operated_by' },
      { id: 'PD-001', type: 'produces' },
      { id: 'PD-003', type: 'produces' },
      { id: 'PD-007', type: 'produces' }
    ]
  },
  {
    id: 'EQ-003',
    name: 'Empacadora Flow Pack FP-450',
    category: 'equipment',
    activities: 'Empaquetado automático',
    code: 'EQ-EMP-003',
    image: '',
    status: 'active',
    // Connections (12 total)
    connections: [
      { id: 'EM-001', type: 'equipment' },
      { id: 'ES-001', type: 'located_at' },
      { id: 'PE-002', type: 'operated_by' },
      { id: 'PD-001', type: 'packages' },
      { id: 'PD-002', type: 'packages' },
      { id: 'PD-003', type: 'packages' },
      { id: 'PD-004', type: 'packages' },
      { id: 'PD-005', type: 'packages' },
      { id: 'PD-006', type: 'packages' },
      { id: 'PD-007', type: 'packages' },
      { id: 'PD-008', type: 'packages' }
    ]
  },
  {
    id: 'EQ-004',
    name: 'Cámara de Fermentación CF-200',
    category: 'equipment',
    activities: 'Fermentación controlada',
    code: 'EQ-FER-004',
    image: '',
    status: 'pending',
    // Connections (5 total)
    connections: [
      { id: 'EM-001', type: 'equipment' },
      { id: 'ES-001', type: 'located_at' },
      { id: 'PE-001', type: 'operated_by' },
      { id: 'PD-003', type: 'produces' },
      { id: 'PD-007', type: 'produces' }
    ]
  },
  {
    id: 'EQ-005',
    name: 'Generador Caterpillar 150KW',
    category: 'equipment',
    activities: 'Energía de respaldo',
    code: 'EQ-GEN-005',
    image: '',
    status: 'expired',
    // Connections (3 total)
    connections: [
      { id: 'EM-001', type: 'equipment' },
      { id: 'ES-001', type: 'located_at' },
      { id: 'PE-004', type: 'operated_by' }
    ]
  },
  {
    id: 'EQ-006',
    name: 'Detector de Metales Safeline MD-5000',
    category: 'equipment',
    activities: 'Control de calidad y seguridad',
    code: 'EQ-DET-006',
    image: '',
    status: 'active',
    // Connections (11 total)
    connections: [
      { id: 'EM-001', type: 'equipment' },
      { id: 'ES-001', type: 'located_at' },
      { id: 'PE-002', type: 'operated_by' },
      { id: 'PD-001', type: 'inspects' },
      { id: 'PD-002', type: 'inspects' },
      { id: 'PD-003', type: 'inspects' },
      { id: 'PD-004', type: 'inspects' },
      { id: 'PD-005', type: 'inspects' },
      { id: 'PD-006', type: 'inspects' },
      { id: 'PD-007', type: 'inspects' },
      { id: 'PD-008', type: 'inspects' }
    ]
  },
  {
    id: 'EQ-007',
    name: 'Balanza Verificadora Mettler Toledo',
    category: 'equipment',
    activities: 'Verificación de peso',
    code: 'EQ-BAL-007',
    image: '',
    status: 'active',
    // Connections (11 total)
    connections: [
      { id: 'EM-001', type: 'equipment' },
      { id: 'ES-001', type: 'located_at' },
      { id: 'PE-008', type: 'operated_by' },
      { id: 'PD-001', type: 'weighs' },
      { id: 'PD-002', type: 'weighs' },
      { id: 'PD-003', type: 'weighs' },
      { id: 'PD-004', type: 'weighs' },
      { id: 'PD-005', type: 'weighs' },
      { id: 'PD-006', type: 'weighs' },
      { id: 'PD-007', type: 'weighs' },
      { id: 'PD-008', type: 'weighs' }
    ]
  },
  {
    id: 'EQ-008',
    name: 'Cámara Fría Materias Primas 50m³',
    category: 'equipment',
    activities: 'Almacenamiento refrigerado',
    code: 'EQ-CAM-008',
    image: '',
    status: 'active',
    // Connections (6 total)
    connections: [
      { id: 'EM-001', type: 'equipment' },
      { id: 'ES-001', type: 'located_at' },
      { id: 'PE-007', type: 'oversees' },
      { id: 'PR-001', type: 'stores' },
      { id: 'PR-002', type: 'stores' },
      { id: 'PD-003', type: 'stores' }
    ]
  },

  // Other Assets
  {
    id: 'OT-001',
    name: 'Registro Sanitario INSAI',
    category: 'other_asset',
    activities: 'Permiso sanitario nacional',
    code: 'RS-2024-001',
    image: '',
    status: 'active',
    // Connections (1 total)
    connections: [
      { id: 'EM-001', type: 'applies_to' }
    ]
  },
  {
    id: 'OT-002',
    name: 'Certificación ISO 22000',
    category: 'other_asset',
    activities: 'Sistema de gestión de inocuidad',
    code: 'ISO-22000-2024',
    image: '',
    status: 'active',
    // Connections (1 total)
    connections: [
      { id: 'EM-001', type: 'applies_to' }
    ]
  },
  {
    id: 'OT-003',
    name: 'Licencia Software SAP',
    category: 'other_asset',
    activities: 'Sistema ERP empresarial',
    code: 'LIC-SAP-2024',
    image: '',
    status: 'active',
    // Connections (1 total)
    connections: [
      { id: 'EM-001', type: 'applies_to' }
    ]
  },
  {
    id: 'OT-004',
    name: 'Marca Registrada "Valle"',
    category: 'other_asset',
    activities: 'Propiedad intelectual',
    code: 'MAR-2019-456',
    image: '',
    status: 'pending',
    // Connections (1 total)
    connections: [
      { id: 'EM-001', type: 'applies_to' }
    ]
  },
];

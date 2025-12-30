export const mockRegulatoryAffairs = [
  // Regulatory affairs for Alimentos del Valle C.A. (EM-001)
  {
    id: 'AFF-001',
    assetId: 'EM-001',
    name: 'Registro Nacional de Contribuyentes (RNC)',
    type: 'Certificado',
    category: 'Fiscal',
    description: 'Inscripción y renovación del Registro Nacional de Contribuyentes',
    authority: 'SENIAT',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },
  {
    id: 'AFF-002',
    assetId: 'EM-001',
    name: 'Licencia Sanitaria',
    type: 'Licencia',
    category: 'Sanitaria',
    description: 'Permiso sanitario para operación de planta de alimentos',
    authority: 'INSAI',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },
  {
    id: 'AFF-003',
    assetId: 'EM-001',
    name: 'Permiso de Bomberos',
    type: 'Permiso',
    category: 'Seguridad',
    description: 'Certificado de cumplimiento de normas de prevención de incendios',
    authority: 'Cuerpo de Bomberos',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },
  {
    id: 'AFF-004',
    assetId: 'EM-001',
    name: 'Póliza de Seguro de Responsabilidad Civil',
    type: 'Póliza',
    category: 'Seguros',
    description: 'Cobertura de responsabilidad civil general y operaciones',
    authority: 'Superintendencia de Seguros',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-005',
    assetId: 'EM-001',
    name: 'Certificación ISO 9001',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Sistema de gestión de calidad',
    authority: 'FONDONORMA',
    renewalFrequency: 'Trienal',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-006',
    assetId: 'EM-001',
    name: 'Patente Municipal',
    type: 'Registro',
    category: 'Municipal',
    description: 'Licencia de actividades económicas',
    authority: 'Alcaldía de Caracas',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-007',
    assetId: 'EM-001',
    name: 'Plan de Gestión Ambiental',
    type: 'Plan',
    category: 'Ambiental',
    description: 'Autorización ambiental para operaciones industriales',
    authority: 'Ministerio del Ambiente',
    renewalFrequency: 'Bienal',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-008',
    assetId: 'EM-001',
    name: 'Certificación de Buenas Prácticas de Manufactura',
    type: 'Certificado',
    category: 'Sanitaria',
    description: 'Cumplimiento de normas BPM en producción de alimentos',
    authority: 'INSAI',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // Regulatory affairs for PR-001: Molinos de Venezuela S.A. (Key Supplier)
  {
    id: 'AFF-009',
    assetId: 'PR-001',
    name: 'Evaluación y Calificación de Proveedor',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Auditoría de calidad y certificación como proveedor aprobado para materias primas',
    authority: 'Alimentos del Valle C.A.',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-010',
    assetId: 'PR-001',
    name: 'Ficha Técnica de Harina de Trigo',
    type: 'Especificación',
    category: 'Calidad',
    description: 'Especificaciones técnicas aprobadas del producto suministrado',
    authority: 'Alimentos del Valle C.A.',
    renewalFrequency: 'Bienal',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },

  // Regulatory affairs for PD-001: Galletas María Valle 400g (Flagship Product)
  {
    id: 'AFF-011',
    assetId: 'PD-001',
    name: 'Registro Sanitario de Producto',
    type: 'Registro',
    category: 'Sanitaria',
    description: 'Registro sanitario nacional obligatorio para comercialización de alimentos procesados',
    authority: 'INSAI',
    renewalFrequency: 'Quinquenal',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },
  {
    id: 'AFF-012',
    assetId: 'PD-001',
    name: 'Aprobación de Etiquetado',
    type: 'Aprobación',
    category: 'Sanitaria',
    description: 'Aprobación del diseño de etiqueta nutricional y declaraciones de salud',
    authority: 'INSAI',
    renewalFrequency: 'Trienal',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-013',
    assetId: 'PD-001',
    name: 'Certificado de Libre Venta',
    type: 'Certificado',
    category: 'Comercial',
    description: 'Certificado para exportación que confirma autorización de venta en Venezuela',
    authority: 'INSAI',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // Regulatory affairs for PE-001: Ana María Sánchez (Plant Manager)
  {
    id: 'AFF-014',
    assetId: 'PE-001',
    name: 'Certificado de Salud Ocupacional',
    type: 'Certificado',
    category: 'Sanitaria',
    description: 'Examen médico ocupacional requerido para personal de planta alimentaria',
    authority: 'INSAI / MPPS',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },
  {
    id: 'AFF-015',
    assetId: 'PE-001',
    name: 'Certificación en Manipulación de Alimentos',
    type: 'Certificado',
    category: 'Capacitación',
    description: 'Curso obligatorio de manipulación higiénica de alimentos',
    authority: 'INSAI',
    renewalFrequency: 'Bienal',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-016',
    assetId: 'PE-001',
    name: 'Título Profesional Registrado CIV',
    type: 'Registro',
    category: 'Profesional',
    description: 'Registro del título de Ingeniera de Alimentos ante el Colegio de Ingenieros',
    authority: 'Colegio de Ingenieros de Venezuela',
    renewalFrequency: 'Permanente',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // Regulatory affairs for VH-001: Camión Termo Valle-01 (Refrigerated Truck)
  {
    id: 'AFF-017',
    assetId: 'VH-001',
    name: 'Certificado de Registro Vehicular',
    type: 'Certificado',
    category: 'Vehicular',
    description: 'Registro nacional del vehículo ante INTT',
    authority: 'INTT',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-018',
    assetId: 'VH-001',
    name: 'Revisión Técnica Vehicular (RTV)',
    type: 'Inspección',
    category: 'Vehicular',
    description: 'Inspección técnica obligatoria de seguridad vehicular',
    authority: 'INTT',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-019',
    assetId: 'VH-001',
    name: 'Póliza de Seguro de Vehículo',
    type: 'Póliza',
    category: 'Seguros',
    description: 'Seguro de responsabilidad civil y daños materiales',
    authority: 'Superintendencia de Seguros',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-020',
    assetId: 'VH-001',
    name: 'Calibración de Equipo de Refrigeración',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Calibración y validación del sistema de refrigeración para transporte de alimentos',
    authority: 'Laboratorio Acreditado',
    renewalFrequency: 'Semestral',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },

  // Regulatory affairs for ES-001: Planta de Producción Los Ruices (Main Production Facility)
  {
    id: 'AFF-021',
    assetId: 'ES-001',
    name: 'Permiso de Habitabilidad',
    type: 'Permiso',
    category: 'Municipal',
    description: 'Permiso de uso conforme y habitabilidad del inmueble industrial',
    authority: 'Alcaldía',
    renewalFrequency: 'Permanente',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-022',
    assetId: 'ES-001',
    name: 'Licencia Sanitaria de Establecimiento',
    type: 'Licencia',
    category: 'Sanitaria',
    description: 'Licencia sanitaria para operación de planta de producción de alimentos',
    authority: 'INSAI',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },
  {
    id: 'AFF-023',
    assetId: 'ES-001',
    name: 'Permiso del Cuerpo de Bomberos',
    type: 'Permiso',
    category: 'Seguridad',
    description: 'Inspección y permiso de prevención de incendios del establecimiento',
    authority: 'Cuerpo de Bomberos',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },
  {
    id: 'AFF-024',
    assetId: 'ES-001',
    name: 'Autorización Ambiental de Planta',
    type: 'Autorización',
    category: 'Ambiental',
    description: 'Permiso ambiental para operación industrial y manejo de efluentes',
    authority: 'Ministerio del Ambiente',
    renewalFrequency: 'Bienal',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-025',
    assetId: 'ES-001',
    name: 'Certificado de Potabilidad de Agua',
    type: 'Certificado',
    category: 'Sanitaria',
    description: 'Análisis de calidad del agua utilizada en procesos de producción',
    authority: 'Laboratorio Acreditado',
    renewalFrequency: 'Semestral',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // Regulatory affairs for EQ-001: Horno Rotatorio Werner Pfleiderer (Critical Oven Equipment)
  {
    id: 'AFF-026',
    assetId: 'EQ-001',
    name: 'Certificado de Calibración de Temperatura',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Calibración de sensores de temperatura para validación de proceso térmico',
    authority: 'Laboratorio Acreditado ISO 17025',
    renewalFrequency: 'Semestral',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-027',
    assetId: 'EQ-001',
    name: 'Inspección de Seguridad de Equipo',
    type: 'Inspección',
    category: 'Seguridad',
    description: 'Inspección técnica de seguridad eléctrica y mecánica del equipo',
    authority: 'Ingeniería de Mantenimiento',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },

  // Regulatory affairs for EM-002: Importadora Valle Import C.A. (Tier 2 - Importer Subsidiary)
  {
    id: 'AFF-028',
    assetId: 'EM-002',
    name: 'Licencia de Importación',
    type: 'Licencia',
    category: 'Comercial',
    description: 'Autorización para realizar operaciones de importación de alimentos',
    authority: 'SENIAT / MPPA',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-029',
    assetId: 'EM-002',
    name: 'Registro de Importador ante INSAI',
    type: 'Registro',
    category: 'Sanitaria',
    description: 'Registro como importador de productos alimenticios',
    authority: 'INSAI',
    renewalFrequency: 'Bienal',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-030',
    assetId: 'EM-002',
    name: 'Certificación Aduanera OEA',
    type: 'Certificado',
    category: 'Comercial',
    description: 'Certificación como Operador Económico Autorizado para facilidades aduaneras',
    authority: 'SENIAT',
    renewalFrequency: 'Trienal',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // Regulatory affairs for PR-004: Químicos Industriales Miranda (Tier 2 - Chemical Supplier)
  {
    id: 'AFF-031',
    assetId: 'PR-004',
    name: 'Auditoría de Calificación de Proveedor',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Evaluación y aprobación como proveedor de aditivos alimentarios',
    authority: 'Alimentos del Valle C.A.',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-032',
    assetId: 'PR-004',
    name: 'Hojas de Datos de Seguridad (MSDS)',
    type: 'Especificación',
    category: 'Seguridad',
    description: 'Fichas de seguridad actualizadas de productos químicos suministrados',
    authority: 'Fabricante / Alimentos del Valle',
    renewalFrequency: 'Bienal',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // Regulatory affairs for PD-003: Pan de Sandwich Valle 500g (Tier 2 - Refrigerated Product)
  {
    id: 'AFF-033',
    assetId: 'PD-003',
    name: 'Registro Sanitario de Producto Refrigerado',
    type: 'Registro',
    category: 'Sanitaria',
    description: 'Registro sanitario específico para producto de panadería refrigerado',
    authority: 'INSAI',
    renewalFrequency: 'Quinquenal',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },
  {
    id: 'AFF-034',
    assetId: 'PD-003',
    name: 'Estudio de Vida Útil',
    type: 'Estudio',
    category: 'Calidad',
    description: 'Validación de vida útil y condiciones de almacenamiento del producto refrigerado',
    authority: 'Laboratorio Acreditado',
    renewalFrequency: 'Trienal',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },

  // Regulatory affairs for VH-002: Camión Reparto Valle-02 (Tier 2 - Delivery Truck)
  {
    id: 'AFF-035',
    assetId: 'VH-002',
    name: 'Certificado de Registro Vehicular',
    type: 'Certificado',
    category: 'Vehicular',
    description: 'Registro nacional del vehículo ante INTT',
    authority: 'INTT',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-036',
    assetId: 'VH-002',
    name: 'Revisión Técnica Vehicular (RTV)',
    type: 'Inspección',
    category: 'Vehicular',
    description: 'Inspección técnica obligatoria de seguridad vehicular',
    authority: 'INTT',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-037',
    assetId: 'VH-002',
    name: 'Póliza de Seguro de Vehículo',
    type: 'Póliza',
    category: 'Seguros',
    description: 'Seguro de responsabilidad civil y daños materiales',
    authority: 'Superintendencia de Seguros',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },

  // Regulatory affairs for ES-002: Centro de Distribución Guatire (Tier 2 - Distribution Center)
  {
    id: 'AFF-038',
    assetId: 'ES-002',
    name: 'Licencia Sanitaria de Almacén',
    type: 'Licencia',
    category: 'Sanitaria',
    description: 'Licencia sanitaria para almacenamiento y distribución de alimentos',
    authority: 'INSAI',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },
  {
    id: 'AFF-039',
    assetId: 'ES-002',
    name: 'Permiso del Cuerpo de Bomberos',
    type: 'Permiso',
    category: 'Seguridad',
    description: 'Inspección y permiso de prevención de incendios del centro de distribución',
    authority: 'Cuerpo de Bomberos',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },
  {
    id: 'AFF-040',
    assetId: 'ES-002',
    name: 'Certificado de Fumigación y Control de Plagas',
    type: 'Certificado',
    category: 'Sanitaria',
    description: 'Servicio de control de plagas y certificación del tratamiento',
    authority: 'Empresa Certificada',
    renewalFrequency: 'Trimestral',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // ========== ADDITIONAL ASSETS - COMPLETE COVERAGE ==========

  // EM-003: Logística Valle Trans C.A. (Logistics Subsidiary)
  {
    id: 'AFF-041',
    assetId: 'EM-003',
    name: 'Registro RIF Empresa de Transporte',
    type: 'Registro',
    category: 'Fiscal',
    description: 'Registro de Información Fiscal para empresa de logística',
    authority: 'SENIAT',
    renewalFrequency: 'Trienal',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },

  // PR-002: Azucarera del Centro C.A. (Sugar Supplier)
  {
    id: 'AFF-042',
    assetId: 'PR-002',
    name: 'Evaluación de Proveedor de Azúcar',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Auditoría y certificación como proveedor aprobado de azúcar',
    authority: 'Alimentos del Valle C.A.',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },

  // PR-003: Empaques Flexibles del Caribe (Packaging Supplier)
  {
    id: 'AFF-043',
    assetId: 'PR-003',
    name: 'Evaluación de Proveedor de Empaques',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Calificación de proveedor de materiales de empaque',
    authority: 'Alimentos del Valle C.A.',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },

  // PR-005: Control de Plagas Seguridad Total (Pest Control Supplier)
  {
    id: 'AFF-044',
    assetId: 'PR-005',
    name: 'Certificación de Empresa de Control de Plagas',
    type: 'Certificado',
    category: 'Sanitaria',
    description: 'Certificación oficial de empresa de control de plagas en industria alimentaria',
    authority: 'INSAI',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // PD-002: Harina de Trigo Valle 1Kg
  {
    id: 'AFF-045',
    assetId: 'PD-002',
    name: 'Registro Sanitario de Producto',
    type: 'Registro',
    category: 'Sanitaria',
    description: 'Registro sanitario para comercialización de harina de trigo enriquecida',
    authority: 'INSAI',
    renewalFrequency: 'Quinquenal',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },

  // PD-004: Galletas Saladas Soda 300g
  {
    id: 'AFF-046',
    assetId: 'PD-004',
    name: 'Registro Sanitario de Producto',
    type: 'Registro',
    category: 'Sanitaria',
    description: 'Registro sanitario para galletas saladas tipo soda',
    authority: 'INSAI',
    renewalFrequency: 'Quinquenal',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },

  // PD-005: Bizcocho Vainilla Valle 350g
  {
    id: 'AFF-047',
    assetId: 'PD-005',
    name: 'Registro Sanitario de Producto',
    type: 'Registro',
    category: 'Sanitaria',
    description: 'Registro sanitario para bizcocho de vainilla',
    authority: 'INSAI',
    renewalFrequency: 'Quinquenal',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },

  // PD-006: Galletas Avena y Miel 250g
  {
    id: 'AFF-048',
    assetId: 'PD-006',
    name: 'Registro Sanitario de Producto',
    type: 'Registro',
    category: 'Sanitaria',
    description: 'Registro sanitario para galletas de avena y miel',
    authority: 'INSAI',
    renewalFrequency: 'Quinquenal',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },

  // PD-007: Pan Hamburguesa Valle 6und
  {
    id: 'AFF-049',
    assetId: 'PD-007',
    name: 'Registro Sanitario de Producto',
    type: 'Registro',
    category: 'Sanitaria',
    description: 'Registro sanitario para pan de hamburguesa',
    authority: 'INSAI',
    renewalFrequency: 'Quinquenal',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },

  // PD-008: Tostadas Integrales 200g
  {
    id: 'AFF-050',
    assetId: 'PD-008',
    name: 'Registro Sanitario de Producto',
    type: 'Registro',
    category: 'Sanitaria',
    description: 'Registro sanitario para tostadas integrales',
    authority: 'INSAI',
    renewalFrequency: 'Quinquenal',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },

  // PE-002: Carlos Eduardo Pérez (Quality Manager)
  {
    id: 'AFF-051',
    assetId: 'PE-002',
    name: 'Certificado de Salud Ocupacional',
    type: 'Certificado',
    category: 'Sanitaria',
    description: 'Examen médico ocupacional requerido para personal de planta',
    authority: 'INSAI / MPPS',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },

  // PE-003: María José Herrera (Warehouse Supervisor)
  {
    id: 'AFF-052',
    assetId: 'PE-003',
    name: 'Certificado de Manipulación de Alimentos',
    type: 'Certificado',
    category: 'Sanitaria',
    description: 'Certificado de manipulador de alimentos para supervisora de almacén',
    authority: 'INSAI',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // PE-004: José Luis Ramírez (Maintenance Technician)
  {
    id: 'AFF-053',
    assetId: 'PE-004',
    name: 'Certificado de Competencia Técnica',
    type: 'Certificado',
    category: 'Laboral',
    description: 'Certificación técnica para mantenimiento de equipos industriales',
    authority: 'INCES',
    renewalFrequency: 'Trienal',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // VH-003: Montacarga Toyota FL-45 (Forklift)
  {
    id: 'AFF-054',
    assetId: 'VH-003',
    name: 'Inspección Técnica de Montacarga',
    type: 'Certificado',
    category: 'Seguridad',
    description: 'Inspección anual de seguridad para montacarga industrial',
    authority: 'INPSASEL',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },

  // ES-003: Oficinas Administrativas Caracas
  {
    id: 'AFF-055',
    assetId: 'ES-003',
    name: 'Permiso del Cuerpo de Bomberos',
    type: 'Permiso',
    category: 'Seguridad',
    description: 'Inspección y permiso de prevención de incendios de oficinas',
    authority: 'Cuerpo de Bomberos',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },

  // ES-004: Punto de Venta Fábrica
  {
    id: 'AFF-056',
    assetId: 'ES-004',
    name: 'Licencia Comercial',
    type: 'Licencia',
    category: 'Comercial',
    description: 'Licencia municipal para punto de venta directo en fábrica',
    authority: 'Alcaldía de Sucre',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // EQ-002: Amasadora Industrial Diosna
  {
    id: 'AFF-057',
    assetId: 'EQ-002',
    name: 'Certificado de Calibración',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Calibración de controles de velocidad y temperatura de amasadora',
    authority: 'Laboratorio Acreditado',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },

  // EQ-003: Empacadora Flow Pack FP-450
  {
    id: 'AFF-058',
    assetId: 'EQ-003',
    name: 'Certificado de Mantenimiento Preventivo',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Mantenimiento preventivo anual de empacadora automática',
    authority: 'Proveedor Autorizado',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },

  // EQ-004: Cámara de Fermentación CF-200
  {
    id: 'AFF-059',
    assetId: 'EQ-004',
    name: 'Certificado de Calibración de Temperatura y Humedad',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Calibración de sensores de temperatura y humedad de cámara de fermentación',
    authority: 'Laboratorio Acreditado ISO 17025',
    renewalFrequency: 'Semestral',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },

  // EQ-005: Generador Caterpillar 150KW
  {
    id: 'AFF-060',
    assetId: 'EQ-005',
    name: 'Certificado de Mantenimiento de Generador',
    type: 'Certificado',
    category: 'Seguridad',
    description: 'Mantenimiento preventivo de generador eléctrico de emergencia',
    authority: 'Caterpillar Autorizado',
    renewalFrequency: 'Semestral',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // ========== PHASE 2 EXPANSION - NEW ASSETS REGULATORY AFFAIRS ==========

  // PE-005: Roberto Medina (Sales Manager)
  {
    id: 'AFF-061',
    assetId: 'PE-005',
    name: 'Certificado de Salud Ocupacional',
    type: 'Certificado',
    category: 'Sanitaria',
    description: 'Examen médico ocupacional para personal administrativo',
    authority: 'MPPS',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },
  {
    id: 'AFF-062',
    assetId: 'PE-005',
    name: 'Certificación en Gestión de Ventas',
    type: 'Certificado',
    category: 'Capacitación',
    description: 'Capacitación en técnicas de ventas y gestión comercial',
    authority: 'INCES',
    renewalFrequency: 'Trienal',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // PE-006: Carmen Lucía Rojas (Accountant)
  {
    id: 'AFF-063',
    assetId: 'PE-006',
    name: 'Registro Profesional Colegio de Contadores',
    type: 'Registro',
    category: 'Profesional',
    description: 'Registro del título de Licenciada en Contaduría ante el colegio profesional',
    authority: 'Colegio de Contadores Públicos',
    renewalFrequency: 'Permanente',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-064',
    assetId: 'PE-006',
    name: 'Certificado de Salud Ocupacional',
    type: 'Certificado',
    category: 'Sanitaria',
    description: 'Examen médico ocupacional para personal administrativo',
    authority: 'MPPS',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },

  // PE-007: Luis Alberto Torres (HSE Officer)
  {
    id: 'AFF-065',
    assetId: 'PE-007',
    name: 'Certificación en Seguridad Industrial',
    type: 'Certificado',
    category: 'Profesional',
    description: 'Certificación profesional en higiene y seguridad industrial',
    authority: 'INPSASEL',
    renewalFrequency: 'Trienal',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-066',
    assetId: 'PE-007',
    name: 'Curso de Primeros Auxilios',
    type: 'Certificado',
    category: 'Capacitación',
    description: 'Capacitación en primeros auxilios y respuesta a emergencias',
    authority: 'Cruz Roja Venezolana',
    renewalFrequency: 'Bienal',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // PE-008: Mónica Patricia Vargas (Line Supervisor)
  {
    id: 'AFF-067',
    assetId: 'PE-008',
    name: 'Certificado de Salud Ocupacional',
    type: 'Certificado',
    category: 'Sanitaria',
    description: 'Examen médico ocupacional requerido para personal de planta',
    authority: 'INSAI / MPPS',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },
  {
    id: 'AFF-068',
    assetId: 'PE-008',
    name: 'Certificación en Manipulación de Alimentos',
    type: 'Certificado',
    category: 'Sanitaria',
    description: 'Curso obligatorio de manipulación higiénica de alimentos para supervisores',
    authority: 'INSAI',
    renewalFrequency: 'Bienal',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // PE-009: Jesús David Mendoza (Delivery Driver)
  {
    id: 'AFF-069',
    assetId: 'PE-009',
    name: 'Licencia de Conducir Profesional',
    type: 'Licencia',
    category: 'Vehicular',
    description: 'Licencia de conducir grado 4 para transporte de carga',
    authority: 'INTT',
    renewalFrequency: 'Quinquenal',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-070',
    assetId: 'PE-009',
    name: 'Certificado de Salud para Conductor',
    type: 'Certificado',
    category: 'Sanitaria',
    description: 'Examen médico para conductores profesionales',
    authority: 'MPPS',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },

  // PR-006: Electricidad Caracas C.A. (Electricity Supplier)
  {
    id: 'AFF-071',
    assetId: 'PR-006',
    name: 'Contrato de Suministro Eléctrico',
    type: 'Contrato',
    category: 'Comercial',
    description: 'Contrato de servicio de suministro eléctrico comercial',
    authority: 'Alimentos del Valle C.A.',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-072',
    assetId: 'PR-006',
    name: 'Certificado de Conformidad Eléctrica',
    type: 'Certificado',
    category: 'Seguridad',
    description: 'Certificación de instalaciones eléctricas y cumplimiento de normas',
    authority: 'CORPOELEC',
    renewalFrequency: 'Bienal',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // PR-007: Laboratorios Control Total (Laboratory Services)
  {
    id: 'AFF-073',
    assetId: 'PR-007',
    name: 'Acreditación ISO 17025',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Acreditación de laboratorio de ensayo y calibración',
    authority: 'ONA (Organismo Nacional de Acreditación)',
    renewalFrequency: 'Trienal',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-074',
    assetId: 'PR-007',
    name: 'Contrato de Servicios de Análisis',
    type: 'Contrato',
    category: 'Comercial',
    description: 'Acuerdo de servicios de análisis microbiológico y fisicoquímico',
    authority: 'Alimentos del Valle C.A.',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // PR-008: EcoGestión Ambiental C.A. (Waste Management)
  {
    id: 'AFF-075',
    assetId: 'PR-008',
    name: 'Licencia de Manejo de Desechos',
    type: 'Licencia',
    category: 'Ambiental',
    description: 'Autorización para recolección y disposición de desechos industriales',
    authority: 'Ministerio del Ambiente',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-076',
    assetId: 'PR-008',
    name: 'Certificado de Gestión Ambiental',
    type: 'Certificado',
    category: 'Ambiental',
    description: 'Certificación en gestión integral de residuos sólidos y líquidos',
    authority: 'Ministerio del Ambiente',
    renewalFrequency: 'Bienal',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },

  // PR-009: Mantenimiento Industrial M&M (Maintenance Contractor)
  {
    id: 'AFF-077',
    assetId: 'PR-009',
    name: 'Evaluación de Proveedor de Mantenimiento',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Calificación y aprobación como proveedor de servicios de mantenimiento',
    authority: 'Alimentos del Valle C.A.',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-078',
    assetId: 'PR-009',
    name: 'Contrato de Mantenimiento Preventivo',
    type: 'Contrato',
    category: 'Comercial',
    description: 'Acuerdo de servicios de mantenimiento preventivo y correctivo',
    authority: 'Alimentos del Valle C.A.',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // CL-005: Caribbean Foods Export Corp. (International Customer)
  {
    id: 'AFF-079',
    assetId: 'CL-005',
    name: 'Aprobación de Exportación',
    type: 'Aprobación',
    category: 'Comercial',
    description: 'Autorización para exportación de productos alimenticios al Caribe',
    authority: 'SENIAT / Aduana Nacional',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },
  {
    id: 'AFF-080',
    assetId: 'CL-005',
    name: 'Evaluación Crediticia de Cliente',
    type: 'Evaluación',
    category: 'Comercial',
    description: 'Análisis de crédito y aprobación de línea comercial',
    authority: 'Alimentos del Valle C.A.',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'low'
  },

  // EQ-006: Detector de Metales Safeline MD-5000 (Metal Detector)
  {
    id: 'AFF-081',
    assetId: 'EQ-006',
    name: 'Certificado de Calibración de Detector',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Calibración y validación de detector de metales para control de calidad',
    authority: 'Mettler Toledo Autorizado',
    renewalFrequency: 'Semestral',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-082',
    assetId: 'EQ-006',
    name: 'Inspección de Seguridad Eléctrica',
    type: 'Inspección',
    category: 'Seguridad',
    description: 'Inspección técnica de seguridad eléctrica del equipo',
    authority: 'Ingeniería de Mantenimiento',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },

  // EQ-007: Balanza Verificadora Mettler Toledo (Checkweigher)
  {
    id: 'AFF-083',
    assetId: 'EQ-007',
    name: 'Certificado de Calibración Metrológica',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Calibración de precisión y exactitud de balanza industrial',
    authority: 'Laboratorio Acreditado ISO 17025',
    renewalFrequency: 'Trimestral',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-084',
    assetId: 'EQ-007',
    name: 'Verificación Metrológica Oficial',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Verificación oficial de instrumento de pesaje comercial',
    authority: 'SENCAMER',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },

  // EQ-008: Cámara Fría Materias Primas 50m³ (Cold Storage Chamber)
  {
    id: 'AFF-085',
    assetId: 'EQ-008',
    name: 'Certificado de Calibración de Temperatura',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Calibración de sensores de temperatura y validación térmica',
    authority: 'Laboratorio Acreditado ISO 17025',
    renewalFrequency: 'Semestral',
    lifecycleStatus: 'active',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-086',
    assetId: 'EQ-008',
    name: 'Inspección de Seguridad de Cámara Fría',
    type: 'Inspección',
    category: 'Seguridad',
    description: 'Inspección de sistema de refrigeración y seguridad eléctrica',
    authority: 'INPSASEL',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'high'
  },

  // ES-005: Almacén de Materias Primas (Raw Materials Warehouse)
  {
    id: 'AFF-087',
    assetId: 'ES-005',
    name: 'Licencia Sanitaria de Almacén',
    type: 'Licencia',
    category: 'Sanitaria',
    description: 'Licencia sanitaria para almacenamiento de materias primas alimentarias',
    authority: 'INSAI',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },
  {
    id: 'AFF-088',
    assetId: 'ES-005',
    name: 'Permiso del Cuerpo de Bomberos',
    type: 'Permiso',
    category: 'Seguridad',
    description: 'Inspección y permiso de prevención de incendios del almacén',
    authority: 'Cuerpo de Bomberos',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'active',
    priorityLevel: 'critical'
  },

  // ES-006: Laboratorio de Control de Calidad (Quality Control Lab)
  {
    id: 'AFF-089',
    assetId: 'ES-006',
    name: 'Acreditación ISO 17025',
    type: 'Certificado',
    category: 'Calidad',
    description: 'Acreditación de laboratorio de ensayo para análisis de alimentos',
    authority: 'ONA (Organismo Nacional de Acreditación)',
    renewalFrequency: 'Trienal',
    lifecycleStatus: 'archived',
    priorityLevel: 'medium'
  },
  {
    id: 'AFF-090',
    assetId: 'ES-006',
    name: 'Permiso del Cuerpo de Bomberos',
    type: 'Permiso',
    category: 'Seguridad',
    description: 'Inspección y permiso de prevención de incendios del laboratorio',
    authority: 'Cuerpo de Bomberos',
    renewalFrequency: 'Anual',
    lifecycleStatus: 'archived',
    priorityLevel: 'critical'
  },
];

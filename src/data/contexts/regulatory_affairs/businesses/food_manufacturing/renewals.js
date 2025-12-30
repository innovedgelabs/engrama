const rawRenewals = [
  // AFF-001: RNC - 2 renewals
  {
    id: 'REN-001',
    affairId: 'AFF-001',
    name: 'Renovación 2024',
    type: 'Renovación',
    submissionDate: '2024-01-15',
    approvalDate: '2024-01-20',
    expiryDate: '2027-06-16',
    reminderDays: 180,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Renovación aprobada sin observaciones',
    primaryAttachmentId: 'DOC-001'
  },
  {
    id: 'REN-002',
    affairId: 'AFF-001',
    name: 'Renovación 2023',
    type: 'Renovación',
    submissionDate: '2023-01-10',
    approvalDate: '2023-01-18',
    expiryDate: '2024-01-18',
    reminderDays: 180,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Renovación completada',
    primaryAttachmentId: 'DOC-002'
  },
  
  // AFF-002: Health License - 3 renewals
  {
    id: 'REN-003',
    affairId: 'AFF-002',
    name: 'Renovación 2024',
    type: 'Renovación',
    submissionDate: '2024-03-01',
    approvalDate: '2024-03-10',
    expiryDate: '2027-03-20',
    reminderDays: 90,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Inspección completada el 28/02/2024',
    primaryAttachmentId: 'DOC-004'
  },
  {
    id: 'REN-004',
    affairId: 'AFF-002',
    name: 'Renovación 2023',
    type: 'Renovación',
    submissionDate: '2023-03-05',
    approvalDate: '2023-03-15',
    expiryDate: '2024-03-15',
    reminderDays: 90,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Renovación completada',
    primaryAttachmentId: 'DOC-005'
  },
  {
    id: 'REN-005',
    affairId: 'AFF-002',
    name: 'Modificación de Equipos',
    type: 'Modificación',
    submissionDate: '2023-08-20',
    approvalDate: '2023-08-25',
    expiryDate: null,
    reminderDays: 0,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Actualización por cambio de equipos de producción',
    primaryAttachmentId: 'DOC-006'
  },

  // AFF-003: Fire Department Permit - 2 renewals
  {
    id: 'REN-006',
    affairId: 'AFF-003',
    name: 'Renovación 2025',
    type: 'Renovación',
    submissionDate: '2025-01-10',
    approvalDate: null, // WAITING status - submitted but not yet approved
    expiryDate: null,
    reminderDays: 60,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Documentos enviados a Bomberos, esperando aprobación',
    primaryAttachmentId: 'DOC-008'
  },
  {
    id: 'REN-007',
    affairId: 'AFF-003',
    name: 'Inspección 2022',
    type: 'Renovación',
    submissionDate: '2022-12-10',
    approvalDate: '2022-12-18',
    expiryDate: '2023-12-31',
    reminderDays: 60,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Inspección aprobada',
    primaryAttachmentId: 'DOC-009'
  },

  // AFF-004: Insurance Policy - 1 renewal
  {
    id: 'REN-008',
    affairId: 'AFF-004',
    name: 'Póliza 2024-2025',
    type: 'Renovación',
    submissionDate: '2024-09-01',
    approvalDate: '2024-09-05',
    expiryDate: '2027-11-15',
    reminderDays: 30,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Cobertura: $500,000 USD vigente',
    primaryAttachmentId: 'DOC-010'
  },

  // AFF-005: ISO 9001 - 1 renewal
  {
    id: 'REN-009',
    affairId: 'AFF-005',
    name: 'Certificación 2020',
    type: 'Certificación Inicial',
    submissionDate: '2020-08-15',
    approvalDate: '2020-08-30',
    expiryDate: '2023-08-30',
    reminderDays: 365,
    isPendingSubmission: true, // PENDING_SUBMISSION status - preparing documents for renewal
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Vencida - preparando documentos para auditoría de renovación',
    primaryAttachmentId: 'DOC-011'
  },

  // AFF-006: Municipal License - 2 renewals
  {
    id: 'REN-010',
    affairId: 'AFF-006',
    name: 'Licencia 2023',
    type: 'Renovación',
    submissionDate: '2023-12-20',
    approvalDate: '2023-12-28',
    expiryDate: '2024-12-31',
    reminderDays: 45,
    isPendingSubmission: true, // PENDING_SUBMISSION status - working on renewal documents
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'En proceso de renovación para 2025 - recopilando documentos',
    primaryAttachmentId: 'DOC-012'
  },
  {
    id: 'REN-011',
    affairId: 'AFF-006',
    name: 'Licencia 2022',
    type: 'Renovación',
    submissionDate: '2022-12-15',
    approvalDate: '2022-12-22',
    expiryDate: '2023-12-31',
    reminderDays: 45,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Renovación completada',
    primaryAttachmentId: 'DOC-014'
  },

  // AFF-007: Environmental Plan - 1 renewal
  {
    id: 'REN-012',
    affairId: 'AFF-007',
    name: 'Plan 2024-2026',
    type: 'Actualización',
    submissionDate: '2024-07-15',
    approvalDate: '2024-07-25',
    expiryDate: '2027-07-30',
    reminderDays: 180,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Aprobado por MinAmbiente sin observaciones',
    primaryAttachmentId: 'DOC-013'
  },

  // AFF-008: GMP - 1 renewal
  {
    id: 'REN-013',
    affairId: 'AFF-008',
    name: 'Auditoría 2024',
    type: 'Renovación',
    submissionDate: '2024-11-01',
    approvalDate: '2024-11-10',
    expiryDate: '2027-11-30',
    reminderDays: 60,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Auditoría aprobada con 2 observaciones menores',
    primaryAttachmentId: 'DOC-021'
  },

  // ========== PHASE 1: TIER 1 ENTITIES ==========

  // PR-001: Molinos de Venezuela S.A. (Key Supplier)
  // AFF-009: Evaluación y Calificación de Proveedor - 1 renewal
  {
    id: 'REN-014',
    affairId: 'AFF-009',
    name: 'Evaluación 2025',
    type: 'Renovación',
    submissionDate: '2025-03-15',
    approvalDate: '2025-03-25',
    expiryDate: '2027-03-31',
    reminderDays: 30,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Auditoría de calidad aprobada - proveedor cumple estándares',
    primaryAttachmentId: 'DOC-015'
  },

  // AFF-010: Certificado de Buenas Prácticas de Manufactura - 1 renewal
  {
    id: 'REN-015',
    affairId: 'AFF-010',
    name: 'Certificación 2024',
    type: 'Renovación',
    submissionDate: '2024-06-10',
    approvalDate: '2024-06-20',
    expiryDate: '2027-06-30',
    reminderDays: 90,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Certificado BPM vigente del proveedor',
    primaryAttachmentId: 'DOC-016'
  },

  // PD-001: Galletas María Valle 400g (Flagship Product)
  // AFF-011: Registro Sanitario de Producto - 2 renewals
  {
    id: 'REN-016',
    affairId: 'AFF-011',
    name: 'Registro Sanitario 2022',
    type: 'Renovación',
    submissionDate: '2022-01-15',
    approvalDate: '2022-02-10',
    expiryDate: '2027-02-28',
    reminderDays: 180,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Registro sanitario quinquenal vigente',
    primaryAttachmentId: 'DOC-017'
  },
  {
    id: 'REN-017',
    affairId: 'AFF-011',
    name: 'Registro Sanitario 2017',
    type: 'Renovación',
    submissionDate: '2017-02-01',
    approvalDate: '2017-02-28',
    expiryDate: '2022-02-28',
    reminderDays: 180,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Registro anterior - renovado en 2022',
    primaryAttachmentId: 'DOC-018'
  },

  // AFF-012: Análisis de Laboratorio - 2 renewals
  {
    id: 'REN-018',
    affairId: 'AFF-012',
    name: 'Análisis Semestral 2T-2026',
    type: 'Renovación',
    submissionDate: '2025-06-01',
    approvalDate: '2025-06-10',
    expiryDate: '2027-12-15',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Análisis microbiológico y fisicoquímico vigente',
    primaryAttachmentId: 'DOC-019'
  },
  {
    id: 'REN-019',
    affairId: 'AFF-012',
    name: 'Análisis Semestral 1T-2026',
    type: 'Renovación',
    submissionDate: '2024-12-01',
    approvalDate: '2024-12-10',
    expiryDate: '2025-06-15',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Análisis anterior - resultados conformes',
    primaryAttachmentId: 'DOC-020'
  },

  // AFF-013: Certificado de Libre Venta - 1 renewal
  {
    id: 'REN-020',
    affairId: 'AFF-013',
    name: 'Certificado 2024',
    type: 'Renovación',
    submissionDate: '2024-05-10',
    approvalDate: '2024-05-20',
    expiryDate: '2027-05-31',
    reminderDays: 90,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Certificado para exportación - vigente',
    primaryAttachmentId: 'DOC-022'
  },

  // PE-001: Ana María Sánchez (Plant Manager)
  // AFF-014: Certificado de Salud Ocupacional - 1 renewal
  {
    id: 'REN-021',
    affairId: 'AFF-014',
    name: 'Examen Médico 2025',
    type: 'Renovación',
    submissionDate: '2025-08-01',
    approvalDate: '2025-08-05',
    expiryDate: '2027-08-31',
    reminderDays: 30,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Examen médico ocupacional - apto para funciones',
    primaryAttachmentId: 'DOC-023'
  },

  // AFF-015: Certificado de Manipulación de Alimentos - 1 renewal
  {
    id: 'REN-022',
    affairId: 'AFF-015',
    name: 'Certificado 2025',
    type: 'Renovación',
    submissionDate: '2025-11-10',
    approvalDate: '2025-11-15',
    expiryDate: '2026-01-30',
    reminderDays: 35,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Certificado de manipulador de alimentos - próximo a vencer',
    primaryAttachmentId: 'DOC-024'
  },

  // AFF-016: Curso de Buenas Prácticas - 1 renewal
  {
    id: 'REN-023',
    affairId: 'AFF-016',
    name: 'Curso BPM 2024',
    type: 'Certificación',
    submissionDate: '2024-03-15',
    approvalDate: '2024-03-20',
    expiryDate: '2027-03-31',
    reminderDays: 90,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Curso trienal de buenas prácticas - vigente',
    primaryAttachmentId: 'DOC-025'
  },

  // VH-001: Camión Termo Valle-01 (Refrigerated Truck)
  // AFF-017: Inspección Técnica Vehicular - 2 renewals
  {
    id: 'REN-024',
    affairId: 'AFF-017',
    name: 'Inspección 2025',
    type: 'Renovación',
    submissionDate: '2025-09-20',
    approvalDate: null, // WAITING - submitted but not approved
    expiryDate: null,
    reminderDays: 30,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Inspección técnica enviada - esperando certificado del INTT',
    primaryAttachmentId: 'DOC-026'
  },
  {
    id: 'REN-025',
    affairId: 'AFF-017',
    name: 'Inspección 2024',
    type: 'Renovación',
    submissionDate: '2024-09-15',
    approvalDate: '2024-09-20',
    expiryDate: '2025-09-30',
    reminderDays: 30,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Inspección anterior - aprobada',
    primaryAttachmentId: 'DOC-027'
  },

  // AFF-018: Póliza de Seguro de Vehículo - 1 renewal
  {
    id: 'REN-026',
    affairId: 'AFF-018',
    name: 'Póliza 2025-2026',
    type: 'Renovación',
    submissionDate: '2025-07-01',
    approvalDate: '2025-07-05',
    expiryDate: '2027-07-31',
    reminderDays: 30,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Seguro de responsabilidad civil y daños - cobertura $300K USD',
    primaryAttachmentId: 'DOC-028'
  },

  // AFF-019: Permiso de Transporte de Alimentos - 1 renewal
  {
    id: 'REN-027',
    affairId: 'AFF-019',
    name: 'Permiso 2024',
    type: 'Renovación',
    submissionDate: null,
    approvalDate: null,
    expiryDate: '2025-12-31',
    reminderDays: 45,
    isPendingSubmission: true, // PENDING_SUBMISSION - expired, preparing renewal
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Vencido - recopilando documentos para renovación 2025',
    primaryAttachmentId: 'DOC-029'
  },

  // AFF-020: Calibración de Equipo de Refrigeración - 2 renewals
  {
    id: 'REN-028',
    affairId: 'AFF-020',
    name: 'Calibración 2S-2026',
    type: 'Renovación',
    submissionDate: '2025-07-15',
    approvalDate: '2025-07-20',
    expiryDate: '2027-07-31',
    reminderDays: 30,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Calibración semestral - sistema operando correctamente',
    primaryAttachmentId: 'DOC-030'
  },
  {
    id: 'REN-029',
    affairId: 'AFF-020',
    name: 'Calibración 1S-2026',
    type: 'Renovación',
    submissionDate: '2025-01-15',
    approvalDate: '2025-01-20',
    expiryDate: '2025-07-31',
    reminderDays: 30,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Calibración anterior - conforme',
    primaryAttachmentId: 'DOC-031'
  },

  // ES-001: Planta de Producción Los Ruices (Main Production Facility)
  // AFF-021: Permiso Sanitario de Funcionamiento - 2 renewals
  {
    id: 'REN-030',
    affairId: 'AFF-021',
    name: 'Permiso Sanitario 2025',
    type: 'Renovación',
    submissionDate: '2025-12-15',
    approvalDate: '2025-12-28',
    expiryDate: '2026-02-15',
    reminderDays: 50,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Permiso sanitario próximo a vencer',
    primaryAttachmentId: 'DOC-032'
  },
  {
    id: 'REN-031',
    affairId: 'AFF-021',
    name: 'Permiso Sanitario 2024',
    type: 'Renovación',
    submissionDate: '2024-02-10',
    approvalDate: '2024-02-25',
    expiryDate: '2025-02-28',
    reminderDays: 60,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Permiso anterior - renovado',
    primaryAttachmentId: 'DOC-033'
  },

  // AFF-022: Permiso del Cuerpo de Bomberos - 1 renewal
  {
    id: 'REN-032',
    affairId: 'AFF-022',
    name: 'Inspección Bomberos 2025',
    type: 'Renovación',
    submissionDate: '2025-06-10',
    approvalDate: '2025-06-20',
    expiryDate: '2027-06-30',
    reminderDays: 45,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Inspección de bomberos - aprobada sin observaciones',
    primaryAttachmentId: 'DOC-034'
  },

  // AFF-023: Permiso de la Alcaldía - 1 renewal
  {
    id: 'REN-033',
    affairId: 'AFF-023',
    name: 'Licencia Municipal 2025',
    type: 'Renovación',
    submissionDate: '2025-12-10',
    approvalDate: '2025-12-20',
    expiryDate: '2026-02-28',
    reminderDays: 60,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Licencia de funcionamiento municipal - próxima a vencer',
    primaryAttachmentId: 'DOC-035'
  },

  // AFF-024: Control de Plagas - 3 renewals (trimestral)
  {
    id: 'REN-034',
    affairId: 'AFF-024',
    name: 'Fumigación 3T-2026',
    type: 'Renovación',
    submissionDate: '2025-09-01',
    approvalDate: '2025-09-05',
    expiryDate: '2027-12-31',
    reminderDays: 15,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Control de plagas trimestral - sin evidencia de infestación',
    primaryAttachmentId: 'DOC-036'
  },
  {
    id: 'REN-035',
    affairId: 'AFF-024',
    name: 'Fumigación 2T-2026',
    type: 'Renovación',
    submissionDate: '2025-06-01',
    approvalDate: '2025-06-05',
    expiryDate: '2025-09-30',
    reminderDays: 15,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Control trimestral anterior - conforme',
    primaryAttachmentId: 'DOC-037'
  },
  {
    id: 'REN-036',
    affairId: 'AFF-024',
    name: 'Fumigación 1T-2026',
    type: 'Renovación',
    submissionDate: '2025-03-01',
    approvalDate: '2025-03-05',
    expiryDate: '2025-06-30',
    reminderDays: 15,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Control trimestral anterior - conforme',
    primaryAttachmentId: 'DOC-038'
  },

  // AFF-025: Certificado de Potabilidad de Agua - 2 renewals
  {
    id: 'REN-037',
    affairId: 'AFF-025',
    name: 'Análisis de Agua 2S-2026',
    type: 'Renovación',
    submissionDate: '2025-08-01',
    approvalDate: '2025-08-10',
    expiryDate: '2027-08-28',
    reminderDays: 120,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Análisis de agua potable - parámetros conformes',
    primaryAttachmentId: 'DOC-039'
  },
  {
    id: 'REN-038',
    affairId: 'AFF-025',
    name: 'Análisis de Agua 1S-2026',
    type: 'Renovación',
    submissionDate: '2025-02-01',
    approvalDate: '2025-02-10',
    expiryDate: '2025-08-31',
    reminderDays: 120,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Análisis anterior - conforme',
    primaryAttachmentId: 'DOC-040'
  },

  // EQ-001: Horno Rotatorio Werner Pfleiderer (Critical Oven Equipment)
  // AFF-026: Certificado de Calibración de Temperatura - 1 renewal
  {
    id: 'REN-039',
    affairId: 'AFF-026',
    name: 'Calibración 2S-2026',
    type: 'Renovación',
    submissionDate: '2025-08-15',
    approvalDate: '2025-08-20',
    expiryDate: '2027-08-28',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Calibración de sensores de temperatura - precisión validada',
    primaryAttachmentId: 'DOC-041'
  },

  // AFF-027: Certificado de Mantenimiento Preventivo - 1 renewal
  {
    id: 'REN-040',
    affairId: 'AFF-027',
    name: 'Mantenimiento Anual 2025',
    type: 'Renovación',
    submissionDate: '2025-10-01',
    approvalDate: null, // WAITING - maintenance completed, awaiting certification
    expiryDate: null,
    reminderDays: 45,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Mantenimiento preventivo completado - esperando certificado del proveedor',
    primaryAttachmentId: 'DOC-042'
  },

  // ========== PHASE 2: TIER 2 ENTITIES ==========

  // EM-002: Importadora Valle Import C.A. (Importer Subsidiary)
  // AFF-028: Licencia de Importación - 2 renewals
  {
    id: 'REN-041',
    affairId: 'AFF-028',
    name: 'Licencia 2025',
    type: 'Renovación',
    submissionDate: '2025-12-15',
    approvalDate: '2025-12-25',
    expiryDate: '2026-02-05',
    reminderDays: 40,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Licencia de importación próxima a vencer',
    primaryAttachmentId: 'DOC-043'
  },
  {
    id: 'REN-042',
    affairId: 'AFF-028',
    name: 'Licencia 2024',
    type: 'Renovación',
    submissionDate: '2024-01-10',
    approvalDate: '2024-01-20',
    expiryDate: '2025-01-31',
    reminderDays: 60,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Licencia anterior - renovada',
    primaryAttachmentId: 'DOC-044'
  },

  // AFF-029: Registro RIF Importadora - 1 renewal
  {
    id: 'REN-043',
    affairId: 'AFF-029',
    name: 'Actualización RIF 2023',
    type: 'Actualización',
    submissionDate: '2023-06-01',
    approvalDate: '2023-06-10',
    expiryDate: '2027-12-31',
    reminderDays: 180,
    responsiblePerson: 'Fernando Yanez',
    notes: 'RIF actualizado con actividades de importación',
    primaryAttachmentId: 'DOC-045'
  },

  // AFF-030: Registro Mercantil Importadora - 1 renewal
  {
    id: 'REN-044',
    affairId: 'AFF-030',
    name: 'Actualización 2020',
    type: 'Actualización',
    submissionDate: '2020-03-01',
    approvalDate: '2020-03-15',
    expiryDate: null, // Permanente
    reminderDays: 0,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Última actualización de registro mercantil - vigente',
    primaryAttachmentId: 'DOC-046'
  },

  // PR-004: Químicos Industriales Miranda (Chemical Supplier)
  // AFF-031: Evaluación de Proveedor de Químicos - 1 renewal
  {
    id: 'REN-045',
    affairId: 'AFF-031',
    name: 'Auditoría 2024',
    type: 'Renovación',
    submissionDate: '2024-09-10',
    approvalDate: '2024-09-20',
    expiryDate: '2027-09-30',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Evaluación de proveedor de químicos - aprobado',
    primaryAttachmentId: null
  },

  // AFF-032: Hojas de Datos de Seguridad (MSDS) - 1 renewal
  {
    id: 'REN-046',
    affairId: 'AFF-032',
    name: 'MSDS Actualización 2024',
    type: 'Actualización',
    submissionDate: '2024-08-01',
    approvalDate: '2024-08-05',
    expiryDate: '2026-08-31',
    reminderDays: 90,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Fichas MSDS actualizadas para todos los productos químicos',
    primaryAttachmentId: null
  },

  // PD-003: Pan de Sandwich Valle 500g (Refrigerated Product)
  // AFF-033: Registro Sanitario de Producto Refrigerado - 1 renewal
  {
    id: 'REN-047',
    affairId: 'AFF-033',
    name: 'Registro Sanitario 2021',
    type: 'Renovación',
    submissionDate: '2021-11-01',
    approvalDate: '2021-11-20',
    expiryDate: '2026-11-30', // WARNING - within 60-day window
    reminderDays: 60,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Registro sanitario quinquenal - próximo a vencer',
    primaryAttachmentId: null
  },

  // AFF-034: Estudio de Vida Útil - 1 renewal
  {
    id: 'REN-048',
    affairId: 'AFF-034',
    name: 'Estudio 2023',
    type: 'Renovación',
    submissionDate: '2023-07-01',
    approvalDate: '2023-07-15',
    expiryDate: '2026-07-31',
    reminderDays: 90,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Estudio de vida útil - 10 días refrigerado',
    primaryAttachmentId: null
  },

  // VH-002: Camión Reparto Valle-02 (Delivery Truck)
  // AFF-035: Inspección Técnica Vehicular - 2 renewals
  {
    id: 'REN-049',
    affairId: 'AFF-035',
    name: 'Inspección 2025',
    type: 'Renovación',
    submissionDate: '2025-08-15',
    approvalDate: '2025-08-20',
    expiryDate: '2026-08-31',
    reminderDays: 30,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Inspección técnica vigente - aprobada',
    primaryAttachmentId: null
  },
  {
    id: 'REN-050',
    affairId: 'AFF-035',
    name: 'Inspección 2024',
    type: 'Renovación',
    submissionDate: '2024-08-10',
    approvalDate: '2024-08-15',
    expiryDate: '2025-08-31',
    reminderDays: 30,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Inspección anterior - aprobada',
    primaryAttachmentId: null
  },

  // AFF-036: Permiso de Transporte Público - 1 renewal
  {
    id: 'REN-051',
    affairId: 'AFF-036',
    name: 'Permiso 2025',
    type: 'Renovación',
    submissionDate: null,
    approvalDate: null,
    expiryDate: '2026-12-31',
    reminderDays: 60,
    isPendingSubmission: true, // PENDING_SUBMISSION - need to prepare renewal docs
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Permiso vigente - preparando documentos para siguiente renovación',
    primaryAttachmentId: null
  },

  // AFF-037: Póliza de Seguro de Vehículo - 1 renewal
  {
    id: 'REN-052',
    affairId: 'AFF-037',
    name: 'Póliza 2025-2026',
    type: 'Renovación',
    submissionDate: '2025-05-01',
    approvalDate: '2025-05-05',
    expiryDate: '2026-05-31',
    reminderDays: 30,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Seguro vigente - cobertura $150K USD',
    primaryAttachmentId: null
  },

  // ES-002: Centro de Distribución Guatire (Distribution Center)
  // AFF-038: Licencia Sanitaria de Almacén - 2 renewals
  {
    id: 'REN-053',
    affairId: 'AFF-038',
    name: 'Licencia 2025',
    type: 'Renovación',
    submissionDate: '2025-04-01',
    approvalDate: '2025-04-15',
    expiryDate: '2026-04-30',
    reminderDays: 60,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Licencia sanitaria de almacén vigente',
    primaryAttachmentId: null
  },
  {
    id: 'REN-054',
    affairId: 'AFF-038',
    name: 'Licencia 2024',
    type: 'Renovación',
    submissionDate: '2024-04-01',
    approvalDate: '2024-04-12',
    expiryDate: '2025-04-30',
    reminderDays: 60,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Licencia anterior - renovada',
    primaryAttachmentId: null
  },

  // AFF-039: Permiso del Cuerpo de Bomberos - 1 renewal
  {
    id: 'REN-055',
    affairId: 'AFF-039',
    name: 'Inspección Bomberos 2024',
    type: 'Renovación',
    submissionDate: '2024-11-01',
    approvalDate: null, // WAITING - submitted, awaiting approval
    expiryDate: null,
    reminderDays: 45,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Inspección realizada - esperando certificado de bomberos',
    primaryAttachmentId: null
  },

  // AFF-040: Certificado de Fumigación y Control de Plagas - 3 renewals (trimestral)
  {
    id: 'REN-056',
    affairId: 'AFF-040',
    name: 'Fumigación 3T-2026',
    type: 'Renovación',
    submissionDate: '2026-09-05',
    approvalDate: '2026-09-10',
    expiryDate: '2026-12-31',
    reminderDays: 15,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Control de plagas del centro de distribución - conforme',
    primaryAttachmentId: null
  },
  {
    id: 'REN-057',
    affairId: 'AFF-040',
    name: 'Fumigación 2T-2026',
    type: 'Renovación',
    submissionDate: '2026-06-05',
    approvalDate: '2026-06-10',
    expiryDate: '2026-09-30',
    reminderDays: 15,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Control trimestral anterior - conforme',
    primaryAttachmentId: null
  },
  {
    id: 'REN-058',
    affairId: 'AFF-040',
    name: 'Fumigación 1T-2026',
    type: 'Renovación',
    submissionDate: '2026-03-05',
    approvalDate: '2026-03-10',
    expiryDate: '2026-06-30',
    reminderDays: 15,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Control trimestral anterior - conforme',
    primaryAttachmentId: null
  },

  // ========== ADDITIONAL ASSETS - COMPLETE COVERAGE ==========

  // EM-003: Logística Valle Trans C.A.
  // AFF-041: Registro RIF Empresa de Transporte - 1 renewal
  {
    id: 'REN-059',
    affairId: 'AFF-041',
    name: 'Actualización RIF 2024',
    type: 'Actualización',
    submissionDate: '2024-03-01',
    approvalDate: '2024-03-10',
    expiryDate: '2027-03-31',
    reminderDays: 180,
    responsiblePerson: 'Fernando Yanez',
    notes: 'RIF de empresa de transporte actualizado',
    primaryAttachmentId: null
  },

  // PR-002: Azucarera del Centro C.A.
  // AFF-042: Evaluación de Proveedor de Azúcar - 1 renewal
  {
    id: 'REN-060',
    affairId: 'AFF-042',
    name: 'Evaluación 2025',
    type: 'Renovación',
    submissionDate: '2025-06-01',
    approvalDate: '2025-06-10',
    expiryDate: '2026-06-30',
    reminderDays: 30,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Proveedor de azúcar aprobado - cumple estándares de calidad',
    primaryAttachmentId: null
  },

  // PR-003: Empaques Flexibles del Caribe
  // AFF-043: Evaluación de Proveedor de Empaques - 1 renewal
  {
    id: 'REN-061',
    affairId: 'AFF-043',
    name: 'Evaluación 2025',
    type: 'Renovación',
    submissionDate: '2025-07-10',
    approvalDate: '2025-07-20',
    expiryDate: '2026-07-31',
    reminderDays: 30,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Proveedor de empaques calificado - materiales conformes',
    primaryAttachmentId: null
  },

  // PR-005: Control de Plagas Seguridad Total
  // AFF-044: Certificación de Empresa de Control de Plagas - 1 renewal
  {
    id: 'REN-062',
    affairId: 'AFF-044',
    name: 'Certificación 2025',
    type: 'Renovación',
    submissionDate: '2025-02-01',
    approvalDate: '2025-02-15',
    expiryDate: '2026-02-28',
    reminderDays: 60,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Empresa certificada por INSAI para control de plagas',
    primaryAttachmentId: null
  },

  // PD-002: Harina de Trigo Valle 1Kg
  // AFF-045: Registro Sanitario de Producto - 1 renewal
  {
    id: 'REN-063',
    affairId: 'AFF-045',
    name: 'Registro Sanitario 2022',
    type: 'Renovación',
    submissionDate: '2022-04-01',
    approvalDate: '2022-04-20',
    expiryDate: '2027-04-30',
    reminderDays: 180,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Registro quinquenal de harina de trigo enriquecida',
    primaryAttachmentId: null
  },

  // PD-004: Galletas Saladas Soda 300g
  // AFF-046: Registro Sanitario de Producto - 1 renewal
  {
    id: 'REN-064',
    affairId: 'AFF-046',
    name: 'Registro Sanitario 2023',
    type: 'Renovación',
    submissionDate: '2023-05-01',
    approvalDate: '2023-05-15',
    expiryDate: '2028-05-31',
    reminderDays: 180,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Registro quinquenal vigente - galletas saladas',
    primaryAttachmentId: null
  },

  // PD-005: Bizcocho Vainilla Valle 350g
  // AFF-047: Registro Sanitario de Producto - 1 renewal
  {
    id: 'REN-065',
    affairId: 'AFF-047',
    name: 'Registro Sanitario 2021',
    type: 'Renovación',
    submissionDate: '2021-08-01',
    approvalDate: '2021-08-20',
    expiryDate: '2026-08-31',
    reminderDays: 180,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Registro quinquenal - bizcocho de vainilla',
    primaryAttachmentId: null
  },

  // PD-006: Galletas Avena y Miel 250g
  // AFF-048: Registro Sanitario de Producto - 1 renewal
  {
    id: 'REN-066',
    affairId: 'AFF-048',
    name: 'Registro Sanitario 2024',
    type: 'Renovación',
    submissionDate: '2024-02-01',
    approvalDate: '2024-02-15',
    expiryDate: '2029-02-28',
    reminderDays: 180,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Registro quinquenal - galletas de avena y miel',
    primaryAttachmentId: null
  },

  // PD-007: Pan Hamburguesa Valle 6und
  // AFF-049: Registro Sanitario de Producto - 1 renewal
  {
    id: 'REN-067',
    affairId: 'AFF-049',
    name: 'Registro Sanitario 2023',
    type: 'Renovación',
    submissionDate: '2023-09-01',
    approvalDate: '2023-09-15',
    expiryDate: '2028-09-30',
    reminderDays: 180,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Registro quinquenal - pan de hamburguesa',
    primaryAttachmentId: null
  },

  // PD-008: Tostadas Integrales 200g
  // AFF-050: Registro Sanitario de Producto - 1 renewal
  {
    id: 'REN-068',
    affairId: 'AFF-050',
    name: 'Registro Sanitario 2022',
    type: 'Renovación',
    submissionDate: '2022-10-01',
    approvalDate: '2022-10-15',
    expiryDate: '2027-10-31',
    reminderDays: 180,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Registro quinquenal - tostadas integrales',
    primaryAttachmentId: null
  },

  // PE-002: Carlos Eduardo Pérez
  // AFF-051: Certificado de Salud Ocupacional - 1 renewal
  {
    id: 'REN-069',
    affairId: 'AFF-051',
    name: 'Examen Médico 2025',
    type: 'Renovación',
    submissionDate: '2025-05-01',
    approvalDate: '2025-05-05',
    expiryDate: '2026-05-31',
    reminderDays: 30,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Examen médico ocupacional - apto',
    primaryAttachmentId: null
  },

  // PE-003: María José Herrera
  // AFF-052: Certificado de Manipulación de Alimentos - 1 renewal
  {
    id: 'REN-070',
    affairId: 'AFF-052',
    name: 'Certificado 2025',
    type: 'Renovación',
    submissionDate: '2025-04-10',
    approvalDate: '2025-04-15',
    expiryDate: '2026-04-30',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Certificado de manipulador de alimentos vigente',
    primaryAttachmentId: null
  },

  // PE-004: José Luis Ramírez
  // AFF-053: Certificado de Competencia Técnica - 1 renewal
  {
    id: 'REN-071',
    affairId: 'AFF-053',
    name: 'Certificación Técnica 2023',
    type: 'Renovación',
    submissionDate: '2023-11-01',
    approvalDate: '2023-11-15',
    expiryDate: '2026-11-30',
    reminderDays: 90,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Certificación INCES trienal - mantenimiento industrial',
    primaryAttachmentId: null
  },

  // VH-003: Montacarga Toyota FL-45
  // AFF-054: Inspección Técnica de Montacarga - 1 renewal
  {
    id: 'REN-072',
    affairId: 'AFF-054',
    name: 'Inspección 2025',
    type: 'Renovación',
    submissionDate: '2025-06-15',
    approvalDate: '2025-06-20',
    expiryDate: '2026-06-30',
    reminderDays: 30,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Inspección INPSASEL - montacarga aprobado',
    primaryAttachmentId: null
  },

  // ES-003: Oficinas Administrativas Caracas
  // AFF-055: Permiso del Cuerpo de Bomberos - 1 renewal
  {
    id: 'REN-073',
    affairId: 'AFF-055',
    name: 'Inspección Bomberos 2025',
    type: 'Renovación',
    submissionDate: '2025-03-10',
    approvalDate: '2025-03-20',
    expiryDate: '2026-03-31',
    reminderDays: 45,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Permiso de bomberos oficinas - aprobado',
    primaryAttachmentId: null
  },

  // ES-004: Punto de Venta Fábrica
  // AFF-056: Licencia Comercial - 1 renewal
  {
    id: 'REN-074',
    affairId: 'AFF-056',
    name: 'Licencia 2025',
    type: 'Renovación',
    submissionDate: '2025-01-05',
    approvalDate: '2025-01-15',
    expiryDate: '2026-01-31',
    reminderDays: 60,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Licencia municipal punto de venta - vigente',
    primaryAttachmentId: null
  },

  // EQ-002: Amasadora Industrial Diosna
  // AFF-057: Certificado de Calibración - 1 renewal
  {
    id: 'REN-075',
    affairId: 'AFF-057',
    name: 'Calibración 2025',
    type: 'Renovación',
    submissionDate: '2025-05-10',
    approvalDate: '2025-05-15',
    expiryDate: '2026-05-31',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Calibración amasadora - controles operando correctamente',
    primaryAttachmentId: null
  },

  // EQ-003: Empacadora Flow Pack FP-450
  // AFF-058: Certificado de Mantenimiento Preventivo - 1 renewal
  {
    id: 'REN-076',
    affairId: 'AFF-058',
    name: 'Mantenimiento 2025',
    type: 'Renovación',
    submissionDate: '2025-04-01',
    approvalDate: '2025-04-05',
    expiryDate: '2026-04-30',
    reminderDays: 45,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Mantenimiento preventivo empacadora - conforme',
    primaryAttachmentId: null
  },

  // EQ-004: Cámara de Fermentación CF-200
  // AFF-059: Certificado de Calibración de Temperatura y Humedad - 1 renewal
  {
    id: 'REN-077',
    affairId: 'AFF-059',
    name: 'Calibración 2S-2026',
    type: 'Renovación',
    submissionDate: '2026-07-01',
    approvalDate: '2026-07-05',
    expiryDate: '2027-01-31',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Calibración cámara de fermentación - parámetros conformes',
    primaryAttachmentId: null
  },

  // EQ-005: Generador Caterpillar 150KW
  // AFF-060: Certificado de Mantenimiento de Generador - 1 renewal
  {
    id: 'REN-078',
    affairId: 'AFF-060',
    name: 'Mantenimiento 2S-2026',
    type: 'Renovación',
    submissionDate: '2026-08-01',
    approvalDate: '2026-08-05',
    expiryDate: '2027-02-28',
    reminderDays: 60,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Mantenimiento preventivo generador - sistema operativo',
    primaryAttachmentId: null
  },

  // ========== PHASE 3 EXPANSION - NEW AFFAIRS RENEWALS ==========

  // PE-005: Roberto Medina (Sales Manager)
  // AFF-061: Certificado de Salud Ocupacional - 2 renewals
  {
    id: 'REN-079',
    affairId: 'AFF-061',
    name: 'Examen Médico 2025',
    type: 'Renovación',
    submissionDate: '2025-03-01',
    approvalDate: '2025-03-05',
    expiryDate: '2027-03-31',
    reminderDays: 30,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Examen médico ocupacional - apto para trabajo administrativo',
    primaryAttachmentId: 'DOC-101'
  },
  {
    id: 'REN-080',
    affairId: 'AFF-061',
    name: 'Examen Médico 2024',
    type: 'Renovación',
    submissionDate: '2024-03-01',
    approvalDate: '2024-03-05',
    expiryDate: '2025-03-31',
    reminderDays: 30,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Examen anterior - renovado',
    primaryAttachmentId: 'DOC-155'
  },

  // AFF-062: Certificación en Gestión de Ventas - 1 renewal
  {
    id: 'REN-081',
    affairId: 'AFF-062',
    name: 'Certificación INCES 2023',
    type: 'Renovación',
    submissionDate: '2023-06-01',
    approvalDate: '2023-06-15',
    expiryDate: '2027-06-30',
    reminderDays: 90,
    responsiblePerson: 'Roberto Medina',
    notes: 'Certificación en gestión comercial y ventas',
    primaryAttachmentId: 'DOC-103'
  },

  // PE-006: Carmen Lucía Rojas (Accountant)
  // AFF-063: Registro Profesional Colegio de Contadores - 1 renewal
  {
    id: 'REN-082',
    affairId: 'AFF-063',
    name: 'Registro Profesional 2020',
    type: 'Registro',
    submissionDate: '2020-02-01',
    approvalDate: '2020-02-10',
    expiryDate: null, // Permanente
    reminderDays: 0,
    responsiblePerson: 'Carmen Lucía Rojas',
    notes: 'Registro profesional permanente - vigente',
    primaryAttachmentId: 'DOC-104'
  },

  // AFF-064: Certificado de Salud Ocupacional - 1 renewal
  {
    id: 'REN-083',
    affairId: 'AFF-064',
    name: 'Examen Médico 2025',
    type: 'Renovación',
    submissionDate: '2025-04-10',
    approvalDate: '2025-04-15',
    expiryDate: '2027-04-30',
    reminderDays: 30,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Examen médico ocupacional - apto',
    primaryAttachmentId: 'DOC-105'
  },

  // PE-007: Luis Alberto Torres (HSE Officer)
  // AFF-065: Certificación en Seguridad Industrial - 2 renewals
  {
    id: 'REN-084',
    affairId: 'AFF-065',
    name: 'Certificación INPSASEL 2024',
    type: 'Renovación',
    submissionDate: '2024-05-01',
    approvalDate: '2024-05-20',
    expiryDate: '2027-05-31',
    reminderDays: 90,
    responsiblePerson: 'Luis Alberto Torres',
    notes: 'Certificación profesional en seguridad industrial vigente',
    primaryAttachmentId: 'DOC-107'
  },
  {
    id: 'REN-085',
    affairId: 'AFF-065',
    name: 'Certificación INPSASEL 2021',
    type: 'Renovación',
    submissionDate: '2021-05-01',
    approvalDate: '2021-05-15',
    expiryDate: '2024-05-31',
    reminderDays: 90,
    responsiblePerson: 'Luis Alberto Torres',
    notes: 'Certificación anterior - renovada',
    primaryAttachmentId: 'DOC-156'
  },

  // AFF-066: Curso de Primeros Auxilios - 1 renewal
  {
    id: 'REN-086',
    affairId: 'AFF-066',
    name: 'Curso Primeros Auxilios 2024',
    type: 'Renovación',
    submissionDate: '2024-07-01',
    approvalDate: '2024-07-10',
    expiryDate: '2027-07-31',
    reminderDays: 60,
    responsiblePerson: 'Luis Alberto Torres',
    notes: 'Capacitación Cruz Roja - certificado vigente',
    primaryAttachmentId: 'DOC-109'
  },

  // PE-008: Mónica Patricia Vargas (Line Supervisor)
  // AFF-067: Certificado de Salud Ocupacional - 1 renewal (WARNING - expiring soon)
  {
    id: 'REN-087',
    affairId: 'AFF-067',
    name: 'Examen Médico 2026',
    type: 'Renovación',
    submissionDate: '2025-12-15',
    approvalDate: '2025-12-20',
    expiryDate: '2026-01-20',
    reminderDays: 30,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Examen médico próximo a vencer - agendar renovación',
    primaryAttachmentId: 'DOC-110'
  },

  // AFF-068: Certificación en Manipulación de Alimentos - 2 renewals
  {
    id: 'REN-088',
    affairId: 'AFF-068',
    name: 'Curso Manipulación 2025',
    type: 'Renovación',
    submissionDate: '2025-08-10',
    approvalDate: '2025-08-15',
    expiryDate: '2027-08-31',
    reminderDays: 60,
    responsiblePerson: 'Mónica Patricia Vargas',
    notes: 'Certificado INSAI manipulación de alimentos - supervisora',
    primaryAttachmentId: 'DOC-111'
  },
  {
    id: 'REN-089',
    affairId: 'AFF-068',
    name: 'Curso Manipulación 2023',
    type: 'Renovación',
    submissionDate: '2023-08-10',
    approvalDate: '2023-08-15',
    expiryDate: '2025-08-31',
    reminderDays: 60,
    responsiblePerson: 'Mónica Patricia Vargas',
    notes: 'Certificado anterior - renovado',
    primaryAttachmentId: 'DOC-157'
  },

  // PE-009: Jesús David Mendoza (Delivery Driver)
  // AFF-069: Licencia de Conducir Profesional - 1 renewal
  {
    id: 'REN-090',
    affairId: 'AFF-069',
    name: 'Licencia Grado 4 - 2024',
    type: 'Renovación',
    submissionDate: '2024-01-10',
    approvalDate: '2024-01-20',
    expiryDate: '2029-01-31',
    reminderDays: 180,
    responsiblePerson: 'Jesús David Mendoza',
    notes: 'Licencia profesional grado 4 quinquenal vigente',
    primaryAttachmentId: 'DOC-113'
  },

  // AFF-070: Certificado de Salud para Conductor - 2 renewals (WARNING - expiring soon)
  {
    id: 'REN-091',
    affairId: 'AFF-070',
    name: 'Examen Médico Conductor 2026',
    type: 'Renovación',
    submissionDate: '2025-12-20',
    approvalDate: '2025-12-28',
    expiryDate: '2026-01-28',
    reminderDays: 30,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Examen médico conductor - próximo a vencer',
    primaryAttachmentId: 'DOC-115'
  },
  {
    id: 'REN-092',
    affairId: 'AFF-070',
    name: 'Examen Médico Conductor 2025',
    type: 'Renovación',
    submissionDate: '2024-12-20',
    approvalDate: '2024-12-28',
    expiryDate: '2025-12-31',
    reminderDays: 30,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Examen anterior - renovado',
    primaryAttachmentId: 'DOC-158'
  },

  // PR-006: Electricidad Caracas C.A.
  // AFF-071: Contrato de Suministro Eléctrico - 1 renewal
  {
    id: 'REN-093',
    affairId: 'AFF-071',
    name: 'Contrato Eléctrico 2025-2026',
    type: 'Renovación',
    submissionDate: '2025-11-01',
    approvalDate: '2025-11-10',
    expiryDate: '2027-11-30',
    reminderDays: 60,
    responsiblePerson: 'Fernando Yanez',
    notes: 'Contrato de suministro eléctrico vigente',
    primaryAttachmentId: 'DOC-116'
  },

  // AFF-072: Certificado de Conformidad Eléctrica - 1 renewal
  {
    id: 'REN-094',
    affairId: 'AFF-072',
    name: 'Certificación Eléctrica 2024',
    type: 'Renovación',
    submissionDate: '2025-12-01',
    approvalDate: '2025-12-15',
    expiryDate: '2026-01-25',
    reminderDays: 30,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Instalaciones eléctricas - certificación próxima a vencer',
    primaryAttachmentId: 'DOC-117'
  },

  // PR-007: Laboratorios Control Total
  // AFF-073: Acreditación ISO 17025 - 1 renewal
  {
    id: 'REN-095',
    affairId: 'AFF-073',
    name: 'Acreditación ISO 17025 - 2024',
    type: 'Renovación',
    submissionDate: '2024-03-01',
    approvalDate: '2024-03-20',
    expiryDate: '2027-03-31',
    reminderDays: 120,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Laboratorio acreditado por ONA - vigente',
    primaryAttachmentId: 'DOC-118'
  },

  // AFF-074: Contrato de Servicios de Análisis - 2 renewals
  {
    id: 'REN-096',
    affairId: 'AFF-074',
    name: 'Contrato Análisis 2026',
    type: 'Renovación',
    submissionDate: '2025-11-10',
    approvalDate: '2025-11-20',
    expiryDate: '2027-11-30',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Contrato de servicios de laboratorio vigente',
    primaryAttachmentId: 'DOC-119'
  },
  {
    id: 'REN-097',
    affairId: 'AFF-074',
    name: 'Contrato Análisis 2025',
    type: 'Renovación',
    submissionDate: '2024-11-10',
    approvalDate: '2024-11-20',
    expiryDate: '2025-11-30',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Contrato anterior - renovado',
    primaryAttachmentId: 'DOC-120'
  },

  // PR-008: EcoGestión Ambiental C.A.
  // AFF-075: Licencia de Manejo de Desechos - 2 renewals
  {
    id: 'REN-098',
    affairId: 'AFF-075',
    name: 'Licencia Ambiental 2025',
    type: 'Renovación',
    submissionDate: '2025-12-01',
    approvalDate: '2025-12-15',
    expiryDate: '2026-02-10',
    reminderDays: 60,
    responsiblePerson: 'Luis Alberto Torres',
    notes: 'Licencia de manejo de desechos - próxima a vencer',
    primaryAttachmentId: 'DOC-121'
  },
  {
    id: 'REN-099',
    affairId: 'AFF-075',
    name: 'Licencia Ambiental 2024',
    type: 'Renovación',
    submissionDate: '2024-05-01',
    approvalDate: '2024-05-10',
    expiryDate: '2025-05-31',
    reminderDays: 60,
    responsiblePerson: 'Luis Alberto Torres',
    notes: 'Licencia anterior - renovada',
    primaryAttachmentId: 'DOC-122'
  },

  // AFF-076: Certificado de Gestión Ambiental - 1 renewal
  {
    id: 'REN-100',
    affairId: 'AFF-076',
    name: 'Certificación Ambiental 2024',
    type: 'Renovación',
    submissionDate: '2024-08-01',
    approvalDate: '2024-08-20',
    expiryDate: '2027-08-31',
    reminderDays: 90,
    responsiblePerson: 'Luis Alberto Torres',
    notes: 'Certificación en gestión ambiental - conforme',
    primaryAttachmentId: 'DOC-123'
  },

  // PR-009: Mantenimiento Industrial M&M
  // AFF-077: Evaluación de Proveedor de Mantenimiento - 1 renewal
  {
    id: 'REN-101',
    affairId: 'AFF-077',
    name: 'Evaluación Proveedor 2026',
    type: 'Renovación',
    submissionDate: '2025-07-01',
    approvalDate: '2025-07-10',
    expiryDate: '2027-07-31',
    reminderDays: 60,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Proveedor de mantenimiento calificado - aprobado',
    primaryAttachmentId: 'DOC-124'
  },

  // AFF-078: Contrato de Mantenimiento Preventivo - 2 renewals
  {
    id: 'REN-102',
    affairId: 'AFF-078',
    name: 'Contrato Mantenimiento 2026',
    type: 'Renovación',
    submissionDate: '2025-04-01',
    approvalDate: '2025-04-10',
    expiryDate: '2027-04-30',
    reminderDays: 60,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Contrato de mantenimiento preventivo vigente',
    primaryAttachmentId: 'DOC-125'
  },
  {
    id: 'REN-103',
    affairId: 'AFF-078',
    name: 'Contrato Mantenimiento 2025',
    type: 'Renovación',
    submissionDate: '2024-04-01',
    approvalDate: '2024-04-08',
    expiryDate: '2025-04-30',
    reminderDays: 60,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Contrato anterior - renovado',
    primaryAttachmentId: 'DOC-126'
  },

  // CL-005: Caribbean Foods Export Corp.
  // AFF-079: Aprobación de Exportación - 1 renewal
  {
    id: 'REN-104',
    affairId: 'AFF-079',
    name: 'Aprobación Exportación 2026',
    type: 'Renovación',
    submissionDate: '2025-09-01',
    approvalDate: '2025-09-15',
    expiryDate: '2027-09-30',
    reminderDays: 60,
    responsiblePerson: 'Roberto Medina',
    notes: 'Autorización de exportación aprobada',
    primaryAttachmentId: 'DOC-127'
  },

  // AFF-080: Evaluación Crediticia de Cliente - 1 renewal
  {
    id: 'REN-105',
    affairId: 'AFF-080',
    name: 'Evaluación Crédito 2025',
    type: 'Renovación',
    submissionDate: '2025-10-01',
    approvalDate: '2025-10-15',
    expiryDate: '2027-10-31',
    reminderDays: 30,
    responsiblePerson: 'Carmen Lucía Rojas',
    notes: 'Línea de crédito aprobada USD $500K',
    primaryAttachmentId: 'DOC-128'
  },

  // EQ-006: Detector de Metales Safeline MD-5000
  // AFF-081: Certificado de Calibración de Detector - 2 renewals
  {
    id: 'REN-106',
    affairId: 'AFF-081',
    name: 'Calibración 2S-2026',
    type: 'Renovación',
    submissionDate: '2026-07-01',
    approvalDate: null,
    expiryDate: '2027-01-31',
    reminderDays: 60,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Calibración enviada - esperando aprobación del ente regulador',
    primaryAttachmentId: 'DOC-129'
  },
  {
    id: 'REN-107',
    affairId: 'AFF-081',
    name: 'Calibración 1S-2026',
    type: 'Renovación',
    submissionDate: '2025-01-05',
    approvalDate: '2025-01-10',
    expiryDate: '2025-07-31',
    reminderDays: 60,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Calibración anterior - renovada',
    primaryAttachmentId: 'DOC-130'
  },

  // AFF-082: Inspección de Seguridad Eléctrica - 1 renewal
  {
    id: 'REN-108',
    affairId: 'AFF-082',
    name: 'Inspección Seguridad 2025',
    type: 'Renovación',
    submissionDate: '2025-12-01',
    approvalDate: '2025-12-10',
    expiryDate: '2026-01-20',
    reminderDays: 25,
    responsiblePerson: 'Luis Alberto Torres',
    notes: 'Inspección eléctrica detector - próxima a vencer',
    primaryAttachmentId: 'DOC-131'
  },

  // EQ-007: Balanza Verificadora Mettler Toledo
  // AFF-083: Certificado de Calibración Metrológica - 3 renewals (trimestral)
  {
    id: 'REN-109',
    affairId: 'AFF-083',
    name: 'Calibración 3T-2026',
    type: 'Renovación',
    submissionDate: '2025-09-05',
    approvalDate: '2025-09-10',
    expiryDate: '2027-12-31',
    reminderDays: 15,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Calibración trimestral balanza - precisión 0.1g',
    primaryAttachmentId: 'DOC-132'
  },
  {
    id: 'REN-110',
    affairId: 'AFF-083',
    name: 'Calibración 2T-2026',
    type: 'Renovación',
    submissionDate: '2025-06-05',
    approvalDate: '2025-06-10',
    expiryDate: '2025-09-30',
    reminderDays: 15,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Calibración trimestral anterior',
    primaryAttachmentId: 'DOC-133'
  },
  {
    id: 'REN-111',
    affairId: 'AFF-083',
    name: 'Calibración 1T-2026',
    type: 'Renovación',
    submissionDate: '2025-03-05',
    approvalDate: '2025-03-10',
    expiryDate: '2025-06-30',
    reminderDays: 15,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Calibración trimestral anterior',
    primaryAttachmentId: 'DOC-134'
  },

  // AFF-084: Verificación Metrológica Oficial - 1 renewal
  {
    id: 'REN-112',
    affairId: 'AFF-084',
    name: 'Verificación SENCAMER 2025',
    type: 'Renovación',
    submissionDate: '2025-12-01',
    approvalDate: '2025-12-15',
    expiryDate: '2026-01-30',
    reminderDays: 35,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Verificación oficial SENCAMER - próxima a vencer',
    primaryAttachmentId: 'DOC-135'
  },

  // EQ-008: Cámara Fría Materias Primas 50m³
  // AFF-085: Certificado de Calibración de Temperatura - 2 renewals
  {
    id: 'REN-113',
    affairId: 'AFF-085',
    name: 'Calibración 2S-2026',
    type: 'Renovación',
    submissionDate: '2025-08-01',
    approvalDate: '2025-08-10',
    expiryDate: '2027-08-28',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Calibración cámara fría - temperatura 4°C ±1°C',
    primaryAttachmentId: 'DOC-136'
  },
  {
    id: 'REN-114',
    affairId: 'AFF-085',
    name: 'Calibración 1S-2026',
    type: 'Renovación',
    submissionDate: '2025-02-01',
    approvalDate: '2025-02-10',
    expiryDate: '2025-08-31',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Calibración anterior - renovada',
    primaryAttachmentId: 'DOC-137'
  },

  // AFF-086: Inspección de Seguridad de Cámara Fría - 1 renewal
  {
    id: 'REN-115',
    affairId: 'AFF-086',
    name: 'Inspección INPSASEL 2025',
    type: 'Renovación',
    submissionDate: '2025-12-01',
    approvalDate: '2025-12-15',
    expiryDate: '2026-02-15',
    reminderDays: 50,
    responsiblePerson: 'Luis Alberto Torres',
    notes: 'Certificado INPSASEL - próximo a vencer',
    primaryAttachmentId: 'DOC-138'
  },

  // ES-005: Almacén de Materias Primas
  // AFF-087: Licencia Sanitaria de Almacén - 2 renewals
  {
    id: 'REN-116',
    affairId: 'AFF-087',
    name: 'Licencia Sanitaria 2026',
    type: 'Renovación',
    submissionDate: '2025-05-01',
    approvalDate: '2025-05-15',
    expiryDate: '2027-05-31',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Licencia sanitaria almacén de materias primas vigente',
    primaryAttachmentId: 'DOC-139'
  },
  {
    id: 'REN-117',
    affairId: 'AFF-087',
    name: 'Licencia Sanitaria 2025',
    type: 'Renovación',
    submissionDate: '2024-05-01',
    approvalDate: '2024-05-12',
    expiryDate: '2025-05-31',
    reminderDays: 60,
    responsiblePerson: 'Ana María Sánchez',
    notes: 'Licencia anterior - renovada',
    primaryAttachmentId: 'DOC-140'
  },

  // AFF-088: Permiso del Cuerpo de Bomberos - 1 renewal
  {
    id: 'REN-118',
    affairId: 'AFF-088',
    name: 'Inspección Bomberos 2025',
    type: 'Renovación',
    submissionDate: '2025-12-15',
    approvalDate: null,
    expiryDate: '2026-06-30',
    reminderDays: 45,
    responsiblePerson: 'Luis Alberto Torres',
    notes: 'Inspección enviada - esperando aprobación del Cuerpo de Bomberos',
    primaryAttachmentId: 'DOC-141'
  },

  // ES-006: Laboratorio de Control de Calidad
  // AFF-089: Acreditación ISO 17025 - 1 renewal
  {
    id: 'REN-119',
    affairId: 'AFF-089',
    name: 'Acreditación ISO 17025 - 2023',
    type: 'Renovación',
    submissionDate: '2025-11-01',
    approvalDate: '2025-11-20',
    expiryDate: '2026-02-20',
    reminderDays: 90,
    responsiblePerson: 'Carlos Eduardo Pérez',
    notes: 'Acreditación ONA - próxima a vencer, renovación en proceso',
    primaryAttachmentId: 'DOC-142'
  },

  // AFF-090: Permiso del Cuerpo de Bomberos - 2 renewals
  {
    id: 'REN-120',
    affairId: 'AFF-090',
    name: 'Inspección Bomberos 2026',
    type: 'Renovación',
    submissionDate: '2025-03-01',
    approvalDate: '2025-03-15',
    expiryDate: '2027-03-31',
    reminderDays: 45,
    responsiblePerson: 'Luis Alberto Torres',
    notes: 'Permiso de bomberos laboratorio - aprobado',
    primaryAttachmentId: 'DOC-143'
  },
  {
    id: 'REN-121',
    affairId: 'AFF-090',
    name: 'Inspección Bomberos 2025',
    type: 'Renovación',
    submissionDate: '2024-03-01',
    approvalDate: '2024-03-12',
    expiryDate: '2025-03-31',
    reminderDays: 45,
    responsiblePerson: 'Luis Alberto Torres',
    notes: 'Permiso anterior - renovado',
    primaryAttachmentId: 'DOC-144'
  },

  // Additional renewals to reach 45 total (need 2 more)
  // AFF-079: Aprobación de Exportación - add historical renewal
  {
    id: 'REN-122',
    affairId: 'AFF-079',
    name: 'Aprobación Exportación 2025',
    type: 'Renovación',
    submissionDate: '2024-09-01',
    approvalDate: '2024-09-20',
    expiryDate: '2025-09-30',
    reminderDays: 60,
    responsiblePerson: 'Roberto Medina',
    notes: 'Autorización anterior - renovada',
    primaryAttachmentId: 'DOC-145'
  },

  // AFF-081: Certificado de Calibración de Detector - historical renewal (delete this for clean data)
  // Removed REN-123 as REN-106 is already the latest renewal for AFF-081
];

export const mockRenewals = rawRenewals.map(({ status, ...renewal }) => renewal);

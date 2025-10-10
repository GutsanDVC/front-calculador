// Constantes para el módulo de cálculo de bruto
// Valores fijos utilizados en los cálculos y configuraciones

export const BRUTO_CONSTANTS = {
  // Valores por defecto para cálculos
  DEFAULT_UF_VALUE: 25,
  DEFAULT_MINIMUM_WAGE: 500000,
  
  // Límites de validación
  MIN_HOURS_WORKED: 0,
  MAX_HOURS_WORKED: 744, // Máximo horas en un mes (31 días * 24 horas)
  MIN_BONUS_AMOUNT: 0,
  MAX_BONUS_AMOUNT: 10000000, // 10 millones como límite máximo
  
  // Mensajes de error
  ERROR_MESSAGES: {
    COLLABORATOR_REQUIRED: 'Debe seleccionar un colaborador',
    INVALID_HOUR_VALUE: 'El valor de hora extra debe ser mayor a 0',
    INVALID_HOURS_WORKED: 'Las horas trabajadas deben ser mayor a 0',
    INVALID_BONUS_AMOUNT: 'El monto del bono debe ser mayor a 0',
    CALCULATION_ERROR: 'Error al realizar el cálculo',
    INVALID_DESIRED_SALARY: 'El sueldo líquido deseado debe ser mayor a 0',
    INVALID_ISAPRE_AMOUNT: 'El monto del plan de Isapre debe ser mayor a 0'
  },
  
  SUCCESS_MESSAGES: {
    CALCULATION_COMPLETED: 'Cálculo completado exitosamente'
  },
  
  // Formatos de número
  CURRENCY_FORMAT: {
    locale: 'es-CL',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }
} as const;

// Constantes económicas
export const INGRESO_MINIMO_MENSUAL = 529000;
export const INGRESO_MINIMO_ANUAL = INGRESO_MINIMO_MENSUAL * 12;
export const GRATIFICACION_TOPE = (INGRESO_MINIMO_MENSUAL * 4.75)/12;

// Configuración de las pestañas del calculador
export const CALCULATOR_TABS = [
  {
    id: 'bono_sabados',
    label: 'Bono Sábados',
    route: '/panel/bruto/bono-sabados'
  },
  {
    id: 'bono',
    label: 'Bonos',
    route: '/panel/bruto/bono'
  },
  {
    id: 'sueldo_bruto',
    label: 'Sueldo Bruto',
    route: '/panel/bruto/sueldo-bruto'
  }
] as const;

// Opciones para los selects de Sueldo Bruto
export const TIPO_CONTRATO_OPTIONS = [
  { label: 'Indefinido', value: 1 },
  { label: 'Plazo fijo', value: 2 }
];

export const AFP_OPTIONS = [
  { label: 'Capital', value: 'Capital' },
  { label: 'Cuprum', value: 'Cuprum' },
  { label: 'Habitat', value: 'Habitat' },
  { label: 'Modelo', value: 'Modelo' },
  { label: 'Planvital', value: 'Planvital' },
  { label: 'Provida', value: 'Provida' },
  { label: 'Uno', value: 'Uno' }
];

export const PREVISION_OPTIONS = [
  { label: 'Fonasa', value: 'Fonasa' },
  { label: 'Isapre', value: 'Isapre' }
];

export const GRATIFICACION_OPTIONS = [
  { label: 'Sí', value: true },
  { label: 'No', value: false }
];

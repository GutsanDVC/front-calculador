// Interfaces y tipos para el módulo de cálculo de bruto
// Define las estructuras de datos utilizadas en los cálculos

// Importamos la interfaz de Colaborador del repository global para mantener consistencia
import { Colaborador } from '../../../repository/colaboradoresRepository';

// Re-exportamos para uso interno del módulo
export type { Colaborador };

export interface CalculoBrutoRequest {
  colaborador: Colaborador;
  valorHoraExtra: number;
  horasExtrasTrabajadas: number;
  montoBonoPactado: number;
}

export interface CalculoBrutoResponse {
  // Resultados principales para las cards
  bonoPactadoLiquido: number;
  diferenciaLiquida: number;
  diferenciaBruto: number;
  
  // Desglose de liquidación (mantener para compatibilidad)
  montoBonoPactado: number;
  montoTotalHorasExtras: number;
  totalBrutoDiferencia: number;
}

export interface DesgloseLiquidacion {
  montoBonoPactado: number;
  montoTotalHorasExtras: number;
  diferenciaLiquida: number;
}

// Enum para los tipos de cálculo disponibles
export enum TipoCalculoBruto {
  BONO_SABADOS = 'bono_sabados',
  BONOS = 'bonos',
  SUELDO_BRUTO = 'sueldo_bruto'
}

// Tipo para los errores de validación
export interface ValidationError {
  field: string;
  message: string;
}

// Interfaces para Sueldo Bruto
export interface CalculoSueldoBrutoRequest {
  sueldo_liquido_deseado: number;
  tipo_contrato: number; // 1: Indefinido, 2: Plazo fijo
  afp: string;
  salud?: string; // 'Fonasa' o nombre de Isapre
  plan_isapre?: number; // Monto del plan si es Isapre
  gratificacion?: boolean;
  asignacion_familiar?: number;
  asignacion_colacion?: number;
  asignacion_transporte?: number;
  asignacion_otros?: number;
  tolerancia?: number;
  max_iteraciones?: number;
}

export interface Haberes {
  sueldo_base: number;
  gratificacion: number;
  asignacion_familiar: number;
  asignacion_colacion: number;
  asignacion_transporte: number;
  asignacion_otros: number;
  'Total haberes': number;
}

export interface Descuentos {
  descuento_afp: number;
  descuento_salud: number;
  descuento_cesantia: number;
  impuesto: number;
  'Total descuentos': number;
}

export interface CalculoInverso {
  sueldo_liquido_deseado: number;
  sueldo_liquido_obtenido: number;
  diferencia_final: number;
  iteraciones_realizadas: number;
  convergencia_exitosa: boolean;
  tolerancia_utilizada: number;
  sueldo_base_calculado: number;
}

export interface CalculoSueldoBrutoResponse {
  haberes: Haberes;
  deberes: Descuentos;
  sueldo_liquido: number;
  indicadores: {
    utm: number;
    uf: number;
  };
  calculo_inverso: CalculoInverso;
}

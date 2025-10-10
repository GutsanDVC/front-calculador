// Lógica de cálculos para el módulo de bruto
// Separación de la lógica de negocio de los componentes

import { 
  CalculoBrutoRequest, 
  CalculoBrutoResponse, 
  DesgloseLiquidacion,
  ValidationError
} from '../Types/bruto.interface';
import { BRUTO_CONSTANTS } from './bruto.constants';

/**
 * Valida los datos de entrada para el cálculo de bruto
 * @param data Datos a validar
 * @returns Array de errores de validación (vacío si todo es válido)
 */
export function validateCalculoBrutoData(data: CalculoBrutoRequest): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validar colaborador+
  if (!data.colaborador || !data.colaborador.user_id) {
    errors.push({
      field: 'colaborador',
      message: BRUTO_CONSTANTS.ERROR_MESSAGES.COLLABORATOR_REQUIRED
    });
  }

  // Validar valor hora extra
  if (!data.valorHoraExtra || data.valorHoraExtra <= 0) {
    errors.push({
      field: 'valorHoraExtra',
      message: BRUTO_CONSTANTS.ERROR_MESSAGES.INVALID_HOUR_VALUE
    });
  }

  // Validar horas extras trabajadas
  if (data.horasExtrasTrabajadas < BRUTO_CONSTANTS.MIN_HOURS_WORKED || 
      data.horasExtrasTrabajadas > BRUTO_CONSTANTS.MAX_HOURS_WORKED) {
    errors.push({
      field: 'horasExtrasTrabajadas',
      message: BRUTO_CONSTANTS.ERROR_MESSAGES.INVALID_HOURS_WORKED
    });
  }

  // Validar monto bono pactado
  if (data.montoBonoPactado < BRUTO_CONSTANTS.MIN_BONUS_AMOUNT || 
      data.montoBonoPactado > BRUTO_CONSTANTS.MAX_BONUS_AMOUNT) {
    errors.push({
      field: 'montoBonoPactado',
      message: BRUTO_CONSTANTS.ERROR_MESSAGES.INVALID_BONUS_AMOUNT
    });
  }

  return errors;
}

/**
 * Calcula el monto total de horas extras
 * @param valorHora Valor por hora extra
 * @param horasTrabajadas Cantidad de horas trabajadas
 * @returns Monto total de horas extras
 */
export function calcularMontoHorasExtras(valorHora: number, horasTrabajadas: number): number {
  return valorHora * horasTrabajadas;
}

/**
 * Calcula la diferencia líquida
 * @param montoBonoPactado Monto del bono pactado
 * @param montoHorasExtras Monto total de horas extras
 * @returns Diferencia líquida
 */
export function calcularDiferenciaLiquida(montoBonoPactado: number, montoHorasExtras: number): number {
  return montoBonoPactado - montoHorasExtras;
}

/**
 * Calcula el desglose de liquidación
 * @param montoBonoPactado Monto del bono pactado
 * @param montoHorasExtras Monto total de horas extras
 * @returns Desglose completo de la liquidación
 */
export function calcularDesgloseLiquidacion(
  montoBonoPactado: number, 
  montoHorasExtras: number
): DesgloseLiquidacion {
  const diferenciaLiquida = calcularDiferenciaLiquida(montoBonoPactado, montoHorasExtras);
  
  return {
    montoBonoPactado,
    montoTotalHorasExtras: montoHorasExtras,
    diferenciaLiquida
  };
}

/**
 * Formatea un número como moneda chilena
 * @param amount Monto a formatear
 * @returns String formateado como moneda
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(
    BRUTO_CONSTANTS.CURRENCY_FORMAT.locale,
    {
      style: 'currency',
      currency: BRUTO_CONSTANTS.CURRENCY_FORMAT.currency,
      minimumFractionDigits: BRUTO_CONSTANTS.CURRENCY_FORMAT.minimumFractionDigits,
      maximumFractionDigits: BRUTO_CONSTANTS.CURRENCY_FORMAT.maximumFractionDigits
    }
  ).format(amount);
}

/**
 * Formatea un número sin símbolo de moneda
 * @param amount Monto a formatear
 * @returns String formateado como número
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat(BRUTO_CONSTANTS.CURRENCY_FORMAT.locale).format(amount);
}

/**
 * Formatea un número para mostrar en input con separadores de miles
 * @param value Valor numérico
 * @returns String formateado para input
 */
export function formatNumberForInput(value: number | string): string {
  if (!value && value !== 0) return '';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  if (isNaN(numValue)) return '';
  return formatNumber(numValue);
}

/**
 * Convierte un string formateado de input a número
 * @param formattedValue String con formato de separadores
 * @returns Número sin formato
 */
export function parseFormattedNumber(formattedValue: string): number {
  if (!formattedValue) return 0;
  // Remover separadores de miles (puntos) pero mantener decimales (comas)
  const cleanValue = formattedValue.replace(/\./g, '').replace(',', '.');
  const numValue = parseFloat(cleanValue);
  return isNaN(numValue) ? 0 : numValue;
}

/**
 * Maneja la entrada de números en inputs con formato
 * @param event Evento de input
 * @param callback Función callback para actualizar el valor
 */
export function handleNumberInput(event: Event, callback: (value: number) => void): void {
  const target = event.target as HTMLInputElement;
  const cursorPosition = target.selectionStart || 0;
  const rawValue = parseFormattedNumber(target.value);
  
  // Actualizar el valor en el modelo
  callback(rawValue);
  
  // Formatear el valor y mantener la posición del cursor
  const formattedValue = formatNumberForInput(rawValue);
  if (formattedValue !== target.value) {
    target.value = formattedValue;
    
    // Calcular nueva posición del cursor considerando los separadores agregados
    const originalLength = target.value.length;
    const newLength = formattedValue.length;
    const newCursorPosition = Math.min(cursorPosition + (newLength - originalLength), newLength);
    
    // Restaurar posición del cursor
    setTimeout(() => {
      target.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  }
}

/**
 * Calcula el bruto diferencia (cálculo mock para desarrollo)
 * Esta función será reemplazada por la lógica real del backend
 * @param diferenciaLiquida Diferencia líquida calculada
 * @returns Total bruto diferencia
 */
export function calcularBrutoDiferencia(diferenciaLiquida: number): number {
  // Cálculo simplificado para desarrollo - será reemplazado por lógica real
  // Asumimos un factor de conversión aproximado
  const factorConversion = 1.2; // Factor ejemplo
  return diferenciaLiquida * factorConversion;
}

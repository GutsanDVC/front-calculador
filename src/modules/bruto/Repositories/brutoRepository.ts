// Repository para el módulo de cálculo de bruto
// Maneja la comunicación con APIs y fuentes de datos

import apiClient from '../../../shared/apiClient';
import { 
  CalculoBrutoRequest, 
  CalculoBrutoResponse,
  CalculoSueldoBrutoRequest,
  CalculoSueldoBrutoResponse
} from '../Types/bruto.interface';
import { 
  Colaborador, 
  getColaboradores as getColaboradoresGlobal, 
  getColaboradorPorCorreo,
  getDatosColaboradorAfpSalud,
  DatosColaboradorAfpSalud
} from '../../../repository/colaboradoresRepository';

/**
 * Obtiene la lista de colaboradores disponibles para los cálculos
 * Utiliza el repository global de colaboradores
 * @param centrosCostos Array de códigos de centros de costo
 * @param ver_planta Filtro opcional para personal de planta
 * @returns Lista de colaboradores
 */
export async function getColaboradores(centrosCostos: string[] = [], ver_planta?: boolean): Promise<Colaborador[]> {
  try {
    const response = await getColaboradoresGlobal(centrosCostos, ver_planta);
    return response.results;
  } catch (error: any) {
    console.error('Error al obtener colaboradores:', error);
    throw new Error('No se pudieron cargar los colaboradores');
  }
}

/**
 * Busca un colaborador específico por su correo electrónico
 * Utiliza el repository global de colaboradores
 * @param correo Correo electrónico del colaborador
 * @returns Datos del colaborador encontrado
 */
export async function buscarColaboradorPorCorreo(correo: string): Promise<Colaborador> {
  try {
    return await getColaboradorPorCorreo(correo);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('No se encontró un colaborador con ese correo electrónico');
    }
    console.error('Error al buscar colaborador:', error);
    throw new Error('Error al buscar el colaborador');
  }
}

/**
 * Calcula el bruto para bono de sábados
 * @param data Datos del cálculo
 * @returns Resultado del cálculo
 */
export async function calcularBrutoBonoSabados(data: CalculoBrutoRequest): Promise<CalculoBrutoResponse> {
  try {
    const response = await apiClient.post<CalculoBrutoResponse>('/api/bruto/bono-sabados/', data);
    return response.data;
  } catch (error: any) {
    console.error('Error al calcular bruto bono sábados:', error);
    throw new Error('Error al realizar el cálculo del bruto');
  }
}

/**
 * Calcula el sueldo bruto necesario para obtener un sueldo líquido específico
 * @param data Datos del cálculo inverso
 * @returns Resultado del cálculo con haberes, descuentos y sueldo líquido
 */
export async function calcularSueldoBrutoDesdeNeto(data: CalculoSueldoBrutoRequest): Promise<CalculoSueldoBrutoResponse> {
  try {
    const response = await apiClient.post<CalculoSueldoBrutoResponse>('/api/salary/calculo-sueldo-bruto-desde-neto/', data);
    return response.data;
  } catch (error: any) {
    console.error('Error al calcular sueldo bruto desde neto:', error);
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.detail || 'Error en los parámetros de entrada');
    }
    throw new Error('Error al realizar el cálculo del sueldo bruto');
  }
}

/**
 * Realiza el cálculo de bruto para bonos generales
 * @param data Datos del cálculo
 * @returns Resultado del cálculo
 */
export async function calcularBrutoBonos(data: CalculoBrutoRequest): Promise<CalculoBrutoResponse> {
  try {
    const response = await apiClient.post<CalculoBrutoResponse>('/api/bruto/calcular-bonos/', data);
    return response.data;
  } catch (error: any) {
    console.error('Error al calcular bruto bonos:', error);
    throw new Error('Error al realizar el cálculo. Verifique los datos ingresados');
  }
}

/**
 * Realiza el cálculo de sueldo bruto
 * @param data Datos del cálculo
 * @returns Resultado del cálculo
 */
export async function calcularSueldoBruto(data: CalculoBrutoRequest): Promise<CalculoBrutoResponse> {
  try {
    const response = await apiClient.post<CalculoBrutoResponse>('/api/bruto/calcular-sueldo-bruto/', data);
    return response.data;
  } catch (error: any) {
    console.error('Error al calcular sueldo bruto:', error);
    throw new Error('Error al realizar el cálculo. Verifique los datos ingresados');
  }
}

/**
 * Obtiene los valores actuales de UF y salario mínimo
 * @returns Valores actuales para los cálculos
 */
export async function obtenerValoresActuales(): Promise<{ uf: number; salarioMinimo: number }> {
  try {
    const response = await apiClient.get<{ uf: number; salario_minimo: number }>('/api/bruto/valores-actuales/');
    return {
      uf: response.data.uf,
      salarioMinimo: response.data.salario_minimo
    };
  } catch (error: any) {
    console.error('Error al obtener valores actuales:', error);
    // Retornamos valores por defecto en caso de error
    return {
      uf: 25,
      salarioMinimo: 500000
    };
  }
}

/**
 * Obtiene los datos de AFP y Salud de un colaborador específico
 * Utiliza el repository global de colaboradores
 * @param user_id Número de personal (NP) del colaborador
 * @returns Datos de AFP, Salud y tipo de contrato del colaborador
 */
export async function obtenerDatosColaboradorAfpSalud(user_id: number): Promise<DatosColaboradorAfpSalud> {
  try {
    return await getDatosColaboradorAfpSalud(user_id);
  } catch (error: any) {
    console.error('Error al obtener datos AFP y Salud del colaborador:', error);
    throw new Error('No se pudieron obtener los datos de AFP y Salud del colaborador');
  }
}

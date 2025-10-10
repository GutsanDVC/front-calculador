// Servicio para obtener rangos de colación y movilización desde la API
import apiClient from '../../../shared/apiClient';

export interface RangoColacionMovilizacion {
  colacion: number;
  movilizacion: number;
  minimo: number;
  maximo: number;
}

export interface RangosResponse {
  success: boolean;
  data: RangoColacionMovilizacion[];
  message: string;
}

/**
 * Obtiene los rangos de colación y movilización desde la API
 * @returns Promise con los rangos de asignaciones
 */
export const obtenerRangosColacionMovilizacion = async (): Promise<RangoColacionMovilizacion[]> => {
  try {
    const response = await apiClient.get<RangosResponse>('/api/bd-gestion/rangos-colacion-movilizacion/');
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al obtener los rangos');
    }
  } catch (error: any) {
    console.error('Error al obtener rangos de colación y movilización:', error);
    throw new Error(error.response?.data?.message || 'Error de conexión al obtener rangos');
  }
};

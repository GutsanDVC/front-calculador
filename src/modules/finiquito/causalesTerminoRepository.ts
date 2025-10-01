// Repository para obtener causales de término desde la API
// Sigue el estándar WindSurf para orden y comentarios explicativos

import apiClient from '../../shared/apiClient';

// Interface que representa una causal de término según la respuesta de la API
export interface CausalTermino {
  id: number; // Identificador único de la causal
  causal_termino: string; // Código de la causal (ej: "159-1")
  letra: string | null; // Letra asociada (puede ser null)
  nombre: string; // Nombre descriptivo de la causal
}

// Función para obtener el listado de causales de término desde la API
export async function getCausalesTermino(): Promise<CausalTermino[]> {
  try {
    // Llamada a la API para obtener las causales
    const response = await apiClient.get<CausalTermino[]>('/api/warehouse/causales-termino/');
    // Retornamos el array de causales
    return response.data;
  } catch (error: any) {
    // Lanzamos el error para que el componente lo maneje
    throw error;
  }
}

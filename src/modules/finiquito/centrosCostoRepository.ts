// Repositorio para obtener centros de costo desde la API
// Mantiene el mismo patrón que colaboradoresRepository

import apiClient from '../../shared/apiClient';
import { useUserStore } from '../../store/user';

// Interfaz para tipar los centros de costo recibidos desde la API
export interface CentroCosto {
  centro_costo: string; // Código del centro de costo
  nombre_centro_costo: string; // Nombre descriptivo del centro de costo
  label: string; // Etiqueta para mostrar en selectores|
  empresa:string;
}

// Función para obtener el listado de centros de costo
// export async function getCentrosCosto(): Promise<CentroCosto[]> {
//   try {
//     console.log(import.meta.env.APP_API_BASE_URL)
//     // Llamada a la API para obtener los centros de costo
//     const response = await apiClient.get<CentroCosto[]>('/api/warehouse/centros-costo/');
//     // Retornamos directamente el array de centros de costo
//     return response.data;
//   } catch (error: any) {
//     // Lanzamos el error para que el componente lo maneje y muestre mensaje amigable
//     throw error;
//   }
// }
const user = useUserStore()
export const getCentrosCosto = () => {
  const centroCosto = user.userInfo.data.admin_access.map((access) => access.cc);
  const empresas = user.userInfo.data.admin_access.map((access) => access.empresa);
  console.log(centroCosto, empresas)
  return {centroCosto, empresas};
}
    
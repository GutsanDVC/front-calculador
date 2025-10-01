// Repository para manejar logs de finiquitos vía API REST (TypeScript)
// Todas las funciones usan apiClient (ubicado en src/shared/apiClient.ts)
// Este módulo centraliza el acceso a la API de logs para mantener el código desacoplado y reutilizable

import apiClient from '../../../shared/apiClient'

// Definición de tipos para claridad y tipado estricto
export interface SettlementLogCreate {
  user: string
  log_accion: any
}

export interface SettlementLogResponse {
  id?: number
  user: string
  log_accion: any
  created_at?: string
  message?: string
}

/**
 * Crea un nuevo registro de log para finiquitos
 * @param {SettlementLogCreate} logData - Datos del log (user, log_accion)
 * @returns {Promise<SettlementLogResponse>} Respuesta del log creado
 */
export const createSettlementLog = async (logData: SettlementLogCreate): Promise<SettlementLogResponse> => {
  // POST /api/finiquito/log/
  const { data } = await apiClient.post<SettlementLogResponse>('/api/finiquito/log/', logData)
  return data
}

/**
 * Función helper para crear logs de forma simplificada
 * @param {string} user - Email del usuario
 * @param {any} logAccion - Acción o datos a registrar en el log
 * @returns {Promise<SettlementLogResponse>} Respuesta del log creado
 */
export const logSettlementAction = async (user: string, logAccion: any): Promise<SettlementLogResponse> => {
  return await createSettlementLog({
    user,
    log_accion: logAccion
  })
}

// Repository para manejar usuarios globales vía API REST (TypeScript)
// Todas las funciones usan apiClient (ubicado en src/shared/apiClient.ts)
// Este módulo centraliza el acceso a la API de usuarios globales para mantener el código desacoplado y reutilizable

import apiClient from '../../../shared/apiClient'

// Definición de tipos para claridad y tipado estricto
export interface GlobalUser {
  np: string
  nombre: string
  email: string
  activo: boolean
  ver_nfg: boolean
  usuario_creo: string
  created_at?: string // solo lectura
}

export interface GlobalUserCreate {
  np: string
  nombre: string
  email: string
  activo: boolean
  ver_nfg:boolean
  usuario_creo: string
}

export interface GlobalUserUpdate {
  np: string
  nombre: string
  email: string
  activo: boolean
  ver_nfg:boolean
  usuario_creo: string
}

/**
 * Obtiene el listado completo de usuarios globales
 * @returns {Promise<GlobalUser[]>} Array de usuarios globales
 */
export const getAllGlobalUsers = async (): Promise<GlobalUser[]> => {
  // GET /global-access-users/
  const { data } = await apiClient.get<GlobalUser[]>('/api/auth/global-access-users/')
  return data
}

/**
 * Crea un nuevo usuario global
 * @param {GlobalUserCreate} userData - Datos del usuario (np, nombre, email, usuario_creo)
 * @returns {Promise<GlobalUser>} Usuario creado
 */
export const createGlobalUser = async (userData: GlobalUserCreate): Promise<GlobalUser> => {
  // POST /global-access-users/
  const { data } = await apiClient.post<GlobalUser>('/api/auth/global-access-users/', userData)
  return data
}

/**
 * Obtiene un usuario global por su número personal (np)
 * @param {string} np - Número personal único
 * @returns {Promise<GlobalUser>} Usuario global encontrado
 */
export const getGlobalUserByNp = async (np: string): Promise<GlobalUser> => {
  // GET /global-access-users/<np>/
  const { data } = await apiClient.get<GlobalUser>(`/global-access-users/${np}/`)
  return data
}

/**
 * Actualiza los datos de un usuario global identificado por np
 * @param {string} np - Número personal único
 * @param {GlobalUserUpdate} userData - Campos a actualizar (nombre, email, usuario_creo)
 * @returns {Promise<{message: string}>} Respuesta de actualización
 */
export const updateGlobalUser = async (np: string, userData: GlobalUserUpdate): Promise<{message: string}> => {
  // PUT /global-access-users/<np>/
  const { data } = await apiClient.put<{message: string}>(`/api/auth/global-access-users/${np}/`, userData)
  return data
}

/**
 * Elimina un usuario global por np
 * @param {string} np - Número personal único
 * @returns {Promise<{message: string}>} Respuesta de eliminación
 */
export const deleteGlobalUser = async (np: string): Promise<{message: string}> => {
  // DELETE /global-access-users/<np>/
  const { data } = await apiClient.delete<{message: string}>(`/api/auth/global-access-users/${np}/`)
  return data
}

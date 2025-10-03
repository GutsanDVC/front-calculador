// Store global para manejo de colaboradores con patrón Repository
// Actúa como caché temporal y única fuente de datos para todos los módulos

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getColaboradores, type Colaborador } from '../repository/colaboradoresRepository';
import { useUserStore } from './user';

interface CollaboratorState {
  colaboradores: Colaborador[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null; // Timestamp de la última carga
  isInitialized: boolean;
}

// Constantes de configuración
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos
const BACKGROUND_REFRESH_THRESHOLD = 50 * 60 * 1000; // 50 minutos para refresh silencioso

export const useCollaboratorStore = defineStore('collaborator', () => {
  // Estado reactivo
  const state = ref<CollaboratorState>({
    colaboradores: [],
    loading: false,
    error: null,
    lastFetch: null,
    isInitialized: false
  });

  // Getters computados
  const list = computed(() => state.value.colaboradores);
  const isLoading = computed(() => state.value.loading);
  const hasError = computed(() => !!state.value.error);
  const errorMessage = computed(() => state.value.error);
  const isEmpty = computed(() => state.value.colaboradores.length === 0);
  const count = computed(() => state.value.colaboradores.length);

  // Computed para verificar si los datos están expirados
  const isDataExpired = computed(() => {
    if (!state.value.lastFetch) return true;
    return Date.now() - state.value.lastFetch > CACHE_DURATION;
  });

  // Computed para verificar si necesita refresh silencioso
  const needsBackgroundRefresh = computed(() => {
    if (!state.value.lastFetch) return false;
    return Date.now() - state.value.lastFetch > BACKGROUND_REFRESH_THRESHOLD;
  });

  // Computed para obtener información del tiempo de caché
  const cacheInfo = computed(() => {
    if (!state.value.lastFetch) {
      return { status: 'no-data', message: 'Sin datos cargados' };
    }

    const elapsed = Date.now() - state.value.lastFetch;
    const remaining = CACHE_DURATION - elapsed;

    if (remaining <= 0) {
      return { status: 'expired', message: 'Datos expirados' };
    }

    const minutes = Math.floor(remaining / (60 * 1000));
    return { 
      status: 'valid', 
      message: `Datos válidos por ${minutes} minutos más`,
      remainingMs: remaining
    };
  });

  /**
   * Obtiene los centros de costo del usuario actual
   */
  const getCentrosCostos = (): string[] => {
    const userStore = useUserStore();
    return userStore.userInfo.data.admin_access.map((access) => access.cc);
  };

  /**
   * Verifica si el usuario puede ver planta
   */
  const getPuedeVerPlanta = (): boolean => {
    const userStore = useUserStore();
    if (userStore.userInfo.data.global_access) {
      return true;
    }
    const primerAcceso = userStore.userInfo.data.admin_access[0];
    return primerAcceso?.ver_planta || false;
  };

  /**
   * Carga colaboradores desde el repositorio
   * @param force - Fuerza la recarga aunque los datos no estén expirados
   * @param silent - Si es true, no muestra estados de loading
   */
  const fetch = async (force: boolean = false, silent: boolean = false): Promise<void> => {
    // Si no se fuerza y los datos no están expirados, no hacer nada
    if (!force && !isDataExpired.value && state.value.isInitialized) {
      return;
    }

    // Si es un refresh silencioso y ya hay datos, no mostrar loading
    if (!silent) {
      state.value.loading = true;
    }
    
    state.value.error = null;

    try {
      const centrosCostos = getCentrosCostos();
      const puedeVerPlanta = getPuedeVerPlanta();
      
      const data = await getColaboradores(centrosCostos, puedeVerPlanta);
      
      state.value.colaboradores = data.results;
      state.value.lastFetch = Date.now();
      state.value.isInitialized = true;
      state.value.error = null;

      console.log(`[CollaboratorStore] Colaboradores cargados: ${data.results.length} registros`);
      
    } catch (error: any) {
      const errorMsg = error.message || 'Error al cargar colaboradores';
      state.value.error = errorMsg;
      
      // Si es la primera carga y falla, limpiar datos
      if (!state.value.isInitialized) {
        state.value.colaboradores = [];
      }
      
      console.error('[CollaboratorStore] Error al cargar colaboradores:', error);
      throw error; // Re-lanzar para que el componente pueda manejarlo
      
    } finally {
      if (!silent) {
        state.value.loading = false;
      }
    }
  };

  /**
   * Fuerza la recarga de colaboradores (para uso manual)
   */
  const refresh = async (): Promise<void> => {
    return fetch(true, false);
  };

  /**
   * Realiza un refresh silencioso en segundo plano
   */
  const backgroundRefresh = async (): Promise<void> => {
    if (!needsBackgroundRefresh.value) return;
    
    try {
      await fetch(true, true);
      console.log('[CollaboratorStore] Background refresh completado');
    } catch (error) {
      // En refresh silencioso, no propagar errores
      console.warn('[CollaboratorStore] Background refresh falló:', error);
    }
  };

  /**
   * Inicializa el store cargando datos si es necesario
   */
  const initialize = async (): Promise<void> => {
    if (!state.value.isInitialized || isDataExpired.value) {
      await fetch(false, false);
    } else if (needsBackgroundRefresh.value) {
      // Programar refresh silencioso
      setTimeout(() => backgroundRefresh(), 100);
    }
  };

  /**
   * Busca colaboradores por diferentes criterios
   * @param query - Término de búsqueda
   * @param excludeIds - IDs de colaboradores a excluir
   */
  const search = (query: string, excludeIds: number[] = []): Colaborador[] => {
    if (!query.trim()) {
      return state.value.colaboradores.filter(c => !excludeIds.includes(c.user_id));
    }

    const searchTerm = query.toLowerCase().trim();
    return state.value.colaboradores.filter(colaborador => {
      // Excluir IDs especificados
      if (excludeIds.includes(colaborador.user_id)) return false;

      const nombreCompleto = `${colaborador.first_name} ${colaborador.last_name}`.toLowerCase();
      const np = colaborador.user_id.toString();
      const cargo = colaborador.nombre_cargo?.toLowerCase() || '';
      const centro = colaborador.centro_costo?.toLowerCase() || '';

      return colaborador.first_name.toLowerCase().includes(searchTerm) ||
             colaborador.last_name.toLowerCase().includes(searchTerm) ||
             nombreCompleto.includes(searchTerm) ||
             np.includes(searchTerm) ||
             cargo.includes(searchTerm) ||
             centro.includes(searchTerm);
    });
  };

  /**
   * Busca un colaborador por ID
   */
  const findById = (id: number): Colaborador | undefined => {
    return state.value.colaboradores.find(c => c.user_id === id);
  };

  /**
   * Limpia el caché y resetea el estado
   */
  const clear = (): void => {
    state.value.colaboradores = [];
    state.value.loading = false;
    state.value.error = null;
    state.value.lastFetch = null;
    state.value.isInitialized = false;
  };

  /**
   * Obtiene estadísticas del store
   */
  const getStats = () => {
    return {
      totalColaboradores: state.value.colaboradores.length,
      isInitialized: state.value.isInitialized,
      lastFetch: state.value.lastFetch ? new Date(state.value.lastFetch) : null,
      cacheStatus: cacheInfo.value.status,
      needsRefresh: isDataExpired.value,
      needsBackgroundRefresh: needsBackgroundRefresh.value
    };
  };

  return {
    // Estado (solo lectura)
    list,
    isLoading,
    hasError,
    errorMessage,
    isEmpty,
    count,
    isDataExpired,
    needsBackgroundRefresh,
    cacheInfo,
    
    // Acciones
    fetch,
    refresh,
    backgroundRefresh,
    initialize,
    search,
    findById,
    clear,
    getStats
  };
});

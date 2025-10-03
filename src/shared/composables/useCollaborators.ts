// Composable helper para facilitar el uso del CollaboratorStore
// Proporciona una interfaz simplificada para los módulos que consumen colaboradores

import { computed } from 'vue';
import { useCollaboratorStore } from '../../store/collaboratorStore';
import type { Colaborador } from '../../repository/colaboradoresRepository';

export function useCollaborators() {
  const store = useCollaboratorStore();

  // Estados reactivos simplificados
  const colaboradores = computed(() => store.list);
  const isLoading = computed(() => store.isLoading);
  const hasError = computed(() => store.hasError);
  const errorMessage = computed(() => store.errorMessage);
  const isEmpty = computed(() => store.isEmpty);
  const count = computed(() => store.count);

  // Información de caché
  const cacheInfo = computed(() => store.cacheInfo);
  const needsRefresh = computed(() => store.isDataExpired);
  const canRefreshSilently = computed(() => store.needsBackgroundRefresh);

  /**
   * Inicializa los colaboradores si es necesario
   * Uso recomendado: llamar en onMounted de componentes
   */
  const initialize = async (): Promise<void> => {
    try {
      await store.initialize();
    } catch (error) {
      console.error('[useCollaborators] Error en initialize:', error);
      throw error;
    }
  };

  /**
   * Fuerza la recarga de colaboradores
   * Uso: botones de "Actualizar" o "Refrescar"
   */
  const refresh = async (): Promise<void> => {
    try {
      await store.refresh();
    } catch (error) {
      console.error('[useCollaborators] Error en refresh:', error);
      throw error;
    }
  };

  /**
   * Busca colaboradores con filtros opcionales
   * @param query - Término de búsqueda
   * @param excludeIds - IDs a excluir de los resultados
   * @param limit - Límite de resultados (opcional)
   */
  const search = (
    query: string = '', 
    excludeIds: number[] = [], 
    limit?: number
  ): Colaborador[] => {
    const results = store.search(query, excludeIds);
    return limit ? results.slice(0, limit) : results;
  };

  /**
   * Busca un colaborador específico por ID
   */
  const findById = (id: number): Colaborador | undefined => {
    return store.findById(id);
  };

  /**
   * Busca colaboradores por múltiples criterios
   */
  const findBy = (criteria: {
    name?: string;
    cargo?: string;
    centro?: string;
    empresa?: string;
  }): Colaborador[] => {
    return colaboradores.value.filter(colaborador => {
      if (criteria.name) {
        const fullName = `${colaborador.first_name} ${colaborador.last_name}`.toLowerCase();
        if (!fullName.includes(criteria.name.toLowerCase())) return false;
      }
      
      if (criteria.cargo) {
        if (!colaborador.nombre_cargo?.toLowerCase().includes(criteria.cargo.toLowerCase())) return false;
      }
      
      if (criteria.centro) {
        if (!colaborador.centro_costo?.toLowerCase().includes(criteria.centro.toLowerCase())) return false;
      }
      
      if (criteria.empresa) {
        if (!colaborador.empresa?.toLowerCase().includes(criteria.empresa.toLowerCase())) return false;
      }
      
      return true;
    });
  };

  /**
   * Obtiene estadísticas del store
   */
  const getStats = () => store.getStats();

  /**
   * Limpia el caché (usar con precaución)
   */
  const clearCache = () => store.clear();

  /**
   * Hook para componentes que necesitan colaboradores
   * Inicializa automáticamente y proporciona estados comunes
   */
  const useCollaboratorData = () => {
    // Auto-inicializar en el siguiente tick
    setTimeout(() => initialize(), 0);

    return {
      colaboradores,
      isLoading,
      hasError,
      errorMessage,
      isEmpty,
      count,
      refresh,
      search,
      findById
    };
  };

  /**
   * Hook especializado para selectores/dropdowns
   * Incluye funcionalidades específicas para componentes de selección
   */
  const useCollaboratorSelector = (excludeIds: () => number[] = () => []) => {
    const searchColaboradores = (query: string, limit: number = 50) => {
      return search(query, excludeIds(), limit);
    };

    const hasData = computed(() => !isEmpty.value);
    const showCacheInfo = computed(() => {
      return process.env.NODE_ENV === 'development' && hasData.value;
    });

    return {
      colaboradores,
      isLoading,
      hasError,
      errorMessage,
      hasData,
      showCacheInfo,
      cacheInfo,
      canRefreshSilently,
      initialize,
      refresh,
      search: searchColaboradores,
      findById
    };
  };

  return {
    // Estados
    colaboradores,
    isLoading,
    hasError,
    errorMessage,
    isEmpty,
    count,
    cacheInfo,
    needsRefresh,
    canRefreshSilently,

    // Acciones
    initialize,
    refresh,
    search,
    findById,
    findBy,
    getStats,
    clearCache,

    // Hooks especializados
    useCollaboratorData,
    useCollaboratorSelector
  };
}

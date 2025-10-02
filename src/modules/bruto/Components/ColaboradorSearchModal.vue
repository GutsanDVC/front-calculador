<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Seleccionar Colaborador</h3>
        <button class="modal-close" @click="closeModal">
          <i class="pi pi-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Campo de búsqueda -->
        <div class="search-field">
          <label class="field-label">Buscar colaborador</label>
          <input
            v-model="searchQuery"
            type="text"
            class="form-input" 
            placeholder="Buscar por nombre, apellido o NP..."
            :disabled="loading"
          />
        </div>
        
        <!-- Loading -->
        <div v-if="loading" class="loading-container">
          <i class="pi pi-spin pi-spinner loading-icon"></i>
          <p>Cargando colaboradores...</p>
        </div>
        
        <!-- Lista de colaboradores -->
        <div v-else-if="filteredColaboradores.length > 0" class="colaboradores-list">
          <div class="list-header">
            <span>{{ filteredColaboradores.length }} colaborador(es) disponible(s)</span>
          </div>
          <div class="list-container">
            <div 
              v-for="colaborador in filteredColaboradores" 
              :key="colaborador.user_id"
              class="colaborador-item"
              @click="selectColaborador(colaborador)"
            >
              <div class="colaborador-info">
                <h5 class="colaborador-name">{{ colaborador.first_name }} {{ colaborador.last_name }}</h5>
                <div class="colaborador-details">
                  <span class="detail-item"><strong>NP:</strong> {{ colaborador.user_id }}</span>
                  <span class="detail-item"><strong>Cargo:</strong> {{ colaborador.nombre_cargo }}</span>
                  <span class="detail-item"><strong>Tipo Contrato:</strong> {{ getTipoContrato(colaborador.external_cod_tipo_contrato) }}</span>
                  <span class="detail-item"><strong>Centro:</strong> {{ colaborador.centro_costo }} - {{ colaborador.nombre_centro_costo }}</span>
                </div>
              </div>
              <div class="colaborador-actions">
                <button class="btn-select-item">
                  <i class="pi pi-check"></i>
                  Seleccionar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Estado vacío -->
        <div v-else-if="!loading && colaboradores.length === 0" class="no-results">
          <i class="pi pi-users no-results-icon"></i>
          <p class="no-results-message">No hay colaboradores disponibles</p>
        </div>
        
        <!-- Sin resultados de búsqueda -->
        <div v-else-if="!loading && searchQuery && filteredColaboradores.length === 0" class="no-results">
          <i class="pi pi-search no-results-icon"></i>
          <p class="no-results-message">No se encontraron colaboradores con "{{ searchQuery }}"</p>
        </div>
        
        <!-- Mensajes de error -->
        <div v-if="error" class="error-message">
          <i class="pi pi-exclamation-triangle"></i>
          {{ error }}
        </div>
      </div>
      
      <div class="modal-footer">
        <button
          class="btn-cancel"
          @click="closeModal"
          :disabled="loading"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Colaborador, getColaboradores, TipoContrato } from '../../../repository/colaboradoresRepository';
import { useUserStore } from '../../../store/user';

// Props
interface Props {
  visible: boolean;
  initialSearchQuery?: string;
}

const props = defineProps<Props>();

// Emits
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'colaborador-selected', colaborador: Colaborador): void;
}

const emit = defineEmits<Emits>();

// Store
const userStore = useUserStore();

// Estado reactivo
const searchQuery = ref('');
const colaboradores = ref<Colaborador[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Computed
const puedeVerPlanta = computed(() => {
  if (userStore.userInfo.data.global_access) {
    return true;
  }
  // Para el modal, usar el primer centro disponible o todos si no hay restricción específica
  const primerAcceso = userStore.userInfo.data.admin_access[0];
  return primerAcceso?.ver_planta || false;
});

const filteredColaboradores = computed(() => {
  if (!searchQuery.value.trim()) {
    return colaboradores.value;
  }
  
  const query = searchQuery.value.toLowerCase().trim();
  return colaboradores.value.filter(colaborador => {
    const nombreCompleto = `${colaborador.first_name} ${colaborador.last_name}`.toLowerCase();
    const np = colaborador.user_id.toString();
    
    return colaborador.first_name.toLowerCase().includes(query) ||
           colaborador.last_name.toLowerCase().includes(query) ||
           nombreCompleto.includes(query) ||
           np.includes(query);
  });
});

// Watchers
watch(() => props.visible, (newValue) => {
  if (newValue) {
    // Sincronizar el searchQuery inicial cuando se abre el modal
    if (props.initialSearchQuery) {
      searchQuery.value = props.initialSearchQuery;
    }
    cargarColaboradores();
  } else {
    // Limpiar búsqueda cuando se cierra el modal
    searchQuery.value = '';
  }
});

// Watcher para sincronizar el searchQuery inicial
watch(() => props.initialSearchQuery, (newQuery) => {
  if (props.visible && newQuery !== undefined) {
    searchQuery.value = newQuery;
  }
});

// Funciones
const closeModal = () => {
  emit('update:visible', false);
};

const handleOverlayClick = () => {
  closeModal();
};

const getTipoContrato = (codigo: string): string => {
  return TipoContrato[codigo as keyof typeof TipoContrato] || 'Desconocido';
};

/**
 * Carga colaboradores usando la misma lógica que SeleccionPersonal
 */
const cargarColaboradores = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Obtener centros de costo del usuario (misma lógica que SeleccionPersonal)
    const centrosCostos = userStore.userInfo.data.admin_access.map((access) => access.cc);
    
    const data = await getColaboradores(centrosCostos, puedeVerPlanta.value);
    colaboradores.value = data.results;
  } catch (e: any) {
    error.value = e.message || 'Error al cargar colaboradores';
    colaboradores.value = [];
  } finally {
    loading.value = false;
  }
};

/**
 * Selecciona un colaborador y cierra el modal
 */
const selectColaborador = (colaborador: Colaborador) => {
  emit('colaborador-selected', colaborador);
  closeModal();
};

// Cargar colaboradores al montar el componente si el modal está visible
onMounted(() => {
  if (props.visible) {
    cargarColaboradores();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.search-field {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.field-help {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #6b7280;
}

.loading-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #dc2626;
}

/* Lista de colaboradores */
.colaboradores-list {
  margin-top: 1rem;
}

.list-header {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.list-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.colaborador-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.2s;
}

.colaborador-item:last-child {
  border-bottom: none;
}

.colaborador-item:hover {
  background-color: #f9fafb;
}

.colaborador-info {
  flex: 1;
}

.colaborador-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.colaborador-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item {
  font-size: 0.875rem;
  color: #6b7280;
}

.colaborador-actions {
  margin-left: 1rem;
}

.btn-select-item {
  padding: 0.5rem 1rem;
  background-color: #059669;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-select-item:hover {
  background-color: #047857;
}

/* Estado sin resultados */
.no-results {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.no-results-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.no-results-message {
  font-size: 1rem;
}

/* Mensajes de error */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  background-color: #fef2f2;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  border: 1px solid #fecaca;
}

/* Footer del modal */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-search {
  padding: 0.75rem 1.5rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-search:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-select {
  padding: 0.75rem 1.5rem;
  background-color: #059669;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-select:hover {
  background-color: #047857;
}

.btn-cancel:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .colaborador-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .colaborador-details {
    gap: 0.125rem;
  }
  
  .detail-item {
    font-size: 0.8rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>

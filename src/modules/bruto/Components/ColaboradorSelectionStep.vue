<template>
  <div class="colaborador-selection-step">
    <div class="step-header">
      <h3 class="step-title">Seleccionar Colaboradores</h3>
      <p class="step-description">
        Seleccione uno o más colaboradores para calcular el bono de sábados
      </p>
    </div>

    <div class="selection-content">
      <!-- Selector de colaboradores -->
      <div class="search-section">
        <div class="search-field">
          <label class="field-label">Seleccionar Colaborador</label>
          <div class="select-container">
            <!-- Campo de búsqueda -->
            <div class="search-input-wrapper">
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Buscar colaborador por nombre, NP o cargo..."
                @focus="showDropdown = true"
                @input="handleSearchInput"
                :disabled="loading"
              />
              <i v-if="loading" class="pi pi-spin pi-spinner search-loading"></i>
              <i v-else class="pi pi-search search-icon"></i>
            </div>
            
            <!-- Dropdown con colaboradores filtrados -->
            <div v-if="showDropdown && !loading" class="dropdown-container">
              <div v-if="filteredColaboradores.length > 0" class="dropdown-list">
                <div class="dropdown-header">
                  {{ filteredColaboradores.length }} colaborador(es) encontrado(s)
                </div>
                <div 
                  v-for="colaborador in filteredColaboradores.slice(0, 50)" 
                  :key="colaborador.user_id"
                  class="dropdown-item"
                  @click="selectColaborador(colaborador)"
                >
                  <div class="colaborador-info">
                    <div class="colaborador-name">
                      {{ colaborador.first_name }} {{ colaborador.last_name }}
                    </div>
                    <div class="colaborador-details">
                      <span class="detail">NP: {{ colaborador.user_id }}</span>
                      <span class="detail">{{ colaborador.nombre_cargo }}</span>
                      <span class="detail">{{ colaborador.centro_costo }}</span>
                    </div>
                  </div>
                  <div class="select-indicator">
                    <i class="pi pi-plus"></i>
                  </div>
                </div>
                <div v-if="filteredColaboradores.length > 50" class="dropdown-footer">
                  Mostrando los primeros 50 resultados. Refine su búsqueda para ver más.
                </div>
              </div>
              <div v-else class="dropdown-empty">
                <i class="pi pi-search"></i>
                <p>No se encontraron colaboradores</p>
                <small v-if="searchQuery.trim()">con "{{ searchQuery }}"</small>
              </div>
            </div>
            
            <!-- Overlay para cerrar dropdown -->
            <div v-if="showDropdown" class="dropdown-overlay" @click="showDropdown = false"></div>
          </div>
          
          <!-- Loading inicial -->
          <div v-if="loading && !hasData" class="initial-loading">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Cargando colaboradores...</span>
          </div>
          
          <!-- Error de carga -->
          <div v-if="error" class="error-message">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ error }}</span>
            <button class="retry-button" @click="refreshColaboradores">
              <i class="pi pi-refresh"></i>
              Reintentar
            </button>
          </div>
          
          <!-- Información de caché (solo en desarrollo) -->
          <div v-if="showCacheInfo" class="cache-info-simple">
            <small>{{ cacheTimestamp }}</small>
          </div>
        </div>
      </div>

      <!-- Lista de colaboradores seleccionados -->
      <div class="selected-section">
        <div class="section-header">
          <h4 class="section-title">
            Colaboradores Seleccionados 
            <span class="count-badge">{{ selectedColaboradores.length }}</span>
          </h4>
          <button 
            v-if="selectedColaboradores.length > 0"
            class="clear-all-button"
            @click="clearAllColaboradores"
          >
            <i class="pi pi-trash"></i>
            Limpiar Todo
          </button>
        </div>

        <!-- Estado vacío -->
        <div v-if="selectedColaboradores.length === 0" class="empty-state">
          <i class="pi pi-users empty-icon"></i>
          <p class="empty-message">No hay colaboradores seleccionados</p>
          <p class="empty-hint">Use el buscador para agregar colaboradores</p>
        </div>

        <!-- Lista de colaboradores -->
        <div v-else class="colaboradores-list">
          <div 
            v-for="colaborador in selectedColaboradores" 
            :key="colaborador.user_id"
            class="colaborador-card"
          >
            <div class="colaborador-info">
              <div class="colaborador-main">
                <h5 class="colaborador-name">
                  {{ colaborador.first_name }} {{ colaborador.last_name }}
                </h5>
                <span class="colaborador-id">{{ colaborador.user_id }}</span>
              </div>
              <div class="colaborador-details">
                <div class="detail-item">
                  <span class="detail-label">Centro Gestión:</span>
                  <span class="detail-value">{{ colaborador.centro_costo }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Cargo:</span>
                  <span class="detail-value">{{ colaborador.nombre_cargo }}</span>
                </div>
              </div>
            </div>
            <button 
              class="remove-button"
              @click="removeColaborador(colaborador.user_id)"
              :title="`Remover ${colaborador.first_name} ${colaborador.last_name}`"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones del paso -->
    <div class="step-actions">
      <button 
        class="next-button"
        @click="handleNext"
        :disabled="selectedColaboradores.length === 0"
      >
        Continuar
        <i class="pi pi-arrow-right"></i>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Colaborador } from '../Types/bruto.interface';
import { useCollaboratorStore } from '../../../store/collaboratorStore';

// Props y emits
const selectedColaboradores = defineModel<Colaborador[]>('selectedColaboradores', { default: () => [] });

const emit = defineEmits<{
  next: []
}>();

// Store
const collaboratorStore = useCollaboratorStore();

// Estado reactivo
const searchQuery = ref('');
const showDropdown = ref(false);

// Computed
const filteredColaboradores = computed(() => {
  const excludeIds = selectedColaboradores.value.map(c => c.user_id);
  return collaboratorStore.search(searchQuery.value, excludeIds);
});

// Computed para estados del store
const loading = computed(() => collaboratorStore.isLoading);
const error = computed(() => collaboratorStore.errorMessage);
const hasData = computed(() => !collaboratorStore.isEmpty);

// Funciones
const cargarColaboradores = async () => {
  try {
    await collaboratorStore.initialize();
  } catch (e: any) {
    // El error ya está manejado por el store
    console.error('Error al inicializar colaboradores:', e);
  }
};

const refreshColaboradores = async () => {
  try {
    await collaboratorStore.refresh();
  } catch (e: any) {
    console.error('Error al refrescar colaboradores:', e);
  }
};

const handleSearchInput = () => {
  showDropdown.value = true;
};

const selectColaborador = (colaborador: Colaborador) => {
  // Verificar si el colaborador ya está seleccionado
  const isAlreadySelected = selectedColaboradores.value.some(
    c => c.user_id === colaborador.user_id
  );
  
  if (!isAlreadySelected) {
    selectedColaboradores.value.push(colaborador);
  }
  
  // Limpiar búsqueda y cerrar dropdown
  searchQuery.value = '';
  showDropdown.value = false;
};

const removeColaborador = (userId: number) => {
  selectedColaboradores.value = selectedColaboradores.value.filter(
    c => c.user_id !== userId
  );
};

const clearAllColaboradores = () => {
  selectedColaboradores.value = [];
};


const handleNext = () => {
  if (selectedColaboradores.value.length > 0) {
    emit('next');
  }
};

// Estado para mostrar información de caché (solo en desarrollo)
const showCacheInfo = computed(() => {
  return process.env.NODE_ENV === 'development' && hasData.value;
});

// Formato de fecha y hora para el caché
const cacheTimestamp = computed(() => {
  const stats = collaboratorStore.getStats();
  if (!stats.lastFetch) return '';
  
  const date = stats.lastFetch;
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return `Datos cargados hoy a las ${date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  } else {
    return `Datos cargados el ${date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })} a las ${date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  }
});

// Cargar colaboradores al montar el componente
onMounted(() => {
  cargarColaboradores();
});
</script>

<style scoped>
.colaborador-selection-step {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 100%;
}

.step-header {
  text-align: center;
  margin-bottom: 1rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.step-description {
  color: #6b7280;
  font-size: 1rem;
}

.selection-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.search-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.search-field {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

/* Selector con dropdown */
.select-container {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: white;
}

.search-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.search-input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.search-icon,
.search-loading {
  position: absolute;
  right: 1rem;
  color: #6b7280;
  pointer-events: none;
}

.search-loading {
  color: #dc2626;
}

/* Dropdown */
.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
}

.dropdown-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 400px;
  overflow: hidden;
}

.dropdown-list {
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-header {
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f9fafb;
}

.colaborador-info {
  flex: 1;
}

.colaborador-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.colaborador-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.detail {
  font-size: 0.8rem;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.select-indicator {
  color: #059669;
  font-size: 1.125rem;
  margin-left: 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.dropdown-item:hover .select-indicator {
  opacity: 1;
}

.dropdown-footer {
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  font-size: 0.8rem;
  color: #6b7280;
  text-align: center;
}

.dropdown-empty {
  padding: 2rem 1rem;
  text-align: center;
  color: #6b7280;
}

.dropdown-empty i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #d1d5db;
}

.dropdown-empty p {
  margin: 0.5rem 0 0.25rem 0;
  font-weight: 500;
}

.dropdown-empty small {
  color: #9ca3af;
}

/* Estados de carga y error */
.initial-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
}

.retry-button {
  margin-left: auto;
  padding: 0.375rem 0.75rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.retry-button:hover {
  background-color: #b91c1c;
}

/* Información de caché (desarrollo) - versión simple */
.cache-info-simple {
  margin-top: 0.5rem;
  text-align: center;
}

.cache-info-simple small {
  color: #6b7280;
  font-size: 0.75rem;
}

.selected-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.count-badge {
  background-color: #dc2626;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  min-width: 1.5rem;
  text-align: center;
}

.clear-all-button {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.clear-all-button:hover {
  background-color: #dc2626;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #6b7280;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-message {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.875rem;
}

.colaboradores-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.colaborador-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.colaborador-card:hover {
  border-color: #dc2626;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.colaborador-info {
  flex: 1;
}

.colaborador-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.colaborador-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.colaborador-id {
  background-color: #f3f4f6;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.colaborador-details {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.detail-item {
  display: flex;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  min-width: 100px;
}

.detail-value {
  font-size: 0.875rem;
  color: #1f2937;
}

.remove-button {
  padding: 0.5rem;
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-button:hover {
  background-color: #dc2626;
  color: white;
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.next-button {
  padding: 0.75rem 2rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.next-button:hover:not(:disabled) {
  background-color: #b91c1c;
}

.next-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .dropdown-container {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin-top: 0;
    border-radius: 1rem 1rem 0 0;
    max-height: 70vh;
  }
  
  .dropdown-item {
    padding: 1.25rem 1rem;
  }
  
  .colaborador-details {
    flex-direction: column;
    gap: 0.375rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .colaborador-card {
    padding: 1rem;
  }
  
  .colaborador-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .detail-item {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .detail-label {
    min-width: auto;
  }
}
</style>

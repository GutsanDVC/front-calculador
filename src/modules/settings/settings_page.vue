<template>
  <div>
    <h1>Usuarios Globales</h1>

    <!-- DataTable de usuarios globales con PrimeVue -->
    <DataTable :value="users" responsiveLayout="scroll" class="custom-datatable">
      <Column field="np" header="Número Personal"></Column>
      <Column field="nombre" header="Nombre"></Column>
      <Column field="email" header="Email"></Column>
      <Column field="activo" header="Activo">
        <template #body="slotProps">
          <i class="pi" :class="{'status-active pi-check-circle': slotProps.data.activo, 'status-inactive pi-times-circle': !slotProps.data.activo}"></i>
        </template>
      </Column>
      <Column field="ver_nfg" header="Ver NFG">
        <template #body="slotProps">
          <i class="pi" :class="{'status-active pi-check-circle': slotProps.data.ver_nfg, 'status-inactive pi-times-circle': !slotProps.data.ver_nfg}"></i>
        </template>
      </Column>
      <Column field="usuario_creo" header="Usuario Creador"></Column>
      <Column field="created_at" header="Fecha de Creación">
        <template #body="slotProps">
          {{ formatDate(slotProps.data) }}
        </template>
      </Column>
      <Column header="Acciones" class="actions-column">
        <template #body="slotProps">
          <Button 
            icon="pi pi-trash"
            class="btn-delete"
            @click="handleDeleteUser(slotProps.data)"
            v-tooltip.bottom="'Eliminar usuario'"
            aria-label="Eliminar"
          />
          <Button 
            icon="pi pi-pencil"
            class="btn-edit"
            @click="handleEditUser(slotProps.data)"
            v-tooltip.bottom="'Editar usuario'"
            aria-label="Editar"
          />
        </template>
      </Column>
      <template #header>
        <Button icon="pi pi-plus" label="Agregar" class="btn-add" @click="sidebarVisible = true" />
      </template>
    </DataTable>
    <!-- Modal de confirmación para eliminar usuario global -->
    <div v-if="!loading && !error && !users.length">No hay usuarios registrados.</div>

    <!-- Estado de carga -->
    <div v-if="loading">Cargando usuarios...</div>
    
    <!-- Estado de error -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Sidebar para agregar nuevo colaborador global -->
    <Sidebar v-model:visible="sidebarVisible" :baseZIndex="10000" position="right">
      <template #header>
        <h3>Agregar nuevo colaborador global</h3>
      </template>
      <form class="form-container" @submit.prevent="handleCreateUser">
        <div class="form-field">
          <label for="colaborador-search">Seleccionar Colaborador*</label>
          <div class="select-container">
            <!-- Campo de búsqueda -->
            <div class="search-input-wrapper">
              <input
                id="colaborador-search"
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Buscar colaborador por nombre, NP o correo..."
                @focus="showDropdown = true"
                @input="handleSearchInput"
                :disabled="creatingUser || collaboratorStore.isLoading"
              />
              <i v-if="collaboratorStore.isLoading" class="pi pi-spin pi-spinner search-loading"></i>
              <i v-else class="pi pi-search search-icon"></i>
            </div>
            
            <!-- Dropdown con colaboradores filtrados -->
            <div v-if="showDropdown && !collaboratorStore.isLoading" class="dropdown-container">
              <div v-if="filteredColaboradores.length > 0" class="dropdown-list">
                <div class="dropdown-header">
                  {{ filteredColaboradores.length }} colaborador(es) encontrado(s)
                </div>
                <div 
                  v-for="colaborador in filteredColaboradores.slice(0, 20)" 
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
                      <span class="detail">{{ colaborador.correo_flesan || colaborador.correo_gmail }}</span>
                      <span class="detail">{{ colaborador.centro_costo }}</span>
                    </div>
                  </div>
                  <div class="select-indicator">
                    <i class="pi pi-check"></i>
                  </div>
                </div>
                <div v-if="filteredColaboradores.length > 20" class="dropdown-footer">
                  Mostrando los primeros 20 resultados. Refine su búsqueda para ver más.
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
          <div v-if="collaboratorStore.isLoading && !collaboratorStore.count" class="initial-loading">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Cargando colaboradores...</span>
          </div>
          
          <!-- Error de carga -->
          <div v-if="collaboratorStore.hasError" class="error-message">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ collaboratorStore.errorMessage }}</span>
            <button class="retry-button" @click="collaboratorStore.refresh()">
              <i class="pi pi-refresh"></i>
              Reintentar
            </button>
          </div>
          
          <!-- Opción alternativa: buscar por correo -->
          <div class="alternative-search">
            <button 
              type="button"
              class="btn-alternative"
              @click="openSearchModal"
              :disabled="creatingUser"
            >
              <i class="pi pi-envelope"></i>
              Buscar por correo específico
            </button>
          </div>
        </div>
        <div class="form-field">
          <label for="nombre">Nombre*</label>
          <InputText id="nombre" v-model="form.nombre" required maxlength="100" autocomplete="off" readonly />
        </div>
        <div class="form-field">
          <label for="email">Email*</label>
          <InputText id="email" v-model="form.email" required type="email" maxlength="100" autocomplete="off" readonly />
        </div>
        <div class="form-field">
          <label for="usuario_creo">Creado por*</label>
          <InputText id="usuario_creo" v-model="form.usuario_creo" required maxlength="100" autocomplete="off" readonly />
        </div>
        <div class="form-row">
          <div class="form-field-half">
            <div class="checkbox-container">
              <Checkbox id="activo" v-model="form.activo" :binary="true" />
              <label for="activo" class="checkbox-label">Usuario Activo</label>
            </div>
          </div>
          <div class="form-field-half">
            <div class="checkbox-container">
              <Checkbox id="ver_nfg" v-model="form.ver_nfg" :binary="true" />
              <label for="ver_nfg" class="checkbox-label">Ver NFG</label>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <Button type="submit" label="Agregar" :loading="creatingUser" :disabled="creatingUser" icon="pi pi-user-plus" class="btn-submit" />
        </div>
        <div class="form-messages">
          <Message v-if="formError" severity="error">{{ formError }}</Message>
          <Message v-if="formSuccess" severity="success">Colaborador agregado exitosamente.</Message>
        </div>
      </form>
    </Sidebar>

    <!-- Modal para buscar colaborador por correo -->
    <Dialog 
      v-model:visible="searchModalVisible" 
      :style="{width: '450px'}" 
      header="Buscar Colaborador por Correo" 
      :modal="true" 
      class="search-modal"
    >
      <div class="modal-field">
        <label for="searchEmail">Correo Electrónico*</label>
        <InputText 
          id="searchEmail" 
          v-model="searchEmail" 
          placeholder="Ej: bastian.gutierrez@dvc.cl" 
          type="email"
          :disabled="searchingColaborador"
          @keyup.enter="searchColaborador"
        />
      </div>
      
      <!-- Resultado de la búsqueda -->
      <div v-if="searchResult" class="search-result">
        <h4 class="result-title">Colaborador Encontrado:</h4>
        <p><strong>NP:</strong> {{ searchResult.user_id }}</p>
        <p><strong>Nombre:</strong> {{ searchResult.first_name }} {{ searchResult.last_name }}</p>
        <p><strong>Email:</strong> {{ searchResult.correo_flesan || searchResult.correo_gmail }}</p>
        <p><strong>Empresa:</strong> {{ searchResult.empresa }}</p>
      </div>
      
      <!-- Mensaje de error o no encontrado -->
      <div v-if="searchError" class="search-error">
        <Message severity="error">{{ searchError }}</Message>
      </div>
      
      <template #footer>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          class="btn-cancel" 
          @click="closeSearchModal" 
          :disabled="searchingColaborador"
        />
        <Button 
          label="Buscar" 
          icon="pi pi-search" 
          class="btn-primary" 
          @click="searchColaborador" 
          :loading="searchingColaborador"
          :disabled="!searchEmail || searchingColaborador"
        />
        <Button 
          v-if="searchResult" 
          label="Seleccionar" 
          icon="pi pi-check" 
          class="btn-success" 
          @click="selectSearchResult" 
          :disabled="searchingColaborador"
        />
      </template>
    </Dialog>

    <!-- Modal para editar usuario -->
    <Dialog 
      v-model:visible="editModalVisible" 
      :style="{width: '400px'}" 
      header="Editar Usuario" 
      :modal="true" 
      class="edit-modal"
    >
      <div class="edit-form">
        <div class="user-info">
          <h4>{{ editForm.nombre }}</h4>
          <p><strong>NP:</strong> {{ editForm.np }}</p>
          <p><strong>Email:</strong> {{ editForm.email }}</p>
        </div>
        
        <div class="edit-fields">
          <div class="edit-field">
            <div class="checkbox-container">
              <Checkbox 
                id="edit-activo" 
                v-model="editForm.activo" 
                :binary="true" 
                :disabled="editingUser"
              />
              <label for="edit-activo" class="checkbox-label">Usuario Activo</label>
            </div>
          </div>
          
          <div class="edit-field">
            <div class="checkbox-container">
              <Checkbox 
                id="edit-ver-nfg" 
                v-model="editForm.ver_nfg" 
                :binary="true" 
                :disabled="editingUser"
              />
              <label for="edit-ver-nfg" class="checkbox-label">Ver NFG</label>
            </div>
          </div>
        </div>
        
        <!-- Mensajes de estado -->
        <div v-if="editError" class="edit-error">
          <Message severity="error">{{ editError }}</Message>
        </div>
        
        <div v-if="editSuccess" class="edit-success">
          <Message severity="success">Usuario actualizado exitosamente</Message>
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          class="btn-cancel" 
          @click="closeEditModal" 
          :disabled="editingUser"
        />
        <Button 
          label="Guardar Cambios" 
          icon="pi pi-save" 
          class="btn-primary" 
          @click="updateUser" 
          :loading="editingUser"
          :disabled="editingUser"
        />
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
// Importamos los métodos y tipos del repository
import { ref, onMounted, watch } from 'vue'
import { getAllGlobalUsers, createGlobalUser, type GlobalUser, type GlobalUserCreate, type GlobalUserUpdate, deleteGlobalUser, updateGlobalUser } from './repositories/global-access-user.repository'
import { getColaboradorPorCorreo, type Colaborador } from '../../repository/colaboradoresRepository'
import { useCollaboratorStore } from '../../store/collaboratorStore'
import { useUserStore } from '../../store/user'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import { useGlobalStore } from '../../store/global'
// Estado reactivo para los usuarios, carga y error
const users = ref<GlobalUser[]>([])
const loading = ref<boolean>(false)
const error = ref<string | null>(null)


const global = useGlobalStore();
// Estado y lógica para el formulario de creación
const form = ref<GlobalUserCreate>({
  np: '',
  nombre: '',
  email: '',
  usuario_creo: '',
  activo: false,
  ver_nfg: false
})
const creatingUser = ref(false)
const formError = ref<string | null>(null)
const formSuccess = ref(false)
const sidebarVisible = ref(false)

// Store de colaboradores
const collaboratorStore = useCollaboratorStore()

// Estado para el selector con dropdown
const searchQuery = ref('')
const showDropdown = ref(false)

// Estado para el modal de búsqueda por correo
const searchModalVisible = ref(false)
const searchEmail = ref('')
const searchingColaborador = ref(false)
const searchResult = ref<Colaborador | null>(null)
const searchError = ref<string | null>(null)

// Estado para el modal de edición de usuario
const editModalVisible = ref(false)
const editingUser = ref(false)
const editForm = ref<GlobalUserUpdate>({
  np: '',
  nombre: '',
  email: '',
  activo: false,
  ver_nfg: false,
  usuario_creo: ''
})
const editError = ref<string | null>(null)
const editSuccess = ref(false)

// Computed para colaboradores disponibles
import { computed } from 'vue'
const colaboradoresDisponibles = computed(() => collaboratorStore.list)

// Colaboradores filtrados por búsqueda
const filteredColaboradores = computed(() => {
  if (!searchQuery.value.trim()) {
    return colaboradoresDisponibles.value.slice(0, 20) // Mostrar los primeros 20 si no hay búsqueda
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return colaboradoresDisponibles.value.filter(colaborador => {
    const nombreCompleto = `${colaborador.first_name} ${colaborador.last_name}`.toLowerCase()
    const np = colaborador.user_id.toString()
    const correo = (colaborador.correo_flesan || colaborador.correo_gmail || '').toLowerCase()
    const centro = colaborador.centro_costo?.toLowerCase() || ''
    
    return colaborador.first_name.toLowerCase().includes(query) ||
           colaborador.last_name.toLowerCase().includes(query) ||
           nombreCompleto.includes(query) ||
           np.includes(query) ||
           correo.includes(query) ||
           centro.includes(query)
  })
})

// Store de usuario logueado
const userStore = useUserStore()

// Watcher para inicializar colaboradores y resetear formulario
watch(sidebarVisible, async (visible) => {
  if (visible) {
    // Inicializar colaboradores si es necesario
    await collaboratorStore.initialize()
    
    // Resetear formulario y búsqueda
    searchQuery.value = ''
    showDropdown.value = false
    form.value = {
      np: '',
      nombre: '',
      email: '',
      activo: true,
      ver_nfg: false,
      usuario_creo: userStore.userInfo?.data?.email || ''
    }
  }
})

// Funciones para el selector con dropdown
const handleSearchInput = () => {
  showDropdown.value = true
}

const selectColaborador = (colaborador: Colaborador) => {
  llenarFormularioColaborador(colaborador)
  searchQuery.value = `${colaborador.first_name} ${colaborador.last_name} (${colaborador.user_id})`
  showDropdown.value = false
}

// Función para buscar colaboradores localmente
const buscarColaboradorLocal = (query: string): Colaborador[] => {
  if (!query.trim()) return []
  const resultados = collaboratorStore.search(query, [])
  return resultados.slice(0, 10) // Limitar a 10 resultados
}

/**
 * Función para obtener un colaborador específico por su correo electrónico
 * @param correo Correo electrónico del colaborador a buscar
 * @returns Colaborador encontrado o null si no existe
 */
const fetchColaboradorPorCorreo = async (correo: string): Promise<Colaborador | null> => {
  try {
    const colaborador = await getColaboradorPorCorreo(correo)
    return colaborador
  } catch (error: any) {
    console.error('Error al buscar colaborador por correo:', error)
    // Si el colaborador no existe, la API probablemente retorna 404
    if (error?.response?.status === 404) {
      return null
    }
    // Para otros errores, relanzamos la excepción
    throw error
  }
}

/**
 * Abre el modal de búsqueda por correo
 */
const openSearchModal = () => {
  searchModalVisible.value = true
  searchEmail.value = ''
  searchResult.value = null
  searchError.value = null
}

/**
 * Cierra el modal de búsqueda y limpia los datos
 */
const closeSearchModal = () => {
  searchModalVisible.value = false
  searchEmail.value = ''
  searchResult.value = null
  searchError.value = null
  searchingColaborador.value = false
}

/**
 * Busca un colaborador por correo electrónico
 */
const searchColaborador = async () => {
  if (!searchEmail.value.trim()) {
    searchError.value = 'Por favor ingrese un correo electrónico'
    return
  }

  searchingColaborador.value = true
  searchError.value = null
  searchResult.value = null

  try {
    const colaborador = await fetchColaboradorPorCorreo(searchEmail.value.trim())
    if (colaborador) {
      searchResult.value = colaborador
      searchError.value = null
    } else {
      searchError.value = 'No se encontró ningún colaborador con ese correo electrónico'
    }
  } catch (error: any) {
    console.error('Error al buscar colaborador:', error)
    searchError.value = 'Error al buscar colaborador. Por favor intente nuevamente.'
  } finally {
    searchingColaborador.value = false
  }
}

/**
 * Selecciona el colaborador encontrado y llena el formulario
 */
const selectSearchResult = () => {
  if (searchResult.value) {
    llenarFormularioColaborador(searchResult.value)
    closeSearchModal()
  }
}

// Función para llenar formulario con datos del colaborador
const llenarFormularioColaborador = (colaborador: Colaborador) => {
  form.value.np = String(colaborador.user_id)
  form.value.nombre = `${colaborador.first_name} ${colaborador.last_name}`
  form.value.email = colaborador.correo_flesan || colaborador.correo_gmail || ''
  form.value.usuario_creo = userStore.userInfo?.data?.email || ''
  form.value.activo = true
  form.value.ver_nfg = false
}

// --- ESTADOS Y FUNCIONES PARA MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ---
import ConfirmationModal from '../../components/ConfirmationModal.vue'

// Usuario objetivo a eliminar
const deleteTargetUser = ref<GlobalUser | null>(null)

// Al hacer clic en el botón eliminar de la tabla
const handleDeleteUser = (user: GlobalUser) => {
  deleteTargetUser.value = user
  deleteUser()
}

// Muestra el modal de confirmación y ejecuta el borrado real en accept
const deleteUser = () => {
  global.utl.showConfirmation({
    message: `Se eliminará el usuario global NP ${deleteTargetUser.value?.np}`,
    accept: async () => {
      if (!deleteTargetUser.value) return
      try {
        await deleteGlobalUser(deleteTargetUser.value.np)
        await fetchUsers()
        // Opcional: feedback visual de éxito
        global.utl.genToast(global.tstType.USER_ENABLED)
      } catch (e: any) {
        global.utl.genToast(global.tstType.UNKNOWN_ERROR)
      }
    },
    reject: () => {
      // Lógica opcional si el usuario cancela
    },
  })
}

// --- FUNCIONES PARA EDICIÓN DE USUARIO ---

/**
 * Abre el modal de edición con los datos del usuario seleccionado
 * @param user Usuario a editar
 */
const handleEditUser = (user: GlobalUser) => {
  // Llenar el formulario con los datos actuales del usuario
  editForm.value = {
    np: user.np,
    nombre: user.nombre,
    email: user.email,
    activo: user.activo || false,
    ver_nfg: user.ver_nfg || false,
    usuario_creo: userStore.userInfo?.data?.email || ''
  }
  
  // Limpiar estados de error y éxito
  editError.value = null
  editSuccess.value = false
  
  // Abrir el modal
  editModalVisible.value = true
}

/**
 * Cierra el modal de edición y limpia los datos
 */
const closeEditModal = () => {
  editModalVisible.value = false
  editError.value = null
  editSuccess.value = false
  editingUser.value = false
  
  // Resetear formulario
  editForm.value = {
    np: '',
    nombre: '',
    email: '',
    activo: false,
    ver_nfg: false,
    usuario_creo: ''
  }
}

/**
 * Actualiza el usuario con los nuevos valores de activo y ver_nfg
 */
const updateUser = async () => {
  editError.value = null
  editSuccess.value = false
  editingUser.value = true
  
  try {
    await updateGlobalUser(editForm.value.np, editForm.value)
    editSuccess.value = true
    
    // Refrescar la tabla de usuarios
    await fetchUsers()
    
    // Mostrar toast de éxito
    global.utl.genToast(global.tstType.USER_ENABLED)
    
    // Cerrar el modal después de un breve delay
    setTimeout(() => {
      closeEditModal()
    }, 1200)
    
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error)
    editError.value = error?.response?.data?.error || error?.message || 'Error al actualizar usuario'
    global.utl.genToast(global.tstType.UNKNOWN_ERROR)
  } finally {
    editingUser.value = false
  }
}

// Función para manejar el submit del formulario
const handleCreateUser = async () => {
  formError.value = null
  formSuccess.value = false
  // Validación básica
  if (!form.value.np || !form.value.nombre || !form.value.email || !form.value.usuario_creo) {
    formError.value = 'Todos los campos son obligatorios.'
    return
  }
  creatingUser.value = true
  try {
    await createGlobalUser({ ...form.value })
    formSuccess.value = true
    // Limpiar formulario
    form.value = { np: '', nombre: '', email: '', usuario_creo: '', activo: true, ver_nfg: false   }
    // Refrescar la tabla
    await fetchUsers()
    // Cerrar el sidebar tras éxito breve
    setTimeout(() => { formSuccess.value = false; sidebarVisible.value = false }, 1200)
  } catch (e: any) {
    // Mostrar mensaje de error específico si lo entrega la API
    formError.value = e?.response?.data?.error || e?.message || 'Error al agregar colaborador.'
  } finally {
    creatingUser.value = false
  }
}

// Formateador de fecha para columna de DataTable
const formatDate = (row: GlobalUser) => {
  return row.created_at ? new Date(row.created_at).toLocaleString() : '-'
}

// Función para cargar usuarios globales
const fetchUsers = async () => {
  loading.value = true
  error.value = null
  try {
    users.value = await getAllGlobalUsers()
  } catch (e: any) {
    // Mensaje de error genérico, puedes personalizar según tu apiClient
    error.value = e?.message || 'Error al cargar usuarios.'
  } finally {
    loading.value = false
  }
}

// Cargar usuarios al montar el componente
onMounted(fetchUsers)
</script>

<style scoped>
/* === ESTILOS GENERALES === */
.error {
  color: #b71c1c;
  margin: 1rem 0;
}

/* === ESTILOS PARA DATATABLE === */
.custom-datatable {
  width: 100%;
  margin-top: 1rem;
}

.actions-column {
  width: 80px;
  text-align: center;
}

.status-active {
  color: #16a34a; /* green-600 */
}

.status-inactive {
  color: #dc2626; /* red-600 */
}

.btn-delete {
  background: transparent;
  border: none;
  color: #dc2626;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-delete:hover {
  background-color: #fef2f2;
}

.btn-add {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-add:hover {
  background-color: #2563eb;
}

/* === ESTILOS PARA FORMULARIO === */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.form-field label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.form-field-half {
  flex: 1;
}

.input-group {
  display: flex;
  width: 100%;
}

.input-full {
  flex: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-search {
  background-color: white;
  border: 1px solid #d1d5db;
  border-left: none;
  color: #6b7280;
  padding: 0.5rem 0.75rem;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search:hover {
  background-color: #f9fafb;
  color: #374151;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-submit {
  background-color: #16a34a;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-submit:hover {
  background-color: #15803d;
}

.btn-submit:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.form-messages {
  margin-top: 0.5rem;
}

/* === ESTILOS PARA MODAL === */
.search-modal {
  width: 100%;
}

.modal-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.modal-field label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.search-result {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #f9fafb;
}

.result-title {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.search-result p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #374151;
}

.search-error {
  margin-top: 1rem;
}

.btn-cancel {
  background: transparent;
  border: none;
  color: #6b7280;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #f3f4f6;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-success {
  background-color: #16a34a;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-success:hover {
  background-color: #15803d;
}

.btn-success:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* === ESTILOS PARA MODAL DE EDICIÓN === */
.edit-modal {
  width: 100%;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-info {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.user-info h4 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1.125rem;
  font-weight: 600;
}

.user-info p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.edit-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-field {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: #ffffff;
}

.edit-error,
.edit-success {
  margin: 0;
}

.btn-edit {
  background: transparent;
  border: none;
  color: #3b82f6;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 0.25rem;
}

.btn-edit:hover {
  background-color: #eff6ff;
}

/* === ESTILOS PARA SELECTOR CON DROPDOWN === */
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
  font-size: 0.875rem;
  transition: all 0.2s;
  background-color: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  color: #3b82f6;
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
  max-height: 300px;
  overflow: hidden;
}

.dropdown-list {
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-header {
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
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
  font-size: 0.875rem;
}

.colaborador-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detail {
  font-size: 0.75rem;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.select-indicator {
  color: #16a34a;
  font-size: 1rem;
  margin-left: 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.dropdown-item:hover .select-indicator {
  opacity: 1;
}

.dropdown-footer {
  padding: 0.5rem 1rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.dropdown-empty {
  padding: 1.5rem 1rem;
  text-align: center;
  color: #6b7280;
}

.dropdown-empty i {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #d1d5db;
}

.dropdown-empty p {
  margin: 0.5rem 0 0.25rem 0;
  font-weight: 500;
  font-size: 0.875rem;
}

.dropdown-empty small {
  color: #9ca3af;
  font-size: 0.75rem;
}

/* Estados de carga y error */
.initial-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.retry-button {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.retry-button:hover {
  background-color: #b91c1c;
}

/* Búsqueda alternativa */
.alternative-search {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.btn-alternative {
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-alternative:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-alternative:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .form-field-half {
    width: 100%;
  }
  
  .dropdown-container {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin-top: 0;
    border-radius: 1rem 1rem 0 0;
    max-height: 60vh;
  }
  
  .dropdown-item {
    padding: 1rem;
  }
  
  .colaborador-details {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>

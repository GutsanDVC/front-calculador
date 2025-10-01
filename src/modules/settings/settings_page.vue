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
          <label for="np">N° Personal*</label>
          <div class="input-group">
            <InputText 
              id="np" 
              v-model="form.np" 
              placeholder="Buscar colaborador por correo" 
              readonly 
              class="input-full"
            />
            <Button 
              icon="pi pi-search" 
              class="btn-search" 
              @click="openSearchModal" 
              :disabled="creatingUser"
              v-tooltip.bottom="'Buscar colaborador por correo'"
            />
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
import { getColaboradores, getColaboradorPorCorreo, type Colaborador } from '../finiquito/colaboradoresRepository'
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

// Estado para colaboradores y selección de NP
const colaboradores = ref<Colaborador[]>([])
const loadingColaboradores = ref(false)
const selectedColaborador = ref<string | null>(null)

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

// Computed para el Dropdown: user_id como string
import { computed } from 'vue'
const colaboradoresDropdown = computed(() =>
  colaboradores.value.map(c => ({
    ...c,
    user_id: String(c.user_id)
  }))
)

// Store de usuario logueado
const userStore = useUserStore()

// Watcher para cargar colaboradores al abrir el sidebar y resetear el formulario
watch(sidebarVisible, async (visible) => {
  if (visible) {
    selectedColaborador.value = null
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

// Función para cargar colaboradores
// const fetchColaboradores = async () => {
//   loadingColaboradores.value = true
//   try {
//     const res = await getColaboradores(userStore.userInfo.data.admin_access,'NFGA03')
//     colaboradores.value = res.results || []
//   } catch (e: any) {
//     colaboradores.value = []
//   } finally {
//     loadingColaboradores.value = false
//   }
// }

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
    // Llenar el formulario con los datos del colaborador encontrado
    form.value.np = String(searchResult.value.user_id)
    form.value.nombre = `${searchResult.value.first_name} ${searchResult.value.last_name}`
    form.value.email = searchResult.value.correo_flesan || searchResult.value.correo_gmail || ''
    form.value.usuario_creo = userStore.userInfo?.data?.email || ''
    form.value.activo = true // Por defecto activo
    form.value.ver_nfg = false // Por defecto sin acceso NFG
    
    // Cerrar el modal
    closeSearchModal()
  }
}

// Función para autocompletar campos al seleccionar un colaborador
const onColaboradorSelect = () => {
  const colab = colaboradores.value.find(c => String(c.user_id) === selectedColaborador.value)
  if (colab) {
    form.value.np = String(colab.user_id)
    form.value.nombre = `${colab.first_name} ${colab.last_name}`
    form.value.email = colab.correo_flesan || colab.correo_gmail || ''
    form.value.usuario_creo = userStore.userInfo?.data?.email || ''
  } else {
    form.value.np = ''
    form.value.nombre = ''
    form.value.email = ''
    form.value.usuario_creo = userStore.userInfo?.data?.email || ''
  }
}

// Filtro personalizado para el Dropdown de NP
const filterColaboradores = (option: Colaborador, filter: string) => {
  console.log(option)
  if (!filter) return true
  const texto = filter.toLowerCase()
  return (
    (option.user_id && String(option.user_id).toLowerCase().includes(texto)) ||
    (option.first_name && option.first_name.toLowerCase().includes(texto)) ||
    (option.last_name && option.last_name.toLowerCase().includes(texto)) ||
    (option.correo_flesan && option.correo_flesan.toLowerCase().includes(texto)) ||
    (option.correo_gmail && option.correo_gmail.toLowerCase().includes(texto))
  )
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

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .form-field-half {
    width: 100%;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .input-full {
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }
  
  .btn-search {
    border: 1px solid #d1d5db;
    border-radius: 4px;
  }
}
</style>

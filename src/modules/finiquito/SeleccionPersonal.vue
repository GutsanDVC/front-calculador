<template>
  <div>
    <!-- <h2 class="text-lg font-bold mb-2">1. Selección de Personal</h2> -->
    <DotLoader v-if="loading" msg="Cargando colaboradores..." />
    <DataTable v-else :value="filteredUsers" selectionMode="multiple" v-model:selection="selectedUsers" dataKey="user_id"
      :paginator="true" :rows="cantRows" :rowsPerPageOptions="[5, 10, 15]" class="mb-4">
      <template #header>
        <div class="flex gap-2">
          <InputText v-model="search" placeholder="Buscar por nombre o NP..." class="w-4" />
          <Dropdown v-model="selectedEmpresa" :options="empresas"  
            placeholder="Filtrar empresa" class="w-2" filter filterBy="label" />
          <Dropdown v-model="selectedCentro" :options="centros"  
            placeholder="Filtrar centro de costo" class="w-2" filter filterBy="label" :disabled="selectedEmpresa === null" showClear />
        </div>
      </template>
      <template #empty>
        <div v-if="!loading" class="text-gray-500 py-8 text-center">No hay colaboradores para mostrar.</div>
      </template>
      <Column selectionMode="multiple" headerStyle="width: 3em" />
      <Column field="user_id" header="NP" />
      <Column field="first_name" header="Nombre" />
      <Column field="last_name" header="Apellidos" />
      <Column field="national_id" header="RUT">
        <template #body="{ data }">
          {{ formatRut(data.national_id) }}
        </template> 
      </Column>
      <Column field="nombre_cargo" header="Cargo" />
      <Column field="external_cod_tipo_contrato" header="Tipo de Contrato" >
        <template #body="{ data }">
          {{ TipoContrato[data.external_cod_tipo_contrato as keyof typeof TipoContrato] || 'Desconocido' }}
        </template>
      </Column>
      <Column field="centro_costo" header="Centro de Costo">
        <template #body="{ data }">
          <div class="centroCosto">
            <p class="centroCosto__codigo">{{ data.centro_costo }}</p>
            <p class="centroCosto__nombre">{{ data.nombre_centro_costo }}</p>
          </div>
        </template>
      </Column>
    </DataTable>

    <div v-if="!loading && selectedUsers.length === 0" class="text-red-600 mb-2 w-12 text-right">Debe seleccionar al menos una persona.
    </div>
    <div v-else class="text-gray-500 mb-2 w-12 text-right">{{ selectedUsers.length }} personas seleccionadas.</div>
</div>
<footer class="foot-buttons">
  <Button label="Siguiente" @click="nextStep" />
</footer>
</template>
<script lang="ts" setup>
import { Utilities } from '../../shared/classes/Utilities';

// Importa el repository de colaboradores y tipos
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { getColaboradores, Colaborador, TipoContrato } from './colaboradoresRepository';
import { getCentrosCosto, CentroCosto } from './centrosCostoRepository';
import { useStepperStore } from './steperSstore';
import { useUserStore } from '../../store/user';
const stepperStore = useStepperStore();
const formatRut = (rut: string) => Utilities.formatRut(rut);
const userStore = useUserStore();
const usuarios = ref<Colaborador[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const search = ref('');
const selectedCentro = ref<string>(userStore.userInfo.data.admin_access[0].cc);
const selectedEmpresa = ref<string>(userStore.userInfo.data.admin_access[0].empresa);
const selectedUsers = ref<Colaborador[]>([]);
const centros = ref<string[]>(userStore.userInfo.data.admin_access.map(access => access.cc));
const empresas = ref<string[]>(userStore.userInfo.data.admin_access.map(access => access.empresa));

// Constante reactiva para almacenar el tamaño de la ventana
const windowSize = ref({ width: window.innerWidth, height: window.innerHeight });

const cantRows = ref(5);
// Función para actualizar el tamaño de la ventana
function updateWindowSize() {
	windowSize.value = {
		width: window.innerWidth,
		height: window.innerHeight
	};
}
// Hook de ciclo de vida para inicializar y limpiar el listener de resize
onMounted(async () => {
	window.addEventListener('resize', updateWindowSize);
});

onUnmounted(() => {
	window.removeEventListener('resize', updateWindowSize);
});

watch(()=>windowSize.value.height, () => {
  if(windowSize.value.height < 1000) {
    cantRows.value = 5;
  }
  else {
    cantRows.value = 10;
  }
});
async function cargarColaboradores() {
  loading.value = true;
  error.value = null;
  try {
    // Si hay centro seleccionado, filtra por centro_costo
  const puedeVerPlanta = computed(() => {
    if (userStore.userInfo.data.global_access) {
      return true;
    }
    const acceso = userStore.userInfo.data.admin_access.find((access) => access.cc === selectedCentro.value);
    return acceso?.ver_planta;
  });
    const centrosCostos =selectedCentro.value?[selectedCentro.value]:userStore.userInfo.data.admin_access.map((access) => access.cc);
    const data = await getColaboradores(centrosCostos,puedeVerPlanta.value);
    usuarios.value = data.results
    //console.log(usuarios.value)
  } catch (e: any) {
    error.value = e.message || 'Error al cargar colaboradores';
    usuarios.value = [];
  } finally {
    loading.value = false;
  }
}
async function cargarCentrosCosto() {
  loading.value = true;
  error.value = null;
  try {
    empresas.value = [...new Set(userStore.userInfo.data.admin_access.map((access) => access.empresa))];
  } catch (e: any) {
    error.value = e.message || 'Error al cargar centros de costo';
    centros.value = [];
  } finally {
    loading.value = false;
  }
}
watch(selectedEmpresa, () => {
  centros.value = userStore.userInfo.data.admin_access.filter((access) => access.empresa === selectedEmpresa.value).map((access) => access.cc);
  selectedCentro.value =centros.value[0];
  cargarColaboradores();
});
watch(selectedUsers, () => {
  if (selectedUsers.value.length > 0) {
    stepperStore.setPersonasSeleccionadas([...selectedUsers.value]);
  }
});
onMounted(async () => {
  await cargarColaboradores();
  await cargarCentrosCosto();
});

watch(selectedCentro, () => {
  cargarColaboradores();
});

const nextStep = () => {
  if (selectedUsers.value.length === 0) {
    error.value = 'Debe seleccionar al menos una persona.';
    return;
  }
  stepperStore.nextStep();
}
// const centros = computed(() => {
//   const centrosUnicos = [...new Set(usuarios.value.map(u => u.centro_costo))];
//   return [
//     { label: 'Todos', value: null },
//     ...centrosUnicos.map(c => ({ label: c, value: c })),
//   ];
// });

const filteredUsers = computed<Colaborador[]>(() => {
  let result = usuarios.value;
  if (search.value) {
    const s = search.value.toLowerCase();
    result = result.filter(u => u.first_name.toLowerCase().includes(s)||u.last_name.toLowerCase().includes(s) || u.user_id.toString().includes(s));
  }
  // console.log(result);
  return result;
});


</script>
<style scoped>

.centroCosto {
  display: flex;
  flex-direction: column;
  justify-content: right;
  /* align-items: center; */
  gap: 1px;
  padding: 0px;
  margin: 0px;
}

.centroCosto__codigo {
  padding:0;
  margin:0;
  font-size: 12px;
  color: var(--primary-color);
}

.centroCosto__nombre {
  padding:0;
  margin:0;
  font-size: 14px;
}
.foot-buttons {
  display: flex;
  gap: 1rem;
  justify-content: end;
}
</style>

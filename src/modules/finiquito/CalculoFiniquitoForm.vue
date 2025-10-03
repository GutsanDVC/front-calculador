<template>
  <div class="w-full max-w-5xl mx-auto p-4 bg-white rounded shadow">
    <form @submit.prevent="simular" class="grid gap-4">
      <Accordion :multiple="true" v-model:activeIndex="activeAccordionIndexes">
        <AccordionTab v-for="(persona, idx) in personasForm" :key="persona.user_id">
          <template #header>
            <div class="header-accordion">
              <p class="name-item">{{persona.first_name}} {{persona.last_name}}</p>
              <p class="rut-item">{{formatRut(persona.national_id)}} - {{persona.nombre_cargo}}- {{TipoContrato[persona.external_cod_tipo_contrato]}}</p>
            </div>
          </template>
          <ColaboradorFiniquitoForm
              ref="colaboradorRefs"
              :persona="persona"
            />
        </AccordionTab>
      </Accordion>
    </form>
    <footer class="foot-buttons">
      <Button label="Anterior" @click="prevStep" outlined />
      <Button label="Simular" @click="simular" />
    </footer>
    
  </div>
  <Dialog v-model:visible="simulando" :pt="global.modalConfig.blur" modal :closable="false"
  :draggable="false">
   <div class="dialog-simulando">
    <div>
      <h2>Simulación de Finiquitos</h2>
      <small>Por favor, espere mientras se simulan los finiquitos...</small>
    </div>
    <div v-for="(persona, idx) in personasForm" :key="persona.user_id" class="flex align-items-center gap-2">     
       <i v-if="todosValidosArray[idx]" class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--primary-color)"></i> 
       <i v-else class="pi pi-check text-green-500" style="font-size: 2rem"></i> 
       <p>{{persona.first_name}} {{persona.last_name}}</p>
    </div>
    <p>
      <small>Tiempo estimado: {{ personasForm.length * 10 }} segundos</small>
    </p>
   </div>
  </Dialog>
</template>
<script lang="ts" setup>
// 1. Importaciones
import { ref,reactive, computed, watch, toRefs, defineProps } from 'vue';
import { useStepperStore } from './steperSstore';
import { ColaboradorForm, TipoContrato } from '../../repository/colaboradoresRepository';
import { EssentialForm } from '../../shared/classes/EssentialForm';
import { useGlobalStore } from '../../store/global';
import ColaboradorFiniquitoForm from './ColaboradorFiniquitoForm.vue';
import { ToastTypeMessageEnum } from '../../shared/interfaces/toast-message.interface';
import { logSettlementAction } from '../settings/repositories/settlements-log.repository';
import { useUserStore } from '../../store/user';
const userStore = useUserStore();
// Referencias a los hijos con tipado correcto
const colaboradorRefs = ref<Array<InstanceType<typeof ColaboradorFiniquitoForm> | null>>([]);

// Método para validar todos los formularios hijos
function validarTodosColaboradores() {
  return colaboradorRefs.value.every(ref => ref?.validate());
}
const getValuesColaboradores = () => {
  return colaboradorRefs.value.map(ref => ref?.values());
}
// 2. Declaración de constantes y reactivos
const global = useGlobalStore();
const simulando = ref(false);
// Estado reactivo para cada persona
const personasForm = ref<ColaboradorForm[]>(useStepperStore().personasSeleccionadas.map(persona => ({
  ...persona,
  form: {
    fecha_desvinculacion: new Date(),
    tipo_solicitud: 'R',
    causalTermino: '',
    descuentoAfc: null,
    grat: 202127,
    otrosDescuentos: null,
    letraCausal: '',
    mesAviso: null,
    indemnizacion: null,
    
  }
})));
// watch(
//   () => JSON.parse(JSON.stringify(personasForm.value)),
//   (newVal) => {
//     useStepperStore().personasForm = newVal;
//   },
//   { deep: true }
// );
    
// Estado reactivo para los acordeones abiertos
const activeAccordionIndexes = ref<number[]>([]);
const todosValidosArray = ref<boolean[]>([]);
// 3. Watchers y hooks
// Abre todos los acordeones al montar o cuando cambia la cantidad de personas
watch(
  () => personasForm.value.length,
  (newLen) => {
    activeAccordionIndexes.value = Array.from({ length: newLen }, (_, i) => i);
  },
  { immediate: true }
);

// 4. Funciones y métodos
// Función utilitaria para dar formato a RUT chileno (xxxxxxxx-x → xx.xxx.xxx-x)
function formatRut(rut: string): string {
  if (!rut) return '';
  // Elimina puntos y guión por si acaso
  rut = rut.replace(/\./g, '').replace(/-/g, '');
  if (rut.length < 2) return rut;
  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);
  // Agrega puntos cada 3 dígitos desde el final
  const cuerpoFormateado = cuerpo
    .split('')
    .reverse()
    .join('')
    .replace(/(\d{3})(?=\d)/g, '$1.')
    .split('')
    .reverse()
    .join('');
  return `${cuerpoFormateado}-${dv}`;
}


const stepperStore = useStepperStore();
const prevStep = () => {
  stepperStore.prevStep();
  todosValidosArray.value = [];
  simulando.value = false;

}
const simular = async() => {
  const todosValidos =validarTodosColaboradores();
  if (todosValidos) {
    const formularios = getValuesColaboradores();
    simulando.value = true;
    todosValidosArray.value = Array.from({ length: personasForm.value.length }, () => true);

    for (let idx = 0; idx < personasForm.value.length; idx++) {
      const persona = personasForm.value[idx];
      persona.form = formularios[idx];
      if(persona.form.descuentoAfc==null){
        persona.form.descuentoAfc=0;
      }
      await stepperStore.simularFiniquito(persona);
      todosValidosArray.value[idx] = false;
    }
    simulando.value = false;
    stepperStore.nextStep();

    const jsonLog ={
      finiquitosCreados:stepperStore.finiquitos.length,
      data:stepperStore.finiquitos,     
    }
    logSettlementAction(userStore.userInfo.data.email,jsonLog)
  } else {
    global.utl.genToast(ToastTypeMessageEnum.FORM_ERROR);
    };
  }


</script>
<style scoped>
.header-accordion {
  display: flex;
  gap: 1rem;
}
.name-item {
  font-weight: bold;
  color: #5a5656;
}
.rut-item {
  font-style: italic;
}
.Button-simular {
  background-color: var(--primary-color);
  color: white;
}
.foot-buttons {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: end;
}
.dialog-simulando {
  width: 23rem;
  min-height: 20rem;
}
@media (max-width: 600px) {

  .dialog-simulando {
    width: 100%;
  }
}
</style>

<template>
  <div class="form-colaborador">
    <FormGroup :control="formColaborador.controls.fecha_ingreso_date" label="Fecha de ingreso">
      <InputText v-model="formColaborador.controls.fecha_ingreso_date.value" readonly />
    </FormGroup>
    <FormGroup :control="formColaborador.controls.fecha_desvinculacion" label="Fecha de término">
      <Calendar v-model="formColaborador.controls.fecha_desvinculacion.value" showIcon dateFormat="dd-mm-yy" />
    </FormGroup>
    <FormGroup :control="formColaborador.controls.causalTermino" label="Causal de término">
      <Dropdown v-model="causalSelected" :options="causalOptions" optionLabel="nombre"  placeholder="Seleccione" filter filterBy="nombre"/>
    </FormGroup>
    <FormGroup :control="formColaborador.controls.tipo_solicitud" label="Tipo de solicitud">
      <Dropdown v-model="formColaborador.controls.tipo_solicitud.value" :options="[{label: 'Real', value: 'R'}, {label: 'Simulación', value: 'S'}]" optionLabel="label" optionValue="value" placeholder="Seleccione" />
    </FormGroup>
    <FormGroup :control="formColaborador.controls.mesAviso" label="Pago Mes de aviso">
      <Dropdown v-model="formColaborador.controls.mesAviso.value" :options="[{label: 'Sí', value: true}, {label: 'No', value: false}]" optionLabel="label" optionValue="value" placeholder="Seleccione" :disabled="!aplicarMesAviso" />
    </FormGroup>
    <FormGroup :control="formColaborador.controls.descuentoAfc" label="Descuento AFC">
      <InputNumber v-model="formColaborador.controls.descuentoAfc.value" :min="0" :required="afcRequerido(formColaborador.controls.causalTermino.value)" :disabled="!afcRequerido(formColaborador.controls.causalTermino.value)"/>
      <small v-if="afcRequerido(formColaborador.controls.causalTermino.value) && formColaborador.controls.descuentoAfc.value==null" class="text-yellow-600">⚠️ Debe ingresar el descuento AFC.</small>
    </FormGroup>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import FormGroup from '../../components/FormGroup.vue';
import { EssentialForm } from '../../shared/classes/EssentialForm';
import { useGlobalStore } from '../../store/global';
import { useStepperStore } from './steperSstore';
import { getCausalesTermino, CausalTermino } from './causalesTerminoRepository';
import { getCargos162 } from '../../repository/colaboradoresRepository';
const props = defineProps<{ persona: any }>();
const emit = defineEmits(['onValid']);
const global = useGlobalStore();
const cargos162 = ref<number[]>([]);
const formatDate = (fecha: string) => { 
  const date = new Date(fecha+ 'T00:00:00');
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
const causalSelected = ref<CausalTermino | null>(null);
// Definición del formulario local con EssentialForm
const formColaborador = ref<EssentialForm>(
  global.sstForm({
    fecha_ingreso_date: global.sstFormControl(formatDate(props.persona.fecha_ingreso_date), []),
    fecha_desvinculacion: global.sstFormControl(props.persona.form.fecha_desvinculacion, [global.sstRule.REQUIRED]),
    causalTermino: global.sstFormControl(props.persona.form.causalTermino, [global.sstRule.REQUIRED]),
    descuentoAfc: global.sstFormControl(props.persona.form.descuentoAfc, []),
    letraCausal: global.sstFormControl(props.persona.form.letraCausal, []),
    mesAviso: global.sstFormControl(false, []),
    tipo_solicitud: global.sstFormControl(props.persona.form.tipo_solicitud, [global.sstRule.REQUIRED]),
  })
);

const aplicarMesAviso = computed(() => causalSelected.value?.causal_termino === '161-1');

//Causales de termino
const causalOptions = ref<CausalTermino[]>([]);
onMounted(async () => {
  formColaborador.value.applyWatchers();
  const causalTermino = await getCausalesTermino();
  const externalCodes = await getCargos162();
  cargos162.value= externalCodes.map((externalCode: any) => externalCode.external_code);
  causalOptions.value = causalTermino.filter((causal) => {
    if (props.persona.external_cod_tipo_contrato ==='01') {
      if(cargos162.value.includes(props.persona.external_cod_cargo)) {
        return causal.causal_termino !== '159-5'
      }else{
        return causal.causal_termino !== '159-5' && causal.causal_termino !== '161-2'
      }
    } else if (props.persona.external_cod_tipo_contrato === '02') {
      return causal.causal_termino !== '161-1' && causal.causal_termino !== '161-2' && causal.causal_termino !== '159-5'
    } else {
      return causal.causal_termino !== '161-1' && causal.causal_termino !== '161-2'
    }
  }) || [] ;
});
watch(() => causalSelected.value, (val) => {
  if (!val) return;
  formColaborador.value.controls.causalTermino.value = val.causal_termino;
  formColaborador.value.controls.letraCausal.value = val.letra??'';
  if (!(causalSelected.value?.causal_termino === '161-1')) {
    formColaborador.value.controls.mesAviso.value = false;
  }
});
watch(formColaborador, (val) => {
  emit('onValid', val.validateAll());
  stepperStore.updatePersonaFormById(props.persona.user_id, {
    ...props.persona,
    form: formColaborador.value.value()
  });
}, { deep: true });

function afcRequerido(causal: string) {
  const causalesRequeridos = ['159-5','161-1', '161-2'];
  if (causalesRequeridos.includes(causal)) return true;
  return false;
}

const stepperStore = useStepperStore();

function validateAndSync() {
  const isValid = formColaborador.value.validateAll();
  if (isValid) {
    stepperStore.updatePersonaFormById(props.persona.user_id, {
      ...props.persona,
      form: formColaborador.value.value()
    });
  }
  return isValid;
}

defineExpose({
  validate: ()=>formColaborador.value.validateAll(),
  values:() => formColaborador.value.value()
});
</script>

<style scoped>
.form-colaborador {
  width: 100%;
  display: flex;
  align-items: start;
  justify-content: space-around;
  gap: 1rem;
  box-sizing: border-box
}

:v-deep(.p-accordion.p-accordion-content) {
  width: 100%;
}
</style>


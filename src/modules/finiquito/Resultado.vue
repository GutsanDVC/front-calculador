<template>
    <DataTable :value="finiquitos" dataKey="np" scrollable :scrollHeight="scrollHeight" tableStyle="
     width: 78vw" ref="table">
    <!-- Agrupación de columnas -->
      <ColumnGroup type="header">
        <Row>
          <Column header="Datos de entrada" :colspan="11" headerClass="header-datos"/>
          <Column header="Resultado" :colspan="9" headerClass="header-result" />
        </Row>
        <Row>
          <Column header="NP" headerClass="header-datos"/>
          <Column header="RUT" headerClass="header-datos"/>
          <Column header="Nombre" headerClass="header-datos"/>
          <Column header="Apellido" headerClass="header-datos"/>
          <Column header="Años de servicio" headerClass="header-datos"/>
          <Column header="Tiempo de servicio" headerClass="header-datos"/>
          <Column header="Saldo en días" headerClass="header-datos"/>
          <Column header="Días inhabiles" headerClass="header-datos"/>
          <Column header="Total días" headerClass="header-datos"/>
          <Column header="Base indemnizaciones" headerClass="header-datos"/>
          <Column header="Base vacaciones" headerClass="header-datos"/>
          <Column header="Indemnización Años de Servicio(IAS)" headerClass="header-result"/>
          <Column header="Mes de Aviso(ISAP)" headerClass="header-result"/>
          <Column header="Indemnización Tiempo de servicio(ITS)" headerClass="header-result"/>
          <Column header="Pago Vacaciones(IVAC)" headerClass="header-result"/>
          <Column header="Descuento AFC" headerClass="header-result"/>
          <Column header="Total finiquito" headerClass="header-result"/>
          <Column header="Fecha de desvinculación" headerClass="header-result"/>
          <Column header="Causal" headerClass="header-result"/>
          <Column header="Letra causal" headerClass="header-result"/>
        </Row>
      </ColumnGroup>
      <Column field="np" header="NP" headerClass="header-datos"/>
      <Column field="national_id" header="RUT" style="min-width: 100px">
        <template #body="{ data }">
          {{ formatRut(data.national_id) }}
        </template>
      </Column>
      <Column field="first_name" header="Nombre" style="min-width: 100px"/>
      <Column field="last_name" header="Apellido" style="min-width: 100px"/>
      <Column field="anios_servicio" header="Años de servicio" style="min-width: 80px"/>
      <Column field="tiempo_servido" header="Tiempo de servicio" style="min-width: 80px"/>
      <Column field="saldo_en_dias" header="Saldo en días" style="min-width: 80px">
        <template #body="{ data }">
          {{ formatNumber(Number(data.saldo_en_dias)) }}
        </template>
      </Column>
      <Column field="dias_inhabiles" header="Días inhabiles" style="min-width: 100px">
        <template #body="{ data }">
          {{ formatNumber(Number(data.dias_inhabiles)) }}
        </template>
      </Column>
      <Column field="total_dias" header="Total días" style="min-width: 100px">
        <template #body="{ data }">
          {{ formatNumber(Number(data.total_dias)) }}
        </template>
      </Column>
      <Column field="base_indemnizaciones" header="Base indemnizaciones" style="min-width: 100px">
        <template #body="{ data }">
          {{ formatMoney(Number(data.base_indemnizaciones), CurrencyEnum.CLP, LocaleEnum.ES) }}
        </template>
      </Column>
      <Column field="base_vacaciones" header="Base vacaciones" style="min-width: 100px">
        <template #body="{ data }">
          {{ formatMoney(Number(data.base_vacaciones), CurrencyEnum.CLP, LocaleEnum.ES) }}
        </template>
      </Column>
      <Column field="ias" header="Indemnización Años de Servicio(IAS)" style="min-width: 100px">
        <template #body="{ data }">
          {{ formatMoney(Number(data.ias), CurrencyEnum.CLP, LocaleEnum.ES) }}
        </template>
      </Column>
      <Column field="isap" header="Mes de Aviso(ISAP)" style="min-width: 100px">
        <template #body="{ data }">
          {{ formatMoney(Number(data.isap), CurrencyEnum.CLP, LocaleEnum.ES) }}
        </template>
      </Column>
      <Column field="its" header="Indemnización Tiempo de servicio(ITS)" style="min-width: 100px">
        <template #body="{ data }">
          {{ formatMoney(Number(data.its), CurrencyEnum.CLP, LocaleEnum.ES) }}
        </template>
      </Column>
      <Column field="ivac" header="Pago Vacaciones(IVAC)" style="min-width: 100px">
        <template #body="{ data }">
          {{ formatMoney(Number(data.ivac), CurrencyEnum.CLP, LocaleEnum.ES) }}
        </template>
      </Column>
      <Column field="descuento_afc" header="Descuento AFC" style="min-width: 100px" class="negative">
        <template #body="{ data }">
          <span v-if="data.descuento_afc" class="negative">{{ formatMoney(Number(data.descuento_afc??0), CurrencyEnum.CLP, LocaleEnum.ES) }}</span>
          <span v-else>0</span>
        </template>
      </Column>
      <Column field="total_finiquito" header="Total finiquito" style="min-width: 100px">
        <template #body="{ data }">
          {{ formatMoney(Number(data.total_finiquito), CurrencyEnum.CLP, LocaleEnum.ES) }}
        </template>
      </Column>
      <Column field="fecha_desvinculacion" header="Fecha de desvinculación" style="min-width: 100px">
        <template #body="{ data }">
          {{ formatDate(new Date(data.fecha_desvinculacion), LocaleEnum.ES) }}
        </template>
      </Column>
      <Column field="causal" header="Causal" style="min-width: 100px"/>
      <Column field="letra_causal" header="Letra causal" style="min-width: 100px"/>
      <!-- <Column field="fecha_inset" header="Fecha de inset" style="min-width: 100px">
        <template #body="{ data }">
          {{ formatDate(new Date(data.fecha_inset), LocaleEnum.ES) }}
        </template>
      </Column> -->
    </DataTable>
    <footer class="foot-buttons">
      <Button label="Inicio" @click="goHome" outlined />
      <Button label="Anterior" @click="prevStep" outlined />
      <Button label="Exportar" icon="pi pi-file-excel" severity='success' @click="exportar" />
    </footer>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useStepperStore } from './steperSstore';
import { Utilities } from '../../shared/classes/Utilities';
import { CurrencyEnum } from '../../shared/enums/currency.enum';
import { LocaleEnum } from '../../shared/enums/locale.enum';

const formatRut = Utilities.formatRut;
const formatNumber = Utilities.formatNumber;
const formatMoney = Utilities.formatMoney;
const formatDate = Utilities.formatDate;
const finiquitos = computed(() => stepperStore.finiquitos);
const stepperStore = useStepperStore();

const table = ref();

const exportar = ():void => {

    Utilities.exportToExcel(finiquitos.value, 'finiquitos');
}

const prevStep = () => {
  stepperStore.prevStep();
}
const goHome = () => {
  stepperStore.goHome();
}
// Constante reactiva para almacenar el tamaño de la ventana
const windowSize = ref({ width: window.innerWidth, height: window.innerHeight });
const scrollHeight = ref('400px');
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
  scrollHeight.value = (windowSize.value.height-50) + 'px';
});

</script>
<style scoped>
.foot-buttons {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: end;
}
.negative {
  color: red;
}
</style>

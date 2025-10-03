<template>
  <div class="resultado-container">
    <!-- Vista Desktop: Tabla completa -->
    <div class="desktop-view">
      <DataTable 
        :value="finiquitos" 
        dataKey="np" 
        scrollable 
        :scrollHeight="scrollHeight" 
        class="finiquito-table"
        ref="table"
        responsiveLayout="scroll"
      >
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
            <Column header="Años servicio" headerClass="header-datos"/>
            <Column header="Tiempo servicio" headerClass="header-datos"/>
            <Column header="Saldo días" headerClass="header-datos"/>
            <Column header="Días inhábiles" headerClass="header-datos"/>
            <Column header="Total días" headerClass="header-datos"/>
            <Column header="Base indemn." headerClass="header-datos"/>
            <Column header="Base vacac." headerClass="header-datos"/>
            <Column header="IAS" headerClass="header-result"/>
            <Column header="ISAP" headerClass="header-result"/>
            <Column header="ITS" headerClass="header-result"/>
            <Column header="IVAC" headerClass="header-result"/>
            <Column header="Desc. AFC" headerClass="header-result"/>
            <Column header="Total finiquito" headerClass="header-result"/>
            <Column header="Fecha desvinc." headerClass="header-result"/>
            <Column header="Causal" headerClass="header-result"/>
            <Column header="Letra" headerClass="header-result"/>
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
      <Column field="causal" header="Causal" style="min-width: 120px"/>
      <Column field="letra_causal" header="Letra causal" style="min-width: 80px"/>
      </DataTable>
    </div>

    <!-- Vista Mobile: Cards -->
    <div class="mobile-view">
      <div class="results-header">
        <h3 class="results-title">Resultados de Finiquito</h3>
        <p class="results-count">{{ finiquitos.length }} colaborador(es)</p>
      </div>
      
      <div class="finiquito-cards">
        <div 
          v-for="finiquito in finiquitos" 
          :key="finiquito.np"
          class="finiquito-card"
        >
          <!-- Header del card -->
          <div class="card-header">
            <div class="colaborador-info">
              <h4 class="colaborador-name">{{ finiquito.first_name }} {{ finiquito.last_name }}</h4>
              <div class="colaborador-details">
                <span class="detail-item">NP: {{ finiquito.np }}</span>
                <span class="detail-item">{{ formatRut(finiquito.national_id) }}</span>
              </div>
            </div>
            <div class="total-finiquito">
              <span class="total-label">Total</span>
              <span class="total-amount">{{ formatMoney(Number(finiquito.total_finiquito), CurrencyEnum.CLP, LocaleEnum.ES) }}</span>
            </div>
          </div>

          <!-- Datos de entrada -->
          <div class="card-section">
            <h5 class="section-title">Datos de Entrada</h5>
            <div class="data-grid">
              <div class="data-item">
                <span class="data-label">Años de servicio:</span>
                <span class="data-value">{{ finiquito.anios_servicio }}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Tiempo servido:</span>
                <span class="data-value">{{ finiquito.tiempo_servido }}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Saldo en días:</span>
                <span class="data-value">{{ formatNumber(Number(finiquito.saldo_en_dias)) }}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Días inhábiles:</span>
                <span class="data-value">{{ formatNumber(Number(finiquito.dias_inhabiles)) }}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Total días:</span>
                <span class="data-value">{{ formatNumber(Number(finiquito.total_dias)) }}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Base indemnizaciones:</span>
                <span class="data-value">{{ formatMoney(Number(finiquito.base_indemnizaciones), CurrencyEnum.CLP, LocaleEnum.ES) }}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Base vacaciones:</span>
                <span class="data-value">{{ formatMoney(Number(finiquito.base_vacaciones), CurrencyEnum.CLP, LocaleEnum.ES) }}</span>
              </div>
            </div>
          </div>

          <!-- Resultados -->
          <div class="card-section">
            <h5 class="section-title">Cálculos</h5>
            <div class="data-grid">
              <div class="data-item highlight">
                <span class="data-label">IAS:</span>
                <span class="data-value">{{ formatMoney(Number(finiquito.ias), CurrencyEnum.CLP, LocaleEnum.ES) }}</span>
              </div>
              <div class="data-item highlight">
                <span class="data-label">ISAP:</span>
                <span class="data-value">{{ formatMoney(Number(finiquito.isap), CurrencyEnum.CLP, LocaleEnum.ES) }}</span>
              </div>
              <div class="data-item highlight">
                <span class="data-label">ITS:</span>
                <span class="data-value">{{ formatMoney(Number(finiquito.its), CurrencyEnum.CLP, LocaleEnum.ES) }}</span>
              </div>
              <div class="data-item highlight">
                <span class="data-label">IVAC:</span>
                <span class="data-value">{{ formatMoney(Number(finiquito.ivac), CurrencyEnum.CLP, LocaleEnum.ES) }}</span>
              </div>
              <div class="data-item negative" v-if="finiquito.descuento_afc">
                <span class="data-label">Descuento AFC:</span>
                <span class="data-value">{{ formatMoney(Number(finiquito.descuento_afc), CurrencyEnum.CLP, LocaleEnum.ES) }}</span>
              </div>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="card-section">
            <h5 class="section-title">Información Adicional</h5>
            <div class="data-grid">
              <div class="data-item">
                <span class="data-label">Fecha desvinculación:</span>
                <span class="data-value">{{ formatDate(new Date(finiquito.fecha_desvinculacion), LocaleEnum.ES) }}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Causal:</span>
                <span class="data-value">{{ finiquito.causal }}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Letra causal:</span>
                <span class="data-value">{{ finiquito.letra_causal }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <footer class="foot-buttons">
      <Button label="Inicio" @click="goHome" outlined />
      <Button label="Anterior" @click="prevStep" outlined />
      <Button label="Exportar" icon="pi pi-file-excel" severity='success' @click="exportar" />
    </footer>
  </div>
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
/* === CONTENEDOR PRINCIPAL === */
.resultado-container {
  width: 100%;
  padding: 1rem;
}

/* === VISTA DESKTOP === */
.desktop-view {
  display: block;
}

.finiquito-table {
  width: 100%;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Headers personalizados */
:deep(.header-datos) {
  background-color: #3b82f6 !important;
  color: white !important;
  font-weight: 600 !important;
  text-align: center !important;
  padding: 0.75rem 0.5rem !important;
  font-size: 0.875rem !important;
}

:deep(.header-result) {
  background-color: #059669 !important;
  color: white !important;
  font-weight: 600 !important;
  text-align: center !important;
  padding: 0.75rem 0.5rem !important;
  font-size: 0.875rem !important;
}

/* === VISTA MOBILE === */
.mobile-view {
  display: none;
}

.results-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 0.75rem;
}

.results-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.results-count {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
}

.finiquito-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.finiquito-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.finiquito-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Header del card */
.card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #e5e7eb;
}

.colaborador-info {
  flex: 1;
}

.colaborador-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.colaborador-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.detail-item {
  background-color: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.total-finiquito {
  text-align: right;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  min-width: 140px;
}

.total-label {
  display: block;
  font-size: 0.75rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.total-amount {
  display: block;
  font-size: 1rem;
  font-weight: 700;
}

/* Secciones del card */
.card-section {
  padding: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.card-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.data-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.data-item:hover {
  background-color: #f3f4f6;
}

.data-item.highlight {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-left: 4px solid #059669;
}

.data-item.negative {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  border-left: 4px solid #dc2626;
}

.data-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.data-value {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  text-align: right;
}

.data-item.highlight .data-value {
  color: #059669;
}

.data-item.negative .data-value {
  color: #dc2626;
}

/* === BOTONES === */
.foot-buttons {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.negative {
  color: #dc2626;
}

/* === RESPONSIVE === */
@media (max-width: 1024px) {
  .desktop-view {
    display: block;
  }
  
  .mobile-view {
    display: none;
  }
  
  .finiquito-table {
    font-size: 0.8rem;
  }
  
  :deep(.header-datos),
  :deep(.header-result) {
    font-size: 0.75rem !important;
    padding: 0.5rem 0.25rem !important;
  }
}

@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }
  
  .mobile-view {
    display: block;
  }
  
  .resultado-container {
    padding: 0.5rem;
  }
  
  .data-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .total-finiquito {
    text-align: center;
    min-width: auto;
  }
  
  .foot-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .foot-buttons :deep(.p-button) {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .results-header {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .results-title {
    font-size: 1.25rem;
  }
  
  .finiquito-card {
    border-radius: 0.75rem;
  }
  
  .card-header,
  .card-section {
    padding: 1rem;
  }
  
  .colaborador-name {
    font-size: 1rem;
  }
  
  .colaborador-details {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .data-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .data-value {
    text-align: left;
    font-size: 1rem;
  }
}

/* === MEJORAS ADICIONALES === */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem 0.5rem;
  font-size: 0.875rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.75rem 0.5rem;
  font-size: 0.875rem;
}

:deep(.p-datatable-scrollable .p-datatable-wrapper) {
  border-radius: 0.75rem;
}

/* Scroll personalizado */
:deep(.p-datatable-wrapper::-webkit-scrollbar) {
  height: 8px;
}

:deep(.p-datatable-wrapper::-webkit-scrollbar-track) {
  background: #f1f5f9;
  border-radius: 4px;
}

:deep(.p-datatable-wrapper::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 4px;
}

:deep(.p-datatable-wrapper::-webkit-scrollbar-thumb:hover) {
  background: #94a3b8;
}
</style>

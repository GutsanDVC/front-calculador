<template>
  <div class="bruto-calculator">
    <!-- Contenido principal -->
    <div class="calculator-content">
      <div class="calculator-grid">
        <!-- Panel izquierdo - Formulario -->
        <div class="form-panel">
          <h2 class="form-title">Sueldo Bruto</h2>
          
          <!-- Sueldo líquido deseado -->
          <div class="form-section">
            <label class="field-label">Sueldo líquido deseado</label>
            <input
              v-model="sueldoLiquidoFormateado"
              type="text"
              class="form-input"
              placeholder="Ingrese el sueldo líquido deseado"
              @input="onSueldoLiquidoInput"
              @blur="formatSueldoLiquido"
            />
          </div>

          <!-- Tipo de contrato (siempre indefinido) -->
          <!-- <div class="form-section">
            <label class="field-label">Tipo de contrato</label>
            <input
              v-model="tipoContratoLabel"
              type="text"
              class="form-input"
              readonly
              disabled
            />
          </div> -->

          <!-- AFP -->
          <div class="form-section">
            <label class="field-label">AFP</label>
            <div class="select-wrapper">
              <select v-model="formData.afp" class="form-select">
                <option value="">Seleccionar AFP</option>
                <option
                  v-for="option in afpOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <i class="pi pi-chevron-down select-icon"></i>
            </div>
          </div>

          <!-- Previsión (siempre Fonasa) -->
          <div class="form-section">
            <label class="field-label">Previsión</label>
            <input
              v-model="previsionLabel"
              type="text"
              class="form-input"
              readonly
              disabled
            />
          </div>

          <!-- Gratificación (siempre activa) -->
          <div class="form-section">
            <label class="field-label">Gratificación</label>
            <input
              v-model="gratificacionLabel"
              type="text"
              class="form-input"
              readonly
              disabled
            />
            
            <!-- Tope de gratificación -->
            <div class="gratificacion-tope-info">
              <small class="tope-text">
                <i class="pi pi-info-circle"></i>
                Tope máximo mensual: {{ formatCurrency(GRATIFICACION_TOPE) }} (4.75 x Ingreso Mínimo Mensual/12)
              </small>
            </div>
          </div>

          <!-- Colación -->
          <div class="form-section">
            <label class="field-label">Colación</label>
            <input
              v-model="colacionFormatted"
              type="text"
              class="form-input"
              placeholder="Monto automático"
              readonly
              disabled
            />
          </div>

          <!-- Movilización -->
          <div class="form-section">
            <label class="field-label">Movilización</label>
            <input
              v-model="movilizacionFormatted"
              type="text"
              class="form-input"
              placeholder="Monto automático"
              readonly
              disabled
            />
          </div>

          <!-- Información de rangos -->
          <div class="form-section">
            <div v-if="isLoadingRangos" class="loading-rangos">
              <i class="pi pi-spin pi-spinner"></i>
              <small>Cargando rangos...</small>
            </div>
            
            <div v-else-if="rangosError" class="error-rangos">
              <i class="pi pi-exclamation-triangle"></i>
              <small>{{ rangosError }}</small>
            </div>
            
            <div v-else-if="rangosAsignaciones.length > 0" class="rangos-info">
              <small class="rangos-title">
                <i class="pi pi-info-circle"></i>
                Rangos de asignaciones según sueldo líquido:
              </small>
              <div class="rangos-list">
                <div 
                  v-for="rango in rangosAsignaciones" 
                  :key="`${rango.minimo}-${rango.maximo}`"
                  class="rango-item"
                >
                  <span class="rango-sueldo">
                    {{ formatCurrency(rango.minimo) }} - 
                    {{ rango.maximo === Infinity || rango.maximo >= 999999999 ? 'o más' : formatCurrency(rango.maximo) }}:
                  </span>
                  <span class="rango-monto">
                    {{ formatCurrency(rango.colacion) }} c/u
                  </span>
                </div>
              </div>
            </div>
          </div>


          <!-- Botón calcular -->
          <div class="form-section">
            <button
              class="calculate-button"
              @click="calcular"
              :disabled="!canCalculate || isCalculating"
            >
              <i v-if="isCalculating" class="pi pi-spin pi-spinner"></i>
              {{ isCalculating ? 'Calculando...' : 'Calcular' }}
            </button>
          </div>
        </div>

        <!-- Panel derecho - Resultados -->
        <div class="results-panel">
          <!-- Loading durante cálculo -->
          <div v-if="isCalculating" class="loading-results">
            <DotLoader msg="Calculando sueldo bruto..." />
          </div>
          
          <div v-else-if="calculationResult" class="results-content">
            <!-- Resultados principales -->
            <div class="results-grid">
              <div class="result-card">
                <div class="result-label">Sueldo Base</div>
                <div class="result-amount">{{ formatCurrency(calculationResult.haberes.sueldo_base) }}</div>
              </div>
              <div class="result-card">
                <div class="result-label">Total Haberes</div>
                <div class="result-amount">{{ formatCurrency(calculationResult.haberes['Total haberes']) }}</div>
              </div>
              <div class="result-card">
                <div class="result-label">Total Descuentos</div>
                <div class="result-amount">{{ formatCurrency(calculationResult.deberes['Total descuentos']) }}</div>
              </div>
            </div>

            <!-- Detalle de Haberes y Descuentos -->
            <div class="details-section">
              <h3 class="section-title">Detalle</h3>
              
              <div class="details-grid">
                <!-- Haberes -->
                <div class="details-column">
                  <h4 class="column-title">Haberes</h4>
                  <div class="detail-items">
                    <div class="detail-item">
                      <span class="detail-label">Sueldo Base:</span>
                      <span class="detail-amount">{{ formatCurrency(calculationResult.haberes.sueldo_base) }}</span>
                    </div>
                    <div v-if="calculationResult.haberes.gratificacion > 0" class="detail-item">
                      <span class="detail-label">Gratificación:</span>
                      <span class="detail-amount">{{ formatCurrency(calculationResult.haberes.gratificacion) }}</span>
                    </div>
                    <div v-if="calculationResult.haberes.asignacion_familiar > 0" class="detail-item">
                      <span class="detail-label">Asignación Familiar:</span>
                      <span class="detail-amount">{{ formatCurrency(calculationResult.haberes.asignacion_familiar) }}</span>
                    </div>
                    <div v-if="calculationResult.haberes.asignacion_colacion > 0" class="detail-item">
                      <span class="detail-label">Colación:</span>
                      <span class="detail-amount">{{ formatCurrency(calculationResult.haberes.asignacion_colacion) }}</span>
                    </div>
                    <div v-if="calculationResult.haberes.asignacion_transporte > 0" class="detail-item">
                      <span class="detail-label">Movilización:</span>
                      <span class="detail-amount">{{ formatCurrency(calculationResult.haberes.asignacion_transporte) }}</span>
                    </div>
                    <div v-if="calculationResult.haberes.asignacion_otros > 0" class="detail-item">
                      <span class="detail-label">Otros:</span>
                      <span class="detail-amount">{{ formatCurrency(calculationResult.haberes.asignacion_otros) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Descuentos -->
                <div class="details-column">
                  <h4 class="column-title">Descuentos</h4>
                  <div class="detail-items">
                    <div class="detail-item">
                      <span class="detail-label">AFP:</span>
                      <span class="detail-amount">{{ formatCurrency(calculationResult.deberes.descuento_afp) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Salud:</span>
                      <span class="detail-amount">{{ formatCurrency(calculationResult.deberes.descuento_salud) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Cesantía:</span>
                      <span class="detail-amount">{{ formatCurrency(calculationResult.deberes.descuento_cesantia) }}</span>
                    </div>
                    <div v-if="calculationResult.deberes.impuesto > 0" class="detail-item">
                      <span class="detail-label">Impuesto:</span>
                      <span class="detail-amount">{{ formatCurrency(calculationResult.deberes.impuesto) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Resultado final -->
              <div class="final-result">
                <div class="final-result-item">
                  <span class="final-label">Sueldo Líquido Obtenido:</span>
                  <span class="final-amount">{{ formatCurrency(calculationResult.sueldo_liquido) }}</span>
                </div>
                <div v-if="calculationResult.calculo_inverso" class="convergence-info">
                  <small class="convergence-text">
                    Convergencia: {{ calculationResult.calculo_inverso.convergencia_exitosa ? 'Exitosa' : 'No exitosa' }}
                    ({{ calculationResult.calculo_inverso.iteraciones_realizadas }} iteraciones)
                    - Diferencia: {{ formatCurrency(Math.abs(calculationResult.calculo_inverso.diferencia_final)) }}
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado vacío -->
          <div v-else-if="!isCalculating" class="empty-results">
            <i class="pi pi-calculator empty-icon"></i>
            <p class="empty-message">Complete los campos y presione "Calcular" para ver los resultados</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensajes de error -->
    <div v-if="calculationError" class="error-toast">
      <i class="pi pi-exclamation-triangle"></i>
      {{ calculationError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Importaciones del módulo
import { 
  CalculoSueldoBrutoRequest, 
  CalculoSueldoBrutoResponse 
} from '../Types/bruto.interface';
import { 
  TIPO_CONTRATO_OPTIONS,
  AFP_OPTIONS,
  PREVISION_OPTIONS,
  GRATIFICACION_OPTIONS,
  BRUTO_CONSTANTS,
  GRATIFICACION_TOPE
} from '../Constants/bruto.constants';
import { calcularSueldoBrutoDesdeNeto } from '../Repositories/brutoRepository';
import { formatCurrency, formatNumber } from '../Constants/brutoCalculations';
import { obtenerRangosColacionMovilizacion, RangoColacionMovilizacion } from '../Services/rangosService';

// Componentes
import DotLoader from '../../../components/DotLoader.vue';

// Composables
const router = useRouter();

// Estado para los rangos dinámicos
const rangosAsignaciones = ref<RangoColacionMovilizacion[]>([]);
const isLoadingRangos = ref(false);
const rangosError = ref('');

// Estado reactivo

// Opciones para selects
const tipoContratoOptions = ref(TIPO_CONTRATO_OPTIONS);
const afpOptions = ref(AFP_OPTIONS);
const previsionOptions = ref(PREVISION_OPTIONS);
const gratificacionOptions = ref(GRATIFICACION_OPTIONS);

// Datos del formulario
const formData = ref({
  sueldoLiquidoDeseado: 0,
  tipoContrato: 1, // Siempre indefinido (valor 1)
  afp: '',
  prevision: 'Fonasa', // Siempre Fonasa
  planIsapre: 0,
  tieneGratificacion: true, // Siempre con gratificación
  gratificacion: 0,
  asignacionColacion: 0, // Se calcula dinámicamente
  asignacionTransporte: 0, // Se calcula dinámicamente
  asignacionFamiliar: 0, // Eliminado pero mantenido para compatibilidad
  tolerancia: 1,
  maxIteraciones: 100
});

// Variables para formateo de inputs
const sueldoLiquidoFormateado = ref('');
const planIsapreFormateado = ref('');

// Estados de cálculo
const isCalculating = ref(false);
const calculationResult = ref<CalculoSueldoBrutoResponse | null>(null);
const calculationError = ref('');

// Función para obtener asignaciones según el sueldo
const getAsignacionesPorSueldo = (sueldo: number) => {
  const rango = rangosAsignaciones.value.find(r => sueldo >= r.minimo && sueldo <= r.maximo);
  return rango || (rangosAsignaciones.value.length > 0 ? rangosAsignaciones.value[0] : { colacion: 0, movilizacion: 0, minimo: 0, maximo: 0 });
};

// Computed properties
const tipoContratoLabel = computed(() => 'Indefinido');
const previsionLabel = computed(() => 'Fonasa');
const gratificacionLabel = computed(() => 'Sí');

const asignacionesActuales = computed(() => {
  return getAsignacionesPorSueldo(formData.value.sueldoLiquidoDeseado);
});

const colacionFormatted = computed(() => {
  return formatCurrency(asignacionesActuales.value.colacion);
});

const movilizacionFormatted = computed(() => {
  return formatCurrency(asignacionesActuales.value.movilizacion);
});

// Validación para habilitar el botón calcular
const canCalculate = computed(() => {
  return formData.value.sueldoLiquidoDeseado > 0 && 
         formData.value.afp !== '';
});


// Funciones para formateo de números
const formatNumberWithThousands = (value: number): string => {
  return new Intl.NumberFormat('es-CL').format(value);
};

const parseFormattedNumber = (value: string): number => {
  return parseInt(value.replace(/\./g, '')) || 0;
};

// Funciones para manejo de inputs con separador de miles
const onSueldoLiquidoInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const numericValue = parseFormattedNumber(target.value);
  formData.value.sueldoLiquidoDeseado = numericValue;
  
  // Actualizar asignaciones según el nuevo sueldo
  const asignaciones = getAsignacionesPorSueldo(numericValue);
  formData.value.asignacionColacion = asignaciones.colacion;
  formData.value.asignacionTransporte = asignaciones.movilizacion;
};

const formatSueldoLiquido = () => {
  if (formData.value.sueldoLiquidoDeseado > 0) {
    sueldoLiquidoFormateado.value = formatNumberWithThousands(formData.value.sueldoLiquidoDeseado);
  }
};

const onPlanIsapreInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const numericValue = parseFormattedNumber(target.value);
  formData.value.planIsapre = numericValue;
};

const formatPlanIsapre = () => {
  if (formData.value.planIsapre > 0) {
    planIsapreFormateado.value = formatNumberWithThousands(formData.value.planIsapre);
  }
};


// Función principal de cálculo
const calcular = async () => {
  if (!canCalculate.value) return;
  
  isCalculating.value = true;
  calculationError.value = '';
  
  try {
    // Preparar datos para la API
    const requestData: CalculoSueldoBrutoRequest = {
      sueldo_liquido_deseado: formData.value.sueldoLiquidoDeseado,
      tipo_contrato: formData.value.tipoContrato, // Siempre 1 (indefinido)
      afp: formData.value.afp,
      salud: formData.value.prevision,
      plan_isapre: formData.value.prevision === 'Isapre' ? formData.value.planIsapre : undefined,
      gratificacion: formData.value.tieneGratificacion,
      asignacion_familiar: 0, // Eliminado
      asignacion_colacion: formData.value.asignacionColacion,
      asignacion_transporte: formData.value.asignacionTransporte,
      asignacion_otros: 0,
      tolerancia: formData.value.tolerancia,
      max_iteraciones: formData.value.maxIteraciones
    };

    const result = await calcularSueldoBrutoDesdeNeto(requestData);
    calculationResult.value = result;
    
  } catch (error: any) {
    calculationError.value = error.message || 'Error al realizar el cálculo';
    setTimeout(() => calculationError.value = '', 5000);
  } finally {
    isCalculating.value = false;
  }
};

// Función para cargar rangos desde la API
const cargarRangos = async () => {
  isLoadingRangos.value = true;
  rangosError.value = '';
  
  try {
    const rangos = await obtenerRangosColacionMovilizacion();
    rangosAsignaciones.value = rangos;
    
    // Inicializar asignaciones con el primer rango si hay datos
    if (rangos.length > 0) {
      const asignacionesIniciales = rangos[0];
      formData.value.asignacionColacion = asignacionesIniciales.colacion;
      formData.value.asignacionTransporte = asignacionesIniciales.movilizacion;
    }
  } catch (error: any) {
    rangosError.value = error.message || 'Error al cargar los rangos';
    console.error('Error al cargar rangos:', error);
  } finally {
    isLoadingRangos.value = false;
  }
};

// Hooks del ciclo de vida
onMounted(async () => {
  // Inicializar valores por defecto
  formData.value.tieneGratificacion = true;
  formData.value.tipoContrato = 1; // Indefinido
  formData.value.prevision = 'Fonasa'; // Siempre Fonasa
  
  // Cargar rangos desde la API
  await cargarRangos();
});
</script>

<style scoped>
.bruto-calculator {
  padding: 0;
  max-width: 100%;
  margin: 0;
}

.calculator-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.calculator-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;
}

.form-panel {
  padding: 2rem;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #dc2626;
}

.form-section {
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

.form-input:disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  padding-right: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  appearance: none;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

.radio-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-input {
  margin-right: 0.5rem;
}

.radio-label {
  font-size: 0.875rem;
  color: #374151;
}

.isapre-amount-field,
.gratificacion-amount-field {
  margin-top: 1rem;
}

.gratificacion-tope-info {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background-color: #eff6ff;
  border-radius: 0.375rem;
  border-left: 3px solid #3b82f6;
}

.tope-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #1e40af;
  font-weight: 500;
}

.tope-text i {
  color: #3b82f6;
}

.rangos-info {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: #f0f9ff;
  border-radius: 0.375rem;
  border-left: 3px solid #0ea5e9;
}

.rangos-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #0c4a6e;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.rangos-title i {
  color: #0ea5e9;
}

.rangos-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rango-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
  padding: 0.25rem 0;
}

.rango-sueldo {
  color: #475569;
  font-weight: 500;
}

.rango-monto {
  color: #0c4a6e;
  font-weight: 600;
}

.loading-rangos {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fef3c7;
  border-radius: 0.375rem;
  border-left: 3px solid #f59e0b;
}

.loading-rangos small {
  color: #92400e;
  font-weight: 500;
}

.loading-rangos i {
  color: #f59e0b;
}

.error-rangos {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fef2f2;
  border-radius: 0.375rem;
  border-left: 3px solid #ef4444;
}

.error-rangos small {
  color: #dc2626;
  font-weight: 500;
}

.error-rangos i {
  color: #ef4444;
}

.calculate-button {
  width: 100%;
  padding: 1rem;
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
  justify-content: center;
  gap: 0.5rem;
}

.calculate-button:hover:not(:disabled) {
  background-color: #b91c1c;
}

.calculate-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.results-panel {
  padding: 2rem;
  background-color: #f9fafb;
}

.results-content {
  height: 100%;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.result-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.result-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.result-amount {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.details-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.column-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.detail-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.detail-amount {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
}

.final-result {
  border-top: 2px solid #e5e7eb;
  padding-top: 1rem;
}

.final-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.final-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.final-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
}

.convergence-info {
  margin-top: 0.5rem;
}

.convergence-text {
  font-size: 0.75rem;
  color: #6b7280;
}

.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-message {
  font-size: 1rem;
  max-width: 300px;
}

.error-toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background-color: #fef2f2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1001;
}

.loading-results {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

/* Responsive */
@media (max-width: 768px) {
  .calculator-grid {
    grid-template-columns: 1fr;
  }
  
  .form-panel {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

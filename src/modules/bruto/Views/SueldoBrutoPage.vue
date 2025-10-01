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
              v-model.number="formData.sueldoLiquidoDeseado"
              type="number"
              class="form-input"
              placeholder="Ingrese el sueldo líquido deseado"
              min="0"
              step="1000"
            />
          </div>

          <!-- Tipo de contrato -->
          <div class="form-section">
            <label class="field-label">Tipo de contrato</label>
            <div class="select-wrapper">
              <select v-model="formData.tipoContrato" class="form-select">
                <option value="">Seleccionar tipo de contrato</option>
                <option
                  v-for="option in tipoContratoOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <i class="pi pi-chevron-down select-icon"></i>
            </div>
          </div>

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

          <!-- Previsión -->
          <div class="form-section">
            <label class="field-label">Previsión</label>
            <div class="select-wrapper">
              <select v-model="formData.prevision" class="form-select" @change="onPrevisionChange">
                <option value="">Seleccionar previsión</option>
                <option
                  v-for="option in previsionOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <i class="pi pi-chevron-down select-icon"></i>
            </div>
            
            <!-- Campo condicional para monto Isapre -->
            <div v-if="formData.prevision === 'Isapre'" class="isapre-amount-field">
              <label class="field-label">Monto plan Isapre</label>
              <input
                v-model.number="formData.planIsapre"
                type="number"
                class="form-input"
                placeholder="Ingrese el monto del plan"
                min="0"
                step="1000"
              />
            </div>
          </div>

          <!-- Gratificación -->
          <div class="form-section">
            <label class="field-label">Gratificación</label>
            <div class="radio-group">
              <label
                v-for="option in gratificacionOptions"
                :key="option.label"
                class="radio-option"
              >
                <input
                  v-model="formData.tieneGratificacion"
                  type="radio"
                  :value="option.value"
                  class="radio-input"
                />
                <span class="radio-label">{{ option.label }}</span>
              </label>
            </div>
            
          </div>

          <!-- Colación -->
          <div class="form-section">
            <label class="field-label">Colación</label>
            <input
              v-model.number="formData.asignacionColacion"
              type="number"
              class="form-input"
              placeholder="Monto de colación"
              min="0"
              step="1000"
            />
          </div>

          <!-- Transporte -->
          <div class="form-section">
            <label class="field-label">Transporte</label>
            <input
              v-model.number="formData.asignacionTransporte"
              type="number"
              class="form-input"
              placeholder="Monto de transporte"
              min="0"
              step="1000"
            />
          </div>

          <!-- Asignación Familiar -->
          <div class="form-section">
            <label class="field-label">Asignación Familiar</label>
            <input
              v-model.number="formData.asignacionFamiliar"
              type="number"
              class="form-input"
              placeholder="Monto de asignación familiar"
              min="0"
              step="1000"
            />
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
                      <span class="detail-label">Transporte:</span>
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
  BRUTO_CONSTANTS
} from '../Constants/bruto.constants';
import { calcularSueldoBrutoDesdeNeto } from '../Repositories/brutoRepository';
import { formatCurrency, formatNumber } from '../Constants/brutoCalculations';

// Componentes
import DotLoader from '../../../components/DotLoader.vue';

// Composables
const router = useRouter();

// Estado reactivo

// Opciones para selects
const tipoContratoOptions = ref(TIPO_CONTRATO_OPTIONS);
const afpOptions = ref(AFP_OPTIONS);
const previsionOptions = ref(PREVISION_OPTIONS);
const gratificacionOptions = ref(GRATIFICACION_OPTIONS);

// Datos del formulario
const formData = ref({
  sueldoLiquidoDeseado: 0,
  tipoContrato: '',
  afp: '',
  prevision: '',
  planIsapre: 0,
  tieneGratificacion: false,
  gratificacion: 0,
  asignacionColacion: 0,
  asignacionTransporte: 0,
  asignacionFamiliar: 0,
  tolerancia: 100,
  maxIteraciones: 100
});

// Estados de cálculo
const isCalculating = ref(false);
const calculationResult = ref<CalculoSueldoBrutoResponse | null>(null);
const calculationError = ref('');

// Validación para habilitar el botón calcular
const canCalculate = computed(() => {
  return formData.value.sueldoLiquidoDeseado > 0 && 
         formData.value.tipoContrato !== '' && 
         formData.value.afp !== '' && 
         formData.value.prevision !== '' &&
         (!formData.value.prevision || formData.value.prevision === 'Fonasa' || 
          (formData.value.prevision === 'Isapre' && formData.value.planIsapre > 0));
});


// Función para manejar cambio de previsión
const onPrevisionChange = () => {
  if (formData.value.prevision !== 'Isapre') {
    formData.value.planIsapre = 0;
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
      tipo_contrato: Number(formData.value.tipoContrato),
      afp: formData.value.afp,
      salud: formData.value.prevision,
      plan_isapre: formData.value.prevision === 'Isapre' ? formData.value.planIsapre : undefined,
      gratificacion: formData.value.tieneGratificacion ,
      asignacion_familiar: formData.value.asignacionFamiliar || 0,
      asignacion_colacion: formData.value.asignacionColacion || 0,
      asignacion_transporte: formData.value.asignacionTransporte || 0,
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

// Hooks del ciclo de vida
onMounted(() => {
  // Inicialización si es necesaria
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

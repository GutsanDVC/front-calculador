<template>
  <div class="bruto-calculator">
    <!-- Contenido principal -->
    <div class="calculator-content">
      <div class="calculator-grid">
        <!-- Panel izquierdo - Formulario -->
        <div class="form-panel">
          <div class="form-section">
            <h3 class="form-title">Calculador Bono Sábados</h3>
            
            <!-- Selector de colaborador -->
            <div class="form-field">
              <label class="field-label">Colaborador</label>
              <div class="input-group">
                <input
                  v-model="selectedColaboradorDisplay"
                  type="text"
                  class="form-input readonly-input"
                  placeholder="Seleccionar colaborador"
                  readonly
                />
                <button
                  class="search-button"
                  @click="openSearchModal"
                  :disabled="isCalculating"
                >
                  <i class="pi pi-search"></i>
                </button>
              </div>
            </div>

            <!-- Información del colaborador seleccionado -->
            <div v-if="selectedColaborador" class="colaborador-info">
              <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">{{ selectedColaborador.first_name }} {{ selectedColaborador.last_name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Centro Gestión:</span>
                <span class="info-value">{{ selectedColaborador.centro_costo }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Cargo:</span>
                <span class="info-value">{{ selectedColaborador.nombre_cargo }}</span>
              </div>
              <div v-if="compensacionColaborador" class="info-row">
                <span class="info-label">Sueldo Base:</span>
                <span class="info-value">{{ formatCurrency(compensacionColaborador.sueldo_base) }}</span>
              </div>
            </div>
          </div>

          <!-- Campos de entrada -->
          <div class="form-section">
            <div class="form-field">
              <label class="field-label">Valor de Hora extra (líquido)</label>
              <div class="input-group">
                <input
                  :value="formatCurrency(formData.valorHoraExtra)"
                  type="text"
                  class="form-input readonly-input"
                  placeholder="Seleccione un colaborador"
                  readonly
                />
                <div v-if="isLoadingCompensacion" class="loading-indicator">
                  <i class="pi pi-spin pi-spinner"></i>
                </div>
              </div>
              <small v-if="compensacionError" class="field-error">
                <i class="pi pi-exclamation-triangle"></i>
                {{ compensacionError }}
              </small>
            </div>

            <div class="form-field">
              <label class="field-label">Horas extras Trabajadas</label>
              <input
                v-model.number="formData.horasExtrasTrabajadas"
                type="number"
                class="form-input"
                placeholder="Campo de entrada"
                :disabled="isCalculating"
              />
            </div>

            <div class="form-field">
              <label class="field-label">Monto bono Pactado</label>
              <input
                v-model.number="formData.montoBonoPactado"
                type="number"
                class="form-input"
                placeholder="Campo de entrada"
                :disabled="isCalculating"
              />
            </div>

            <!-- AFP -->
            <div class="form-field">
              <label class="field-label">AFP</label>
              <div class="select-wrapper">
                <select v-model="formData.afp" class="form-select" :disabled="isCalculating">
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
            <DotLoader msg="Calculando bono sábados..." />
          </div>
          
          <div v-else-if="calculationResult" class="results-content">
            <!-- Resultados principales -->
            <div class="results-grid">
              <div class="result-card">
                <div class="result-label">Bono Pactado Líquido</div>
                <div class="result-amount">{{ formatCurrency(calculationResult.bonoPactadoLiquido) }}</div>
              </div>
              <div class="result-card">
                <div class="result-label">Diferencia Líquida</div>
                <div class="result-amount">{{ formatCurrency(calculationResult.diferenciaLiquida) }}</div>
              </div>
              <div class="result-card">
                <div class="result-label">Diferencia Bruto</div>
                <div class="result-amount">
                  <i v-if="isCalculatingBruto" class="pi pi-spin pi-spinner loading-icon"></i>
                  <span v-else>{{ formatCurrency(calculationResult.diferenciaBruto) }}</span>
                </div>
              </div>
            </div>
            <!-- Desglose Liquidación -->
            <div class="liquidation-section">
              <h3 class="section-title">Desglose Liquidación</h3>
              
              <div class="liquidation-grid">
                <div class="liquidation-item">
                  <label class="liquidation-label">Monto bono Pactado</label>
                  <input
                    :value="formatNumber(calculationResult.montoBonoPactado)"
                    type="text"
                    class="liquidation-input"
                    readonly
                  />
                </div>
                
                <div class="liquidation-operator">−</div>
                
                <div class="liquidation-item">
                  <label class="liquidation-label">Monto total Horas extras</label>
                  <input
                    :value="formatNumber(calculationResult.montoTotalHorasExtras)"
                    type="text"
                    class="liquidation-input"
                    readonly
                  />
                </div>
                
                <div class="liquidation-operator">=</div>
                
                <div class="liquidation-item">
                  <label class="liquidation-label">Diferencia Líquida</label>
                  <input
                    :value="formatNumber(calculationResult.diferenciaLiquida)"
                    type="text"
                    class="liquidation-input"
                    readonly
                  />
                </div>
              </div>

              <!-- Total final -->
              <div class="total-section">
                <div class="total-label">TOTAL, BRUTO DIFERENCIA</div>
                <div class="total-input">
                  <input
                    :value="formatNumber(calculationResult.diferenciaBruto)"
                    type="text"
                    class="total-amount-input"
                    readonly
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Estado vacío -->
          <div v-else class="empty-results">
            <i class="pi pi-calculator empty-icon"></i>
            <p class="empty-message">Complete los campos y presione "Calcular" para ver los resultados</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de búsqueda de colaborador -->
    <ColaboradorSearchModal
      v-model:visible="searchModalVisible"
      @colaborador-selected="onColaboradorSelected"
    />

    <!-- Mensajes de error -->
    <div v-if="calculationError" class="error-toast">
      <i class="pi pi-exclamation-triangle"></i>
      {{ calculationError }}
    </div>

    <!-- Error de valores económicos -->
    <div v-if="valoresError" class="error-toast valores-error">
      <i class="pi pi-exclamation-triangle"></i>
      {{ valoresError }}
      <button @click="cargarValoresEconomicos" class="retry-button">
        <i class="pi pi-refresh"></i>
        Reintentar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Importaciones del módulo
import { 
  CalculoBrutoRequest, 
  CalculoBrutoResponse, 
  Colaborador,
  CalculoSueldoBrutoRequest,
  CalculoSueldoBrutoResponse
} from '../Types/bruto.interface';
import { 
  calcularSueldoBrutoDesdeNeto
} from '../Repositories/brutoRepository';
import { 
  validateCalculoBrutoData, 
  formatCurrency, 
  formatNumber 
} from '../Constants/brutoCalculations';
import { 
  AFP_OPTIONS 
} from '../Constants/bruto.constants';
import { 
  ValoresEconomicos, 
  getValoresEconomicos,
  CompensacionColaborador,
  getCompensacionPorNp
} from '../../../repository/colaboradoresRepository';

// Componentes locales
import ColaboradorSearchModal from '../Components/ColaboradorSearchModal.vue';
import DotLoader from '../../../components/DotLoader.vue';

// Composables
const router = useRouter();

// Estado reactivo

// Datos del formulario
const formData = ref({
  valorHoraExtra: 0,
  horasExtrasTrabajadas: 0,
  montoBonoPactado: 0,
  afp: ''
});

// Opciones para selects
const afpOptions = ref(AFP_OPTIONS);

// Colaborador seleccionado
const selectedColaborador = ref<Colaborador | null>(null);
const selectedColaboradorDisplay = computed(() => 
  selectedColaborador.value ? selectedColaborador.value.user_id : ''
);

// Modal de búsqueda
const searchModalVisible = ref(false);

// Estados de cálculo
const isCalculating = ref(false);
const isCalculatingBruto = ref(false);
const calculationResult = ref<CalculoBrutoResponse | null>(null);
const calculationError = ref('');

// Valores económicos del día
const valoresEconomicos = ref<ValoresEconomicos | null>(null);
const isLoadingValores = ref(false);
const valoresError = ref('');

// Datos del colaborador para cálculo de bruto (ya no se usa el endpoint específico)
// Se eliminó datosColaboradorAfpSalud ya que ahora usamos la AFP seleccionada directamente

// Compensación del colaborador
const compensacionColaborador = ref<CompensacionColaborador | null>(null);
const isLoadingCompensacion = ref(false);
const compensacionError = ref('');

// Constante del ingreso mínimo mensual (temporal hasta que se obtenga desde API)
const INGRESO_MINIMO_MENSUAL = 529000;

// Fecha actual
const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-CL');
});

// Validación para habilitar el botón calcular
const canCalculate = computed(() => {
  return selectedColaborador.value && 
         formData.value.valorHoraExtra > 0 && 
         formData.value.horasExtrasTrabajadas > 0 && 
         formData.value.montoBonoPactado > 0 &&
         formData.value.afp;
});


// Funciones del modal de búsqueda
const openSearchModal = () => {
  searchModalVisible.value = true;
};

const onColaboradorSelected = async (colaborador: Colaborador) => {
  selectedColaborador.value = colaborador;
  // Limpiar datos previos del colaborador para forzar nueva consulta
  // datosColaboradorAfpSalud.value = null; // Ya no se usa
  compensacionColaborador.value = null;
  // Limpiar resultados previos
  calculationResult.value = null;
  // Limpiar AFP seleccionada
  formData.value.afp = '';
  
  // Cargar compensación del colaborador
  await cargarCompensacionColaborador(colaborador.user_id);
};

// Función para cargar compensación del colaborador
const cargarCompensacionColaborador = async (np: number) => {
  isLoadingCompensacion.value = true;
  compensacionError.value = '';
  
  try {
    const compensacion = await getCompensacionPorNp(np);
    compensacionColaborador.value = compensacion;
    // Actualizar el valor de hora extra en el formulario
    formData.value.valorHoraExtra = compensacion.valor_hr_extras;
  } catch (error: any) {
    console.error('Error al cargar compensación del colaborador:', error);
    compensacionError.value = 'Error al obtener datos de compensación';
    // Resetear valor de hora extra
    formData.value.valorHoraExtra = 0;
  } finally {
    isLoadingCompensacion.value = false;
  }
};

// Función para cargar valores económicos
const cargarValoresEconomicos = async () => {
  isLoadingValores.value = true;
  valoresError.value = '';
  
  try {
    const valores = await getValoresEconomicos();
    valoresEconomicos.value = valores;
  } catch (error: any) {
    console.error('Error al cargar valores económicos:', error);
    valoresError.value = 'Error al cargar valores UF y UTM';
    
    // Valores por defecto en caso de error
    valoresEconomicos.value = {
      fecha: new Date().toISOString().split('T')[0],
      valor_uf: '68647',
      valor_utm: '39383.07',
      dolar: '967.48'
    };
  } finally {
    isLoadingValores.value = false;
  }
};

// Función para calcular el bruto de la diferencia líquida
const calcularBrutoDiferencia = async (diferenciaLiquida: number): Promise<number> => {
  try {
    // Preparar datos para el cálculo de sueldo bruto usando la AFP seleccionada
    const requestData: CalculoSueldoBrutoRequest = {
      sueldo_liquido_deseado: Math.abs(diferenciaLiquida), // Usar valor absoluto
      tipo_contrato: 1, // Usar indefinido por defecto
      afp: formData.value.afp,
      salud: 'Fonasa', // Usar Fonasa por defecto
      tolerancia: 100,
      max_iteraciones: 50
    };

    isCalculatingBruto.value = true;
    const response: CalculoSueldoBrutoResponse = await calcularSueldoBrutoDesdeNeto(requestData);
    
    // Retornar el sueldo base calculado con el signo correcto
    return diferenciaLiquida >= 0 ? response.haberes.sueldo_base : -response.haberes.sueldo_base;
  } catch (error: any) {
    console.error('Error al calcular bruto de diferencia:', error);
    // En caso de error, retornar la diferencia líquida como aproximación
    return diferenciaLiquida;
  } finally {
    isCalculatingBruto.value = false;
  }
};

// Función principal de cálculo
const calcular = async () => {
  if (!canCalculate.value) return;
  
  // Validar datos
  const requestData: CalculoBrutoRequest = {
    colaborador: selectedColaborador.value!,
    valorHoraExtra: formData.value.valorHoraExtra,
    horasExtrasTrabajadas: formData.value.horasExtrasTrabajadas,
    montoBonoPactado: formData.value.montoBonoPactado
  };
  
  const validationErrors = validateCalculoBrutoData(requestData);
  if (validationErrors.length > 0) {
    calculationError.value = validationErrors[0].message;
    setTimeout(() => calculationError.value = '', 5000);
    return;
  }
  
  isCalculating.value = true;
  calculationError.value = '';
  
  try {
    // Cálculos básicos
    const montoTotalHorasExtras = formData.value.valorHoraExtra * formData.value.horasExtrasTrabajadas;
    const diferenciaLiquida = formData.value.montoBonoPactado - montoTotalHorasExtras;
    
    // Calcular el bruto de la diferencia líquida
    const diferenciaBruto = await calcularBrutoDiferencia(diferenciaLiquida);

    const result: CalculoBrutoResponse = {
      // Resultados principales para las cards
      bonoPactadoLiquido: formData.value.montoBonoPactado,
      diferenciaLiquida: diferenciaLiquida,
      diferenciaBruto: diferenciaBruto,
      
      // Desglose de liquidación (mantener para compatibilidad)
      montoBonoPactado: formData.value.montoBonoPactado,
      montoTotalHorasExtras: montoTotalHorasExtras,
      totalBrutoDiferencia: diferenciaBruto // Usar el valor calculado
    };
    
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
  // Cargar valores económicos al inicializar el componente
  cargarValoresEconomicos();
});
</script>

<style scoped>
.bruto-calculator {
  padding: 0;
  max-width: 100%;
  margin: 0;
}

.calculator-content {
  background: #ffffff;
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
}

.results-panel {
  padding: 2rem;
  background-color: #f9fafb;
}

.form-section {
  margin-bottom: 2rem;
}
.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #dc2626;
}
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.form-field {
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

.readonly-input {
  background-color: #f9fafb;
  color: #6b7280;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.search-button {
  padding: 0.75rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover:not(:disabled) {
  background-color: #b91c1c;
}

.search-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.colaborador-info {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-label {
  font-weight: 500;
  color: #374151;
}

.info-value {
  color: #1f2937;
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
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-date {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
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

.loading-icon {
  color: #6b7280;
  font-size: 1rem;
}

.liquidation-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.liquidation-grid {
  display: flex;
  align-items: end;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.liquidation-item {
  flex: 1;
  min-width: 150px;
}

.liquidation-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.liquidation-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  color: #374151;
  font-weight: 500;
}

.liquidation-operator {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  padding: 0.75rem 0;
  text-align: center;
  min-width: 30px;
}

.total-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
}

.total-label {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
}

.total-input {
  flex: 1;
}

.total-amount-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #dc2626;
  border-radius: 0.5rem;
  background-color: white;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  text-align: right;
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

.valores-error {
  top: 4rem;
  background-color: #fef3cd;
  color: #d97706;
  border-color: #fde68a;
}

.retry-button {
  background-color: #d97706;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #b45309;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  color: #dc2626;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
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
  appearance: none;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-select:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
  font-size: 0.875rem;
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
  
  .liquidation-grid {
    flex-direction: column;
  }
  
  .liquidation-operator {
    transform: rotate(90deg);
  }
  
  .total-section {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

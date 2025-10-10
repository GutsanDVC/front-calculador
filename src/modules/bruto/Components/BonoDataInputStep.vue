<template>
  <div class="data-input-step">
    <div class="step-header">
      <h3 class="step-title">Ingresar Datos por Colaborador</h3>
      <p class="step-description">
        Complete el monto del bono para cada colaborador
      </p>
    </div>

    <div class="input-content">
      <!-- Lista de colaboradores con formularios -->
      <div class="colaboradores-forms">
        <div 
          v-for="(colaboradorData, index) in colaboradoresDataLocal" 
          :key="colaboradorData.colaborador.user_id"
          class="colaborador-form-card"
        >
          <!-- Header del colaborador -->
          <div class="colaborador-header">
            <div class="colaborador-info">
              <h4 class="colaborador-name">
                {{ colaboradorData.colaborador.first_name }} {{ colaboradorData.colaborador.last_name }}
              </h4>
              <span class="colaborador-id">{{ colaboradorData.colaborador.user_id }}</span>
            </div>
            <div class="form-progress">
              <span class="progress-text">{{ index + 1 }} de {{ colaboradoresDataLocal.length }}</span>
            </div>
          </div>

          <!-- Información del colaborador -->
          <div class="colaborador-details">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Centro Gestión:</span>
                <span class="detail-value">{{ colaboradorData.colaborador.centro_costo }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Cargo:</span>
                <span class="detail-value">{{ colaboradorData.colaborador.nombre_cargo }}</span>
              </div>
            </div>
            
            <!-- Información de compensación -->
            <div v-if="colaboradorData.compensacion" class="compensation-info">
              <div class="detail-item">
                <span class="detail-label">Sueldo Base:</span>
                <span class="detail-value">{{ formatCurrency(colaboradorData.compensacion.sueldo_base) }}</span>
              </div>
            </div>
          </div>

          <!-- Formulario de datos -->
          <div class="form-section">
            <div class="form-grid">
              <!-- Monto bono pactado -->
              <div class="form-field">
                <label class="field-label">Monto Bono Líquido</label>
                <input
                  v-model.number="colaboradorData.montoBonoPactado"
                  @blur="formatMontoBonoOnBlur($event, colaboradorData)"
                  type="text"
                  class="form-input"
                  placeholder="0"
                />
              </div>

              <!-- AFP -->
              <div class="form-field">
                <label class="field-label">AFP</label>
                <div class="input-group">
                  <input
                    :value="colaboradorData.afp"
                    type="text"
                    class="form-input readonly-input"
                    readonly
                  />
                  <div v-if="colaboradorData.isLoadingAfp" class="loading-indicator">
                    <i class="pi pi-spin pi-spinner"></i>
                  </div>
                </div>
                <small v-if="colaboradorData.afpError" class="field-error">
                  <i class="pi pi-exclamation-triangle"></i>
                  {{ colaboradorData.afpError }}
                </small>
              </div>
            </div>

            <!-- Estado de validación -->
            <div class="validation-status">
              <div 
                class="status-indicator"
                :class="{ 
                  'valid': isColaboradorDataValid(colaboradorData),
                  'invalid': !isColaboradorDataValid(colaboradorData)
                }"
              >
                <i 
                  :class="isColaboradorDataValid(colaboradorData) ? 'pi pi-check' : 'pi pi-exclamation-triangle'"
                ></i>
                <span>
                  {{ isColaboradorDataValid(colaboradorData) ? 'Datos completos' : 'Faltan datos por completar' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen de progreso -->
    <div class="progress-summary">
      <div class="summary-card">
        <div class="summary-item">
          <span class="summary-label">Total Colaboradores:</span>
          <span class="summary-value">{{ colaboradoresDataLocal.length }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Formularios Completos:</span>
          <span class="summary-value">{{ validFormsCount }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Pendientes:</span>
          <span class="summary-value">{{ colaboradoresDataLocal.length - validFormsCount }}</span>
        </div>
      </div>
    </div>

    <!-- Acciones del paso -->
    <div class="step-actions">
      <button 
        class="previous-button"
        @click="handlePrevious"
      >
        <i class="pi pi-arrow-left"></i>
        Anterior
      </button>
      
      <button 
        class="next-button"
        @click="handleNext"
        :disabled="!allFormsValid"
      >
        Continuar
        <i class="pi pi-arrow-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Colaborador } from '../Types/bruto.interface';
import { formatCurrency, formatNumberForInput, parseFormattedNumber } from '../Constants/brutoCalculations';
import { 
  CompensacionColaborador,
  getCompensacionPorNp,
  getAfpColaborador
} from '../../../repository/colaboradoresRepository';

// Interfaces
interface ColaboradorDataForm {
  colaborador: Colaborador;
  montoBonoPactado: number;
  afp: string;
  valorHoraExtra: number;
  compensacion?: CompensacionColaborador;
  isLoadingCompensacion: boolean;
  compensacionError: string;
  isLoadingAfp: boolean;
  afpError: string;
}

// Props y emits
const props = defineProps<{
  colaboradores: Colaborador[]
}>();

const colaboradoresData = defineModel<any[]>('colaboradoresData', { default: () => [] });

const emit = defineEmits<{
  previous: []
  next: []
}>();

// Estado reactivo
const colaboradoresDataLocal = ref<ColaboradorDataForm[]>([]);

// Computed
const validFormsCount = computed(() => {
  return colaboradoresDataLocal.value.filter(data => isColaboradorDataValid(data)).length;
});

const allFormsValid = computed(() => {
  return colaboradoresDataLocal.value.length > 0 && 
         colaboradoresDataLocal.value.every(data => isColaboradorDataValid(data));
});

// Funciones
const isColaboradorDataValid = (data: ColaboradorDataForm): boolean => {
  return data.montoBonoPactado > 0 &&
         data.afp !== '' && // AFP debe estar cargada desde la API
         !data.isLoadingAfp; // No debe estar cargando datos
};

const initializeColaboradoresData = async () => {
  colaboradoresDataLocal.value = props.colaboradores.map(colaborador => ({
    colaborador,
    montoBonoPactado: 0,
    afp: '',
    valorHoraExtra: 0,
    isLoadingCompensacion: false,
    compensacionError: '',
    isLoadingAfp: false,
    afpError: ''
  }));

  // Cargar compensación y AFP para cada colaborador
  for (const data of colaboradoresDataLocal.value) {
    await Promise.all([
      cargarCompensacionColaborador(data),
      cargarAfpColaborador(data)
    ]);
  }
};

const cargarCompensacionColaborador = async (colaboradorData: ColaboradorDataForm) => {
  colaboradorData.isLoadingCompensacion = true;
  colaboradorData.compensacionError = '';
  
  try {
    const compensacion = await getCompensacionPorNp(colaboradorData.colaborador.user_id);
    colaboradorData.compensacion = compensacion;
    colaboradorData.valorHoraExtra = compensacion.valor_hr_extras;
  } catch (error: any) {
    console.error('Error al cargar compensación del colaborador:', error);
    colaboradorData.compensacionError = 'Error al obtener datos de compensación';
    colaboradorData.valorHoraExtra = 0;
  } finally {
    colaboradorData.isLoadingCompensacion = false;
  }
};

const cargarAfpColaborador = async (colaboradorData: ColaboradorDataForm) => {
  colaboradorData.isLoadingAfp = true;
  colaboradorData.afpError = '';
  
  try {
    const afp_colaborador:{afp: string} = await getAfpColaborador(colaboradorData.colaborador.user_id);
    colaboradorData.afp = afp_colaborador.afp;
  } catch (error: any) {
    console.error('Error al cargar AFP del colaborador:', error);
    colaboradorData.afpError = 'Error al obtener datos de AFP';
    colaboradorData.afp = '';
  } finally {
    colaboradorData.isLoadingAfp = false;
  }
};

const handlePrevious = () => {
  emit('previous');
};

const handleNext = () => {
  if (allFormsValid.value) {
    // Actualizar el modelo con los datos locales
    colaboradoresData.value = colaboradoresDataLocal.value.map(data => ({
      colaborador: data.colaborador,
      montoBonoPactado: data.montoBonoPactado,
      afp: data.afp,
      valorHoraExtra: data.valorHoraExtra
    }));
    
    emit('next');
  }
};

// Funciones para formateo de números en blur
const formatMontoBonoOnBlur = (event: Event, colaboradorData: ColaboradorDataForm) => {
  const target = event.target as HTMLInputElement;
  if (colaboradorData.montoBonoPactado > 0) {
    target.value = formatNumberForInput(colaboradorData.montoBonoPactado);
  }
};

// Watchers
watch(() => props.colaboradores, () => {
  initializeColaboradoresData();
}, { immediate: true });

// Hooks
onMounted(() => {
  initializeColaboradoresData();
});
</script>

<style scoped>
.data-input-step {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 100%;
}

.step-header {
  text-align: center;
  margin-bottom: 1rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.step-description {
  color: #6b7280;
  font-size: 1rem;
}

.input-content {
  flex: 1;
  overflow-y: auto;
}

.colaboradores-forms {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.colaborador-form-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.colaborador-header {
  background: #f9fafb;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.colaborador-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.colaborador-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.colaborador-id {
  background-color: #dc2626;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.form-progress {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.colaborador-details {
  padding: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  min-width: 100px;
}

.detail-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.compensation-info {
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.form-section {
  padding: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
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
  align-items: center;
}

.loading-indicator {
  color: #dc2626;
  font-size: 1rem;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.validation-status {
  display: flex;
  justify-content: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-indicator.valid {
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.status-indicator.invalid {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.progress-summary {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.previous-button {
  padding: 0.75rem 2rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.previous-button:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.next-button {
  padding: 0.75rem 2rem;
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
  gap: 0.5rem;
}

.next-button:hover:not(:disabled) {
  background-color: #b91c1c;
}

.next-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .colaborador-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-card {
    grid-template-columns: 1fr;
  }
  
  .step-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .previous-button,
  .next-button {
    justify-content: center;
  }
}
</style>

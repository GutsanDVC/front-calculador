<template>
  <div class="calculation-results-step">
    <div class="step-header">
      <h3 class="step-title">Cálculo y Resultados</h3>
      <p class="step-description">
        Revise los resultados del cálculo de bonos para cada colaborador
      </p>
    </div>

    <div class="results-content">
      <!-- Mensaje de cálculo automático (solo se muestra brevemente) -->
      <div v-if="!hasResults && !isCalculating" class="auto-calculation-info">
        <div class="info-card">
          <div class="info-content">
            <i class="pi pi-info-circle info-icon"></i>
            <h4 class="info-title">Cálculo Automático</h4>
            <p class="info-description">
              El cálculo se ejecutará automáticamente para {{ colaboradoresData.length }} colaborador{{ colaboradoresData.length > 1 ? 'es' : '' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Loading durante cálculo -->
      <div v-if="isCalculating" class="loading-calculation">
        <div class="loading-card">
          <div class="loading-content">
            <div class="loading-spinner">
              <i class="pi pi-spin pi-spinner"></i>
            </div>
            <h4 class="loading-title">Calculando...</h4>
            <p class="loading-description">
              Procesando cálculos para {{ colaboradoresData.length }} colaborador{{ colaboradoresData.length > 1 ? 'es' : '' }}
            </p>
            <div class="loading-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: '100%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resultados -->
      <div v-if="hasResults && !isCalculating" class="results-section">
        <!-- Resumen general -->
        <div class="summary-section">
          <h4 class="summary-title">Resumen General</h4>
          <div class="summary-cards">
            <div class="summary-card">
              <div class="summary-label">Total Colaboradores</div>
              <div class="summary-value">{{ calculationResults.length }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Bono Líquido</div>
              <div class="summary-value">{{ formatCurrency(totalBonoLiquido) }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Bono Bruto</div>
              <div class="summary-value">{{ formatCurrency(totalBonoBruto) }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Descuentos</div>
              <div class="summary-value">{{ formatCurrency(totalDescuentos) }}</div>
            </div>
          </div>
        </div>

        <!-- Resultados por colaborador -->
        <div class="individual-results">
          <div class="results-header">
            <h4 class="results-title">Resultados por Colaborador</h4>
            <button 
              class="recalculate-button"
              @click="handleRecalculate"
            >
              <i class="pi pi-refresh"></i>
              Recalcular
            </button>
          </div>

          <div class="results-list">
            <div 
              v-for="result in calculationResults" 
              :key="result.colaborador.user_id"
              class="result-card"
            >
              <!-- Header del colaborador -->
              <div class="result-header">
                <div class="colaborador-info">
                  <h5 class="colaborador-name">
                    {{ result.colaborador.first_name }} {{ result.colaborador.last_name }}
                  </h5>
                  <span class="colaborador-id">{{ result.colaborador.user_id }}</span>
                </div>
              </div>

              <!-- Datos de entrada -->
              <div class="input-data">
                <h6 class="section-subtitle">Datos de Entrada</h6>
                <div class="data-grid">
                  <div class="data-item">
                    <span class="data-label">Bono Líquido Deseado:</span>
                    <span class="data-value">{{ formatCurrency(result.montoBonoPactado) }}</span>
                  </div>
                  <div class="data-item">
                    <span class="data-label">AFP:</span>
                    <span class="data-value">{{ result.afp }}</span>
                  </div>
                </div>
              </div>

              <!-- Resultados principales -->
              <div class="main-results">
                <h6 class="section-subtitle">Resultados del Cálculo</h6>
                <div class="results-grid">
                  <div class="result-item highlight">
                    <div class="result-label">Bono Bruto Calculado</div>
                    <div class="result-amount">
                      {{ formatCurrency(result.result.diferenciaBruto) }}
                    </div>
                  </div>
                  <div class="result-item highlight">
                    <div class="result-label">Descuentos Totales</div>
                    <div class="result-amount">
                      {{ formatCurrency(result.result.diferenciaBruto - result.result.diferenciaLiquida) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Desglose detallado -->
              <div class="detailed-breakdown">
                <h6 class="section-subtitle">Desglose del Cálculo</h6>
                <div class="breakdown-formula">
                  <div class="formula-item">
                    <span class="formula-label">Bono Bruto</span>
                    <span class="formula-value">{{ formatCurrency(result.result.diferenciaBruto) }}</span>
                  </div>
                  <div class="formula-operator">−</div>
                  <div class="formula-item">
                    <span class="formula-label">Descuentos</span>
                    <span class="formula-value">{{ formatCurrency(result.result.diferenciaBruto - result.result.diferenciaLiquida) }}</span>
                  </div>
                  <div class="formula-operator">=</div>
                  <div class="formula-item result">
                    <span class="formula-label">Bono Líquido</span>
                    <span class="formula-value">
                      {{ formatCurrency(result.result.diferenciaLiquida) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones del paso -->
    <div class="step-actions">
      <button 
        class="previous-button"
        @click="handlePrevious"
        :disabled="isCalculating"
      >
        <i class="pi pi-arrow-left"></i>
        Anterior
      </button>
      
      <div class="action-group">
        <button 
          v-if="hasResults"
          class="export-button"
          @click="handleExport"
          :disabled="isCalculating || isExporting"
        >
          <i :class="isExporting ? 'pi pi-spin pi-spinner' : 'pi pi-download'"></i>
          {{ isExporting ? 'Exportando...' : 'Exportar Resultados' }}
        </button>
        
        <button 
          class="finish-button"
          @click="handleFinish"
          :disabled="isCalculating || !hasResults"
        >
          <i class="pi pi-check"></i>
          Finalizar
        </button>
      </div>
    </div>

    <!-- Mensaje de error de exportación -->
    <div v-if="exportError" class="export-error-toast">
      <i class="pi pi-exclamation-triangle"></i>
      {{ exportError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatCurrency } from '../Constants/brutoCalculations';

// Interfaces
interface ColaboradorData {
  colaborador: any;
  montoBonoPactado: number;
  afp: string;
  valorHoraExtra: number;
}

interface ColaboradorResult extends ColaboradorData {
  result: {
    bonoPactadoLiquido: number;
    diferenciaLiquida: number;
    diferenciaBruto: number;
    montoBonoPactado: number;
    montoTotalHorasExtras: number;
    totalBrutoDiferencia: number;
  };
}

// Props y emits
const props = defineProps<{
  colaboradoresData: ColaboradorData[]
  calculationResults: ColaboradorResult[]
  isCalculating: boolean
}>();

const emit = defineEmits<{
  previous: []
  calculate: []
  recalculate: []
  finish: []
}>();

// Estado para exportación
const isExporting = ref(false);
const exportError = ref('');

// Computed
const hasResults = computed(() => {
  return props.calculationResults.length > 0;
});

const totalBonoLiquido = computed(() => {
  return props.calculationResults.reduce((sum, result) => sum + result.montoBonoPactado, 0);
});

const totalBonoBruto = computed(() => {
  return props.calculationResults.reduce((sum, result) => sum + result.result.diferenciaBruto, 0);
});

const totalDescuentos = computed(() => {
  return props.calculationResults.reduce((sum, result) => {
    return sum + (result.result.diferenciaBruto - result.result.diferenciaLiquida);
  }, 0);
});

// Funciones
const handlePrevious = () => {
  emit('previous');
};

const handleCalculate = () => {
  emit('calculate');
};

const handleRecalculate = () => {
  emit('recalculate');
};

const handleExport = async () => {
  if (!hasResults.value) {
    exportError.value = 'No hay resultados para exportar';
    return;
  }

  isExporting.value = true;
  exportError.value = '';

  try {
    // Generar nombre de archivo con fecha y hora
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const fileName = `bonos_${dateStr}_${timeStr}.xlsx`;

    // TODO: Implementar exportación específica para bonos
    console.log('Exportación de bonos - Funcionalidad pendiente de implementar');
    
  } catch (error: any) {
    console.error('Error durante la exportación:', error);
    exportError.value = error.message || 'Error al exportar los resultados';
    
    // Limpiar error después de 5 segundos
    setTimeout(() => {
      exportError.value = '';
    }, 5000);
  } finally {
    isExporting.value = false;
  }
};

const handleFinish = () => {
  // Emitir evento para volver al paso 1 y limpiar datos
  emit('finish');
};
</script>

<style scoped>
.calculation-results-step {
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

.results-content {
  flex: 1;
  overflow-y: auto;
}

/* Información de cálculo automático */
.auto-calculation-info {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.info-card {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.info-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.info-icon {
  font-size: 2.5rem;
  color: #0ea5e9;
  margin-bottom: 0.5rem;
}

.info-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.info-description {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

/* Loading */
.loading-calculation {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  font-size: 2rem;
  color: #dc2626;
}

.loading-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.loading-description {
  color: #6b7280;
  margin: 0;
}

.loading-progress {
  width: 100%;
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #f3f4f6;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #dc2626;
  transition: width 0.3s ease;
  animation: progress-animation 2s ease-in-out infinite;
}

@keyframes progress-animation {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

/* Resultados */
.results-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-section {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.summary-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  background: white;
  padding: 1.25rem;
  border-radius: 0.5rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.individual-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.recalculate-button {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.recalculate-button:hover {
  background-color: #e5e7eb;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.result-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-header {
  background: #f9fafb;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.colaborador-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.colaborador-name {
  font-size: 1rem;
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

.input-data,
.main-results,
.detailed-breakdown {
  padding: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.detailed-breakdown {
  border-bottom: none;
}

.section-subtitle {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.data-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.data-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 600;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.result-item {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
}

.result-item.highlight {
  background: #fef2f2;
  border: 1px solid #fecaca;
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

.breakdown-formula {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.formula-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 120px;
}

.formula-item.result {
  background: #fef2f2;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
}

.formula-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-align: center;
}

.formula-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 600;
}

.formula-operator {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.action-group {
  display: flex;
  gap: 1rem;
}

.previous-button,
.export-button,
.finish-button {
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.previous-button {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.previous-button:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.export-button {
  background-color: #059669;
  color: white;
  border: none;
}

.export-button:hover:not(:disabled) {
  background-color: #047857;
}

.finish-button {
  background-color: #dc2626;
  color: white;
  border: none;
}

.finish-button:hover:not(:disabled) {
  background-color: #b91c1c;
}

.previous-button:disabled,
.export-button:disabled,
.finish-button:disabled {
  background-color: #9ca3af;
  color: #6b7280;
  cursor: not-allowed;
}

/* Mensaje de error de exportación */
.export-error-toast {
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
  max-width: 400px;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .info-card,
  .loading-card {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .results-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .data-grid {
    grid-template-columns: 1fr;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .breakdown-formula {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .formula-operator {
    transform: rotate(90deg);
  }
  
  .step-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .action-group {
    width: 100%;
    justify-content: center;
  }
  
  .previous-button,
  .export-button,
  .finish-button {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .action-group {
    flex-direction: column;
    width: 100%;
  }
}
</style>

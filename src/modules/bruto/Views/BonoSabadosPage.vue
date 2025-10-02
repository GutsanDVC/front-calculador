<template>
  <div class="bruto-calculator">
    <!-- Header con título y navegación de pasos -->
    <div class="calculator-header">
      <h2 class="calculator-title">Calculador Bono Sábados</h2>
      <div class="steps-navigation">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step-item"
          :class="{ 
            'active': currentStep === index + 1, 
            'completed': currentStep > index + 1,
            'disabled': currentStep < index + 1
          }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="calculator-content">
      <!-- Paso 1: Selección de colaboradores -->
      <div v-if="currentStep === 1" class="step-content">
        <ColaboradorSelectionStep
          v-model:selected-colaboradores="selectedColaboradores"
          @next="goToStep(2)"
        />
      </div>

      <!-- Paso 2: Ingreso de datos por colaborador -->
      <div v-if="currentStep === 2" class="step-content">
        <DataInputStep
          :colaboradores="selectedColaboradores"
          v-model:colaboradores-data="colaboradoresData"
          @previous="goToStep(1)"
          @next="goToStep(3)"
        />
      </div>

      <!-- Paso 3: Cálculo y resultados -->
      <div v-if="currentStep === 3" class="step-content">
        <CalculationResultsStep
          :colaboradores-data="colaboradoresData"
          :calculation-results="calculationResults"
          :is-calculating="isCalculating"
          @previous="goToStep(2)"
          @calculate="calcularTodos"
          @recalculate="calcularTodos"
          @finish="handleFinish"
        />
      </div>
    </div>

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

// Importaciones del módulo
import { 
  CalculoBrutoResponse, 
  Colaborador,
  CalculoSueldoBrutoRequest,
  CalculoSueldoBrutoResponse
} from '../Types/bruto.interface';
import { 
  calcularSueldoBrutoDesdeNeto,
  calcularSueldoLiquido
} from '../Repositories/brutoRepository';
import { 
  ValoresEconomicos, 
  getValoresEconomicos
} from '../../../repository/colaboradoresRepository';

// Componentes de los pasos
import ColaboradorSelectionStep from '../Components/ColaboradorSelectionStep.vue';
import DataInputStep from '../Components/DataInputStep.vue';
import CalculationResultsStep from '../Components/CalculationResultsStep.vue';

// Interfaces para los datos de colaboradores
interface ColaboradorData {
  colaborador: Colaborador;
  horasExtrasTrabajadas: number;
  montoBonoPactado: number;
  afp: string;
  valorHoraExtra: number;
}

interface ColaboradorResult extends ColaboradorData {
  result: CalculoBrutoResponse;
}

// Estado reactivo para navegación de pasos
const currentStep = ref(1);
const steps = ref([
  { label: 'Seleccionar Colaboradores' },
  { label: 'Ingresar Datos' },
  { label: 'Calcular y Resultados' }
]);

// Estado para colaboradores seleccionados
const selectedColaboradores = ref<Colaborador[]>([]);

// Estado para datos de cada colaborador
const colaboradoresData = ref<ColaboradorData[]>([]);

// Estado para resultados de cálculos
const calculationResults = ref<ColaboradorResult[]>([]);

// Estados de cálculo
const isCalculating = ref(false);
const calculationError = ref('');

// Valores económicos del día
const valoresEconomicos = ref<ValoresEconomicos | null>(null);
const isLoadingValores = ref(false);
const valoresError = ref('');

// Función para navegar entre pasos
const goToStep = async (step: number) => {
  if (step >= 1 && step <= 3) {
    currentStep.value = step;
    
    // Si se pasa al paso 3 (resultados), ejecutar cálculo automáticamente
    if (step === 3 && colaboradoresData.value.length > 0) {
      // Pequeño delay para que se renderice el componente
      await new Promise(resolve => setTimeout(resolve, 100));
      await calcularTodos();
    }
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
const calcularBrutoDiferencia = async (diferenciaLiquida: number, afp: string): Promise<number> => {
  try {
    // Si la diferencia líquida es negativa o cero, retornar 0
    if (diferenciaLiquida <= 0) {
      return 0;
    }

    // Preparar datos para el cálculo de sueldo bruto usando la AFP seleccionada
    const requestData: CalculoSueldoBrutoRequest = {
      sueldo_liquido_deseado: diferenciaLiquida, // Ya no necesitamos valor absoluto
      tipo_contrato: 1, // Usar indefinido por defecto
      afp: afp,
      salud: 'Fonasa', // Usar Fonasa por defecto
      tolerancia: 100,
      max_iteraciones: 50
    };

    const response: CalculoSueldoBrutoResponse = await calcularSueldoBrutoDesdeNeto(requestData);
    
    // Retornar el sueldo base calculado
    return response.haberes.sueldo_base;
  } catch (error: any) {
    console.error('Error al calcular bruto de diferencia:', error);
    // En caso de error, retornar 0 si la diferencia es negativa, o la diferencia como aproximación
    return diferenciaLiquida <= 0 ? 0 : diferenciaLiquida;
  }
};

// Función principal de cálculo para todos los colaboradores
const calcularTodos = async () => {
  if (colaboradoresData.value.length === 0) return;
  
  isCalculating.value = true;
  calculationError.value = '';
  calculationResults.value = [];
  
  try {
    const results: ColaboradorResult[] = [];
    
    for (const colaboradorData of colaboradoresData.value) {
      try {
        // Cálculos básicos
        const montoTotalHorasExtras = colaboradorData.valorHoraExtra * colaboradorData.horasExtrasTrabajadas;
        console.log(montoTotalHorasExtras);
        const calcularhrExtraLiquidas=await calcularSueldoLiquido({
          sueldo_base: montoTotalHorasExtras,
          afp: colaboradorData.afp
        });
        const horaExtraLiquido=calcularhrExtraLiquidas.sueldo_liquido;
        const diferenciaLiquida = colaboradorData.montoBonoPactado - horaExtraLiquido;
        
        // Calcular el bruto de la diferencia líquida
        const diferenciaBruto = await calcularBrutoDiferencia(diferenciaLiquida, colaboradorData.afp);

        const result: CalculoBrutoResponse = {
          // Resultados principales para las cards
          bonoPactadoLiquido: colaboradorData.montoBonoPactado,
          diferenciaLiquida: diferenciaLiquida,
          diferenciaBruto: diferenciaBruto,
          
          // Desglose de liquidación (mantener para compatibilidad)
          montoBonoPactado: colaboradorData.montoBonoPactado,
          montoTotalHorasExtras: horaExtraLiquido,
          totalBrutoDiferencia: diferenciaBruto // Usar el valor calculado
        };
        
        results.push({
          ...colaboradorData,
          result
        });
      } catch (error: any) {
        console.error(`Error al calcular para colaborador ${colaboradorData.colaborador.user_id}:`, error);
        // Continuar con el siguiente colaborador en caso de error
      }
    }
    
    calculationResults.value = results;
  } catch (error: any) {
    calculationError.value = error.message || 'Error al realizar los cálculos';
    setTimeout(() => calculationError.value = '', 5000);
  } finally {
    isCalculating.value = false;
  }
};

// Función para manejar la finalización del proceso
const handleFinish = () => {
  // Confirmar antes de limpiar los datos
  const confirmFinish = confirm(
    '¿Está seguro que desea finalizar? Se perderán todos los datos ingresados y volverá al paso 1.'
  );
  
  if (confirmFinish) {
    // Limpiar todos los datos
    selectedColaboradores.value = [];
    colaboradoresData.value = [];
    calculationResults.value = [];
    calculationError.value = '';
    
    // Volver al paso 1
    currentStep.value = 1;
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

/* Header con navegación de pasos */
.calculator-header {
  background: #ffffff;
  border-radius: 0.75rem 0.75rem 0 0;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.calculator-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  text-align: center;
}

.steps-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  flex: 1;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 1.25rem;
  left: calc(100% + 1rem);
  width: 2rem;
  height: 2px;
  background-color: #d1d5db;
  z-index: 1;
}

.step-item.completed:not(:last-child)::after {
  background-color: #28c76f;
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  background-color: #f3f4f6;
  color: #6b7280;
  border: 2px solid #d1d5db;
  transition: all 0.3s ease;
  z-index: 2;
  position: relative;
}

.step-item.active .step-number {
  background-color: #dc2626;
  color: white;
  border-color: #dc2626;
}

.step-item.completed .step-number {
  background-color: #28c76f;
  color: white;
  border-color: #28c76f;
}

.step-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
  transition: color 0.3s ease;
}

.step-item.active .step-label {
  color: #dc2626;
  font-weight: 600;
}

.step-item.completed .step-label {
  color: #28c76f;
  font-weight: 600;
}

/* Contenido principal */
.calculator-content {
  background: #ffffff;
  border-radius: 0 0 0.75rem 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

.step-content {
  padding: 2rem;
  min-height: 500px;
}

/* Mensajes de error */
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

/* Responsive */
@media (max-width: 768px) {
  .calculator-header {
    padding: 1.5rem;
  }
  
  .calculator-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .steps-navigation {
    gap: 1rem;
  }
  
  .step-item:not(:last-child)::after {
    width: 1rem;
    left: calc(100% + 0.5rem);
  }
  
  .step-number {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }
  
  .step-label {
    font-size: 0.75rem;
  }
  
  .step-content {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .steps-navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .step-item:not(:last-child)::after {
    display: none;
  }
  
  .step-item {
    flex-direction: row;
    gap: 1rem;
  }
  
  .step-label {
    text-align: left;
  }
}
</style>

<template>
  <div class="bruto-calculator">
    <!-- Header con título y navegación de pasos -->
    <div class="calculator-header">
      <h2 class="calculator-title">Calculador de Bonos</h2>
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
        <BonoDataInputStep
          :colaboradores="selectedColaboradores"
          v-model:colaboradores-data="colaboradoresData"
          @previous="goToStep(1)"
          @next="goToStep(3)"
        />
      </div>

      <!-- Paso 3: Cálculo y resultados -->
      <div v-if="currentStep === 3" class="step-content">
        <BonoCalculationResultsStep
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
import BonoDataInputStep from '../Components/BonoDataInputStep.vue';
import BonoCalculationResultsStep from '../Components/BonoCalculationResultsStep.vue';

// Interfaces para los datos de colaboradores
interface ColaboradorData {
  colaborador: Colaborador;
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
      sueldo_liquido_deseado: diferenciaLiquida,
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
    return 0;
  }
};

// Función principal de cálculo para todos los colaboradores
const calcularTodos = async () => {
  isCalculating.value = true;
  calculationError.value = '';
  calculationResults.value = [];

  try {
    // Validar que hay colaboradores con datos
    if (colaboradoresData.value.length === 0) {
      throw new Error('No hay colaboradores para calcular');
    }

    // Procesar cada colaborador
    for (const data of colaboradoresData.value) {
      try {
        const { montoBonoPactado, afp } = data;

        // Validar datos requeridos
        if (montoBonoPactado <= 0) {
          throw new Error(`El monto del bono debe ser mayor a 0 para ${data.colaborador.first_name} ${data.colaborador.last_name}`);
        }

        // Calcular el bruto correspondiente al bono líquido
        const bonoBruto = await calcularBrutoDiferencia(montoBonoPactado, afp);

        // Crear objeto de resultado con la estructura correcta de CalculoBrutoResponse
        const result: ColaboradorResult = {
          ...data,
          result: {
            bonoPactadoLiquido: montoBonoPactado,
            diferenciaLiquida: montoBonoPactado,
            diferenciaBruto: bonoBruto,
            montoBonoPactado: montoBonoPactado,
            montoTotalHorasExtras: 0, // No hay horas extras en bonos generales
            totalBrutoDiferencia: bonoBruto
          }
        };

        calculationResults.value.push(result);
      } catch (error: any) {
        console.error(`Error al calcular para ${data.colaborador.first_name} ${data.colaborador.last_name}:`, error);
        calculationError.value = `Error al calcular para ${data.colaborador.first_name} ${data.colaborador.last_name}: ${error.message}`;
      }
    }
  } catch (error: any) {
    console.error('Error en el cálculo general:', error);
    calculationError.value = error.message || 'Ocurrió un error al realizar los cálculos';
  } finally {
    isCalculating.value = false;
  }
};

// Función para manejar la finalización del proceso
const handleFinish = () => {
  // Reiniciar el estado del componente
  currentStep.value = 1;
  selectedColaboradores.value = [];
  colaboradoresData.value = [];
  calculationResults.value = [];
  calculationError.value = '';
};

// Hooks del ciclo de vida
onMounted(() => {
  // Cargar valores económicos al inicializar el componente
  cargarValoresEconomicos();
});
</script>

<style scoped>
/* Estilos del contenedor principal */
.bruto-calculator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', sans-serif;
}

/* Estilos del encabezado */
.calculator-header {
  margin-bottom: 2rem;
  text-align: center;
}

.calculator-title {
  color: #1C1C1C;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-weight: 600;
}

/* Estilos de la navegación de pasos */
.steps-navigation {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  gap: 1.5rem;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  max-width: 200px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step-item::after {
  content: '';
  position: absolute;
  top: 15px;
  left: calc(50% + 20px);
  width: 100%;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 0;
}

.step-item:last-child::after {
  display: none;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #757575;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.step-label {
  font-size: 0.85rem;
  color: #757575;
  text-align: center;
  transition: all 0.3s ease;
}

/* Estados de los pasos */
.step-item.active {
  opacity: 1;
}

.step-item.active .step-number {
  background-color: #E92828;
  color: white;
}

.step-item.active .step-label {
  color: #1C1C1C;
  font-weight: 500;
}

.step-item.completed {
  opacity: 1;
}

.step-item.completed .step-number {
  background-color: #28C76F;
  color: white;
}

.step-item.completed .step-label {
  color: #1C1C1C;
}

/* Estilos del contenido */
.calculator-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  min-height: 400px;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Estilos de mensajes de error */
.error-toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
}

.error-toast .pi {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.valores-error {
  background-color: #fff8e1;
  color: #ff8f00;
}

.retry-button {
  margin-left: 1rem;
  padding: 0.25rem 0.75rem;
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.retry-button .pi {
  font-size: 0.9rem;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .steps-navigation {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .step-item {
    width: 100%;
    max-width: 100%;
    flex-direction: row;
    gap: 1rem;
    justify-content: flex-start;
    padding: 0.5rem 0;
  }
  
  .step-item::after {
    display: none;
  }
  
  .step-number {
    margin-bottom: 0;
  }
  
  .calculator-content {
    padding: 1rem;
  }
  
  .error-toast {
    left: 1rem;
    right: 1rem;
    max-width: none;
    bottom: 1rem;
  }
}
</style>

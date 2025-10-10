<template>
  <div class="bruto-calculator-main">
    <!-- Header con título y valores económicos -->
    <div class="calculator-header">
      <div class="header-left">
        <h1 class="main-title">Cálculo de Bruto</h1>
      </div>
      
      <div class="header-right">
        <div class="economic-values">
          <div class="economic-item">
            <span class="economic-label">Valor UF ({{ formatDate(valoresEconomicos?.fecha??'') }})</span>
            <span class="economic-value">
              <i v-if="isLoadingValores" class="pi pi-spin pi-spinner loading-spinner"></i>
              <span v-else>{{ formatCurrency(valoresEconomicos?.valor_uf ? parseFloat(valoresEconomicos.valor_uf) : 0) }}</span>
            </span>
          </div>
          <div class="economic-item">
            <span class="economic-label">Valor UTM ({{ formatDate(valoresEconomicos?.fecha??'') }})</span>
            <span class="economic-value">
              <i v-if="isLoadingValores" class="pi pi-spin pi-spinner loading-spinner"></i>
              <span v-else>{{ formatCurrency(valoresEconomicos?.valor_utm ? parseFloat(valoresEconomicos.valor_utm) : 0) }}</span>
            </span>
          </div>
          <div class="economic-item">
            <span class="economic-label">Ingreso Mínimo Mensual(Mayo-2025)</span>
            <span class="economic-value">{{ formatCurrency(INGRESO_MINIMO_MENSUAL) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navegación por pestañas -->
    <div class="tabs-container">
      <div class="tabs-navigation">
        <button
          v-for="tab in calculatorTabs"
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="changeTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Contenido dinámico de las pestañas -->
    <div class="tab-content">
      <router-view />
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Utilities } from '../../../shared/classes/Utilities';
// Importaciones del módulo
import { CALCULATOR_TABS } from '../Constants/bruto.constants';
import { formatCurrency } from '../Constants/brutoCalculations';
import { 
  ValoresEconomicos, 
  getValoresEconomicos 
} from '../../../repository/colaboradoresRepository';

// Composables
const router = useRouter();
const route = useRoute();

// Estado reactivo
const calculatorTabs = ref(CALCULATOR_TABS);

// Valores económicos del día
const valoresEconomicos = ref<ValoresEconomicos | null>(null);
const isLoadingValores = ref(false);
const valoresError = ref('');

// Constante del ingreso mínimo mensual
const INGRESO_MINIMO_MENSUAL = 529000;

// Tab activo basado en la ruta actual
const activeTab = computed(() => {
  const currentPath = route.path;
  if (currentPath.includes('bono-sabados')) {
    return 'bono_sabados';
  } else if (currentPath.includes('bono')) {
    return 'bono';
  } else if (currentPath.includes('sueldo-bruto')) {
    return 'sueldo_bruto';
  }
  return 'bono_sabados'; // Default
});

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
      valor_uf: '0',
      valor_utm: '0',
      dolar: '0'
    };
  } finally {
    isLoadingValores.value = false;
  }
};

// Funciones de navegación
const changeTab = (tabId: string) => {
  const tab = calculatorTabs.value.find(t => t.id === tabId);
  if (tab && activeTab.value !== tabId) {
    router.push(tab.route);
  }
};
//Funciones utilitarias
const formatDate = Utilities.formatDate;
// Hooks del ciclo de vida
onMounted(() => {
  // Cargar valores económicos al inicializar
  cargarValoresEconomicos();
  
  // Si estamos en la ruta base, redirigir a bono-sabados
  if (route.path === '/panel/bruto' || route.path === '/panel/bruto/') {
    router.replace('/panel/bruto/bono-sabados');
  }
});
</script>

<style scoped>
.bruto-calculator-main {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 120px);
}

/* Header */
.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-left .main-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.025em;
}

.header-right {
  display: flex;
  align-items: center;
}

.economic-values {
  display: flex;
  gap: 2rem;
}

.economic-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 120px;
}

.economic-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #dc2626;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.economic-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
}

.loading-spinner {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Pestañas */
/* .tabs-container {
  margin-bottom: 2rem;  
} */

.tabs-navigation {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  gap: 0;
}

.tab-button {
  padding: 1rem 2rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;
}

.tab-button:hover {
  color: #374151;
  background-color: #f9fafb;
}

.tab-button.active {
  color: #dc2626;
  /* border-bottom-color: #dc2626; */
  background-color: #fef2f2;
}

.tab-button.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #dc2626;
}

/* Contenido */
.tab-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  min-height: 600px;
}

/* Error toast */
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
@media (max-width: 1024px) {
  .calculator-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-right {
    width: 100%;
    justify-content: center;
  }
  
  .economic-values {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .bruto-calculator-main {
    padding: 1rem;
  }
  
  .calculator-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
  }
  
  .header-left .main-title {
    font-size: 1.5rem;
  }
  
  .economic-values {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  
  .economic-item {
    flex-direction: row;
    justify-content: space-between;
    min-width: auto;
    width: 100%;
    padding: 0.75rem;
    background-color: #f9fafb;
    border-radius: 0.5rem;
  }
  
  .economic-label {
    margin-bottom: 0;
    text-align: left;
  }
  
  .tabs-navigation {
    flex-direction: column;
  }
  
  .tab-button {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
    border-right: none;
  }
  
  .tab-button.active {
    border-bottom-color: #e5e7eb;
    border-left: 3px solid #dc2626;
  }
  
  .tab-button.active::before {
    display: none;
  }
}

@media (max-width: 480px) {
  .economic-item {
    padding: 0.5rem;
  }
  
  .economic-label {
    font-size: 0.7rem;
  }
  
  .economic-value {
    font-size: 0.875rem;
  }
}
</style>

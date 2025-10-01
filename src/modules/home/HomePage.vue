<template>
  <div class="home-page">
    <!-- Header de bienvenida -->
    <div class="welcome-header">
      <div class="welcome-content">
        <h1 class="welcome-title">
          Bienvenido al <span class="brand-text">Calculador de Recursos Humanos</span>
        </h1>
        <p class="welcome-subtitle">
          Sistema integral para el cálculo  de finiquitos y sueldos brutos
        </p>
      </div>
    </div>

    <!-- Cards de navegación -->
    <div class="navigation-cards">
      <div class="cards-container">
        <!-- Card Calculador de Finiquitos -->
        <div 
          class="navigation-card finiquito-card"
          @click="navigateToFiniquito"
        >
          <div class="card-icon">
            <i class="pi pi-calculator"></i>
          </div>
          <div class="card-content">
            <h3 class="card-title">Calculador de Finiquitos</h3>
            <p class="card-description">
              Calcula finiquitos de manera masiva con todos los parámetros legales y configuraciones personalizadas
            </p>
            <div class="card-features">
              <span class="feature-tag">• Cálculo masivo</span>
              <span class="feature-tag">• Múltiples causales</span>
              <span class="feature-tag">• Exportación Excel</span>
            </div>
          </div>
          <div class="card-arrow">
            <i class="pi pi-arrow-right"></i>
          </div>
        </div>

        <!-- Card Calculador de Bruto -->
        <div 
          class="navigation-card bruto-card"
          @click="navigateToBruto"
        >
          <div class="card-icon">
            <i class="pi pi-chart-line"></i>
          </div>
          <div class="card-content">
            <h3 class="card-title">Calculador de Bruto</h3>
            <p class="card-description">
              Herramientas para calcular sueldos brutos y bonos con valores económicos actualizados
            </p>
            <div class="card-features">
              <span class="feature-tag">• Sueldo bruto desde líquido</span>
              <span class="feature-tag">• Bono sábados</span>
              <span class="feature-tag">• Valores UF/UTM</span>
            </div>
          </div>
          <div class="card-arrow">
            <i class="pi pi-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Información adicional -->
    <div class="info-section">
      <div class="info-grid">
        <div class="info-item">
          <i class="pi pi-shield info-icon"></i>
          <h4>Seguro y Confiable</h4>
          <p>Cálculos basados en la legislación laboral chilena vigente</p>
        </div>
        <div class="info-item">
          <i class="pi pi-clock info-icon"></i>
          <h4>Actualizado</h4>
          <p>Valores económicos y parámetros legales siempre al día</p>
        </div>
        <div class="info-item">
          <i class="pi pi-users info-icon"></i>
          <h4>Fácil de Usar</h4>
          <p>Interfaz intuitiva diseñada para recursos humanos</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

// Composables
const router = useRouter();

// Funciones de navegación
const navigateToFiniquito = () => {
  router.push('/panel/finiquito');
};

const navigateToBruto = () => {
  router.push('/panel/bruto/bono-sabados');
};
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Header de bienvenida */
.welcome-header {
  background: linear-gradient(135deg, #252525 0%, #494949 100%);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.welcome-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.welcome-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.025em;
}

.brand-text {
  color: #f30707;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  font-weight: 400;
  line-height: 1.6;
}

/* Cards de navegación */
.navigation-cards {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.navigation-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
}

.navigation-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transition: all 0.3s ease;
}

.finiquito-card::before {
  background: linear-gradient(90deg, #dc2626, #b91c1c);
}

.bruto-card::before {
  background: linear-gradient(90deg, #059669, #047857);
}

.navigation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-icon {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.finiquito-card .card-icon {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.bruto-card .card-icon {
  background: linear-gradient(135deg, #059669, #047857);
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.card-description {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  font-size: 0.75rem;
  color: #374151;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
}

.card-arrow {
  flex-shrink: 0;
  color: #9ca3af;
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.navigation-card:hover .card-arrow {
  color: #374151;
  transform: translateX(4px);
}

/* Información adicional */
.info-section {
  background: white;
  padding: 3rem 2rem;
  border-top: 1px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.info-item {
  text-align: center;
  padding: 1.5rem;
}

.info-icon {
  font-size: 2rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

.info-item h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.info-item p {
  color: #6b7280;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .welcome-header {
    padding: 2rem 1rem;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .navigation-cards {
    padding: 2rem 1rem;
  }
  
  .cards-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .navigation-card {
    padding: 1.5rem;
    flex-direction: column;
    text-align: center;
  }
  
  .card-arrow {
    display: none;
  }
  
  .info-section {
    padding: 2rem 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 1.75rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .navigation-card {
    padding: 1rem;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .card-title {
    font-size: 1.125rem;
  }
}
</style>

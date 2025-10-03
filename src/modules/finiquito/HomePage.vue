<template>
    <div>
      <header>
        <div class="header__steps">
          <div :class="{ 'header__steps__step--active': stepActiveRef === 0 }" class="header__steps__step">
            <div class="header__steps__icon">
              <i name="pi pi-user" class="pi pi-user"></i>
            </div>
            <p>Seleccion de Colaboradores</p>
          </div>
          <div :class="{ 'header__steps__step--active': stepActiveRef === 1 }" class="header__steps__step">
            <div class="header__steps__icon">
              <i name="pi pi-user" class="pi pi-calculator"></i>
            </div>
            <p>Calculo de Finiquito</p>
          </div>
          <div :class="{ 'header__steps__step--active': stepActiveRef === 2 }" class="header__steps__step">
            <div class="header__steps__icon">
              <i name="pi pi-user" class="pi pi-check"></i>
            </div>
            <p>Resultados</p>
          </div>
        </div>
      </header>
      <main>
        <div v-if="stepActiveRef === 0">
          <SeleccionPersonal/>
        </div>
        <div v-if="stepActiveRef === 1">
          <h2 class="text-xl font-bold mb-4">Cálculo Masivo de Finiquito</h2>
          <CalculoFiniquitoForm />
        </div>
        <div v-if="stepActiveRef === 2" class="result-container">
          <h2 class="text-xl font-bold mb-4">Resumen de finiquitos</h2>
          <Resultados ref="resultadoRef" />
        </div>
      </main>

      <!-- <footer class="foot-buttons">
        <Button label="Anterior" :disabled="stepActiveRef === 0" @click="prevStep" />
        <Button v-if="stepActiveRef == 0" label="Siguiente" :disabled="stepperStore.personasSeleccionadas.length === 0" @click="nextStep" />
        <Button v-if="stepActiveRef == 1" label="Simular" @click="simular" />
        <Button v-if="stepActiveRef == 2" label="Exportar" icon="pi pi-file-excel" severity='success' @click="exportar"/>
      </footer> -->
    </div>
  </template>
  <script lang="ts" setup>
  import { ref, computed,watch } from 'vue';
  import SeleccionPersonal from './SeleccionPersonal.vue';
  import CalculoFiniquitoForm from './CalculoFiniquitoForm.vue';
  import Resultados from './Resultado.vue';
  import { useStepperStore } from './steperSstore';
  import { useGlobalStore } from '../../store/global';
  
  const stepperStore = useStepperStore(); 
  const global = useGlobalStore();
  const stepActiveRef = ref(stepperStore.stepActive);
watch(() => stepperStore.stepActive, (val) => {
  stepActiveRef.value = val;
});
watch(
  stepActiveRef,
  (val) => {
    if (val !== stepperStore.stepActive) {
      stepperStore.setStepActive(val);
    }
  }
);

  </script>
  <style scoped>
.result-container {
  margin:auto;
  width:calc(100vw - 25rem);
  height:calc(100vh - 20rem);
}
.header__steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-inline: 1rem;
}
.header__steps__step {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 5px;
  padding-inline: 0.5rem;
  position: relative;
  opacity: 0.5;
}
.header__steps__step::after {
  content: '';
  position: absolute;
  right: 150%;
  top: 50%;
  transform: translateY(-50%);
  width: 20rem;
  height: 1px;
  background-color: #ccc;
}
.header__steps__step--active {
  background-color:#5a5656;
  color: white;
  opacity: 1;
}
.header__steps__icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
}
.foot-buttons {
  display: flex;
  gap: 1rem;
  justify-content: end;
}
.error {
  width: 100%;
  display: flex;
  justify-content: start;
  color: red;
  margin-bottom: 0rem;
}
  </style>
  
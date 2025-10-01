# Componentes del Módulo Bruto

Este directorio contiene los componentes reutilizables específicos del módulo de cálculo de bruto.

## ColaboradorSearchModal.vue

Modal de búsqueda avanzada de colaboradores con múltiples criterios de búsqueda y selección.

### Descripción

Componente modal que permite buscar colaboradores por diferentes criterios (correo electrónico, número de personal o nombre) y manejar resultados múltiples con selección individual.

### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `visible` | `boolean` | ✅ | Controla la visibilidad del modal |

### Eventos

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `update:visible` | `boolean` | Emitido cuando el modal debe cerrarse |
| `colaborador-selected` | `Colaborador` | Emitido cuando se selecciona un colaborador |

### Funcionalidades

#### Búsqueda Inteligente
- **Por correo electrónico**: Detecta automáticamente si el texto contiene `@`
- **Por número de personal (NP)**: Detecta si el texto son solo números
- **Por nombre**: Busca en `first_name`, `last_name` o nombre completo

#### Manejo de Resultados
- **Resultado único**: Muestra información detallada con botón de selección
- **Múltiples resultados**: Lista seleccionable con información de cada colaborador
- **Sin resultados**: Mensaje informativo cuando no se encuentran coincidencias
- **Manejo de errores**: Mensajes de error claros y informativos

#### Información Mostrada
- Nombre completo del colaborador
- Número de personal (NP)
- Correo electrónico (flesan o gmail)
- Centro de gestión
- Cargo

### Uso

```vue
<template>
  <ColaboradorSearchModal
    v-model:visible="modalVisible"
    @colaborador-selected="onColaboradorSelected"
  />
</template>

<script setup>
import ColaboradorSearchModal from '../Components/ColaboradorSearchModal.vue';

const modalVisible = ref(false);

const onColaboradorSelected = (colaborador) => {
  console.log('Colaborador seleccionado:', colaborador);
  // Manejar la selección del colaborador
};
</script>
```

### Dependencias

- **Repository global**: `colaboradoresRepository.ts` para operaciones de búsqueda
- **Tipos**: `Colaborador` interface del repository global
- **Iconos**: PrimeVue icons (`pi-*`)

### Estilos

El componente incluye estilos CSS completamente personalizados con:
- Diseño responsive para móviles y desktop
- Estados hover y focus
- Animaciones suaves
- Paleta de colores consistente con el proyecto
- Overlay modal con z-index apropiado

### Estados del Componente

1. **Inicial**: Campo de búsqueda vacío
2. **Buscando**: Indicador de carga durante la búsqueda
3. **Resultado único**: Información del colaborador encontrado
4. **Múltiples resultados**: Lista de colaboradores para seleccionar
5. **Sin resultados**: Mensaje cuando no hay coincidencias
6. **Error**: Mensaje de error en caso de falla en la búsqueda

### Validaciones

- Campo de búsqueda requerido antes de buscar
- Detección automática del tipo de búsqueda
- Manejo de errores 404 para colaboradores no encontrados
- Validación de entrada para evitar búsquedas vacías

### Accesibilidad

- Navegación por teclado (Enter para buscar)
- Botones con estados disabled apropiados
- Mensajes de estado claros
- Contraste de colores accesible
- Estructura semántica correcta

### Responsive Design

- Adaptable a pantallas móviles
- Layout flexible para diferentes tamaños
- Botones y elementos redimensionables
- Scroll interno para listas largas de resultados

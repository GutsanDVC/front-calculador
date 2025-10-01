# Módulo Bruto

## Descripción

El módulo **Bruto** es una herramienta de cálculo que permite determinar el valor bruto a partir del monto líquido en diferentes escenarios laborales. Está diseñado para facilitar los cálculos de remuneraciones y bonificaciones en el contexto de finiquitos y liquidaciones.

## Características Principales

- **Cálculo de Bono Sábados**: Calcula el bruto considerando horas extras trabajadas en sábados
- **Cálculo de Bonos**: Determina el bruto para bonificaciones generales
- **Cálculo de Sueldo Bruto**: Convierte montos líquidos a bruto para sueldos base
- **Búsqueda de Colaboradores**: Integración con el sistema de colaboradores por correo electrónico
- **Validación de Datos**: Sistema robusto de validación de entrada
- **Interfaz Intuitiva**: Diseño basado en wireframes con UX optimizada

## Estructura del Módulo

```
bruto/
├── Components/             # Componentes específicos del módulo (futuro)
├── Constants/             # Constantes y lógica de cálculos
│   ├── bruto.constants.ts    # Constantes generales del módulo
│   └── brutoCalculations.ts  # Lógica de cálculos y validaciones
├── Repositories/          # Manejo de datos y API calls
│   └── brutoRepository.ts    # Repository principal del módulo
├── Types/                 # Interfaces y tipos TypeScript
│   └── bruto.interface.ts    # Definiciones de tipos del módulo
├── Views/                 # Vistas principales
│   └── BonoSabadosPage.vue   # Vista de cálculo de bono sábados
├── README.md              # Esta documentación
└── routes.ts              # Configuración de rutas
```

## API del Store

Actualmente el módulo no utiliza un store centralizado, pero está preparado para implementarlo cuando sea necesario. Los cálculos se manejan directamente en los componentes con la lógica separada en archivos de utilidades.

## Uso del Módulo

### Cálculo de Bono Sábados

1. **Seleccionar Colaborador**: Usar el buscador por correo electrónico
2. **Ingresar Datos**:
   - Valor de hora extra (líquido)
   - Horas extras trabajadas
   - Monto bono pactado
3. **Calcular**: El sistema procesará los datos y mostrará:
   - Resultados principales (UF, salario mínimo)
   - Desglose de liquidación
   - Total bruto diferencia

### Integración con Colaboradores

```typescript
import { buscarColaboradorPorCorreo } from './Repositories/brutoRepository';

// Buscar colaborador por email
const colaborador = await buscarColaboradorPorCorreo('email@empresa.com');
```

### Realizar Cálculos

```typescript
import { calcularBrutoBonoSabados } from './Repositories/brutoRepository';

const requestData = {
  colaborador: selectedColaborador,
  valorHoraExtra: 5000,
  horasExtrasTrabajadas: 8,
  montoBonoPactado: 50000
};

const resultado = await calcularBrutoBonoSabados(requestData);
```

## Rutas del Módulo

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/bruto` | Redirect | Redirige a bono-sabados |
| `/bruto/bono-sabados` | BonoSabadosPage | Cálculo de bono sábados |
| `/bruto/bonos` | BonosPage | Cálculo de bonos generales |
| `/bruto/sueldo-bruto` | SueldoBrutoPage | Cálculo de sueldo bruto |

## Ejemplos de Uso

### Validación de Datos

```typescript
import { validateCalculoBrutoData } from './Constants/brutoCalculations';

const errors = validateCalculoBrutoData(requestData);
if (errors.length > 0) {
  console.log('Errores de validación:', errors);
}
```

### Formateo de Moneda

```typescript
import { formatCurrency, formatNumber } from './Constants/brutoCalculations';

const formatted = formatCurrency(150000); // "$150.000"
const number = formatNumber(150000); // "150.000"
```

## Componentes Principales

### BonoSabadosPage.vue

Componente principal para el cálculo de bono sábados que incluye:

- **Formulario de entrada**: Campos para datos del cálculo
- **Buscador de colaboradores**: Modal de búsqueda por email
- **Panel de resultados**: Visualización de cálculos y desglose
- **Validación en tiempo real**: Feedback inmediato al usuario

**Props**: Ninguna (componente de página)

**Eventos**: Ninguno (manejo interno de estado)

**Funcionalidades**:
- Búsqueda de colaboradores por correo
- Validación de formulario
- Cálculo de bruto con desglose
- Navegación entre pestañas
- Manejo de errores

## Testing

### Pruebas Unitarias

```bash
# Ejecutar pruebas del módulo
npm run test:unit -- --testPathPattern=bruto

# Ejecutar pruebas específicas
npm run test:unit -- brutoCalculations.test.ts
```

### Casos de Prueba Principales

- Validación de datos de entrada
- Cálculos matemáticos correctos
- Formateo de números y moneda
- Manejo de errores de API
- Búsqueda de colaboradores

## Roadmap

### Versión Actual (v1.0)
- ✅ Estructura base del módulo
- ✅ Vista de Bono Sábados
- ✅ Integración con colaboradores
- ✅ Lógica de cálculos básica

### Próximas Versiones

#### v1.1
- [ ] Vista de Bonos generales
- [ ] Vista de Sueldo Bruto
- [ ] Componentes reutilizables
- [ ] Store Pinia para estado global

#### v1.2
- [ ] Historial de cálculos
- [ ] Exportación de resultados
- [ ] Cálculos batch (múltiples colaboradores)
- [ ] Integración con sistema de reportes

#### v2.0
- [ ] Cálculos avanzados con impuestos
- [ ] Integración con nómina
- [ ] Dashboard de análisis
- [ ] API de cálculos externa

## Dependencias

### Internas
- `shared/apiClient`: Cliente HTTP para APIs
- `components/`: Componentes globales del proyecto

### Externas
- Vue 3 (Composition API)
- Vue Router 4
- TypeScript
- PrimeVue (iconos)

## Configuración

### Variables de Entorno

```env
# API endpoints (configurados en apiClient)
VITE_API_BASE_URL=http://localhost:8000
```

### Constantes Configurables

```typescript
// En bruto.constants.ts
export const BRUTO_CONSTANTS = {
  DEFAULT_UF_VALUE: 25,
  DEFAULT_MINIMUM_WAGE: 500000,
  // ... más constantes
};
```

## Contribución

### Agregar Nueva Vista

1. Crear componente en `Views/`
2. Agregar ruta en `routes.ts`
3. Actualizar constantes de navegación
4. Implementar lógica de cálculo específica
5. Agregar pruebas unitarias

### Modificar Cálculos

1. Actualizar lógica en `brutoCalculations.ts`
2. Modificar interfaces si es necesario
3. Actualizar repository si requiere API
4. Agregar/modificar pruebas
5. Actualizar documentación

---

**Nota**: Este módulo sigue las convenciones establecidas en las reglas del proyecto y mantiene consistencia con el resto de la aplicación.

---
trigger: manual
---

#Regla de modulos vue

El proyecto se estructura por modulos y cada modulo debe tener como minimo la siguiente estructura:
ModuleName/ 
├── Components/ # Componentes Vue específicos del módulo 
├── Repositories/ # Clases para manejo de datos y API calls 
├── Constants/ # Constantes, configuraciones y datos estáticos 
├── Store/ # Stores de Pinia para gestión de estado 
├── Types/ # Interfaces, tipos y enums de TypeScript 
├── Views/ # Páginas/vistas principales del módulo 
├── README.md # Documentación completa del módulo 
└── routes.ts # Configuración de rutas del módulo

## Descripción de Carpetas

### 📦 **Components/**
Contiene todos los componentes Vue reutilizables específicos del módulo.

**Convenciones:**
- Nombres en `PascalCase` (ej: `SettingCard.vue`, `UserForm.vue`)
- Un componente por archivo
- Incluir documentación JSDoc cuando sea complejo

**Ejemplo:**

Components/ 
├── SettingCard.vue 
├── CreateSettingForm.vue 
├── SettingCategoryTabs.vue 
└── SettingValueEditor.vue

### 🗄️ **Repositories/**
Clases que manejan la comunicación con APIs y fuentes de datos externas.

**Convenciones:**
- Nombres en `PascalCase` terminados en `Repository`
- Extender de `BaseRepository` cuando sea posible
- Un repositorio por entidad principal
- Métodos en `camelCase`

### 📋 **Constants/**
Datos estáticos, configuraciones y constantes del módulo.

**Convenciones:**
- Nombres en `camelCase` terminados en `.constants.ts`
- Constantes en `UPPER_SNAKE_CASE`
- Agrupar por funcionalidad

### 🏪 **Store/**
Stores de Pinia para gestión de estado global del módulo.

**Convenciones:**
- Nombres en `camelCase` terminados en `Store.ts`
- Usar Composition API (`defineStore` con función)
- Separar estado, getters y actions claramente

### 🏷️ **Types/**
Interfaces, tipos y enums de TypeScript específicos del módulo.

**Convenciones:**
- Nombres en `camelCase` terminados en `.interface.ts` o `.types.ts`
- Interfaces en `PascalCase`
- Enums en `PascalCase`
- Tipos de unión en `PascalCase`

### 📄 **Views/**
Páginas principales y vistas del módulo.

**Convenciones:**
- Nombres en `PascalCase` terminados en `Page.vue`
- Una vista por funcionalidad principal
- Usar composables para lógica compleja

### 📖 **README.md**
Documentación completa y específica del módulo.

**Convenciones:**
- Documentar todas las funcionalidades del módulo
- Incluir ejemplos de uso y API
- Mantener actualizada con cambios
- Seguir formato estándar de documentación

**Contenido requerido:**
markdown # Módulo [NombreModulo] ## Descripción ## Características Principales ## Estructura del Módulo ## API del Store ## Uso del Módulo ## Rutas del Módulo ## Ejemplos de Uso ## Componentes Principales ## Testing ## Roadmap
### 🛣️ **routes.ts**
Configuración de rutas del módulo para Vue Router.

**Convenciones:**
- Exportar array de rutas con nombre `[moduleName]Routes`
- Usar lazy loading para componentes
- Incluir meta información descriptiva


## Buenas Prácticas

### ✅ **Hacer**

1. **Seguir la estructura exacta** definida en este documento
2. **Usar nombres descriptivos** y consistentes
3. **Documentar interfaces complejas** con comentarios JSDoc
4. **Separar responsabilidades** claramente entre carpetas
5. **Usar TypeScript** en todos los archivos
6. **Implementar manejo de errores** en repositories y stores
7. **Crear componentes reutilizables** en lugar de duplicar código
8. **Registrar el módulo en el Sidebar**: cada vez que se cree un módulo nuevo, se debe agregar su ruta en sidebar-items.ts para que sea visible en la navegación del Sidebar.

### ❌ **Evitar**

1. **No crear carpetas adicionales** sin justificación
2. **No mezclar responsabilidades** entre carpetas
3. **No usar `any` en TypeScript** sin una razón válida
4. **No hardcodear valores** que deberían estar en constants
5. **No crear stores gigantes** - dividir por funcionalidad
6. **No ignorar las convenciones de nombres**
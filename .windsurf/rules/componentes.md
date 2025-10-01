# Regla de Componentes Vue

En el proyecto se distinguen dos tipos de componentes: **globales** y **de módulo**. Cada uno tiene su propia estructura y convenciones.

---

## 🌍 **Componentes Globales**

Se encuentran en una carpeta única `components/` y son accesibles desde cualquier parte del aplicativo mediante un archivo `index.ts`.

### 📁 **Estructura:**

```
components/
├── ComponentName.vue
├── OtroComponente.vue
├── ComponentName.types.ts      # (opcional) Tipos específicos
├── ComponentName.constants.ts  # (opcional) Constantes específicas
├── ComponentName.store.ts      # (opcional) Store si el componente lo requiere
├── ComponentName.class.ts      # (opcional) Clases relacionadas
├── README.md                   # Documentación y ejemplos de uso
└── index.ts                    # Exporta todos los componentes globales
```

### 📖 **Convenciones:**
- Nombre de archivo en `PascalCase`.
- Cada componente **debe** tener un `README.md` con:
  - Descripción
  - Props
  - Eventos
  - Ejemplos de uso
- Si el componente crece en complejidad, separar en archivos auxiliares (`types`, `constants`, `class`, `store`).
- Todo componente externo de terceros usado globalmente debe importarse también en `index.ts`.

---

## 📦 **Componentes de Módulo**

Cada módulo puede tener sus propios componentes reutilizables. Estos siguen la misma estructura que los globales, pero se ubican dentro del módulo correspondiente en una carpeta `Components/`.

### 📁 **Estructura:**

```
ModuleName/
├── Components/
│   ├── LocalComponent.vue
│   ├── LocalComponent.types.ts
│   ├── LocalComponent.constants.ts
│   ├── LocalComponent.store.ts
│   ├── LocalComponent.class.ts
│   └── README.md
```

### 📖 **Convenciones:**
- Nombres en `PascalCase`.
- Los componentes de módulo se usan **solo dentro del módulo** correspondiente.
- Si el componente es grande, aplicar la misma separación en archivos auxiliares (`types`, `constants`, `class`, `store`).
- Deben tener un `README.md` con documentación y ejemplos, aunque de alcance limitado al módulo.

---

## ✅ Buenas Prácticas

1. Centralizar imports de componentes globales en `index.ts`.
2. Mantener documentación clara y ejemplos actualizados en cada `README.md`.
3. Preferir componentes reutilizables antes de duplicar lógica.
4. Mantener separación clara entre globales y locales:  
   - **Global** → uso transversal en el proyecto.  
   - **Módulo** → uso restringido al contexto de un módulo.

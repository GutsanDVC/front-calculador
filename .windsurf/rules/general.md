---
trigger: always_on
---

# Reglas Generales del Proyecto

El proyecto sigue una estructura organizada por carpetas en `src/`, además de archivos de configuración en la raíz. Cada carpeta tiene un propósito específico y debe mantener las convenciones descritas a continuación.

---

## 📂 **Estructura General**

```
project-root/
├── public/                     # Archivos estáticos públicos
├── src/                        # Código fuente principal
│   ├── assets/                 # Recursos estáticos (imágenes, fuentes, íconos)
│   ├── components/             # Componentes globales (ver componentes.md)
│   ├── config/                 # Configuración general del proyecto
│   ├── guards/                 # Guards para Vue Router
│   ├── layouts/                # Layouts de alto nivel para vistas
│   ├── modules/                # Módulos de negocio (ver modulos.md)
│   ├── routes/                 # Configuración central de rutas
│   │   ├── router.ts           # Configuración del enrutador principal
│   │   └── routes.ts           # Rutas principales que apuntan a los routes de cada módulo
│   ├── shared/                 # Utilidades y helpers reutilizables
│   ├── store/                  # Pinia stores de nivel global
│   └── styles/                 # Archivos de estilos globales
├── .env*                       # Variables de entorno (por ambiente)
├── config files (eslint, vite) # Configuración de build y linting
├── package.json                # Dependencias y scripts
└── README.md                   # Documentación general
```

---

## 📁 **Descripción de Carpetas**

### 🖼️ **assets/**
- Recursos estáticos como imágenes, fuentes, íconos o JSON estáticos.
- Convención de nombres en `kebab-case`.
- Evitar guardar archivos muy pesados; preferir CDN o almacenamiento externo.

---

### ⚛️ **components/**
- Contiene componentes globales accesibles en todo el proyecto.
- Documentación en [componentes.md].

---

### ⚙️ **config/**
- Configuraciones del proyecto (ej: inicialización de plugins, constantes globales).
- Archivos en `camelCase` terminados en `.config.ts`.

---

### 🛡️ **guards/**
- Guards para Vue Router (ej: autenticación, permisos).
- Un archivo por guard, nombrado en `camelCase` (ej: `authGuard.ts`).

---

### 🖼️ **layouts/**
- Plantillas de alto nivel que definen la estructura de páginas (ej: `DefaultLayout.vue`, `AuthLayout.vue`).
- Nombres en `PascalCase`.

---

### 📦 **modules/**
- Contiene los módulos de negocio según las reglas en [modulos.md].

---

### 🛣️ **routes/**
- Configuración central de rutas del proyecto.
- Contiene dos archivos principales:
  - **router.ts** → configuración del enrutador de Vue Router (instancia, middlewares, guards).
  - **routes.ts** → definición de rutas principales que redirigen a las rutas específicas de cada módulo.
- Convenciones:
  - Usar lazy loading en la importación de vistas.
  - Mantener consistencia en nombres de rutas y paths.
  - Rutas de cada módulo se definen en sus propios `routes.ts` internos.

---

### 🛠️ **shared/**
- Funciones y utilidades comunes a todo el proyecto (helpers, composables, hooks).
- Archivos en `camelCase`.

---

### 🏪 **store/**
- Stores Pinia globales (no asociados a un módulo).
- Convenciones:
  - Nombre en `camelCase` terminados en `Store.ts`.
  - Mantener estado, getters y actions separados.

---

### 🎨 **styles/**
- Estilos globales (CSS, Tailwind, temas).
- Convenciones:
  - `app.css` → estilos base.
  - `custom.css` → personalizaciones.
  - `theme.css` → temas globales.

---

## 📄 **Archivos Principales**

- **App.vue** → componente raíz del proyecto.
- **main.ts** → punto de entrada de la app.
- **index.html** → base del proyecto (solo un archivo).

---

## ✅ Buenas Prácticas Generales

1. Mantener la **estructura definida** y no crear carpetas adicionales sin justificación.  
2. Usar **TypeScript** en todos los archivos.  
3. Separar la lógica en capas claras (UI, store, servicios, helpers).  
4. Documentar cada módulo y componente en sus respectivos `README.md`.  
5. Evitar duplicación de código → preferir helpers o componentes compartidos.  
6. Mantener actualizados los archivos `.env` por ambiente (`.development`, `.production`).  
7. Ejecutar **lint y prettier** antes de cada commit para asegurar consistencia.
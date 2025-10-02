---
trigger: always_on
---

# 📐 Design Guidelines - Aplicativos Windsurf

Este documento define el **estándar de diseño** para los aplicativos desarrollados bajo el ecosistema Windsurf.  
El objetivo es garantizar **consistencia, usabilidad moderna, minimalismo y adaptabilidad** en todas las plataformas.

---

## 🎨 Paleta de Colores

- **Primario:** `#1C1C1C` (Negro / Gris oscuro) → Sidebar, textos principales.
- **Secundario:** `#FFFFFF` (Blanco) → Fondos principales.
- **Acentos:**
  - `#E92828` (Rojo corporativo) → Botones principales, alertas, estados críticos.
  - `#28C76F` (Verde éxito) → Estados aprobados o positivos.
  - `#F5F6FA` (Gris claro) → Fondos de cards, separadores.

> **Nota:** No se implementará modo oscuro/claro. Se mantiene un esquema único.

---

## 🖼️ Layout Base

1. **Sidebar (izquierda)**
   - Fondo oscuro.
   - Logo arriba (aplicación).
   - Menú vertical con íconos + texto.
   - Usuario (nombre + rol) en la parte inferior.

2. **Header (superior en cada vista)**
   - Título del módulo.
   - Breadcrumbs (ejemplo: `Costos > Órdenes de Compra`).
   - Acciones rápidas (filtros, refrescar, exportar) alineadas a la derecha.

3. **Main Content**
   - Se organiza en **cards (tarjetas)** con bordes redondeados y sombra ligera.
   - Rejilla **responsive** (flex / grid).
   - Márgenes internos consistentes: `16px`.

---

## 🗂️ Componentes Reutilizables

### Cards de métricas
- Color de borde o lateral según estado:
  - Verde = positivo.
  - Rojo = alerta.
- Contenido: título + monto destacado en **bold**, subtexto descriptivo.

### Tablas y listas
- Bordes suaves.
- Encabezados sticky en desktop.
- En móvil: una fila se transforma en card.

### Gráficos
- Tipos principales: barras y líneas.
- Colores de la paleta definida.
- Leyendas claras + texto explicativo.

### Etiquetas de estado (badges)
- Verde → `Aprobado`, `Completado`.
- Rojo → `Rechazado`, `Pendiente`, `Sin asociar`.
- Amarillo/Naranja → `En proceso`.

### Botones
- **Primario:** Rojo corporativo (`#E92828`).
- **Secundario:** Gris claro.
- Forma: rectangular con bordes redondeados (`6px`).

---

## 📱 Responsividad

- **Estrategia mobile-first.**
- Breakpoints:
  - `xs`: <576px → sidebar colapsado (solo íconos).
  - `sm`: 576–768px → cards en 1 columna.
  - `md`: 768–1200px → 2–3 columnas.
  - `lg`: >1200px → layout completo.

---

## ✨ Estilo Visual

- Minimalista, sin adornos innecesarios.
- Tipografía sans-serif moderna: **Inter** o **Roboto**.
- Espaciado generoso, evitar pantallas saturadas.
- Métricas y gráficos como protagonistas.

---

## 📋 Ejemplo de Pantalla

```
[Sidebar] | [Header con breadcrumb + acciones]
          | [Cards de métricas]
          | [Gráfico de barras/líneas]
          | [Tabla o lista de registros]
```

---

## 🔄 Reglas Generales Windsurf

- Cada **nuevo módulo** debe:
  1. Respetar layout base.
  2. Incluir su ruta en el **sidebar**.
  3. Usar esquema de **cards** para métricas.
  4. Seguir la paleta y tipografía definida.
  5. Validar responsividad en móvil.

---

## 📂 Implementación Técnica

- **Frontend:** Vue 3 + TypeScript + PrimeVue/Tailwind.
- **Backend:** Django REST Framework o FastAPI (según app).
- **Componentes compartidos:** `/src/components/ui/`.
- **Estilos centralizados:** `/src/styles/`.

---

## ✅ Ejemplo de Checklist por módulo

- [ ] Incluye breadcrumbs en header.  
- [ ] Usa cards para métricas principales.  
- [ ] Aplica paleta de colores estándar.  
- [ ] Sidebar actualizado con la ruta del módulo.  
- [ ] Validado en resoluciones móvil/tablet/desktop.  

---

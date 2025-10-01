📚 Sidebar

El componente Sidebar implementa la barra lateral de navegación del layout principal. Gestiona los elementos de menú, submenús, estilos y eventos de interacción para navegación dentro del aplicativo.

📁 Estructura de Archivos
src/layouts/panel/sidebar/
├── Sidebar.vue                 # Componente principal de la barra lateral
├── SidebarItem.vue             # Componente para cada ítem del menú
├── sidebar.ts                  # Lógica y configuración del sidebar
├── sidebar-items.ts            # Definición de ítems del menú
├── sidebar-item.interface.ts   # Tipado de ítems del sidebar
└── SidebarStyles.css           # Estilos asociados al sidebar

⚙️ Descripción

Sidebar.vue
Renderiza la barra lateral completa. Controla el estado expandido/colapsado, renderiza los elementos del menú y gestiona eventos de navegación y logout.

SidebarItem.vue
Componente hijo para renderizar cada ítem del menú. Soporta ítems simples y con hijos (submenús).

sidebar.ts
Contiene lógica adicional y utilidades del sidebar, como funciones de control de estado o helpers.

sidebar-items.ts
Define los ítems del menú de navegación. Importa el tipado desde sidebar-item.interface.ts.

sidebar-item.interface.ts
Define la interfaz SidebarItem con propiedades como label, icon, route, children, etc.

SidebarStyles.css
Contiene los estilos dedicados para el sidebar, incluyendo soporte para modos:

Normal

Mini (colapsado)

Responsive (pantallas pequeñas)

🏷️ Props

El Sidebar no recibe props directas, pero consume los ítems definidos en sidebar-items.ts.

SidebarItem.vue recibe como prop obligatoria:

item: SidebarItem → Objeto con la información del ítem a renderizar.

📤 Emits

SidebarItem.vue emite eventos de navegación al seleccionar un ítem.

El evento principal se enlaza al Vue Router para cambiar la vista.

🖼️ Ejemplo de Uso
<script setup lang="ts">
import Sidebar from "@/layouts/panel/sidebar/Sidebar.vue"
</script>

<template>
  <div class="app-container">
    <Sidebar />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

🎨 Estilos

Variables CSS utilizadas:

--sidebar-background-color

--sidebar-text-color

--sidebar-primary-color

--sidebar-secondary-color

--sidebar-hover-color

--sidebar-hover-text-color

--sidebar-scrollbar-color

Soporta interacción hover, selección activa, submenús colapsables y mini sidebar.

✅ Buenas Prácticas

Definir todos los ítems del menú en sidebar-items.ts para mantener centralizada la configuración.

Usar la interfaz SidebarItem para garantizar tipado estricto.

Documentar en SidebarItem.vue si se añaden props o eventos adicionales.

Mantener consistencia en íconos y etiquetas de navegación.

Respetar los estilos y variables CSS ya definidas en SidebarStyles.css.
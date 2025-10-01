import { RouteRecordRaw } from 'vue-router';

export const settingsRoutes: RouteRecordRaw[] = [
  {
    name: 'Settings',
    path: 'settings',
    meta: {
      description: 'Configuración',
      icon: 'pi-cog',
    },
    component: () => import('./settings_page.vue'),
  },
];

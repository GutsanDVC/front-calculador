import { RouteRecordRaw } from 'vue-router';

export const homeRoutes: RouteRecordRaw[] = [
    {
        name: 'Home',
        path: 'home',
        meta: {
            description: 'Página de Inicio',
            icon: 'pi-home',
          },
        component: () => import('./HomePage.vue')
    }
]

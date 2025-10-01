import { RouteRecordRaw } from 'vue-router';

export const finiquitoRoutes: RouteRecordRaw[] = [
    {
        name: 'Finiquito',
        path: 'finiquito',
        meta: {
            description: 'Cálculo de Finiquito',
            icon: 'pi-calculator',
          },
        component: () => import('./HomePage.vue')
    }
]
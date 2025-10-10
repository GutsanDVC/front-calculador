// Configuración de rutas para el módulo de cálculo de bruto
// Define las rutas disponibles y sus configuraciones

import { RouteRecordRaw } from 'vue-router';

export const brutoRoutes: RouteRecordRaw[] = [
  {
    path: 'bruto',
    name: 'bruto',
    component: () => import('./Views/BrutoCalculatorPage.vue'),
    meta: {
      title: 'Calculador de Bruto',
      requiresAuth: true,
      breadcrumb: 'Calculador de Bruto'
    },
    children: [
      {
        path: '',
        redirect: 'bono-sabados'
      },
      {
        path: 'bono-sabados',
        name: 'bruto-bono-sabados',
        component: () => import('./Views/BonoSabadosPage.vue'),
        meta: {
          title: 'Bono Sábados - Calculador de Bruto',
          requiresAuth: true,
          breadcrumb: 'Bono Sábados'
        }
      },
      {
        path: 'bono',
        name: 'bruto-bono',
        component: () => import('./Views/BonoPage.vue'),
        meta: {
          title: 'Bonos - Calculador de Bruto',
          requiresAuth: true,
          breadcrumb: 'Bonos'
        }
      },
      {
        path: 'sueldo-bruto',
        name: 'bruto-sueldo-bruto',
        component: () => import('./Views/SueldoBrutoPage.vue'),
        meta: {
          title: 'Sueldo Bruto - Calculador de Bruto',
          requiresAuth: true,
          breadcrumb: 'Sueldo Bruto'
        }
      }
    ]
  }
  // Las siguientes rutas se habilitarán cuando se implementen las vistas correspondientes:
  // {
  //   path: '/bruto/bonos',
  //   name: 'bruto-bonos',
  //   component: () => import('./Views/BonosPage.vue'),
  //   meta: {
  //     title: 'Bonos - Calculador de Bruto',
  //     requiresAuth: true,
  //     breadcrumb: 'Bonos'
  //   }
  // }
];

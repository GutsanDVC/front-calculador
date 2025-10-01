import { RouteRecordRaw } from 'vue-router';
import { authRoutes } from '../modules/auth/routes';
import { errorRoutes } from '../modules/error/routes';
import { homeRoutes } from '../modules/home/routes';
import { finiquitoRoutes } from '../modules/finiquito/routes';
import { userRoutes } from '../modules/users/routes';
import { settingsRoutes } from '../modules/settings/routes';
import { brutoRoutes } from '../modules/bruto/routes';
import { useUserStore } from '../store/user';
import router from './router';

export const routes:RouteRecordRaw[] = [
// El guard de autenticación se implementa abajo

    {
        path: '/',
        redirect: '/auth'
    },
    {
        path: '/panel',
        redirect: '/panel/home',
        component: () => import('../layouts/panel/PanelLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            ...homeRoutes,
            ...finiquitoRoutes,
            ...userRoutes,
            ...settingsRoutes,
            ...brutoRoutes,
        ],
    },
    {
        path: '/auth',
        component: () => import('../layouts/auth/AuthLayout.vue'),
        children: [
            ...authRoutes
        ],
    },
    {
        path: '/error',
        component: () => import('../layouts/auth/AuthLayout.vue'),
        children: [
            ...errorRoutes
        ]
    },
    {
        path: '/:catchAll(.*)',
        redirect: '/error/404'
    }
]


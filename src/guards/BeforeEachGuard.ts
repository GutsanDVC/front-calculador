import { NavigationGuardWithThis } from "vue-router";
import { useUserStore } from "../store/user";
// Validaciones y Protección de rutas

const beforeEachGuard: NavigationGuardWithThis<undefined> = async (to, from, next) => {
    // Validación con el store de usuario (Pinia)
    const userStore = useUserStore();
    if (to.matched.some(record => record.meta.requiresAuth) && !userStore.userInfo.valid) {
        next('/auth');
        return;
    }
    // Pasaron las validaciones. El usuario cumple con los accesos necesarios.
    next();
};

export default beforeEachGuard;

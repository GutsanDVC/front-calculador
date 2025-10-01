import { defineStore } from "pinia";
import { ToastBodyInterface, ToastTypeMessageEnum } from "../shared/interfaces/toast-message.interface";
import { Utilities } from "../shared/classes/Utilities";
import { UserInterface } from "../modules/users/interfaces/user.interface";
import { RolInterface } from "../shared/interfaces/security.interface";

export interface SecurityState {
    user: UserInterface | null,
    roles: RolInterface[] | null,
    token: string | null,
    tokenExpiryTime: number | null
}

export const useSecurityStore = defineStore('security', {
    state: () => (
        {
            user: null,
            roles: null,
            supplier: null,
            token: null,
            tokenExpiryTime: null, // Expresado en segundos
        } as SecurityState
    ),
    actions: {
        // Método para limpiar el store
        clear() {
            this.$reset()
            localStorage.removeItem('token');
        },
        // Método para obtener el payload del token
        getPayload() {
            const tokenPayload = this.token.split(".")[1];
            const decodedPayload = atob(tokenPayload);
            const decodedUnicodePayload = decodeURIComponent(escape(decodedPayload));
            const payload = JSON.parse(decodedUnicodePayload);
            return payload;
        },
        // Método que valida si el token es válido, es decir, se pudo hacer su decodificación correctamente
        validateToken() {
            try {
                this.getPayload();
                return true;
            } catch (e) {
                return false;
            }
        },
        // Método para setear el usuario del store a partir del token
        setUser(token: string | null): UserInterface | null {
            if (!token) return null;

            this.token = token

            if (!this.validateToken()) {
                this.clear();
                return null;
            }

            try {
                const payload = this.getPayload()
                // En este apartado transforma el payload del token a la forma del usuario que estás trabajando
                localStorage.setItem('token', token);
                return this.user
            } catch (e) {
                return null
            }

        },
        // Método para validar constantemente el tiempo de expiración del token
        constantValidateToken() {
            setInterval(() => {
                if (!this.validateToken()) return;
                const payload = this.getPayload();
                const expirationTimestamp = payload.exp;
                const currentTime = Math.floor(Date.now() / 1000); // Hora actual en segundos
                const timeDifferenceSeconds = expirationTimestamp - currentTime;
                this.tokenExpiryTime = timeDifferenceSeconds
            }, 1000)
        }


    }
})

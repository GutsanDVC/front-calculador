<template>
	<div class="login-page">
		<!-- Logo del aplicativo -->
		<div class="app-logo">
			<img :src="global.utl.getFile(global.assets.LOGO_WHITE)" alt="Calculador de RRHH" />
		</div>

		<!-- Título principal -->
		<div class="login-header">
			<h1 class="login-title">Bienvenido</h1>
			<p class="login-subtitle">Ingrese sus credenciales para iniciar sesión</p>
		</div>

		<!-- Contenido del formulario -->
		<div class="login-content">
			<!-- Estados de carga y error -->
			<div v-if="isLoading" class="login-loading">
				<DotLoader msg="Verificando credenciales..." />
			</div>

			<div v-else-if="error" class="login-error">
				<InlineMessage severity="error" class="w-full">
					{{ msgError }}
				</InlineMessage>
			</div>

			<!-- Formulario de login -->
			<div v-else class="login-form">
				<div class="google-signin-wrapper">
					<GoogleSignInButton @success="handleOnSuccess" @error="handleOnError" />
				</div>
			</div>
		</div>

		<!-- Información del navegador -->
		<div class="browser-info">
			<div class="browser-info-content">
				<img :src="global.utl.getFile(global.assets.CHROME)" width="14" height="14" alt="Chrome">
				<span>Sistema optimizado para Google Chrome</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CredentialResponse, GoogleSignInButton } from 'vue3-google-signin';
import { useTokenClient } from 'vue3-google-signin';
import { useGlobalStore } from '../../store/global';
import { AuthService } from './services/AuthService';
import { onMounted } from 'vue';
import {useUserStore} from '../../store/user';
import {UserInfo} from '../../store/user';
import DotLoader from '../../components/DotLoader.vue';
import InlineMessage from 'primevue/inlinemessage';

const global = useGlobalStore();
const user = useUserStore();
const isLoading = ref(false);
const error = ref(false);
const msgError = ref('');

onMounted(() => {
})

const handleOnSuccess = async (response: CredentialResponse) => {
	try {
		isLoading.value = true;
		if (!response.credential) {
			isLoading.value = false;
			error.value = true;
			msgError.value = 'Credenciales inválidas';
			return;
		}
		console.log(response.credential)
		const authResponse: UserInfo = await AuthService.verify(response.credential);
		if (!authResponse.valid) {
			isLoading.value = false;
			msgError.value = 'Usuario no tiene acceso, comuniquese con su administrador';
			error.value = true;
			return
		}
		global.utl.genToast(global.tstType.LOGIN_SUCCESS);
		user.setUserInfo(authResponse);
		global.utl.navigate('Home');
		isLoading.value = false;
	} catch (e: any) {
		isLoading.value = false;
		msgError.value = 'Error desconocido al verificar credenciales';
		error.value = true;
		console.error('Error desconocido al verificar credenciales:', e);
	}
};

const handleOnError = () => { };

const { isReady, login } = useTokenClient({
	onSuccess: handleOnSuccess,
	onError: handleOnError,
});
</script>

<style scoped>
/* Contenedor principal del login */
.login-page {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	padding: 1rem;
	box-sizing: border-box;
}

/* Logo del aplicativo */
.app-logo {
	margin-bottom: 2rem;
	text-align: center;
}

.app-logo img {
	max-width: 180px;
	height: auto;
}

/* Header del login */
.login-header {
	text-align: center;
	margin-bottom: 2rem;
}

.login-title {
	color: #1c1c1c;
	font-size: 2.5rem;
	font-weight: 400;
	margin: 0;
	letter-spacing: -0.02em;
}
.login-subtitle {
	color: #6c757d;
	font-size: 1rem;
	margin: 0;
}
/* Contenido principal */
.login-content {
	width: 100%;
	max-width: 350px;
	margin-bottom: 2rem;
}

/* Estados de carga y error */
.login-loading,
.login-error {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 1rem 0;
}

.login-error {
	margin-bottom: 1rem;
}

/* Formulario de login */
.login-form {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.google-signin-wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
}

/* Información del navegador */
.browser-info {
	background: #f8f9fa;
	border: 1px solid #e9ecef;
	border-radius: 8px;
	padding: 0.75rem 1rem;
	text-align: center;
	max-width: 350px;
	width: 100%;
}

.browser-info-content {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	color: #495057;
	font-size: 0.875rem;
}

.browser-info-content img {
	flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
	.login-page {
		padding: 1.5rem 1rem;
	}

	.app-logo {
		margin-bottom: 1.5rem;
	}

	.app-logo img {
		max-width: 150px;
	}

	.login-header {
		margin-bottom: 1.5rem;
	}

	.login-title {
		font-size: 2rem;
	}

	.login-content {
		margin-bottom: 1.5rem;
	}
}

@media (max-width: 480px) {
	.login-page {
		padding: 1rem 0.75rem;
	}

	.app-logo {
		margin-bottom: 1rem;
	}

	.app-logo img {
		max-width: 120px;
	}

	.login-header {
		margin-bottom: 1rem;
	}

	.login-title {
		font-size: 1.75rem;
	}

	.login-content {
		margin-bottom: 1rem;
	}

	.browser-info-content {
		font-size: 0.8rem;
	}
}

/* Estados hover y focus */
.browser-info {
	transition: all 0.2s ease;
}

.browser-info:hover {
	background: #f1f3f4;
	border-color: #dee2e6;
}

/* Animaciones */
.login-page {
	animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* Mejoras para componentes PrimeVue */
:deep(.p-inline-message) {
	border-radius: 8px;
	font-size: 0.875rem;
	width: 100%;
}

:deep(.p-inline-message.p-inline-message-error) {
	background: #fef2f2;
	border: 1px solid #fecaca;
	color: #dc2626;
}

/* Estilos para el botón de Google */
:deep(.google-signin-button) {
	width: 100%;
	max-width: 300px;
}
</style>
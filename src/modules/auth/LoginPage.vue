<template>
	<div class="flex flex-column align-items-center">
		<GoogleSignInButton @success="handleOnSuccess" @error="handleOnError" />
		<div v-ripple class="p-2 bg-primary mt-2 border-round  p-ripple text-center select-none ">
			<img :src="global.utl.getFile(global.assets.CHROME)" width="12">
			<span class="ml-2 text-sm">Sistema optimizado para navegador Google Chrome.</span>
		</div>
	</div>
	<DotLoader v-if="isLoading" msg="Verificando credenciales..." />
	<InlineMessage v-else-if="error" severity="error" text="" >
		{{ msgError }}
	</InlineMessage>
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
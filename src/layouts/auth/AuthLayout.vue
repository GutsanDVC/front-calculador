<template>
	<div class="auth-layout">
		<!-- Panel izquierdo - Diseño geométrico -->
		<div class="auth-left-panel">
			<div class="geometric-design">
				<div class="geometric-shape"></div>
			</div>
		</div>

		<!-- Panel derecho - Formulario de login -->
		<div class="auth-right-panel">
			<div class="auth-content">
				<!-- Logo del grupo en la parte superior -->
				<div class="group-logo">
					<img :src="global.utl.getFile(global.assets.LOGO_GRUPO_FLESAN)" alt="Grupo Flesan" />
				</div>

				<!-- Contenedor del formulario -->
				<div class="login-container">
					<router-view></router-view>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useGlobalStore } from '../../store/global';

const global = useGlobalStore();

</script>

<style scoped>
/* Layout principal - Split screen */
.auth-layout {
	display: flex;
	height: 100vh;
	overflow: hidden;
}

/* Panel izquierdo - Diseño geométrico */
.auth-left-panel {
	flex: 1;
	background: linear-gradient(135deg, #4a4a4a 0%, #2c2c2c 100%);
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.geometric-design {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.geometric-shape {
	position: absolute;
	top: 0;
	right: 0;
	width: 60%;
	height: 100%;
	background: #E92828;
	clip-path: polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%);
	z-index: 1;
}

/* Panel derecho - Formulario */
.auth-right-panel {
	flex: 1;
	background: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 2rem;
	box-sizing: border-box;
}

.auth-content {
	width: 100%;
	max-width: 400px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* Logo del grupo */
.group-logo {
	margin-bottom: 2rem;
	text-align: center;
}

.group-logo img {
	max-width: 200px;
	height: auto;
}

/* Contenedor del login */
.login-container {
	width: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
	.auth-layout {
		flex-direction: column;
	}

	.auth-left-panel {
		flex: 0 0 200px;
		order: 2;
	}

	.geometric-shape {
		clip-path: polygon(0% 70%, 100% 30%, 100% 100%, 0% 100%);
		width: 100%;
		height: 70%;
		bottom: 0;
		top: auto;
	}

	.auth-right-panel {
		flex: 1;
		order: 1;
		padding: 1.5rem;
	}

	.group-logo {
		margin-bottom: 1.5rem;
	}

	.group-logo img {
		max-width: 150px;
	}
}

@media (max-width: 480px) {
	.auth-right-panel {
		padding: 1rem;
	}

	.auth-left-panel {
		flex: 0 0 150px;
	}

	.group-logo {
		margin-bottom: 1rem;
	}

	.group-logo img {
		max-width: 120px;
	}
}
</style>

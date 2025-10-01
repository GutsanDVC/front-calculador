<template>
	<div class="h-screen grid p-0 relative">

		<div class=" flex p-0 flex-column justify-content-between align-items-center relative"
			id="login-panel">
			<div class="flex justify-content-center relative w-full z-2 pt-6">
				<div class="w-18rem" id="login-slot-group-image">
					<img :src="global.utl.getFile(global.assets.LOGO_GRUPO_FLESAN)" class="w-full">
				</div>
			</div>
			<div class="flex justify-content-center">
				<div class="w-25rem" id="login-slot-group-image">
					<img :src="global.utl.getFile(global.assets.LOGO_WHITE)" class="w-full">
				</div>
			</div>
			<div class="surface-card p-5 shadow-2 border-round w-full sm:w-25rem z-3 h-20rem" id="login-slot">
				<router-view></router-view>
			</div>
			<div class="w-full flex  justify-content-center bg-white z-2">
				<img :src="global.utl.getFile(global.assets.CINTA_LOGOS)" class="w-30rem">
			</div>

			<div class="absolute left-0 right-0 bottom-0 top-0 z-1" id="images-gray-squares"></div>

		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from 'vue';
import { useGlobalStore } from '../../store/global';

const global = useGlobalStore();

</script>

<style>
@import './AuthLayoutStyles.css';
</style>

<template>
    <div class="header">
        <!-- <div class="header-toggle-nav" @click="toggleFloatNav">
            <i :class="`pi pi-align-justify font-bold text-primary`"></i>
        </div> -->
        <div class="header-title">
            <i :class="`pi ${icon} pr-2 font-bold text-primary`"></i>
            <span class="line-height-1 text-gray-800 font-bold">
                {{ description }}
            </span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
// import { useSidebarStore } from '../../../store/sidebar';
import { useRoute } from 'vue-router';
import { routes } from '../../../routes/routes';

const icon = ref<string | undefined>('');
const description = ref<string | undefined>('');

// const sidebar = useSidebarStore();

const route = useRoute();

onMounted(() => {
    getData();
})

watch(() => route.fullPath, () => {
    getData();
})

const getData = () => {
    const routePanel = routes.find(r => r.path == '/panel');
    const routeSelected = routePanel?.children?.find(rp => window.location.href.endsWith(rp.path));
    icon.value = routeSelected?.meta?.icon as string;
    description.value = routeSelected?.meta?.description as string;
}

// const toggleFloatNav = () => {
//     sidebar.setSiteClass(sidebar.siteClass == 'floatnav' ? '' : 'floatnav');
// }
</script>

<style scoped>
@import './HeaderStyles.css';
</style>
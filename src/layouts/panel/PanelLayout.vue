<template>
    <div id="page" :class="`site ${sidebar.siteClass}`">
        <Sidebar></Sidebar>
        <div class="main">
            <div class="container">
                <Header></Header>
                <div class="panel">
                    <router-view></router-view>
                </div>
                <Footer></Footer>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import Sidebar from './sidebar/Sidebar.vue';
import Footer from './footer/Footer.vue';
import Header from './header/Header.vue';
import { useSidebarStore } from './sidebar/sidebar';

const sidebar = useSidebarStore();


</script>

<style>
@import './sidebar/SidebarStyles.css';
@import './PanelStyles.css';
</style>
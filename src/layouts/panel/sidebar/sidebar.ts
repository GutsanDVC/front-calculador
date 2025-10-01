import { defineStore } from "pinia";

export interface SidebarState {
    siteClass: string
    currentRoute: string | null
    userGlobal: boolean
}

export const useSidebarStore = defineStore('sidebar', {
    state: () => (
        {
            siteClass: '',
            currentRoute: null,
            userGlobal: false
        } as SidebarState
    ),
    actions: {
        setSiteClass(value: string) {
            this.siteClass = value;
            window.localStorage.setItem('siteClass', value);
        },
        setCurrentRoute(value: string) {
            this.currentRoute = value;
            window.localStorage.setItem('currentRoute', value);
        },
        setUserGlobal(value: boolean) {
            this.userGlobal = value;
        }
    }
})
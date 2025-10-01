import { SidebarItemInterface, SidebarTypeItemEnum } from "./sidebar-item.interface";




export const SidebarItems: SidebarItemInterface[] = [
    {
        name: 'Opciones',
        type: SidebarTypeItemEnum.TITLE
    },
    {
        name: 'Inicio',
        pathName: 'Home',
        icon: 'pi-home',
        type: SidebarTypeItemEnum.ITEM
    },
    {
        name: 'Calculador de Finiquitos',
        pathName: 'Finiquito',
        icon: 'pi-calculator',
        type: SidebarTypeItemEnum.ITEM
    },
    {
        name: 'Calculador de Bruto',
        pathName: 'bruto-bono-sabados',
        icon: 'pi-chart-line',
        type: SidebarTypeItemEnum.ITEM
    },
    {
        name: 'Configuración',
        pathName: 'Settings',
        icon: 'pi-cog',
        type: SidebarTypeItemEnum.ITEM
    },
]
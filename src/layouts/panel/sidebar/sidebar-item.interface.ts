
export interface SidebarItemInterface {
    name: string
    type: SidebarTypeItemEnum
    pathName?: string
    icon?: string
    children?: SidebarItemChildrenInterface[]
}

export interface SidebarItemChildrenInterface {
    name: string
    pathName: string
}

export enum SidebarTypeItemEnum {
    TITLE = 'TITLE',
    ITEM = 'ITEM',
    DROPDOWN_ITEMS = 'DROPDOWN_ITEMS',
}
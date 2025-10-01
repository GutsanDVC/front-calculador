import { defineStore } from 'pinia';

export interface AdminAccess {
  cc: string;
  empresa: string;
  ver_planta: boolean;
}
interface UserData {
  email: string;
  name: string;
  global_access: boolean;
  ver_nfg: boolean;
  admin_access: AdminAccess[];
}

export interface UserInfo {
  valid: boolean;
  data: UserData;
  message: string;
}

const defaultUserInfo: UserInfo = {
  valid: false,
  data: {
    email: '',
    name: '',
    global_access: false,
    ver_nfg: false,
    admin_access: [],
  },
  message: '',
};

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: { ...defaultUserInfo } as UserInfo,
  }),
  actions: {
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
    },
    clearUserInfo() {
      this.userInfo = { ...defaultUserInfo };
    },
  },
});
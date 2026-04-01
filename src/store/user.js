import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    username: '',
    role: '',
    merchantId: ''
  }),
  persist: {
    key: 'admin-user',
    storage: localStorage,
    paths: ['token', 'username', 'role', 'merchantId']
  },
  actions: {
    login(userInfo) {
      this.token = userInfo.token
      this.username = userInfo.username
      this.role = userInfo.role
      this.merchantId = userInfo.merchantId
    },
    logout() {
      this.token = ''
      this.username = ''
      this.role = ''
      this.merchantId = ''
    }
  },
  getters: {
    isLogin: (state) => !state.token,
    isAdmin: (state) => state.role === 'admin',
    isMerchant: (state) => state.role === 'merchant'
  }
})
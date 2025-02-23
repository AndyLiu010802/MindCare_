import { reactive, watchEffect } from 'vue'

const savedAuthState = JSON.parse(localStorage.getItem('authState')) || {
  user: null,
  isAuthenticated: false,
  accountType: ''
}

export const authState = reactive(savedAuthState)

watchEffect(() => {
  localStorage.setItem('authState', JSON.stringify(authState))
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '@/firebase/config'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  let resolveInit = null
  const initPromise = new Promise(resolve => { resolveInit = resolve })

  function init() {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
      resolveInit(firebaseUser)
    })
    return initPromise
  }

  async function register(email, password) {
    error.value = null
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = credential.user
      return credential.user
    } catch (err) {
      error.value = getErrorMessage(err.code)
      throw err
    }
  }

  async function login(email, password) {
    error.value = null
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      user.value = credential.user
      return credential.user
    } catch (err) {
      error.value = getErrorMessage(err.code)
      throw err
    }
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    error.value = null
  }

  function clearError() {
    error.value = null
  }

  function getErrorMessage(code) {
    const messages = {
      'auth/email-already-in-use': 'Este e-mail já está em uso.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-credential': 'E-mail ou senha inválidos.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.'
    }
    return messages[code] || 'Ocorreu um erro. Tente novamente.'
  }

  return { user, loading, error, isAuthenticated, init, register, login, logout, clearError }
})

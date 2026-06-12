<template>
  <v-container class="auth-bg fill-height d-flex align-center justify-center pa-4" fluid>
    <v-row justify="center" class="w-100">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">

        <!-- Logo -->
        <div class="text-center mb-6">
          <v-avatar color="white" size="72" class="mb-3 elevation-4">
            <v-icon size="40" color="primary">mdi-wallet</v-icon>
          </v-avatar>
          <h1 class="text-h5 font-weight-bold text-white">Controle de Despesas</h1>
          <p class="text-body-2 text-white mt-1" style="opacity: 0.85">
            Crie sua conta e comece agora
          </p>
        </div>

        <!-- Card de cadastro -->
        <v-card class="pa-2" elevation="12" rounded="xl">
          <v-card-title class="text-h6 font-weight-bold text-center pt-5 pb-2">
            Criar Nova Conta
          </v-card-title>
          <v-card-subtitle class="text-center pb-4">
            Preencha os dados abaixo para se cadastrar
          </v-card-subtitle>

          <v-card-text class="px-6">
            <v-form ref="form" @submit.prevent="handleRegister" v-model="isFormValid">
              <v-text-field
                v-model="email"
                label="E-mail"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                :rules="emailRules"
                autocomplete="email"
                class="mb-3"
                @input="authStore.clearError()"
              />

              <v-text-field
                v-model="password"
                label="Senha"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :rules="passwordRules"
                autocomplete="new-password"
                hint="Mínimo de 6 caracteres"
                class="mb-3"
              />

              <v-text-field
                v-model="confirmPassword"
                label="Confirmar Senha"
                :type="showConfirm ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-check-outline"
                :append-inner-icon="showConfirm ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirm = !showConfirm"
                :rules="confirmRules"
                autocomplete="new-password"
                class="mb-4"
              />

              <v-slide-y-transition>
                <v-alert
                  v-if="authStore.error"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  :text="authStore.error"
                  closable
                  @click:close="authStore.clearError()"
                />
              </v-slide-y-transition>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                prepend-icon="mdi-account-plus"
                class="mb-2"
              >
                Criar Conta
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider />

          <v-card-text class="text-center py-4">
            <span class="text-body-2 text-medium-emphasis">Já tem uma conta? </span>
            <router-link
              to="/login"
              class="text-primary font-weight-bold text-decoration-none"
            >
              Entrar agora
            </router-link>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const isFormValid = ref(false)
const form = ref(null)

const emailRules = [
  v => !!v || 'E-mail é obrigatório',
  v => /.+@.+\..+/.test(v) || 'Formato de e-mail inválido'
]

const passwordRules = [
  v => !!v || 'Senha é obrigatória',
  v => v.length >= 6 || 'Mínimo de 6 caracteres'
]

const confirmRules = [
  v => !!v || 'Confirmação de senha é obrigatória',
  v => v === password.value || 'As senhas não coincidem'
]

async function handleRegister() {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await authStore.register(email.value, password.value)
    router.push('/dashboard')
  } catch {
    // erro tratado na store
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-bg {
  background: linear-gradient(135deg, #3949AB 0%, #1A237E 50%, #311B92 100%);
  min-height: 100vh;
}
</style>

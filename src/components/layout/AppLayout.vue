<template>
  <v-layout>
    <!-- Sidebar (Desktop) -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail && !mobile"
      :permanent="!mobile"
      color="surface"
      border="end"
    >
      <!-- Logo -->
      <v-list-item
        prepend-icon="mdi-wallet"
        title="Controle de Despesas"
        nav
        class="py-4"
        :class="{ 'px-2': rail && !mobile }"
      >
        <template v-if="!mobile" #append>
          <v-btn
            :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            variant="text"
            size="small"
            @click="rail = !rail"
          />
        </template>
      </v-list-item>

      <v-divider />

      <!-- Usuário -->
      <v-list-item
        prepend-icon="mdi-account-circle"
        :title="userEmail"
        subtitle="Usuário autenticado"
        class="py-3 text-truncate"
        lines="two"
      />

      <v-divider />

      <!-- Navegação -->
      <v-list density="compact" nav class="mt-2 px-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.to"
          active-color="primary"
          rounded="lg"
          class="mb-1"
        />
      </v-list>

      <template #append>
        <v-divider />
        <v-list density="compact" nav class="my-2 px-2">
          <v-list-item
            prepend-icon="mdi-brightness-6"
            title="Alternar Tema"
            rounded="lg"
            class="mb-1"
            @click="toggleTheme"
          />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Sair"
            rounded="lg"
            color="error"
            @click="handleLogout"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- App Bar (mobile) -->
    <v-app-bar v-if="mobile" elevation="0" border="b" color="surface">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title class="font-weight-bold">{{ currentTitle }}</v-app-bar-title>
      <template #append>
        <v-btn icon="mdi-brightness-6" variant="text" @click="toggleTheme" />
        <v-btn icon="mdi-logout" variant="text" color="error" @click="handleLogout" />
      </template>
    </v-app-bar>

    <!-- Conteúdo principal -->
    <v-main :style="{ background: 'rgb(var(--v-theme-background))' }">
      <v-container fluid class="pa-4 pa-md-6" style="max-width: 1400px">
        <slot />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useExpensesStore } from '@/stores/expenses'

const router = useRouter()
const route = useRoute()
const { mobile } = useDisplay()
const authStore = useAuthStore()
const expensesStore = useExpensesStore()

const toggleTheme = inject('toggleTheme', () => {})

const drawer = ref(!mobile.value)
const rail = ref(false)

const navItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
  { title: 'Despesas', icon: 'mdi-cash-multiple', to: '/despesas' },
  { title: 'Relatórios', icon: 'mdi-chart-bar', to: '/relatorios' }
]

const userEmail = computed(() => authStore.user?.email ?? '')
const currentTitle = computed(() => navItems.find(i => i.to === route.path)?.title ?? 'Menu')

onMounted(() => expensesStore.startListening())

async function handleLogout() {
  expensesStore.stopListening()
  await authStore.logout()
  router.push('/login')
}
</script>

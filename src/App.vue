<template>
  <v-app :theme="theme">
    <router-view />
  </v-app>
</template>

<script setup>
import { ref, provide } from 'vue'

const theme = ref('light')

provide('toggleTheme', () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
})

provide('currentTheme', theme)
</script>

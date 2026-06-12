<template>
  <AppLayout>

    <!-- Cabeçalho -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold">Dashboard</h1>
        <p class="text-body-2 text-medium-emphasis">
          Olá, {{ userEmail }} — aqui está seu resumo financeiro
        </p>
      </div>
      <v-btn-toggle
        v-model="selectedPeriod"
        density="compact"
        mandatory
        color="primary"
        variant="outlined"
        rounded="lg"
      >
        <v-btn value="week" size="small">7 dias</v-btn>
        <v-btn value="month" size="small">Este mês</v-btn>
        <v-btn value="year" size="small">Este ano</v-btn>
      </v-btn-toggle>
    </div>

    <!-- Cards de resumo -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" xl="3">
        <v-card class="summary-card" color="primary" rounded="xl">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-2 text-white mb-1" style="opacity: 0.85">Total do Período</p>
                <p class="text-h5 font-weight-bold text-white">{{ formatCurrency(stats.total) }}</p>
              </div>
              <v-avatar color="white" size="52" style="opacity: 0.9">
                <v-icon color="primary" size="28">mdi-cash-multiple</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" xl="3">
        <v-card class="summary-card" color="error" rounded="xl">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-2 text-white mb-1" style="opacity: 0.85">Maior Gasto</p>
                <p class="text-h5 font-weight-bold text-white">{{ formatCurrency(stats.max) }}</p>
              </div>
              <v-avatar color="white" size="52" style="opacity: 0.9">
                <v-icon color="error" size="28">mdi-trending-up</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" xl="3">
        <v-card class="summary-card" color="success" rounded="xl">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-2 text-white mb-1" style="opacity: 0.85">Média por Lançamento</p>
                <p class="text-h5 font-weight-bold text-white">{{ formatCurrency(stats.avg) }}</p>
              </div>
              <v-avatar color="white" size="52" style="opacity: 0.9">
                <v-icon color="success" size="28">mdi-calculator-variant</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" xl="3">
        <v-card class="summary-card" color="info" rounded="xl">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-2 text-white mb-1" style="opacity: 0.85">Total de Lançamentos</p>
                <p class="text-h5 font-weight-bold text-white">{{ filteredExpenses.length }}</p>
              </div>
              <v-avatar color="white" size="52" style="opacity: 0.9">
                <v-icon color="info" size="28">mdi-receipt-text</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráficos -->
    <v-row class="mb-6">
      <!-- Pizza por Categoria -->
      <v-col cols="12" md="5">
        <v-card rounded="xl" height="100%">
          <v-card-title class="d-flex align-center pa-4 pb-2">
            <v-icon color="primary" class="mr-2">mdi-chart-pie</v-icon>
            <span class="text-subtitle-1 font-weight-bold">Gastos por Categoria</span>
          </v-card-title>
          <v-card-text>
            <div v-if="filteredExpenses.length > 0" style="height: 280px; position: relative;">
              <Pie :data="categoryChartData" :options="pieOptions" />
            </div>
            <div v-else class="d-flex flex-column align-center justify-center py-10 text-medium-emphasis">
              <v-icon size="56" color="grey-lighten-2">mdi-chart-pie-outline</v-icon>
              <p class="mt-3 text-body-2">Nenhuma despesa no período selecionado</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Barras por mês -->
      <v-col cols="12" md="7">
        <v-card rounded="xl" height="100%">
          <v-card-title class="d-flex align-center pa-4 pb-2">
            <v-icon color="primary" class="mr-2">mdi-chart-bar</v-icon>
            <span class="text-subtitle-1 font-weight-bold">Evolução Mensal (últimos 6 meses)</span>
          </v-card-title>
          <v-card-text>
            <div style="height: 280px; position: relative;">
              <Bar :data="monthlyChartData" :options="barOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Despesas Recentes -->
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center pa-4 pb-0">
        <v-icon color="primary" class="mr-2">mdi-history</v-icon>
        <span class="text-subtitle-1 font-weight-bold">Despesas Recentes</span>
        <v-spacer />
        <v-btn
          variant="text"
          color="primary"
          to="/despesas"
          size="small"
          append-icon="mdi-arrow-right"
        >
          Ver todas
        </v-btn>
      </v-card-title>
      <v-divider class="mt-3" />

      <div v-if="expensesStore.loading" class="text-center py-10">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-3 text-body-2 text-medium-emphasis">Carregando...</p>
      </div>

      <v-list v-else-if="recentExpenses.length > 0" lines="two">
        <template v-for="(expense, i) in recentExpenses" :key="expense.id">
          <v-list-item class="py-3 px-4">
            <template #prepend>
              <v-avatar :color="getCategoryColor(expense.category)" size="44">
                <v-icon :icon="getCategoryIcon(expense.category)" color="white" size="22" />
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-medium">{{ expense.description }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ getCategoryTitle(expense.category) }} &bull; {{ formatDate(expense.date) }}
            </v-list-item-subtitle>
            <template #append>
              <v-chip color="error" variant="tonal" size="small" class="font-weight-bold">
                {{ formatCurrency(expense.value) }}
              </v-chip>
            </template>
          </v-list-item>
          <v-divider v-if="i < recentExpenses.length - 1" inset />
        </template>
      </v-list>

      <div v-else class="text-center py-10 text-medium-emphasis">
        <v-icon size="64" color="grey-lighten-2">mdi-receipt-text-outline</v-icon>
        <p class="mt-3 text-body-1 font-weight-medium">Nenhuma despesa registrada ainda</p>
        <p class="text-body-2 mb-4">Comece adicionando sua primeira despesa</p>
        <v-btn color="primary" to="/despesas" prepend-icon="mdi-plus">
          Adicionar Despesa
        </v-btn>
      </div>
    </v-card>

  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Pie, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Title
} from 'chart.js'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useExpensesStore, CATEGORIES } from '@/stores/expenses'
import { useAuthStore } from '@/stores/auth'

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Title)

const expensesStore = useExpensesStore()
const authStore = useAuthStore()

const selectedPeriod = ref('month')
const userEmail = computed(() => authStore.user?.email ?? '')

// Filtrar por período
const filteredExpenses = computed(() => {
  const now = new Date()
  const start = new Date()

  if (selectedPeriod.value === 'week') {
    start.setDate(now.getDate() - 7)
  } else if (selectedPeriod.value === 'month') {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
  } else {
    start.setMonth(0, 1)
    start.setHours(0, 0, 0, 0)
  }

  return expensesStore.expenses.filter(e => new Date(e.date) >= start)
})

const recentExpenses = computed(() => filteredExpenses.value.slice(0, 6))

// Estatísticas
const stats = computed(() => {
  const list = filteredExpenses.value
  const total = list.reduce((s, e) => s + e.value, 0)
  return {
    total,
    max: list.length ? Math.max(...list.map(e => e.value)) : 0,
    avg: list.length ? total / list.length : 0
  }
})

// Dados do gráfico de pizza (categorias)
const categoryChartData = computed(() => {
  const grouped = {}
  filteredExpenses.value.forEach(e => {
    grouped[e.category] = (grouped[e.category] || 0) + e.value
  })

  const cats = CATEGORIES.filter(c => grouped[c.value])
  return {
    labels: cats.map(c => c.title),
    datasets: [{
      data: cats.map(c => grouped[c.value]),
      backgroundColor: cats.map(c => c.color),
      borderWidth: 3,
      borderColor: '#ffffff'
    }]
  }
})

// Dados do gráfico de barras (últimos 6 meses)
const monthlyChartData = computed(() => {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    months.push({
      label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      month: d.getMonth(),
      year: d.getFullYear()
    })
  }

  const data = months.map(m =>
    expensesStore.expenses
      .filter(e => {
        const ed = new Date(e.date)
        return ed.getMonth() === m.month && ed.getFullYear() === m.year
      })
      .reduce((s, e) => s + e.value, 0)
  )

  return {
    labels: months.map(m => m.label),
    datasets: [{
      label: 'Total (R$)',
      data,
      backgroundColor: 'rgba(57, 73, 171, 0.75)',
      borderColor: '#3949AB',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false
    }]
  }
})

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}`
      }
    }
  }
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: v => `R$ ${v.toLocaleString('pt-BR')}` }
    }
  }
}

function getCategoryColor(v) { return CATEGORIES.find(c => c.value === v)?.color ?? '#757575' }
function getCategoryIcon(v) { return CATEGORIES.find(c => c.value === v)?.icon ?? 'mdi-dots-horizontal-circle' }
function getCategoryTitle(v) { return CATEGORIES.find(c => c.value === v)?.title ?? v }

function formatCurrency(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<style scoped>
.summary-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
}
</style>

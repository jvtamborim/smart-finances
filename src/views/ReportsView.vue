<template>
  <AppLayout>

    <!-- Cabeçalho -->
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold">Relatórios</h1>
      <p class="text-body-2 text-medium-emphasis">Análise detalhada das suas despesas com filtros avançados</p>
    </div>

    <!-- Painel de Filtros -->
    <v-card rounded="xl" class="mb-6 pa-5">
      <div class="d-flex align-center mb-4">
        <v-icon color="primary" class="mr-2">mdi-filter-variant</v-icon>
        <span class="text-subtitle-1 font-weight-bold">Filtros</span>
      </div>

      <v-row dense>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filters.startDate"
            label="Data Início"
            type="date"
            density="compact"
            prepend-inner-icon="mdi-calendar-start"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filters.endDate"
            label="Data Fim"
            type="date"
            density="compact"
            prepend-inner-icon="mdi-calendar-end"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.categories"
            label="Categorias"
            :items="CATEGORIES"
            item-title="title"
            item-value="value"
            multiple
            density="compact"
            chips
            closable-chips
            prepend-inner-icon="mdi-tag-multiple"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3" class="d-flex align-start ga-2">
          <v-btn
            color="primary"
            prepend-icon="mdi-magnify"
            :loading="false"
            @click="applyFilters"
            class="flex-grow-1"
          >
            Aplicar
          </v-btn>
          <v-btn
            variant="outlined"
            icon="mdi-filter-remove"
            @click="clearFilters"
          />
        </v-col>
      </v-row>

      <!-- Filtros rápidos -->
      <div class="mt-4">
        <span class="text-caption text-medium-emphasis mr-2">Atalhos:</span>
        <v-chip
          v-for="qf in quickFilters"
          :key="qf.label"
          variant="tonal"
          color="primary"
          size="small"
          class="mr-2 mb-1"
          clickable
          @click="applyQuickFilter(qf)"
        >
          {{ qf.label }}
        </v-chip>
      </div>
    </v-card>

    <!-- Cards de resumo -->
    <v-row class="mb-6">
      <v-col cols="6" md="3">
        <v-card rounded="xl" class="pa-4 text-center">
          <v-icon color="primary" size="28" class="mb-2">mdi-sigma</v-icon>
          <div class="text-caption text-medium-emphasis">Total</div>
          <div class="text-h6 font-weight-bold text-primary mt-1">{{ formatCurrency(summary.total) }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card rounded="xl" class="pa-4 text-center">
          <v-icon color="info" size="28" class="mb-2">mdi-counter</v-icon>
          <div class="text-caption text-medium-emphasis">Lançamentos</div>
          <div class="text-h6 font-weight-bold text-info mt-1">{{ summary.count }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card rounded="xl" class="pa-4 text-center">
          <v-icon color="warning" size="28" class="mb-2">mdi-arrow-up-bold</v-icon>
          <div class="text-caption text-medium-emphasis">Maior Gasto</div>
          <div class="text-h6 font-weight-bold text-warning mt-1">{{ formatCurrency(summary.max) }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card rounded="xl" class="pa-4 text-center">
          <v-icon color="success" size="28" class="mb-2">mdi-chart-line</v-icon>
          <div class="text-caption text-medium-emphasis">Média</div>
          <div class="text-h6 font-weight-bold text-success mt-1">{{ formatCurrency(summary.avg) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráficos -->
    <v-row class="mb-6">
      <!-- Rosca por categoria -->
      <v-col cols="12" md="5">
        <v-card rounded="xl" height="100%">
          <v-card-title class="d-flex align-center pa-4 pb-2">
            <v-icon color="primary" class="mr-2">mdi-chart-donut</v-icon>
            <span class="text-subtitle-1 font-weight-bold">Distribuição por Categoria</span>
          </v-card-title>
          <v-card-text>
            <div v-if="filteredExpenses.length > 0" style="height: 260px; position: relative;">
              <Doughnut :data="doughnutData" :options="doughnutOptions" />
            </div>
            <div v-else class="text-center py-10 text-medium-emphasis">
              <v-icon size="48" color="grey-lighten-2">mdi-chart-donut</v-icon>
              <p class="mt-2 text-body-2">Sem dados no período</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Linha de evolução -->
      <v-col cols="12" md="7">
        <v-card rounded="xl" height="100%">
          <v-card-title class="d-flex align-center pa-4 pb-2">
            <v-icon color="primary" class="mr-2">mdi-chart-timeline-variant-shimmer</v-icon>
            <span class="text-subtitle-1 font-weight-bold">Evolução por Data</span>
          </v-card-title>
          <v-card-text>
            <div v-if="filteredExpenses.length > 0" style="height: 260px; position: relative;">
              <Line :data="lineData" :options="lineOptions" />
            </div>
            <div v-else class="text-center py-10 text-medium-emphasis">
              <v-icon size="48" color="grey-lighten-2">mdi-chart-timeline-variant</v-icon>
              <p class="mt-2 text-body-2">Sem dados no período</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabela por Categoria -->
    <v-card rounded="xl" class="mb-6">
      <v-card-title class="d-flex align-center pa-4 pb-0">
        <v-icon color="primary" class="mr-2">mdi-table-large</v-icon>
        <span class="text-subtitle-1 font-weight-bold">Resumo por Categoria</span>
      </v-card-title>
      <v-card-text class="pa-0 mt-2">
        <v-table density="comfortable">
          <thead>
            <tr>
              <th class="text-left pl-5">Categoria</th>
              <th class="text-right">Qtd.</th>
              <th class="text-right">Total</th>
              <th class="text-right">% do Total</th>
              <th class="text-left pr-5" style="min-width: 140px">Participação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="categoryBreakdown.length === 0">
              <td colspan="5" class="text-center py-6 text-medium-emphasis">Nenhum dado disponível</td>
            </tr>
            <tr v-for="cat in categoryBreakdown" :key="cat.value">
              <td class="pl-5">
                <div class="d-flex align-center ga-2 py-2">
                  <v-avatar :color="cat.color" size="30">
                    <v-icon size="16" color="white">{{ cat.icon }}</v-icon>
                  </v-avatar>
                  <span class="font-weight-medium">{{ cat.title }}</span>
                </div>
              </td>
              <td class="text-right">
                <v-chip size="x-small" variant="tonal" color="grey">{{ cat.count }}</v-chip>
              </td>
              <td class="text-right font-weight-bold">{{ formatCurrency(cat.total) }}</td>
              <td class="text-right">
                <v-chip :color="cat.color" size="x-small" variant="tonal">
                  {{ cat.percent.toFixed(1) }}%
                </v-chip>
              </td>
              <td class="pr-5">
                <v-progress-linear
                  :model-value="cat.percent"
                  :color="cat.color"
                  height="8"
                  rounded
                  bg-color="grey-lighten-4"
                />
              </td>
            </tr>
          </tbody>
          <tfoot v-if="categoryBreakdown.length > 0">
            <tr class="bg-grey-lighten-4">
              <td class="pl-5 font-weight-bold">Total</td>
              <td class="text-right font-weight-bold">{{ summary.count }}</td>
              <td class="text-right font-weight-bold">{{ formatCurrency(summary.total) }}</td>
              <td class="text-right font-weight-bold">100%</td>
              <td class="pr-5"></td>
            </tr>
          </tfoot>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Tabela detalhada -->
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center pa-4 pb-0">
        <v-icon color="primary" class="mr-2">mdi-format-list-bulleted-square</v-icon>
        <span class="text-subtitle-1 font-weight-bold">Listagem Detalhada</span>
        <v-spacer />
        <v-chip variant="tonal" color="primary" size="small">
          {{ filteredExpenses.length }} registros
        </v-chip>
      </v-card-title>

      <v-data-table
        :headers="tableHeaders"
        :items="filteredExpenses"
        :items-per-page="10"
        :items-per-page-options="[5, 10, 25, 50]"
        no-data-text="Nenhuma despesa no período selecionado"
        class="mt-2"
      >
        <template #item.category="{ item }">
          <v-chip
            :color="getCategoryColor(item.category)"
            size="small"
            label
          >
            <v-icon start :icon="getCategoryIcon(item.category)" size="14" />
            {{ getCategoryTitle(item.category) }}
          </v-chip>
        </template>
        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>
        <template #item.value="{ item }">
          <span class="font-weight-bold text-error">{{ formatCurrency(item.value) }}</span>
        </template>
        <template #bottom="{ page, pageCount, itemsPerPage, updateOptions }">
          <div class="d-flex align-center justify-space-between pa-4 flex-wrap ga-2">
            <div class="text-body-2 text-medium-emphasis">
              Total da seleção: <strong class="text-error">{{ formatCurrency(filteredTotal) }}</strong>
            </div>
            <v-pagination
              :model-value="page"
              :length="pageCount"
              :total-visible="5"
              density="compact"
              @update:model-value="v => updateOptions({ page: v, itemsPerPage })"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

  </AppLayout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Filler
} from 'chart.js'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useExpensesStore, CATEGORIES } from '@/stores/expenses'

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Title, Filler)

const expensesStore = useExpensesStore()

// Datas padrão (mês atual)
function firstDayOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const filters = reactive({ startDate: firstDayOfMonth(), endDate: today(), categories: [] })
const applied = reactive({ startDate: firstDayOfMonth(), endDate: today(), categories: [] })

const quickFilters = [
  {
    label: 'Este Mês',
    apply: () => { filters.startDate = firstDayOfMonth(); filters.endDate = today() }
  },
  {
    label: 'Mês Passado',
    apply: () => {
      const d = new Date()
      d.setDate(1)
      d.setMonth(d.getMonth() - 1)
      filters.startDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      filters.endDate = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`
    }
  },
  {
    label: 'Últimos 3 Meses',
    apply: () => {
      const d = new Date()
      d.setMonth(d.getMonth() - 3)
      filters.startDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      filters.endDate = today()
    }
  },
  {
    label: 'Este Ano',
    apply: () => {
      filters.startDate = `${new Date().getFullYear()}-01-01`
      filters.endDate = today()
    }
  }
]

function applyFilters() {
  Object.assign(applied, { ...filters })
}

function applyQuickFilter(qf) {
  qf.apply()
  applyFilters()
}

function clearFilters() {
  filters.startDate = firstDayOfMonth()
  filters.endDate = today()
  filters.categories = []
  applyFilters()
}

// Dados filtrados
const filteredExpenses = computed(() => {
  return expensesStore.expenses.filter(e => {
    const d = new Date(e.date)
    if (applied.startDate) {
      const [y, m, day] = applied.startDate.split('-').map(Number)
      if (d < new Date(y, m - 1, day, 0, 0, 0)) return false
    }
    if (applied.endDate) {
      const [y, m, day] = applied.endDate.split('-').map(Number)
      if (d > new Date(y, m - 1, day, 23, 59, 59)) return false
    }
    if (applied.categories.length && !applied.categories.includes(e.category)) return false
    return true
  })
})

const filteredTotal = computed(() => filteredExpenses.value.reduce((s, e) => s + e.value, 0))

// Resumo
const summary = computed(() => {
  const list = filteredExpenses.value
  const total = list.reduce((s, e) => s + e.value, 0)
  return {
    total,
    count: list.length,
    max: list.length ? Math.max(...list.map(e => e.value)) : 0,
    avg: list.length ? total / list.length : 0
  }
})

// Breakdown por categoria
const categoryBreakdown = computed(() => {
  const grouped = {}
  filteredExpenses.value.forEach(e => {
    if (!grouped[e.category]) grouped[e.category] = { count: 0, total: 0 }
    grouped[e.category].count++
    grouped[e.category].total += e.value
  })

  return CATEGORIES
    .filter(c => grouped[c.value])
    .map(c => ({
      ...c,
      count: grouped[c.value].count,
      total: grouped[c.value].total,
      percent: summary.value.total ? (grouped[c.value].total / summary.value.total) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total)
})

// Gráfico de rosca
const doughnutData = computed(() => ({
  labels: categoryBreakdown.value.map(c => c.title),
  datasets: [{
    data: categoryBreakdown.value.map(c => c.total),
    backgroundColor: categoryBreakdown.value.map(c => c.color),
    borderWidth: 3,
    borderColor: '#ffffff',
    hoverOffset: 8
  }]
}))

// Gráfico de linha por dia
const lineData = computed(() => {
  const sorted = [...filteredExpenses.value].sort((a, b) => new Date(a.date) - new Date(b.date))
  const grouped = {}
  sorted.forEach(e => {
    const key = new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    grouped[key] = (grouped[key] || 0) + e.value
  })

  return {
    labels: Object.keys(grouped),
    datasets: [{
      label: 'Despesas',
      data: Object.values(grouped),
      fill: true,
      backgroundColor: 'rgba(57, 73, 171, 0.1)',
      borderColor: '#3949AB',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: '#3949AB'
    }]
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true } },
    tooltip: {
      callbacks: {
        label: ctx => ` ${ctx.label}: ${formatCurrency(ctx.raw)}`
      }
    }
  }
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => ` ${formatCurrency(ctx.raw)}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: v => `R$ ${v.toLocaleString('pt-BR')}` }
    }
  }
}

const tableHeaders = [
  { title: 'Descrição', key: 'description', align: 'start', sortable: true },
  { title: 'Categoria', key: 'category', align: 'start', sortable: true },
  { title: 'Data', key: 'date', align: 'start', sortable: true },
  { title: 'Valor', key: 'value', align: 'end', sortable: true }
]

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

<template>
  <AppLayout>

    <!-- Cabeçalho -->
    <div class="d-flex align-center justify-space-between mb-5 flex-wrap ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold">Despesas</h1>
        <p class="text-body-2 text-medium-emphasis">Gerencie todos os seus lançamentos</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd" rounded="lg">
        Nova Despesa
      </v-btn>
    </div>

    <!-- Filtros -->
    <v-card rounded="xl" class="mb-4 pa-4">
      <v-row dense align="center">
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="search"
            label="Buscar despesa..."
            prepend-inner-icon="mdi-magnify"
            clearable
            density="compact"
            hide-details
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select
            v-model="filterCategory"
            label="Filtrar por categoria"
            :items="categoryItems"
            item-title="title"
            item-value="value"
            density="compact"
            hide-details
            variant="outlined"
            clearable
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select
            v-model="sortBy"
            label="Ordenar por"
            :items="sortOptions"
            density="compact"
            hide-details
            variant="outlined"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Barra de totais -->
    <v-card rounded="xl" color="primary" class="mb-5">
      <v-card-text class="py-3">
        <v-row justify="space-around" align="center" no-gutters>
          <v-col cols="auto" class="text-center text-white px-4">
            <div class="text-caption" style="opacity: 0.85">Exibindo</div>
            <div class="text-h6 font-weight-bold">{{ filteredExpenses.length }} registros</div>
          </v-col>
          <v-divider vertical color="white" class="my-2" style="opacity: 0.3" />
          <v-col cols="auto" class="text-center text-white px-4">
            <div class="text-caption" style="opacity: 0.85">Total filtrado</div>
            <div class="text-h6 font-weight-bold">{{ formatCurrency(filteredTotal) }}</div>
          </v-col>
          <v-divider vertical color="white" class="my-2" style="opacity: 0.3" />
          <v-col cols="auto" class="text-center text-white px-4">
            <div class="text-caption" style="opacity: 0.85">Total geral</div>
            <div class="text-h6 font-weight-bold">{{ formatCurrency(totalAll) }}</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Carregando -->
    <div v-if="expensesStore.loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="52" />
      <p class="mt-4 text-body-2 text-medium-emphasis">Carregando despesas...</p>
    </div>

    <!-- Sem dados -->
    <v-card v-else-if="filteredExpenses.length === 0" rounded="xl" class="text-center pa-12">
      <v-icon size="80" color="grey-lighten-2">mdi-receipt-text-outline</v-icon>
      <h3 class="text-h6 font-weight-medium mt-4 mb-2">
        {{ search || filterCategory ? 'Nenhum resultado encontrado' : 'Nenhuma despesa cadastrada' }}
      </h3>
      <p class="text-body-2 text-medium-emphasis mb-6">
        {{ search || filterCategory
          ? 'Tente ajustar os filtros de busca'
          : 'Clique em "Nova Despesa" para começar' }}
      </p>
      <v-btn
        v-if="!search && !filterCategory"
        color="primary"
        prepend-icon="mdi-plus"
        @click="openAdd"
      >
        Adicionar Primeira Despesa
      </v-btn>
      <v-btn v-else variant="outlined" @click="clearFilters">Limpar Filtros</v-btn>
    </v-card>

    <!-- Lista de despesas -->
    <v-card v-else rounded="xl">
      <v-list lines="two" class="pa-0">
        <template v-for="(expense, index) in filteredExpenses" :key="expense.id">
          <v-list-item class="py-3 px-5">
            <template #prepend>
              <v-avatar :color="getCategoryColor(expense.category)" size="46">
                <v-icon :icon="getCategoryIcon(expense.category)" color="white" size="22" />
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-semibold mb-1">
              {{ expense.description }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <v-chip
                :color="getCategoryColor(expense.category)"
                size="x-small"
                label
                class="mr-2"
              >
                {{ getCategoryTitle(expense.category) }}
              </v-chip>
              <v-icon size="12" class="mr-1">mdi-calendar</v-icon>
              {{ formatDate(expense.date) }}
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center ga-1">
                <span class="text-body-1 font-weight-bold text-error mr-2">
                  {{ formatCurrency(expense.value) }}
                </span>
                <v-btn
                  icon="mdi-pencil-outline"
                  variant="text"
                  size="small"
                  color="primary"
                  @click="openEdit(expense)"
                />
                <v-btn
                  icon="mdi-trash-can-outline"
                  variant="text"
                  size="small"
                  color="error"
                  @click="confirmDelete(expense)"
                />
              </div>
            </template>
          </v-list-item>
          <v-divider v-if="index < filteredExpenses.length - 1" inset />
        </template>
      </v-list>
    </v-card>

    <!-- Dialog: Adicionar/Editar -->
    <ExpenseDialog
      v-model="showDialog"
      :expense="editingExpense"
      @saved="onSaved"
    />

    <!-- Dialog: Confirmar exclusão -->
    <v-dialog v-model="showDeleteDialog" max-width="420" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-5 pb-3">
          <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text class="px-5 pb-4">
          Você está prestes a excluir a despesa
          <strong>"{{ deletingExpense?.description }}"</strong>
          no valor de
          <strong class="text-error">{{ formatCurrency(deletingExpense?.value) }}</strong>.
          <br /><br />
          <v-alert type="warning" variant="tonal" density="compact">
            Esta ação não pode ser desfeita.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false" :disabled="deleting">
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            prepend-icon="mdi-trash-can"
            @click="handleDelete"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" rounded="lg">
      <v-icon class="mr-2">{{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
      {{ snackbar.message }}
      <template #actions>
        <v-btn icon="mdi-close" variant="text" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>

  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import ExpenseDialog from '@/components/expenses/ExpenseDialog.vue'
import { useExpensesStore, CATEGORIES } from '@/stores/expenses'

const expensesStore = useExpensesStore()

const search = ref('')
const filterCategory = ref('')
const sortBy = ref('date-desc')
const showDialog = ref(false)
const editingExpense = ref(null)
const showDeleteDialog = ref(false)
const deletingExpense = ref(null)
const deleting = ref(false)
const snackbar = ref({ show: false, message: '', color: 'success' })

const categoryItems = [
  { title: 'Todas as categorias', value: '' },
  ...CATEGORIES
]

const sortOptions = [
  { title: 'Data — mais recente', value: 'date-desc' },
  { title: 'Data — mais antiga', value: 'date-asc' },
  { title: 'Valor — maior primeiro', value: 'value-desc' },
  { title: 'Valor — menor primeiro', value: 'value-asc' },
  { title: 'Descrição A → Z', value: 'desc-asc' }
]

const filteredExpenses = computed(() => {
  let list = [...expensesStore.expenses]

  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(e => e.description.toLowerCase().includes(s))
  }

  if (filterCategory.value) {
    list = list.filter(e => e.category === filterCategory.value)
  }

  list.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-asc': return new Date(a.date) - new Date(b.date)
      case 'value-desc': return b.value - a.value
      case 'value-asc': return a.value - b.value
      case 'desc-asc': return a.description.localeCompare(b.description, 'pt-BR')
      default: return new Date(b.date) - new Date(a.date)
    }
  })

  return list
})

const filteredTotal = computed(() => filteredExpenses.value.reduce((s, e) => s + e.value, 0))
const totalAll = computed(() => expensesStore.expenses.reduce((s, e) => s + e.value, 0))

function clearFilters() {
  search.value = ''
  filterCategory.value = ''
}

function openAdd() {
  editingExpense.value = null
  showDialog.value = true
}

function openEdit(expense) {
  editingExpense.value = expense
  showDialog.value = true
}

function confirmDelete(expense) {
  deletingExpense.value = expense
  showDeleteDialog.value = true
}

async function handleDelete() {
  deleting.value = true
  try {
    await expensesStore.deleteExpense(deletingExpense.value.id)
    showSnack('Despesa excluída com sucesso!')
    showDeleteDialog.value = false
  } catch {
    showSnack('Erro ao excluir despesa. Tente novamente.', 'error')
  } finally {
    deleting.value = false
  }
}

function onSaved(tipo) {
  showSnack(tipo === 'editado' ? 'Despesa atualizada com sucesso!' : 'Despesa adicionada com sucesso!')
}

function showSnack(message, color = 'success') {
  snackbar.value = { show: true, message, color }
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

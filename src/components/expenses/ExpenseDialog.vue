<template>
  <v-dialog v-model="dialog" max-width="500" persistent scrollable>
    <v-card>
      <v-toolbar :color="isEditing ? 'warning' : 'primary'" density="compact">
        <v-toolbar-title>
          <v-icon class="mr-1">{{ isEditing ? 'mdi-pencil' : 'mdi-plus-circle' }}</v-icon>
          {{ isEditing ? 'Editar Despesa' : 'Nova Despesa' }}
        </v-toolbar-title>
        <template #append>
          <v-btn icon="mdi-close" variant="text" @click="close" />
        </template>
      </v-toolbar>

      <v-card-text class="pa-5 pt-6">
        <v-form ref="form" v-model="isFormValid">
          <v-text-field
            v-model="formData.description"
            label="Descrição *"
            prepend-inner-icon="mdi-text-short"
            :rules="rules.description"
            placeholder="Ex: Almoço no restaurante"
            class="mb-4"
          />

          <v-select
            v-model="formData.category"
            label="Categoria *"
            :items="CATEGORIES"
            item-title="title"
            item-value="value"
            prepend-inner-icon="mdi-tag-outline"
            :rules="rules.category"
            class="mb-4"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-icon :color="item.raw.color" class="mr-1">{{ item.raw.icon }}</v-icon>
                </template>
              </v-list-item>
            </template>
            <template #selection="{ item }">
              <div class="d-flex align-center ga-2">
                <v-icon :color="item.raw.color" size="18">{{ item.raw.icon }}</v-icon>
                {{ item.raw.title }}
              </div>
            </template>
          </v-select>

          <v-text-field
            v-model="formData.valueStr"
            label="Valor (R$) *"
            type="number"
            prepend-inner-icon="mdi-currency-brl"
            min="0.01"
            step="0.01"
            :rules="rules.value"
            placeholder="0,00"
            class="mb-4"
          />

          <v-text-field
            v-model="formData.dateStr"
            label="Data *"
            type="date"
            prepend-inner-icon="mdi-calendar"
            :rules="rules.date"
          />
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="close" :disabled="loading">Cancelar</v-btn>
        <v-btn
          :color="isEditing ? 'warning' : 'primary'"
          :loading="loading"
          prepend-icon="mdi-check"
          @click="handleSubmit"
        >
          {{ isEditing ? 'Salvar Alterações' : 'Adicionar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useExpensesStore, CATEGORIES } from '@/stores/expenses'

const props = defineProps({
  modelValue: Boolean,
  expense: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const expensesStore = useExpensesStore()
const loading = ref(false)
const isFormValid = ref(false)
const form = ref(null)

const dialog = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const isEditing = computed(() => !!props.expense)

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formData = ref({ description: '', category: '', valueStr: '', dateStr: todayStr() })

const rules = {
  description: [v => !!v?.trim() || 'Descrição é obrigatória'],
  category: [v => !!v || 'Selecione uma categoria'],
  value: [
    v => !!v || 'Valor é obrigatório',
    v => parseFloat(v) > 0 || 'O valor deve ser maior que zero'
  ],
  date: [v => !!v || 'Data é obrigatória']
}

watch(() => props.expense, (expense) => {
  if (expense) {
    const d = new Date(expense.date)
    formData.value = {
      description: expense.description,
      category: expense.category,
      valueStr: String(expense.value),
      dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  formData.value = { description: '', category: '', valueStr: '', dateStr: todayStr() }
  form.value?.resetValidation()
}

function close() {
  dialog.value = false
  resetForm()
}

async function handleSubmit() {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const [year, month, day] = formData.value.dateStr.split('-').map(Number)
    const data = {
      description: formData.value.description.trim(),
      category: formData.value.category,
      value: parseFloat(formData.value.valueStr),
      date: new Date(year, month - 1, day, 12, 0, 0)
    }

    if (isEditing.value) {
      await expensesStore.updateExpense(props.expense.id, data)
    } else {
      await expensesStore.addExpense(data)
    }

    emit('saved', isEditing.value ? 'editado' : 'adicionado')
    close()
  } catch {
    // erro tratado na store
  } finally {
    loading.value = false
  }
}
</script>

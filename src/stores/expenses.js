import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from './auth'

export const CATEGORIES = [
  { title: 'Alimentação', value: 'alimentacao', icon: 'mdi-food', color: '#E53935' },
  { title: 'Transporte', value: 'transporte', icon: 'mdi-car', color: '#1E88E5' },
  { title: 'Moradia', value: 'moradia', icon: 'mdi-home', color: '#43A047' },
  { title: 'Saúde', value: 'saude', icon: 'mdi-hospital-box', color: '#E91E63' },
  { title: 'Educação', value: 'educacao', icon: 'mdi-school', color: '#8E24AA' },
  { title: 'Lazer', value: 'lazer', icon: 'mdi-gamepad-variant', color: '#FB8C00' },
  { title: 'Vestuário', value: 'vestuario', icon: 'mdi-tshirt-crew', color: '#00ACC1' },
  { title: 'Outros', value: 'outros', icon: 'mdi-dots-horizontal-circle', color: '#757575' }
]

export const useExpensesStore = defineStore('expenses', () => {
  const expenses = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null

  function getUserCollection() {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('Usuário não autenticado')
    return collection(db, 'users', authStore.user.uid, 'expenses')
  }

  function startListening() {
    if (unsubscribe) return
    loading.value = true

    try {
      const q = query(getUserCollection(), orderBy('date', 'desc'))
      unsubscribe = onSnapshot(q, (snapshot) => {
        expenses.value = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
          date: docSnap.data().date?.toDate() ?? new Date()
        }))
        loading.value = false
      }, (err) => {
        error.value = err.message
        loading.value = false
      })
    } catch (err) {
      error.value = err.message
      loading.value = false
    }
  }

  function stopListening() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    expenses.value = []
    loading.value = false
  }

  async function addExpense(expense) {
    try {
      await addDoc(getUserCollection(), {
        description: expense.description,
        category: expense.category,
        value: expense.value,
        date: Timestamp.fromDate(expense.date),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function updateExpense(id, expense) {
    try {
      const authStore = useAuthStore()
      const ref = doc(db, 'users', authStore.user.uid, 'expenses', id)
      await updateDoc(ref, {
        description: expense.description,
        category: expense.category,
        value: expense.value,
        date: Timestamp.fromDate(expense.date),
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function deleteExpense(id) {
    try {
      const authStore = useAuthStore()
      const ref = doc(db, 'users', authStore.user.uid, 'expenses', id)
      await deleteDoc(ref)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    expenses,
    loading,
    error,
    startListening,
    stopListening,
    addExpense,
    updateExpense,
    deleteExpense
  }
})

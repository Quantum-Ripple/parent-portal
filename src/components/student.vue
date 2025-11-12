<template>
  <div class="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-xl font-semibold text-gray-800">My Students</h2>

      <div v-if="students.length" class="text-sm text-gray-500">
        Total: {{ students.length }}
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-10 text-gray-500">
      <span class="animate-pulse">Loading students...</span>
    </div>

    <!-- Error -->
    <div v-if="error" class="text-red-500 text-center py-4 bg-red-50 rounded-lg">
      {{ error }}
    </div>

    <!-- Student Cards -->
    <div
      v-if="students.length && !loading"
      class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="student in students"
        :key="student.id"
        class="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all bg-gradient-to-br from-white to-gray-50"
      >
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ student.full_name }}
          </h3>
          <span
            class="px-2 py-1 text-xs rounded-full font-medium"
            :class="student.gender === 'Male'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-pink-100 text-pink-700'"
          >
            {{ student.gender }}
          </span>
        </div>

        <div class="text-sm text-gray-600 space-y-1">
          <p><span class="font-medium text-gray-800">Admission No:</span> {{ student.admission_number }}</p>
          <p><span class="font-medium text-gray-800">Class:</span> {{ student.class_level }}</p>
          <p><span class="font-medium text-gray-800">Stream:</span> {{ student.stream }}</p>
          <p><span class="font-medium text-gray-800">School:</span> {{ student.school_name }}</p>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!loading && !students.length"
      class="text-gray-500 text-center py-6 border border-dashed border-gray-300 rounded-lg"
    >
      No students found.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStudent } from '../api/Students'

const students = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const data = await getStudent()
    students.value = data
  } catch (err) {
    error.value = 'Failed to fetch students. Please try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

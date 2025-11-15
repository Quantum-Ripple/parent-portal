<!--
/**
 * @file student.vue
 * @description This component is responsible for fetching and displaying a list of all students
 *              associated with the logged-in parent.
 *
 * @overview
 * The component fetches a list of students from the API upon mounting and displays them
 * in a responsive grid of cards. Each card contains key details about a student.
 * The component also handles loading and error states to provide a clear user experience.
 *
 * @dataDisplayed
 * - A list of student cards.
 * - For each student:
 *   - Full name
 *   - Gender (with a color-coded badge)
 *   - Admission Number
 *   - Class Level
 *   - Stream
 *   - School Name
 * - The total number of students found.
 *
 * @dataFetching
 * - `getStudent()` from `../api/Students.js`: Fetches the list of students associated with the parent.
 *
 * @dependencies
 * - Vue Composition API: `ref` and `onMounted` for reactive state management and component lifecycle hooks.
 * - API Service: `../api/Students.js` for backend communication.
 *
 * @interactions
 * - **Initial Data Load:** The `onMounted` lifecycle hook triggers the fetching of student data
 *   as soon as the component is rendered.
 *
 * @uiUx
 * - Displays student information in a clean, card-based grid layout that is responsive.
 * - Provides a loading state with a pulsing animation to give feedback during data fetching.
 * - Shows a clear error message if the data fetching fails.
 * - Uses color-coded badges to visually distinguish the gender of each student (blue for Male, pink for Female).
 * - Displays a user-friendly message in a dashed-border box if no students are found for the parent.
 */
-->
<template>
  <div class="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
    
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-xl font-semibold text-gray-800">My Students</h2>

      <div v-if="students.length" class="text-sm text-gray-500">
        Total: {{ students.length }}
      </div>
    </div>

    
    <div v-if="loading" class="flex justify-center py-10 text-gray-500">
      <span class="animate-pulse">Loading students...</span>
    </div>

    
    <div v-if="error" class="text-red-500 text-center py-4 bg-red-50 rounded-lg">
      {{ error }}
    </div>

    
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

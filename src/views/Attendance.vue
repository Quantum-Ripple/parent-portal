<!--
/**
 * @file Attendance.vue
 * @description This view component provides a detailed record of a student's attendance.
 *              Parents can select a specific student to view their attendance history,
 *              including status (Present, Absent, Excused), time marked, and who marked it.
 *
 * @overview
 * The component first fetches all students associated with the logged-in parent. If there are
 * multiple students, a dropdown is displayed for selection. If only one, their name is shown.
 * Upon selection (or initial load), it fetches and displays the attendance records for that student,
 * grouped by date, with visual cues for attendance status.
 *
 * @dataDisplayed
 * - Student's full name, admission number (implicitly via selection).
 * - Attendance records grouped by date.
 * - For each record: status (e.g., PRESENT, ABSENT, EXCUSED), time marked, and the person who marked it.
 *
 * @dataFetching
 * - `getStudent()` from `../api/Students.js`: Fetches a list of students associated with the parent.
 * - `getAttendance(studentId)` from `../api/Attendance.js`: Fetches attendance records for the selected student.
 *
 * @dependencies
 * - Vue Composition API: `ref`, `onMounted` for reactive state management and lifecycle hooks.
 * - API Services: `../api/Students.js` and `../api/Attendance.js` for backend communication.
 *
 * @interactions
 * - **Student Selection:** A dropdown allows parents to switch between their children's attendance records.
 *   If only one child exists, their details are shown directly.
 * - **Dynamic Fetching:** Changing the selected student triggers a new API call to `getAttendance`
 *   to update the displayed records.
 * - **Status Coloring:** The `statusColor` function applies specific CSS classes (e.g., `text-green-600`)
 *   to attendance statuses for quick visual identification.
 *
 * @uiUx
 * - Features a clear heading "Student Attendance".
 * - Provides visual feedback for loading states ("Loading students...", "Fetching attendance...")
 *   and error messages.
 * - Attendance records are logically grouped by date, enhancing readability.
 * - Each attendance entry is presented in a card-like format, detailing status, time, and marker,
 *   with color-coded statuses for improved clarity.
 */
-->
<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Student Attendance</h2>

    
    <div class="mb-4">
      
      <div v-if="studentsLoading" class="text-gray-500">Loading students...</div>

      
      <div v-else-if="students.length === 0" class="text-yellow-600">
        No students found for this parent.
      </div>

      
      <div v-else-if="students.length > 1" class="flex items-center gap-3">
        <label class="font-medium">Select student:</label>
        <select
          v-model="selectedStudentId"
          @change="onStudentChange"
          class="border px-3 py-1 rounded"
        >
          <option value="" disabled>Select a student</option>
          <option v-for="s in students" :key="s.id" :value="s.id">
            {{ s.full_name }}
          </option>
        </select>
      </div>

      
      <div v-else-if="students.length === 1" class="text-gray-700">
        <span class="font-medium">Student:</span>
        <span class="ml-2">{{ students[0].full_name }}</span>
      </div>
    </div>

    
    <div v-if="loading" class="text-gray-500 animate-pulse">
      Fetching attendance...
    </div>

    
    <div v-else-if="error" class="text-red-600 font-medium">
      {{ error }}
    </div>

    
    <div v-else>
      <div
        v-for="(records, date) in attendance"
        :key="date"
        class="mb-4 p-4 rounded-lg shadow bg-white"
      >
        <h2 class="text-lg font-semibold mb-2 text-gray-800">
          {{ date }}
        </h2>

        
        <div
          v-for="record in records"
          :key="record.time_marked"
          class="bg-gray-100 p-3 rounded mb-2"
        >
          <p>
            <span class="font-semibold">Status:</span>
            <span :class="statusColor(record.status)" class="font-bold">
              {{ record.status }}
            </span>
          </p>

          <p>
            <span class="font-semibold">Time Marked:</span>
            {{ record.time_marked }}
          </p>

          <p>
            <span class="font-semibold">Marked By:</span>
            {{ record.marked_by }}
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAttendance } from '../api/attendance'
import { getStudent } from '../api/Students'


const attendance = ref({})
const loading = ref(false)
const error = ref(null)


const students = ref([])
const studentsLoading = ref(true)
const selectedStudentId = ref('')


const fetchAttendance = async (studentId) => {
  if (!studentId) return

  loading.value = true
  error.value = null

  try {
    const res = await getAttendance(studentId)
    attendance.value = res.data
  } catch (err) {
    console.error(err)
    error.value = 'Failed to load attendance.'
    attendance.value = {}
  } finally {
    loading.value = false
  }
}

const onStudentChange = async () => {
  await fetchAttendance(selectedStudentId.value)
}


onMounted(async () => {
  studentsLoading.value = true

  try {
    const data = await getStudent()
    students.value = Array.isArray(data) ? data : []

    if (students.value.length === 1) {
      selectedStudentId.value = students.value[0].id
      await fetchAttendance(selectedStudentId.value)
    }
  } catch (err) {
    console.error(err)
    error.value = 'Cannot load students.'
    students.value = []
  } finally {
    studentsLoading.value = false
  }
})


function statusColor(status) {
  switch (status) {
    case 'PRESENT':
      return 'text-green-600'
    case 'ABSENT':
      return 'text-red-600'
    case 'EXCUSED':
      return 'text-yellow-600'
    default:
      return 'text-gray-600'
  }
}
</script>

<style scoped>
</style>

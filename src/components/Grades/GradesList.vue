<!--
/**
 * @file GradesList.vue
 * @description This component allows parents to view a detailed list of their selected
 *              student's grades across different exams, presented in collapsible sections,
 *              along with a line chart visualizing grade trends.
 *
 * @overview
 * The component first fetches a list of students associated with the parent. It then allows
 * the user to select a student (or defaults to the first one if only one exists). Upon
 * student selection, it fetches all grade data for that student, groups it by exam, and
 * displays it in interactive, collapsible sections. A line chart is also generated to
 * provide a visual representation of the student's performance over time.
 *
 * @dataDisplayed
 * - A list of students for selection, allowing the parent to choose which student's grades to view.
 * - For the selected student, grades are grouped by exam, with each entry showing:
 *   - Subject name
 *   - Score
 *   - Grade letter
 *   - Remarks
 * - A line chart illustrating the student's performance trend across subjects and exams.
 *
 * @dataFetching
 * - `getStudent()` from `../../api/Students.js`: Fetches the list of students associated
 *   with the parent to populate the student selection dropdown.
 * - `getStudentGrades(studentId)` from `../../api/Students.js`: Fetches all grade data
 *   for the student specified by the `studentId` prop.
 *
 * @dependencies
 * - Vue Composition API: `ref`, `reactive`, `onMounted` for reactive state management and
 *   lifecycle hooks.
 * - `vue-chartjs`: For rendering the line chart component.
 * - `chart.js`: The underlying charting library required by `vue-chartjs`.
 * - API Service: `../../api/Students.js`.
 *
 * @interactions
 * - **Student Selection:** If the parent has multiple students, a dropdown allows the user
 *   to select a specific student. If only one student is available, it is automatically selected.
 * - **Initial Data Load:** On component mount, it fetches the list of students. If students
 *   are found, it defaults to fetching the grades for the first student.
 * - **Dynamic Fetching:** When a new student is selected from the dropdown (via `onStudentChange`),
 *   the component re-fetches the grades for that student.
 * - **Collapsible Exam Sections:** Each exam's grades are displayed within a collapsible section.
 *   Clicking the header of an exam section toggles its visibility, allowing users to expand
 *   or collapse the detailed grade list.
 * - **Chart Generation:** The `prepareChart` function processes the fetched grades to generate
 *   data suitable for the line chart, showing subject-wise performance across exams.
 *
 * @uiUx
 * - Provides a clear and organized display of grades, grouped by exam, enhancing readability.
 * - Uses collapsible sections to manage information density, allowing users to focus on specific
 *   exam results without being overwhelmed.
 * - Includes an interactive line chart for visual trend analysis of grades, helping parents
 *   understand their child's academic progress over time.
 * - Displays distinct loading and error states to provide clear feedback to the user during
 *   the data fetching process.
 */
-->
<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Student Grades</h2>

    
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
          <option
            v-for="s in students"
            :key="s.id"
            :value="s.id"
          >
            {{ s.full_name }}
          </option>
        </select>
      </div>

      
      <div v-else-if="students.length === 1" class="text-gray-700">
        <span class="font-medium">Student:</span>
        <span class="ml-2">{{ students[0].full_name }}</span>
      </div>
    </div>

    
    <div v-if="loading" class="text-gray-500">Loading grades...</div>

    
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    
    <div v-else>
      <div
        v-for="(grades, examName) in groupedGrades"
        :key="examName"
        class="mb-6 bg-white shadow rounded-lg overflow-hidden"
      >
        
        <button
          class="w-full flex justify-between items-center px-6 py-4 bg-gray-100 hover:bg-gray-200 transition"
          @click="toggleExam(examName)"
        >
          <h3 class="text-lg font-semibold text-gray-800">{{ examName }}</h3>
          <span class="text-gray-600 text-sm">
            {{ expandedExam === examName ? "▲ Hide" : "▼ Show" }}
          </span>
        </button>

        
        <transition name="fade">
          <div v-if="expandedExam === examName" class="p-4">
            <table class="min-w-full border border-gray-200 rounded-lg text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="py-2 px-3 text-left text-gray-600 font-semibold">Subject</th>
                  <th class="py-2 px-3 text-left text-gray-600 font-semibold">Score</th>
                  <th class="py-2 px-3 text-left text-gray-600 font-semibold">Grade</th>
                  <th class="py-2 px-3 text-left text-gray-600 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(grade, index) in grades"
                  :key="index"
                  class="border-t hover:bg-gray-50 transition"
                >
                  <td class="py-2 px-3 font-medium text-gray-800">{{ grade.subject }}</td>
                  <td class="py-2 px-3 text-gray-700">{{ grade.score }}</td>
                  <td class="py-2 px-3 text-gray-700">{{ grade.grade_letter || '—' }}</td>
                  <td class="py-2 px-3 text-gray-600">{{ grade.remarks || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </transition>
      </div>

      
      <div v-if="chartData.datasets.length > 0" class="mb-6">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getStudentGrades, getStudent } from '../../api/Students'


import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)


const groupedGrades = ref({})
const loading = ref(false)
const error = ref(null)
const expandedExam = ref(null)

const students = ref([])
const studentsLoading = ref(true)
const selectedStudentId = ref('')


const chartData = reactive({ labels: [], datasets: [] })
const chartOptions = {
  responsive: true,
  plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
  scales: { y: { min: 0, max: 100, title: { display: true, text: 'Score' } } },
}


const fetchGrades = async (studentId) => {
  if (!studentId) return
  loading.value = true
  error.value = null

  try {
    const data = await getStudentGrades(studentId)
    groupedGrades.value = data
    prepareChart()
  } catch (err) {
    console.error('Error fetching grades:', err)
    error.value = 'Failed to load grades. Please try again.'
    groupedGrades.value = {}
    chartData.datasets = []
    chartData.labels = []
  } finally {
    loading.value = false
  }
}


const prepareChart = () => {
  const examNames = Object.keys(groupedGrades.value)
  if (!examNames.length) {
    chartData.labels = []
    chartData.datasets = []
    return
  }

  const subjects = Array.from(
    new Set(examNames.flatMap(exam => groupedGrades.value[exam].map(g => g.subject)))
  )
  chartData.labels = subjects

  chartData.datasets = examNames.map((exam, idx) => ({
    label: exam,
    data: subjects.map(subject => {
      const grade = groupedGrades.value[exam].find(g => g.subject === subject)
      return grade ? grade.score : null
    }),
    fill: false,
    borderColor: idx === examNames.length - 1 ? '#3b82f6' : '#9ca3af',
    tension: 0.3,
  }))
}


const onStudentChange = async () => {
  await fetchGrades(selectedStudentId.value)
}


const toggleExam = (examName) => {
  expandedExam.value = expandedExam.value === examName ? null : examName
}


onMounted(async () => {
  studentsLoading.value = true
  error.value = null

  try {
    const data = await getStudent()
    students.value = Array.isArray(data) ? data : []

    if (students.value.length === 1) {
      selectedStudentId.value = students.value[0].id
      await fetchGrades(selectedStudentId.value)
    }
  } catch (err) {
    console.error('Error fetching students:', err)
    error.value = 'Cannot load students'
    students.value = []
  } finally {
    studentsLoading.value = false
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>

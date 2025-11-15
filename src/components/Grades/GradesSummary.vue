<!--
/**
 * @file GradesSummary.vue
 * @description This component provides a visual summary of a selected student's academic
 *              performance across different exams using a line chart.
 *
 * @overview
 * The component first fetches a list of students associated with the parent. It then allows
 * the user to select a student (or defaults to the first one if only one exists). Upon
 * student selection, it fetches all grade data for that student and processes it to
 * generate a line chart that illustrates performance trends across subjects and exams.
 *
 * @dataDisplayed
 * - A list of students for selection, allowing the parent to choose which student's grades to view.
 * - A line chart showing the student's scores for each subject across various exams,
 *   illustrating performance trends over time.
 *
 * @dataFetching
 * - `getStudent()` from `../../api/Students.js`: Fetches the list of students associated
 *   with the parent to populate the student selection dropdown.
 * - `getStudentGrades(studentId)` from `../../api/Students.js`: Fetches all grade data
 *   for the student specified by the `studentId` prop.
 *
 * @dependencies
 * - Vue Composition API: `ref`, `onMounted`, `watch` for reactive state management and
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
 * - **Chart Generation:** The `prepareChart` function processes the fetched grades to generate
 *   data suitable for the line chart, showing subject-wise performance across exams.
 *
 * @uiUx
 * - Provides a clear and interactive line chart for visualizing academic performance trends,
 *   making it easy for parents to track their child's progress.
 * - Handles scenarios with multiple students by offering a user-friendly dropdown selector.
 * - Displays distinct loading and error states to provide clear feedback to the user during
 *   the data fetching process.
 */
-->
<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Student Performance Summary</h2>

    
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

    
    <div v-else-if="chartData.datasets.length > 0">
      <line-chart :chart-data="chartData" :chart-options="chartOptions" />
    </div>

    
    <div v-else class="text-gray-500">
      No grades available for this student yet.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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


const lineChart = {
  extends: Line,
  props: ['chartData', 'chartOptions'],
  mounted() {
    this.renderChart(this.chartData, this.chartOptions)
  },
  watch: {
    chartData: {
      handler(newData) {
        this.renderChart(newData, this.chartOptions)
      },
      deep: true,
    },
  },
}

const students = ref([])
const studentsLoading = ref(true)
const selectedStudentId = ref('')
const loading = ref(false)
const error = ref(null)
const grades = ref({})


const chartData = ref({
  labels: [],
  datasets: [],
})
const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    tooltip: { enabled: true },
  },
  scales: {
    y: { min: 0, max: 100, title: { display: true, text: 'Score' } },
    x: { title: { display: true, text: 'Subjects' } },
  },
})


const fetchGrades = async (studentId) => {
  if (!studentId) {
    grades.value = {}
    chartData.value.datasets = []
    return
  }

  loading.value = true
  error.value = null

  try {
    const data = await getStudentGrades(studentId)
    grades.value = data
    prepareChart(data)
  } catch (err) {
    console.error('Error fetching grades:', err)
    error.value = 'Failed to load grades. Please try again.'
    chartData.value.datasets = []
  } finally {
    loading.value = false
  }
}


const prepareChart = (data) => {
  const examNames = Object.keys(data)
  if (examNames.length === 0) {
    chartData.value = { labels: [], datasets: [] }
    return
  }

  
  const subjects = Array.from(
    new Set(examNames.flatMap((exam) => data[exam].map((g) => g.subject)))
  )
  chartData.value.labels = subjects

  chartData.value.datasets = examNames.map((exam, idx) => ({
    label: exam,
    data: subjects.map((subject) => {
      const grade = data[exam].find((g) => g.subject === subject)
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
  } finally {
    studentsLoading.value = false
  }
})
</script>

<style scoped>

</style>

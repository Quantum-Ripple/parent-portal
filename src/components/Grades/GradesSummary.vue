<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Student Performance Summary</h2>

    <!-- Students selection -->
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

    <!-- Loading grades -->
    <div v-if="loading" class="text-gray-500">Loading grades...</div>

    <!-- Error -->
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- Chart -->
    <div v-else-if="chartData.datasets.length > 0">
      <line-chart :chart-data="chartData" :chart-options="chartOptions" />
    </div>

    <!-- No grades -->
    <div v-else class="text-gray-500">
      No grades available for this student yet.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getStudentGrades, getStudent } from '../../api/Students'

// Chart.js imports
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

// Wrap Chart.js Line component
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

// Chart reactive state
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

// Fetch grades for a given student
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

// Transform grades into chart-friendly format
const prepareChart = (data) => {
  const examNames = Object.keys(data)
  if (examNames.length === 0) {
    chartData.value = { labels: [], datasets: [] }
    return
  }

  // Collect all unique subjects from all exams
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
    borderColor: idx === examNames.length - 1 ? '#3b82f6' : '#9ca3af', // latest exam highlighted
    tension: 0.3,
  }))
}

// Handle dropdown change
const onStudentChange = async () => {
  await fetchGrades(selectedStudentId.value)
}

// Initial load
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

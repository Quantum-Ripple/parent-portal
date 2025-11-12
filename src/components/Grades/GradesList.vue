<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Student Grades</h2>

    <!-- Students selection / info -->
    <div class="mb-4">
      <!-- loading students -->
      <div v-if="studentsLoading" class="text-gray-500">Loading students...</div>

      <!-- no students -->
      <div v-else-if="students.length === 0" class="text-yellow-600">
        No students found for this parent.
      </div>

      <!-- more than one student -> show dropdown -->
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

      <!-- exactly one student -> show name -->
      <div v-else-if="students.length === 1" class="text-gray-700">
        <span class="font-medium">Student:</span>
        <span class="ml-2">{{ students[0].full_name }}</span>
      </div>
    </div>

    <!-- Loading grades -->
    <div v-if="loading" class="text-gray-500">Loading grades...</div>

    <!-- Error -->
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- Grades by Exam -->
    <div v-else>
      <div
        v-for="(grades, examName) in groupedGrades"
        :key="examName"
        class="mb-6 bg-white shadow rounded-lg overflow-hidden"
      >
        <!-- Header -->
        <button
          class="w-full flex justify-between items-center px-6 py-4 bg-gray-100 hover:bg-gray-200 transition"
          @click="toggleExam(examName)"
        >
          <h3 class="text-lg font-semibold text-gray-800">{{ examName }}</h3>
          <span class="text-gray-600 text-sm">
            {{ expandedExam === examName ? "▲ Hide" : "▼ Show" }}
          </span>
        </button>

        <!-- Table -->
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

      <!-- Line chart showing performance AFTER all tables -->
      <div v-if="chartData.datasets.length > 0" class="mb-6">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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

// Reactive state
const groupedGrades = ref({})
const loading = ref(false)
const error = ref(null)
const expandedExam = ref(null)

const students = ref([])
const studentsLoading = ref(true)
const selectedStudentId = ref('')

// Chart reactive state
const chartData = reactive({ labels: [], datasets: [] })
const chartOptions = {
  responsive: true,
  plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
  scales: { y: { min: 0, max: 100, title: { display: true, text: 'Score' } } },
}

// Fetch grades for a student
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

// Prepare chart from groupedGrades
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

// Handle dropdown change
const onStudentChange = async () => {
  await fetchGrades(selectedStudentId.value)
}

// Toggle exam expand/collapse
const toggleExam = (examName) => {
  expandedExam.value = expandedExam.value === examName ? null : examName
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

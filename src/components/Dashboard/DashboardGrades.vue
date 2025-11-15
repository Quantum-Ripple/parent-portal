<!--
/**
 * @file DashboardGrades.vue
 * @description This component displays a summary of a student's latest exam grades and a line
 *              chart showing grade trends across different exams.
 *
 * @overview
 * As a stateless child component, it receives a `studentId` as a prop. It fetches all grade
 * data for that student and then processes it in two ways:
 * 1. It identifies and displays the grades from the most recent exam in a grid.
 * 2. It generates a line chart to visualize the student's performance trends across all exams.
 *
 * @props
 * - `studentId`: A required `String` prop representing the unique identifier for the student.
 *   This ID is used to fetch the relevant grade data.
 *
 * @dataDisplayed
 * - Grades for the most recent exam, including subject, score, grade letter, and remarks for each subject.
 * - A line chart comparing scores across different exams for each subject, providing a trend analysis.
 *
 * @dataFetching
 * - `getStudentGrades(studentId)` from `../../api/Students.js`: Fetches all grade data for the
 *   student specified by the `studentId` prop.
 *
 * @dependencies
 * - Vue Composition API: `ref`, `reactive`, `watch`, `computed`, `toRefs`.
 * - `vue-chartjs`: For rendering the line chart component.
 * - `chart.js`: The underlying charting library required by `vue-chartjs`.
 * - API Service: `../../api/Students.js`.
 *
 * @interactions
 * - **Data Reactivity:** A `watch` effect with `{ immediate: true }` on the `studentId` prop
 *   triggers the `fetchGrades` function both when the component is mounted and whenever the
 *   `studentId` prop changes.
 * - **Latest Grades Calculation:** The `latestExamGrades` computed property processes the fetched
 *   `groupedGrades` data to identify and return only the grades from the most recent exam.
 * - **Dynamic Chart Generation:** A `watch` effect on `groupedGrades` processes the raw grade data
 *   to prepare it for the line chart, creating distinct datasets for each exam to show performance trends.
 *
 * @uiUx
 * - Presents the latest exam grades in a clean, grid-based layout of individual grade items.
 * - Utilizes a line chart to provide a clear visual representation of the student's academic
 *   performance over time.
 * - Provides clear user feedback with distinct states for loading, error, and "no data" scenarios.
 */
-->
<template>
    <div class="dashboard-card">
      <h3 class="card-title">Latest Exam Grades</h3>
  
      
      <div v-if="loading" class="loading-placeholder">
        <p>Loading grades...</p>
      </div>
  
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
  
      
      <div v-else-if="latestExamGrades.length" class="card-content">
        
        <div class="grades-grid">
          <div v-for="(grade, idx) in latestExamGrades" :key="idx" class="grade-item">
            <p class="subject">{{ grade.subject }}</p>
            <p class="score">{{ grade.score }}</p>
            <p class="grade-letter">{{ grade.grade_letter || '—' }}</p>
            <p class="remarks">{{ grade.remarks || '' }}</p>
          </div>
        </div>
  
        
        <div v-if="chartData.datasets.length > 0" class="chart-container">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>
  
      
      <div v-else class="no-data">
        <p>No grades available for this student.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, watch, computed, toRefs } from 'vue';
  import { getStudentGrades } from '../../api/Students';
  
  
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
  import { Line } from 'vue-chartjs';
  
  ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);
  
  
  const props = defineProps({
    studentId: {
      type: String,
      required: true,
    },
  });
  
  const { studentId } = toRefs(props);
  
  
  const groupedGrades = ref({});
  const loading = ref(false);
  const error = ref(null);
  
  
  const fetchGrades = async (id) => {
    if (!id) {
        groupedGrades.value = {};
        return;
    }
    loading.value = true;
    error.value = null;
    try {
      const data = await getStudentGrades(id);
      groupedGrades.value = data;
    } catch (err) {
      console.error('Error fetching grades:', err);
      error.value = 'Failed to load grades.';
      groupedGrades.value = {};
    } finally {
      loading.value = false;
    }
  };
  
  
  watch(studentId, (newId) => {
      fetchGrades(newId);
  }, { immediate: true });
  
  
  const latestExamGrades = computed(() => {
    const exams = Object.keys(groupedGrades.value);
    if (!exams.length) return [];
    const latestExam = exams.sort().pop(); 
    return groupedGrades.value[latestExam] || [];
  });
  
  
  const chartData = reactive({ labels: [], datasets: [] });
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
    scales: { y: { min: 0, max: 100, title: { display: true, text: 'Score' } } },
  };
  
  watch(groupedGrades, (newGrades) => {
      const examNames = Object.keys(newGrades);
      if (!examNames.length) {
        chartData.labels = [];
        chartData.datasets = [];
        return;
      }
  
      const subjects = Array.from(new Set(examNames.flatMap(exam => newGrades[exam].map(g => g.subject))));
      chartData.labels = subjects;
      chartData.datasets = examNames.map((exam, idx) => ({
        label: exam,
        data: subjects.map(subj => {
          const grade = newGrades[exam].find(g => g.subject === subj);
          return grade ? grade.score : null;
        }),
        fill: false,
        borderColor: idx === examNames.length - 1 ? '#3b82f6' : '#9ca3af',
        tension: 0.3,
      }));
  });
  
  </script>
  
  <style scoped>
  .dashboard-card {
    background-color: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  
  .card-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .card-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
  }
  
  .grades-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .grade-item {
    background-color: #f9fafb;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    border: 1px solid #f0f0f0;
  }
  
  .subject {
    font-weight: bold;
    color: #333;
  }
  
  .score {
    font-size: 1.75rem;
    font-weight: bold;
    color: #3b82f6;
    margin: 0.25rem 0;
  }
  
  .grade-letter {
    font-size: 0.9rem;
    color: #666;
  }
  
  .remarks {
      font-size: 0.8rem;
      color: #999;
  }
  
  .chart-container {
      position: relative;
      height: 250px;
  }
  
  .loading-placeholder, .error-message, .no-data {
    text-align: center;
    padding: 2rem;
    color: #777;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  </style>

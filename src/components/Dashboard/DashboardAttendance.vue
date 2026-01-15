<!--
/**
 * @file DashboardAttendance.vue
 * @description This component provides a summary of a student's attendance, including a
 *              breakdown of present, absent, and excused days, and a pie chart for
 *              visual representation.
 *
 * @overview
 * As a stateless child component, it receives a `studentId` as a prop. It watches for
 * changes to this prop and fetches the corresponding attendance data. The data is then
 * processed to generate a summary and a pie chart, providing a clear and concise
 * overview of the student's attendance record.
 *
 * @props
 * - `studentId`: A required `String` prop representing the unique identifier for the student.
 *   This ID is used to fetch the relevant attendance data.
 *
 * @dataDisplayed
 * - A summary of attendance, including:
 *   - Total Days
 *   - Present Days
 *   - Absent Days
 *   - Excused Days
 * - A pie chart that visually represents the distribution of present, absent, and excused days.
 *
 * @dataFetching
 * - `getAttendance(studentId)` from `../../api/Attendance.js`: Fetches the attendance records
 *   for the student specified by the `studentId` prop.
 *
 * @dependencies
 * - Vue Composition API: `ref`, `reactive`, `computed`, `watch`, `toRefs`.
 * - `vue-chartjs`: For rendering the pie chart component.
 * - `chart.js`: The underlying charting library required by `vue-chartjs`.
 * - API Service: `../../api/Attendance.js`.
 *
 * @interactions
 * - **Data Reactivity:** The component uses a `watch` effect with `{ immediate: true }` on the
 *   `studentId` prop. This triggers the `fetchAttendance` function both when the component
 *   is first mounted and whenever the `studentId` prop changes.
 * - **Computed Summary:** The `attendanceSummary` computed property automatically recalculates
 *   the total, present, absent, and excused days whenever the raw `attendance` data changes.
 * - **Dynamic Chart Updates:** A `watch` effect on `attendanceSummary` ensures that the `chartData`
 *   is updated whenever the summary changes, keeping the pie chart synchronized with the data.
 *
 * @uiUx
 * - Presents the attendance summary within a clean, card-based layout (`dashboard-card`).
 * - Utilizes a pie chart for a quick and intuitive visual understanding of the attendance distribution.
 * - Provides clear user feedback with distinct states for loading, error, and "no data" scenarios.
 * - Employs color-coding for different attendance statuses in the summary text (e.g., green for present,
 *   red for absent) for enhanced readability.
 */
-->
<template>
    <div class="dashboard-card">
      <h3 class="card-title">Attendance Overview</h3>
  
      
      <div v-if="loading" class="loading-placeholder">
        <p>Fetching attendance...</p>
      </div>
  
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
  
      
      <div v-else-if="attendanceSummary.total > 0" class="card-content-grid">
        
        <div class="summary-cards">
            <div class="info-item">
                <p class="label">Total Days</p>
                <p class="value">{{ attendanceSummary.total }}</p>
            </div>
            <div class="info-item">
                <p class="label">Present</p>
                <p class="value text-green">{{ attendanceSummary.present }}</p>
            </div>
            <div class="info-item">
                <p class="label">Absent</p>
                <p class="value text-red">{{ attendanceSummary.absent }}</p>
            </div>
            <div class="info-item">
                <p class="label">Excused</p>
                <p class="value text-yellow">{{ attendanceSummary.excused }}</p>
            </div>
        </div>
  
        
        <div v-if="chartData.datasets.length" class="chart-container">
          <Pie :data="chartData" :options="chartOptions" />
        </div>
      </div>
  
      
      <div v-else class="no-data">
        <p>No attendance data available for this student.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, watch, toRefs } from 'vue';
  import { getAttendance } from '../../api/attendance';
  
  
  import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
  import { Pie } from 'vue-chartjs';
  
  ChartJS.register(Title, Tooltip, Legend, ArcElement);
  
  
  const props = defineProps({
    studentId: {
      type: String,
      required: true,
    },
  });
  
  const { studentId } = toRefs(props);
  
  
  const attendance = ref([]);
  const loading = ref(false);
  const error = ref(null);
  
  
  const fetchAttendance = async (id) => {
    if (!id) {
        attendance.value = [];
        return;
    }
    loading.value = true;
    error.value = null;
    try {
      const res = await getAttendance(id);
      attendance.value = res.data;
    } catch (err) {
      console.error('Error fetching attendance:', err);
      error.value = 'Failed to load attendance.';
      attendance.value = [];
    } finally {
      loading.value = false;
    }
  };
  
  
  watch(studentId, (newId) => {
      fetchAttendance(newId);
  }, { immediate: true });
  
  
  const attendanceSummary = computed(() => {
    const summary = { total: 0, present: 0, absent: 0, excused: 0 };
    if(!attendance.value) return summary;

    Object.values(attendance.value).forEach(records => {
      records.forEach(r => {
        summary.total++;
        if (r.status === 'PRESENT') summary.present++;
        else if (r.status === 'ABSENT') summary.absent++;
        else if (r.status === 'EXCUSED') summary.excused++;
      });
    });
    return summary;
  });
  
  
  const chartData = reactive({ labels: ['Present', 'Absent', 'Excused'], datasets: [] });
  const chartOptions = { 
      responsive: true, 
      maintainAspectRatio: false,
      plugins: { 
          legend: { position: 'top' } 
      } 
  };
  
  watch(attendanceSummary, (summary) => {
      chartData.datasets = [{
        label: 'Attendance',
        data: [summary.present, summary.absent, summary.excused],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
      }];
  })
  
  </script>
  
  <style scoped>
  .dashboard-card {
    background-color: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
  }
  
  .card-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .card-content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: center;
  }
  
  .summary-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .info-item:last-child {
      border-bottom: none;
  }
  
  .label {
    color: #666;
    font-size: 0.9rem;
  }
  
  .value {
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  .text-green { color: #10b981; }
  .text-red { color: #ef4444; }
  .text-yellow { color: #f59e0b; }
  
  .chart-container {
      position: relative;
      height: 200px; 
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

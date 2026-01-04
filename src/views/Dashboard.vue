<!--
/**
 * @file Dashboard.vue
 * @description This is the main dashboard view for parents. It provides an overview of key information
 *              for a selected student, including fee overview, attendance summary, and grades summary.
 *              It also features a notification display.
 *
 * @overview
 * The component acts as a stateful parent, managing the selection of a student and passing
 * the `selectedStudentId` down to its child components (`FeeOverview`, `DashboardAttendance`,
 * `DashboardGrades`). It fetches a list of all students associated with the parent and
 * also retrieves and displays notifications. The layout is designed to be responsive and
 * visually appealing, centralizing student selection to improve user experience and reduce redundancy.
 *
 * @dataDisplayed
 * - List of students associated with the parent (for selection).
 * - The currently selected student's ID.
 * - Notifications (title, message, sender, timestamp) with an unread count badge.
 * - Aggregated data from child components (`FeeOverview`, `DashboardAttendance`, `DashboardGrades`)
 *   which dynamically updates based on the `selectedStudentId`.
 *
 * @dataFetching
 * - `getStudent()` from `../api/Students.js`: Fetches the list of students for the logged-in parent.
 * - `fetchEvents()` from `../api/event.js`: Fetches all events/notifications, which are then filtered
 *   for relevance to parents.
 *
 * @dependencies
 * - Vue Composition API: `ref`, `onMounted` for reactive state management and lifecycle hooks.
 * - Child Components: `FeeOverview.vue`, `DashboardAttendance.vue`, `DashboardGrades.vue`
 *   (all located in `../components/Dashboard/`).
 * - API Services: `../api/Students.js`, `../api/event.js`.
 *
 * @interactions
 * - **Student Selection:** A dropdown menu allows the parent to select one of their students.
 *   This selection updates the `selectedStudentId` reactive variable.
 * - **Notifications:** A bell icon displays a badge indicating the number of unread notifications.
 *   Clicking the icon toggles the visibility of a dropdown containing recent notifications.
 * - **Dynamic Content:** The data displayed by the child components automatically updates
 *   whenever a new student is selected, as the `student-id` prop changes.
 *
 * @uiUx
 * - Features a clear and welcoming header with a dynamic greeting and the parent's name.
 * - Centralized student selection mechanism eliminates redundant selectors in child components.
 * - Information is organized into a responsive grid layout (`dashboard-grid`) for clarity and aesthetics.
 * - Provides a user-friendly placeholder message when no student is selected.
 * - Notifications are seamlessly integrated into the header, providing easy access to important updates.
 */
-->
<template>
  <div class="dashboard-container">
    <div class="header">
  
  <div class="notifications">
    <button @click="toggleNotifications" class="notification-btn">
      🔔
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>

    <div v-if="showNotifications" class="notifications-dropdown">
      <h3 class="font-semibold mb-2">Latest Notifications</h3>
      <ul>
        <li v-for="note in notifications" :key="note.id" class="notification-item">
          <strong>{{ note.title }}</strong>: {{ note.message }}
          <p>Sent By: <i style="color:orangered">{{ note.created_by_name }}</i></p>
        </li>
        <li v-if="notifications.length === 0" class="text-gray-500">No notifications.</li>
      </ul>
    </div>
  </div>

  
  <div v-if="students.length > 1" class="student-selector">
    <label for="student-select">Select Student:</label>
    <select id="student-select" v-model="selectedStudentId" @change="onStudentChange">
      <option disabled value="">Please select one</option>
      <option v-for="student in students" :key="student.id" :value="student.id">
        {{ student.full_name }}
      </option>
    </select>
  </div>
</div>

    <div v-if="selectedStudentId" class="dashboard-grid">
      <FeeOverview :student-id="selectedStudentId" />
      <DashboardAttendance :student-id="selectedStudentId" />
      <DashboardGrades :student-id="selectedStudentId" />
    </div>

    <div v-else class="placeholder">
      <p>Please select a student to view their dashboard.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FeeOverview from '../components/Dashboard/FeeOverview.vue';
import DashboardGrades from '../components/Dashboard/DashboardGrades.vue';
import DashboardAttendance from '../components/Dashboard/DashboardAttendance.vue';
import { getStudent } from '../api/Students'; 
import { fetchEvents } from '../api/event'; 

const students = ref([]);
const selectedStudentId = ref('');
const notifications = ref([]);
const unreadCount = ref(0);
const showNotifications = ref(false);

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

onMounted(async () => {
  try {
    
    const response = await getStudent(); 
    students.value = Array.isArray(response) ? response : [];
    if (students.value.length > 0) {
      selectedStudentId.value = students.value[0].id; 
    }

    
    const allNotifications = await fetchEvents();
    notifications.value = allNotifications
      .filter(n => n.target_audience === 'parents' || n.target_audience === 'all')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    unreadCount.value = notifications.value.length;

  } catch (error) {
    console.error('Error fetching students or notifications:', error);
  }
});

const onStudentChange = () => {
  console.log(`Selected student ID changed to: ${selectedStudentId.value}`);
};
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  justify-content: flex-start; 
  gap: 1rem; 
  margin-bottom: 2rem;

}

.notifications {
  position: relative;
  margin-left: auto; 

}

.notification-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  position: relative; 

}

.badge {
  position: absolute;
  top: -5px;
  right: -10px;
  background: red;
  color: white;
  border-radius: 50%;
  padding: 0 6px;
  font-size: 0.75rem;
}

.student-selector {
  display: flex;
  align-items: center;
 
}


.student-selector label {
  margin-right: 1rem;
  font-weight: bold;
}

#student-select {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.notifications-dropdown {
  position: absolute;
  right: 0;
  top: 30px;
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  z-index: 100;
}

.notification-item {
  margin-bottom: 0.5rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.placeholder {
  text-align: center;
  margin-top: 4rem;
  color: #777;
}
</style>

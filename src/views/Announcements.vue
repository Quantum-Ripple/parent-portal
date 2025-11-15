<!--
/**
 * @file Announcements.vue
 * @description This view component is responsible for displaying a list of announcements or notifications
 *              relevant to parents. It acts as a central hub for parents to stay informed about
 *              school-wide or specific updates.
 *
 * @overview
 * The component fetches all available events/notifications from the backend, filters them
 * to show only those targeted at 'parents' or 'all' audiences, and then displays them
 * in a sorted list (latest first). It provides visual feedback for loading and error states.
 *
 * @dataDisplayed
 * - Notification title (`note.title`)
 * - Notification message (`note.message`)
 * - Date and time of creation (`note.created_at`)
 *
 * @dataFetching
 * - Uses `fetchEvents()` from `../api/event.js` to retrieve all events.
 *
 * @dataFilteringAndSorting
 * - `filteredNotifications`: A computed property that filters notifications based on `target_audience`
 *   ('parents' or 'all').
 * - `sortedNotifications`: A computed property that sorts the `filteredNotifications` by `created_at`
 *   in descending order to display the latest announcements first.
 *
 * @dependencies
 * - Vue Composition API: `ref`, `onMounted`, `computed` for reactive state management and lifecycle hooks.
 * - API Service: `../api/event.js` for backend communication.
 *
 * @interactions
 * - Data is fetched automatically when the component is mounted (`onMounted`).
 * - Displays loading indicators while data is being retrieved.
 * - Shows error messages if data fetching fails.
 * - Dates are formatted for user-friendly display.
 *
 * @uiUx
 * - Notifications are presented in a clean, card-like list format.
 * - The page has a clear and descriptive title ("Parent Notifications").
 * - Provides clear visual feedback for loading and error states to enhance user experience.
 * - Ensures the most recent announcements are prominently displayed.
 */
-->
<template>
  <div class="p-6 space-y-6">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Parent Notifications</h1>

    
    <div v-if="loading" class="text-gray-500 text-center py-10">
      Loading notifications...
    </div>

    
    <div v-if="error" class="text-red-600 font-semibold text-center py-6">
      {{ error }}
    </div>

    
    <div v-if="filteredNotifications.length" class="space-y-4">
      <div
        v-for="note in sortedNotifications"
        :key="note.id"
        class="bg-white shadow-md rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-2">
          <h2 class="text-xl font-semibold text-gray-800">{{ note.title }}</h2>
          <span class="text-sm text-gray-500">{{ formatDate(note.created_at) }}</span>
        </div>
        <p class="text-gray-700 leading-relaxed">{{ note.message }}</p>
      </div>
    </div>

    
    <div v-else class="text-gray-600 text-center py-10">
      No notifications for parents at the moment.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { fetchEvents } from "../api/event.js";

const notifications = ref([]);
const loading = ref(false);
const error = ref(null);

const loadNotifications = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await fetchEvents();
    notifications.value = data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load notifications.";
  } finally {
    loading.value = false;
  }
};


const filteredNotifications = computed(() => {
  return notifications.value.filter(
    (note) => note.target_audience === "parents" || note.target_audience === "all"
  );
});


const sortedNotifications = computed(() => {
  return filteredNotifications.value.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});


const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
};

onMounted(loadNotifications);
</script>

<style scoped>

</style>

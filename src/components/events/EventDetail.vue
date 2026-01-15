<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div v-if="loading" class="text-gray-500">Loading announcement...</div>

    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <div v-else class="bg-white shadow-md rounded-xl p-6 border border-gray-100">
      <h2 class="text-2xl font-semibold text-gray-800 mb-2">
        {{ event.title }}
      </h2>

      <p class="text-gray-600 mb-4 whitespace-pre-line">{{ event.message }}</p>

      <div class="text-sm text-gray-500 mb-4">
        <p><strong>Target:</strong> {{ event.target_audience }}</p>
        <p><strong>Date:</strong> {{ formatDate(event.created_at) }}</p>
      </div>

      <div class="flex justify-between items-center">
        <button
          @click="router.push({ name: 'AnnouncementsPage' })"
          class="text-blue-600 hover:underline"
        >
          ← Back
        </button>

    
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as eventApi from "../../api/event";

const route = useRoute();
const router = useRouter();

const event = ref({});
const loading = ref(false);
const error = ref(null);



async function fetchEvent() {
  loading.value = true;
  try {
    const response = await eventApi.fetchEventsById(route.params.id);
    event.value = response;
  } catch (err) {
    console.error("Failed to load event:", err);
    error.value = "Could not load announcement details.";
  } finally {
    loading.value = false;
  }
}


function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

onMounted(fetchEvent);
</script>
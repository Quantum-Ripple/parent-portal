<!--
/**
 * @file ParentDetail.vue
 * @description This component is responsible for fetching and displaying the detailed profile
 *              information of the logged-in parent or guardian.
 *
 * @overview
 * The component fetches the parent's data from the API upon mounting. It displays the
 * information in a structured card format, including personal details, contact information,
 * and account status. It also provides loading and error states to give feedback to the user.
 *
 * @dataDisplayed
 * - Parent's full name, relationship to the student, and school name.
 * - An avatar-like circle with the parent's initials.
 * - Contact Information: Email and Phone number.
 * - Address.
 * - Date Joined (formatted for readability).
 * - Account Status (e.g., 'Active' or 'Inactive'), styled with corresponding colors.
 *
 * @dataFetching
 * - `getParent()` from `../api/Students.js`: Fetches the profile data for the logged-in parent.
 *   The full name is constructed from first, middle, and last names upon successful fetch.
 *
 * @dependencies
 * - Vue Composition API: `ref` and `onMounted` for reactive state management and component lifecycle hooks.
 * - API Service: `../api/Students.js` for backend communication.
 * - Font Awesome: For icons used in the refresh button and loading/error states.
 *
 * @interactions
 * - **Initial Data Load:** The `onMounted` lifecycle hook triggers the `fetchParent` function to
 *   load the parent's data as soon as the component is rendered.
 * - **Manual Refresh:** A "Refresh" button allows the user to manually re-trigger the `fetchParent`
 *   function to get the latest data.
 *
 * @uiUx
 * - Presents the parent's information in a visually appealing card with a distinct gradient header.
 * - Clearly indicates loading and error states to provide feedback to the user during the data fetching process.
 * - The `date_joined` field is formatted into a more human-readable format (e.g., "Jan 1, 2023").
 * - The account status is dynamically styled with colors (green for Active, red for Inactive) for quick visual assessment.
 */
-->
<template>
  <div class="max-w-4xl mx-auto p-8">
    
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-3xl font-bold text-gray-800">Guardian Profile</h2>
      <button
        @click="fetchParent"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
      >
        <i class="fas fa-sync-alt"></i>
        Refresh
      </button>
    </div>

    
    <div v-if="loading" class="text-gray-500 text-center py-8">
      <i class="fas fa-spinner fa-spin mr-2"></i>Loading guardian information...
    </div>

    <div v-else-if="error" class="text-red-600 text-center py-8">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      Failed to load guardian info. Please try again.
    </div>

    
    <div
      v-else
      class="bg-white rounded-2xl shadow-md overflow-hidden transition-all hover:shadow-lg"
    >
      
      <div class="flex items-center gap-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
        <div
          class="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold uppercase"
        >
          {{ parent.first_name?.charAt(0) }}{{ parent.last_name?.charAt(0) }}
        </div>
        <div>
          <h3 class="text-2xl font-semibold">{{ parent.full_name }}</h3>
          <p class="opacity-90">{{ parent.relationship }}</p>
          <p class="opacity-80 text-sm">{{ parent.school_name }}</p>
        </div>
      </div>

      
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-1">
          <p class="text-gray-500 font-medium">Email</p>
          <p class="text-gray-800">{{ parent.email }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-gray-500 font-medium">Phone</p>
          <p class="text-gray-800">{{ parent.phone || 'N/A' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-gray-500 font-medium">Address</p>
          <p class="text-gray-800">{{ parent.address || 'N/A' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-gray-500 font-medium">Date Joined</p>
          <p class="text-gray-800">{{ formatDate(parent.date_joined) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-gray-500 font-medium">Status</p>
          <p
            :class="parent.is_active ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'"
          >
            {{ parent.is_active ? 'Active' : 'Inactive' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getParent } from '../api/Students'

const parent = ref({})
const loading = ref(true)
const error = ref(false)

const fetchParent = async () => {
  loading.value = true
  error.value = false
  try {
    const data = await getParent()
    parent.value = {
      ...data,
      full_name: `${data.first_name} ${data.middle_name ? data.middle_name + ' ' : ''}${data.last_name}`
    }
  } catch (err) {
    console.error(err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchParent)

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

p {
  word-wrap: break-word;
}
</style>

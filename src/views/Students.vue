<!--
/**
 * @file Students.vue
 * @description This view provides a comprehensive overview of the parent's profile and
 *              a list of all students associated with that parent. It acts as a central
 *              page for parents to manage and view information related to themselves and their children.
 *
 * @overview
 * The component acts as a container, importing and rendering two key components:
 * `ParentDetail` for the parent's own information, and `student` for the list of their children.
 * It arranges these components in a responsive grid layout. Data fetching and specific
 * interactions are delegated to the respective child components.
 *
 * @componentsUsed
 * - `ParentDetail.vue`: Displays detailed information about the logged-in parent/guardian.
 * - `student.vue`: Displays a list of all students linked to the parent, showing key details for each student.
 *
 * @dataDisplayed
 * - Parent's personal details (managed and displayed by the `ParentDetail` component).
 * - List of students with their respective details (managed and displayed by the `student` component).
 *
 * @dataFetching
 * - Data fetching is handled independently by each of the child components. This view
 *   itself does not directly fetch parent or student data.
 *
 * @dependencies
 * - Child Components: `ParentDetail.vue` and `student.vue` (both located in `../components/`).
 *
 * @interactions
 * - This view primarily acts as a layout and container. User interactions, such as
 *   refreshing parent details or viewing individual student profiles, are handled
 *   within the individual child components.
 *
 * @uiUx
 * - Organizes parent and student information side-by-side in a responsive grid layout (`md:grid-cols-2`).
 * - Provides a clear and structured presentation of related data, enhancing readability and navigation.
 */
-->
<template>
  <div class="p-6 grid md:grid-cols-2 gap-6">
    <ParentDetail />
    <student />
  </div>
</template>

<script setup>
import ParentDetail from '../components/ParentDetail.vue'
import student from '../components/student.vue'
</script>

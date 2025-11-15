<!--
/**
 * @file Grades.vue
 * @description This view serves as a container for displaying student grade information.
 *              It primarily renders the `GradesList` component, which handles the logic
 *              for fetching and presenting detailed grade records.
 *
 * @overview
 * The component acts as a simple wrapper for the `GradesList` component. It does not
 * contain direct data fetching or complex state management related to grades itself,
 * delegating these responsibilities entirely to its child component.
 *
 * @componentsUsed
 * - `GradesList.vue`: A component responsible for fetching and displaying a list of grades,
 *   typically grouped by exam or subject, and may include a chart for performance trends.
 *
 * @dataDisplayed
 * - The data displayed within this view is entirely managed and presented by the
 *   `GradesList` child component.
 *
 * @dataFetching
 * - Data fetching for grades is handled by the `GradesList` child component. This view
 *   itself does not directly fetch grade data.
 *
 * @dependencies
 * - Child Component: `GradesList` (located in `../components/Grades/`).
 *
 * @interactions
 * - This view primarily acts as a layout and container. User interactions, such as
 *   student selection or expanding grade details, are handled within the `GradesList` component.
 *
 * @uiUx
 * - Provides a dedicated page for viewing student grades.
 * - The layout is simple, focusing on presenting the `GradesList` component prominently.
 *   Any specific styling or layout for the grades display is managed by `GradesList`.
 */
-->
<template>
    <div>
        <GradesList />
       
      
    </div>

</template>

<script setup>
import GradesList from '../components/Grades/GradesList.vue';


</script>
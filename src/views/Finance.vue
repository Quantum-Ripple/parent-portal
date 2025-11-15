<!--
/**
 * @file Finance.vue
 * @description This view serves as a container for various finance-related components,
 *              providing a comprehensive financial overview for parents. It aggregates
 *              different aspects of student finances into a single, navigable page.
 *
 * @overview
 * The component acts as a wrapper, importing and rendering several specialized finance
 * components. It does not contain direct data fetching or complex logic itself, but
 * rather orchestrates the presentation of financial information handled by its children.
 *
 * @componentsUsed
 * - `FeeStatements.vue`: Displays detailed fee statements, including invoices and payment history.
 * - `FeeStructure.vue`: Shows the fee structure applicable to the student.
 * - `FeeSummary.vue`: Provides a summary of fees billed, paid, and outstanding balance.
 * - `OnlinePayment.vue`: Offers information and instructions on how to make online fee payments.
 *
 * @dataDisplayed
 * - The data displayed within this view is entirely aggregated from its child components,
 *   each focusing on a specific aspect of student finance.
 *
 * @dataFetching
 * - Data fetching is handled independently by each of the child components. This view
 *   itself does not directly fetch financial data.
 *
 * @dependencies
 * - Child Components: `FeeStatements`, `FeeStructure`, `FeeSummary`, `OnlinePayment`
 *   (all located in `../components/Finance/`).
 *
 * @interactions
 * - This view primarily acts as a layout and container. User interactions, such as
 *   student selection or payment initiation, are handled within the individual child components.
 *
 * @uiUx
 * - Organizes multiple finance-related components into a single, cohesive page for easy
 *   access and navigation.
 * - The layout is straightforward, simply rendering each child component sequentially,
 *   allowing each sub-component to manage its own presentation.
 */
-->
<template>
    <div>
        <FeeStatements/>
        <FeeStructure/>
       
        <FeeSummary/>
        <OnlinePayment />
    </div>
    </template>

<script setup>
import FeeStructure from '../components/Finance/FeeStructure.vue';
import OnlinePayment from '../components/Finance/OnlinePayment.vue';
import FeeSummary from '../components/Finance/FeeSummary.vue';
import FeeStatements from '../components/Finance/FeeStatements.vue';
</script>
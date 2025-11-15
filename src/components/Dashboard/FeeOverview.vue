<!--
/**
 * @file FeeOverview.vue
 * @description This component provides a high-level overview of a student's financial status,
 *              including total fees billed, total paid, outstanding balance, and any overpayment.
 *
 * @overview
 * As a stateless child component, it receives a `studentId` as a prop and fetches the
 * corresponding financial data. It then displays this information in a clear, summarized
 * format within a dashboard card. The component is designed to be reactive, updating its
 * display whenever the `studentId` prop changes.
 *
 * @props
 * - `studentId`: A required `String` prop representing the unique identifier for the student.
 *   This ID is used to fetch the relevant financial data.
 *
 * @dataDisplayed
 * - Total Fees Billed
 * - Total Paid
 * - Outstanding Balance
 * - Overpayment (only displayed if the balance is negative)
 *
 * @dataFetching
 * - `getStudentFinanceDetails(studentId)` from `../../api/Finance.js`: Fetches the financial
 *   details for the student specified by the `studentId` prop.
 *
 * @dependencies
 * - Vue Composition API: `ref`, `computed`, `watch`, `toRefs`.
 * - API Service: `../../api/Finance.js`.
 *
 * @interactions
 * - **Data Reactivity:** A `watch` effect with `{ immediate: true }` on the `studentId` prop
 *   triggers the `fetchFinance` function both when the component is first mounted and whenever
 *   the `studentId` prop changes.
 * - **Overpayment Calculation:** The `overpayment` computed property calculates and returns any
 *   overpayment amount based on a negative balance.
 * - **Amount Formatting:** The `formatAmount` function formats the financial figures into a
 *   localized currency string (e.g., "Ksh 1,234.56").
 *
 * @uiUx
 * - Presents the financial overview in a clean, card-based layout (`dashboard-card`).
 * - Uses distinct colors for different financial items (e.g., blue for billed, green for paid,
 *   red for balance) to improve readability and quick comprehension.
 * - Provides clear user feedback with distinct states for loading, error, and "no data" scenarios.
 */
-->
<template>
    <div class="dashboard-card">
      <h3 class="card-title">Fee Overview</h3>
  
      
      <div v-if="loading" class="loading-placeholder">
        <p>Loading financial data...</p>
      </div>
  
      
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
  
      
      <div v-if="data" class="card-content">
        <div class="info-item">
          <p class="label">Total Fees Billed</p>
          <p class="value text-blue">{{ formatAmount(data.total_billed) }}</p>
        </div>
        <div class="info-item">
          <p class="label">Total Paid</p>
          <p class="value text-green">{{ formatAmount(data.total_paid) }}</p>
        </div>
        <div class="info-item">
          <p class="label">Outstanding Balance</p>
          <p class="value text-red">{{ formatAmount(data.balance) }}</p>
        </div>
        <div v-if="overpayment > 0" class="info-item">
          <p class="label">Overpayment</p>
          <p class="value text-yellow">{{ formatAmount(overpayment) }}</p>
        </div>
      </div>
       <div v-else-if="!loading && !error" class="no-data">
        <p>No financial data available for this student.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, toRefs } from "vue";
  import { getStudentFinanceDetails } from "../../api/Finance";
  
  
  const props = defineProps({
    studentId: {
      type: String,
      required: true,
    },
  });
  
  const { studentId } = toRefs(props);
  
  
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);
  
  
  const fetchFinance = async (id) => {
    if (!id) {
        data.value = null;
        return
    };
    loading.value = true;
    error.value = null;
    try {
      const res = await getStudentFinanceDetails(id);
      data.value = res.data;
    } catch (err) {
      console.error('Error fetching finance details:', err);
      error.value = "Failed to load financial data.";
    } finally {
      loading.value = false;
    }
  };
  
  
  watch(
    studentId,
    (newId) => {
      fetchFinance(newId);
    },
    { immediate: true } 
  );
  
  
  const overpayment = computed(() => {
    if (!data.value || !data.value.balance) return 0;
    const bal = parseFloat(data.value.balance);
    return bal < 0 ? Math.abs(bal) : 0;
  });
  
  
  const formatAmount = (amount) => {
      if(amount === null || amount === undefined) return "Ksh 0.00";
      return `Ksh ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  </script>
  
  <style scoped>
  .dashboard-card {
    background-color: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease-in-out;
  }
  
  .dashboard-card:hover {
    transform: translateY(-4px);
  }
  
  .card-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .card-content {
    display: grid;
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
  
  .text-blue { color: #3b82f6; }
  .text-green { color: #10b981; }
  .text-red { color: #ef4444; }
  .text-yellow { color: #f59e0b; }
  
  .loading-placeholder, .error-message, .no-data {
    text-align: center;
    padding: 2rem;
    color: #777;
  }
  </style>
  

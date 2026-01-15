<!--
/**
 * @file FeeStatements.vue
 * @description This component provides a detailed financial statement for a selected student,
 *              including their personal details, a list of invoices, and a breakdown of
 *              payments for each invoice.
 *
 * @overview
 * The component first fetches a list of students associated with the parent. It allows the
 * user to select a student, then fetches the detailed financial statement for that student.
 * This involves fetching invoice data and then making subsequent API calls to get detailed
 * information for each payment associated with an invoice.
 *
 * @dataDisplayed
 * - Student's full name, admission number, class, and stream.
 * - A list of invoices, each showing its ID, amount due, and amount paid.
 * - For each invoice, a table of associated payments, detailing the date, amount, payment method,
 *   transaction code, and the name of the receiver.
 *
 * @dataFetching
 * - `getStudent()` from `../../api/students.js`: Fetches the list of students for the parent to populate the selector.
 * - `getStudentFinanceDetails(studentId)` from `../../api/finance.js`: Fetches the main financial data, including a list of invoices.
 * - `getPayments(paymentId)` from `../../api/finance.js`: Fetches detailed information for each individual payment.
 *
 * @dependencies
 * - Vue Composition API: `ref`, `onMounted`.
 * - API Services: `../../api/finance.js`, `../../api/students.js`.
 *
 * @interactions
 * - **Student Selection:** If the parent has multiple students, a dropdown is displayed to allow selection.
 *   If there is only one student, their name is displayed directly.
 * - **Initial Data Load:** On component mount, it fetches the list of students and then automatically
 *   fetches the full financial statement for the first student in the list.
 * - **Dynamic Fetching:** When a new student is selected from the dropdown, the `onStudentChange`
 *   handler triggers a re-fetch of the financial statement for that student.
 * - **Nested API Calls:** The `fetchFinanceStatement` function makes nested calls to `fetchInvoicePayments`,
 *   which in turn calls `getPayments` for each payment. This could result in a significant number of
 *   API requests if a student has many invoices with many payments.
 *
 * @uiUx
 * - Presents a clear, hierarchical view of financial information, starting with student details,
 *   then invoices, and finally a table of payments for each invoice.
 * - Uses tables to structure payment information, making it easy to read and understand.
 * - Provides distinct loading and error states to keep the user informed about the data fetching process.
 */
-->
<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">Finance Statement</h1>

    
    <div v-if="studentsLoading" class="text-gray-500">Loading students...</div>

    <div v-else-if="students.length > 1" class="flex items-center gap-3">
      <label class="font-medium">Select student:</label>
      <select v-model="selectedStudentId" @change="onStudentChange" class="border px-3 py-1 rounded">
        <option value="" disabled>Select a student</option>
        <option v-for="s in students" :key="s.id" :value="s.id">{{ s.full_name }}</option>
      </select>
    </div>

    <div v-else-if="students.length === 1" class="text-gray-700">
      <span class="font-medium">Student:</span>
      <span class="ml-2">{{ students[0].full_name }}</span>
    </div>

    
    <div v-if="loading" class="text-gray-500 py-10 text-center">
      Loading finance statement...
    </div>

    
    <div v-if="error" class="text-red-600 font-semibold text-center py-4">
      {{ error }}
    </div>

    
    <div v-if="data" class="bg-white p-4 rounded-xl shadow border">
      <h2 class="text-lg font-semibold text-gray-700 mb-3">Student Details</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
        <p><span class="font-medium">Name:</span> {{ data.student.full_name }}</p>
        <p><span class="font-medium">Admission No:</span> {{ data.student.admission_number }}</p>
        <p><span class="font-medium">Class:</span> {{ data.student.class_level }}</p>
        <p><span class="font-medium">Stream:</span> {{ data.student.stream }}</p>
      </div>
    </div>

    
    <div v-if="invoices.length" class="space-y-4">
      <div v-for="invoice in invoices" :key="invoice.id" class="bg-gray-50 p-4 rounded-xl shadow border">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">
          Invoice #{{ invoice.id }} — Amount Due: KES {{ formatAmount(invoice.amount_due) }} — Paid: KES {{ formatAmount(invoice.amount_paid) }}
        </h3>

        
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-200">
              <th class="border px-2 py-1 text-left">Date</th>
              <th class="border px-2 py-1 text-left">Amount</th>
              <th class="border px-2 py-1 text-left">Method</th>
              <th class="border px-2 py-1 text-left">Transaction Code</th>
              <th class="border px-2 py-1 text-left">Received By</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in invoice.payments" :key="payment.id">
              <td class="border px-2 py-1">{{ payment.date }}</td>
              <td class="border px-2 py-1">{{ formatAmount(payment.amount) }}</td>
              <td class="border px-2 py-1">{{ payment.method_display }}</td>
              <td class="border px-2 py-1">{{ payment.transaction_code || "-" }}</td>
              <td class="border px-2 py-1">{{ payment.received_by }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    
    <div v-else-if="data && !invoices.length" class="text-yellow-600 text-center py-6">
      No invoices found for this student.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getStudentFinanceDetails, getPayments } from "../../api/Finance";
import { getStudent } from "../../api/Students";


const students = ref([]);
const studentsLoading = ref(true);
const selectedStudentId = ref(null);
const data = ref(null);
const invoices = ref([]);
const loading = ref(false);
const error = ref(null);


const formatAmount = (amount) => Number(amount).toLocaleString("en-KE");


const fetchInvoicePayments = async (invoice) => {
  const detailedPayments = [];
  for (const payment of invoice.payments) {
    try {
      const res = await getPayments(payment.id);
      detailedPayments.push(res.data);
    } catch (err) {
      console.error("Failed to fetch payment:", err);
    }
  }
  return detailedPayments;
};


const fetchFinanceStatement = async (studentId) => {
  if (!studentId) return;
  loading.value = true;
  error.value = null;

  try {
    const res = await getStudentFinanceDetails(studentId);
    data.value = res.data;

    
    const invoicesWithPayments = [];
    for (const invoice of res.data.invoices) {
      const payments = await fetchInvoicePayments(invoice);
      invoicesWithPayments.push({ ...invoice, payments });
    }
    invoices.value = invoicesWithPayments;

  } catch (err) {
    console.error(err);
    error.value = "Failed to load finance statement.";
  } finally {
    loading.value = false;
  }
};


const onStudentChange = async () => {
  if (!selectedStudentId.value) return;
  await fetchFinanceStatement(selectedStudentId.value);
};


onMounted(async () => {
  studentsLoading.value = true;
  try {
    const res = await getStudent();
    students.value = res;

    if (!students.value.length) {
      error.value = "No students found.";
      return;
    }

    
    selectedStudentId.value = students.value[0].id;
    await fetchFinanceStatement(selectedStudentId.value);

  } catch (err) {
    console.error(err);
    error.value = "Failed to load students.";
  } finally {
    studentsLoading.value = false;
  }
});
</script>

<style scoped></style>

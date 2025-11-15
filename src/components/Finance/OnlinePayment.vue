<!--
/**
 * @file OnlinePayment.vue
 * @description This component provides clear, step-by-step instructions on various methods
 *              for parents to pay school fees, including Mpesa, Ecitizen, and Bank transfers.
 *
 * @overview
 * This is a static informational component designed to guide parents through the process
 * of making fee payments. It presents different payment options in an organized and
 * visually distinct manner, making it easy for users to find their preferred method
 * and follow the necessary steps.
 *
 * @dataDisplayed
 * - **Mpesa Payment Instructions:** Details like the Business Number and Account Number,
 *   along with a sequence of steps to complete the transaction.
 * - **Ecitizen Payment Instructions:** A direct link to the Ecitizen portal and a general
 *   outline of the payment process through the platform.
 * - **Bank Transfer Instructions:** Account Name, Account Number, and Bank Name, along with
 *   guidance for bank-based payments.
 *
 * @dependencies
 * - None specific to Vue Composition API or external services, as this component primarily
 *   serves as a static informational display.
 *
 * @interactions
 * - **External Links:** The component includes a clickable external link to the Ecitizen
 *   portal, allowing users to navigate directly to the payment platform.
 *
 * @uiUx
 * - Presents each payment method in a distinct, card-based layout with different background
 *   colors (blue for Mpesa, green for Ecitizen, yellow for Bank) to visually separate them.
 * - Uses bold text to highlight critical information such as account numbers, business numbers,
 *   and bank names, ensuring these details are easily noticeable.
 * - The overall design is clean, concise, and easy to follow, providing a user-friendly guide
 *   for parents.
 */
-->
<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">How to Pay School Fees</h1>

    
    <div class="grid gap-6 md:grid-cols-3">

      
      <div class="bg-blue-50 rounded-lg shadow p-6 hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4 text-blue-700">Mpesa</h2>
        <ul class="space-y-2 text-gray-700">
          <li>Go to Mpesa → Paybill</li>
          <li>Business Number: <span class="font-bold">123456</span></li>
          <li>Account Number: <span class="font-bold">StudentID123</span></li>
          <li>Enter Amount & Confirm</li>
          <li>Save the confirmation SMS</li>
        </ul>
      </div>

      
      <div class="bg-green-50 rounded-lg shadow p-6 hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4 text-green-700">Ecitizen</h2>
        <ul class="space-y-2 text-gray-700">
          <li>Visit <a href="https://www.ecitizen.go.ke" target="_blank" class="text-blue-600 underline">ecitizen.go.ke</a></li>
          <li>Login or create an account</li>
          <li>Select: Education → School Fees</li>
          <li>Enter Student Details & Amount</li>
          <li>Pay using your preferred method (Mpesa, Card, etc.)</li>
          <li>Save the confirmation SMS</li>
        </ul>
      </div>

      
      <div class="bg-yellow-50 rounded-lg shadow p-6 hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4 text-yellow-800">Bank</h2>
        <ul class="space-y-2 text-gray-700">
          <li>Visit your bank or use online banking</li>
          <li>Account Name: <span class="font-bold">XYZ School Fees</span></li>
          <li>Account Number: <span class="font-bold">9876543210</span></li>
          <li>Bank Name: <span class="font-bold">Dummy Bank Ltd</span></li>
          <li>Enter Amount & Confirm</li>
          <li>Keep deposit slip as proof</li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script setup>

</script>

<style scoped>
</style>

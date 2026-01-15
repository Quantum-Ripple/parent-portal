import api from './axios'



export function getStudentFinanceDetails(studentId){
    return api.get(`/student/${studentId}/`)
}


export function getFeeStructures(feeStructureId) {
  return api.get(`fee-structures/${feeStructureId}/`);
}


export function getPayments(paymentId){
    return api.get(`/payments/${paymentId}/`)
}
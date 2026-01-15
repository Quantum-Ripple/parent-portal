import api from './axios'


export function getAttendance(studentId){
  return api.get(`/attendance/student/${studentId}/`)
}
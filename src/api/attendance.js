import api from './Axios'


export function getAttendance(studentId){
  return api.get(`/attendance/student/${studentId}/`)
}
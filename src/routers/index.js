import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../api/Auth'
import LoginPage from '../views/Login.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import StudentsPage from '../views/Students.vue'
import AssignmentsPage from '../views/Assignments.vue'
import AttendancePage from '../views/Attendance.vue'
import Settings from '../views/Settings.vue'
import GradesPage from '../views/Grades.vue'
import AnnouncementsPage from '../views/Announcements.vue'
import Finance from '../views/Finance.vue'


const routes = [
  {
    path: '/',
    redirect: '/login', // Explicitly redirect root to login
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { public: true },
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
      },
      {
        path: 'students',
        name: 'StudentsPage',
        component: StudentsPage,
      },
      {
        path: 'finance',
        name: 'Finance',
        component: Finance
      },
      
      {
        path: 'attendance',
        name: 'AttendancePage',
        component: AttendancePage,
      },
     
      
      {
        path: 'grades',
        name: 'GradesPage',
        component: GradesPage,
      },
      
      {
        path: 'announcements',
        name: 'AnnouncementsPage',
        component: AnnouncementsPage,
      },
      {
        path: 'assignments',
        name: 'AssignmentsPage',
        component: AssignmentsPage,
      },
    
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = Auth.isAuthenticated()

   if (!to.meta.public && !isAuthenticated) {
    next('/login') }

    if (to.path === '/login' && isAuthenticated) {
    next('/dashboard') 
  } else {
    next()
  }
})

export default router
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MazeSolver from '../views/MazeSolver.vue'
import PotsSolver from '../views/PotsSolver.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/maze',
    name: 'MazeSolver',
    component: MazeSolver
  },
  {
    path: '/pots',
    name: 'PotsSolver',
    component: PotsSolver
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
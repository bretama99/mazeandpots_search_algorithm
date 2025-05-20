<!-- src/views/PotsSolver.vue -->
<template>
    <div>
      <div class="header">
        <router-link to="/" class="back-btn">
          <i class="fas fa-arrow-left"></i> Back to Home
        </router-link>
      </div>
      <CapacityPotsSolver />
    </div>
  </template>
  
  <script>
  import CapacityPotsSolver from '@/components/CapacityPotsSolver.vue'
  
  export default {
    name: 'PotsSolver',
    components: {
      CapacityPotsSolver
    }
  }
  </script>
  
  <style scoped>
  .header {
    padding: 15px;
    margin-bottom: 20px;
  }
  
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    text-decoration: none;
    color: #333;
    padding: 8px 15px;
    border-radius: 5px;
    background-color: #f0f0f0;
  }
  </style>
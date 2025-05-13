<!-- src/views/Home.vue -->
<template>
    <div class="home">
      <h1>Search Problem Solvers</h1>
      <p>This project demonstrates two search problems:</p>
      
      <div class="problems-grid">
        <div class="problem-card" @click="$router.push('/maze')">
          <h2>Hill Climbing Maze Solver</h2>
          <p>Demonstration of a local search algorithm finding a path through a maze</p>
          <button class="view-btn">View Demonstration</button>
        </div>
        
        <div class="problem-card" @click="$router.push('/pots')">
          <h2>Capacity Pots Problem</h2>
          <p>Solving the water pots puzzle using breadth-first search</p>
          <button class="view-btn">View Demonstration</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomeView'
  }
  </script>
  
  <style scoped>
  .home {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .problems-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-top: 40px;
  }
  
  .problem-card {
    background-color: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
    cursor: pointer;
  }
  
  .problem-card:hover {
    transform: translateY(-5px);
  }
  
  .view-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 15px;
  }
  </style>
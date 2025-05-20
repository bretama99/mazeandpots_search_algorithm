<!-- src/views/Home.vue -->
<template>
    <div class="home">
      <h1>Search Problem Solvers</h1>
      <p class="intro-text">This project demonstrates two classic search problems solved using different algorithms.</p>
      
      <!-- Detailed Problem Explanations -->
      <div class="explanations-section">
        <h2>Problem Explanations</h2>
        
        <div class="explanation-card">
          <h3>Maze Navigation Problem</h3>
          <div class="explanation-content">
            <div class="explanation-text">
              <p><strong>Problem Definition:</strong> You have a 2D maze with obstacles, a starting position, and a goal position. The goal is to find a route from start to goal without crossing obstacles.</p>
              
              <h4>As a Search Problem:</h4>
              <ul>
                <li><strong>State:</strong> Position (x,y) in the 2D grid</li>
                <li><strong>Initial state:</strong> Starting position (★)</li>
                <li><strong>Goal state:</strong> Finishing position (⛳)</li>
                <li><strong>Actions:</strong> Move in four directions (up, down, left, right)</li>
                <li><strong>Heuristic:</strong> Manhattan distance to goal: |x₁-x₂| + |y₁-y₂|</li>
              </ul>
              
              <h4>Hill Climbing Algorithm:</h4>
              <p>Hill Climbing is a local search algorithm that follows these steps:</p>
              <ol>
                <li>Start at the initial position</li>
                <li>Evaluate all neighboring positions using the heuristic</li>
                <li>Move to the neighbor with the best (lowest) heuristic value</li>
                <li>If no neighbor is better than the current position, we're stuck in a local minimum</li>
                <li>Use random restarts to escape local minima</li>
                <li>Repeat until reaching the goal or maximum steps</li>
              </ol>
              
              <h4>Key Characteristics:</h4>
              <ul>
                <li>Memory efficient (only stores current state)</li>
                <li>Can get trapped in local optima</li>
                <li>Not guaranteed to find the optimal path</li>
                <li>Simple implementation</li>
              </ul>
            </div>
            
            <div class="explanation-image">
              <div class="maze-sample">
                <div class="maze-row">
                  <div class="cell start">★</div>
                  <div class="cell wall"></div>
                  <div class="cell"></div>
                  <div class="cell"></div>
                </div>
                <div class="maze-row">
                  <div class="cell"></div>
                  <div class="cell wall"></div>
                  <div class="cell"></div>
                  <div class="cell wall"></div>
                </div>
                <div class="maze-row">
                  <div class="cell"></div>
                  <div class="cell"></div>
                  <div class="cell path"></div>
                  <div class="cell"></div>
                </div>
                <div class="maze-row">
                  <div class="cell"></div>
                  <div class="cell wall"></div>
                  <div class="cell wall"></div>
                  <div class="cell goal">⛳</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="explanation-card">
          <h3>Capacity Pots Problem</h3>
          <div class="explanation-content">
            <div class="explanation-text">
              <p><strong>Problem Definition:</strong> You have two pots with capacities of 5 liters and 3 liters, and an unlimited water supply. The goal is to measure exactly 4 liters of water using just these two pots.</p>
              
              <h4>As a Search Problem:</h4>
              <ul>
                <li><strong>State:</strong> Ordered pair (x,y) representing water in 5L and 3L pots</li>
                <li><strong>Initial state:</strong> (0,0) - both pots empty</li>
                <li><strong>Goal state:</strong> Any state with exactly 4L in either pot - (4,y) or (x,4)</li>
                <li><strong>Actions:</strong> Fill a pot, empty a pot, or pour water between pots</li>
              </ul>
              
              <h4>Breadth-First Search (BFS) Algorithm:</h4>
              <p>BFS systematically explores the state space level by level:</p>
              <ol>
                <li>Start with the initial state (0,0)</li>
                <li>Explore all states reachable in one step</li>
                <li>Then explore all states reachable in two steps, and so on</li>
                <li>Keep track of visited states to avoid cycles</li>
                <li>Once the goal is found, trace back the path to get the solution</li>
              </ol>
              
              <h4>Key Characteristics:</h4>
              <ul>
                <li>Guarantees the optimal (shortest) solution</li>
                <li>Uses more memory (stores all states in the frontier)</li>
                <li>Never gets stuck in local optima</li>
                <li>Efficient for small state spaces (the pots problem has at most 24 states)</li>
              </ul>
            </div>
            
            <div class="explanation-image">
              <div class="pots-sample">
                <div class="pot-container">
                  <div class="sample-pot large-pot">
                    <div class="water" style="height: 80%"></div>
                    <div class="pot-label">4/5 L</div>
                  </div>
                  <div>5 Liter Pot</div>
                </div>
                <div class="pot-container">
                  <div class="sample-pot small-pot">
                    <div class="water" style="height: 0%"></div>
                    <div class="pot-label">0/3 L</div>
                  </div>
                  <div>3 Liter Pot</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="comparison-section">
          <h3>Algorithm Comparison</h3>
          <div class="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Aspect</th>
                  <th>Hill Climbing</th>
                  <th>Breadth-First Search</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Memory Usage</td>
                  <td>Low (O(1))</td>
                  <td>High (O(b<sup>d</sup>))</td>
                </tr>
                <tr>
                  <td>Guarantees Optimal Solution</td>
                  <td>No</td>
                  <td>Yes (for uniform costs)</td>
                </tr>
                <tr>
                  <td>Completeness</td>
                  <td>No (without restarts)</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Use of Heuristic</td>
                  <td>Yes</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Suitable For</td>
                  <td>Large spaces with good heuristics</td>
                  <td>Small to medium spaces, optimal solutions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="instructions-section">
          <h3>How to Use the Demonstrations</h3>
          <p>Each demonstration allows you to visualize and interact with the search algorithms:</p>
          <ul>
            <li><strong>Play/Pause:</strong> Run the algorithm animation automatically</li>
            <li><strong>Step:</strong> Move forward one step in the algorithm</li>
            <li><strong>Complete:</strong> Run the algorithm to completion instantly</li>
            <li><strong>Reset:</strong> Start over from the beginning</li>
          </ul>
          <p>Watch how the algorithms make decisions at each step and observe how they handle challenges like local minima or finding the shortest path.</p>
        </div>
      </div>
      
      <!-- Navigation Buttons -->
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
    font-family: Arial, sans-serif;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 20px;
    color: #2c3e50;
  }
  
  .intro-text {
    text-align: center;
    font-size: 1.1rem;
    margin-bottom: 30px;
    color: #555;
  }
  
  .problems-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-top: 30px;
    margin-bottom: 50px;
  }
  
  .problem-card {
    background-color: #f8f9fa;
    border-radius: 10px;
    padding: 25px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
  }
  
  .problem-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
  
  .problem-card h2 {
    color: #3498db;
    margin-bottom: 15px;
  }
  
  .view-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 15px;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  
  .view-btn:hover {
    background-color: #45a049;
  }
  
  /* Explanations Section */
  .explanations-section {
    margin-top: 40px;
    background-color: #f8f9fa;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  
  .explanations-section h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #2c3e50;
  }
  
  .explanation-card {
    background-color: white;
    border-radius: 10px;
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .explanation-card h3 {
    color: #3498db;
    margin-bottom: 20px;
    border-bottom: 2px solid #ecf0f1;
    padding-bottom: 10px;
  }
  
  .explanation-content {
    display: flex;
    gap: 30px;
  }
  
  .explanation-text {
    flex: 3;
  }
  
  .explanation-image {
    flex: 2;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  h4 {
    margin-top: 20px;
    margin-bottom: 10px;
    color: #2c3e50;
  }
  
  ul, ol {
    padding-left: 25px;
    margin-bottom: 15px;
  }
  
  li {
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  p {
    line-height: 1.6;
    margin-bottom: 15px;
  }
  
  /* Maze Sample */
  .maze-sample {
    width: 200px;
    height: 200px;
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    gap: 4px;
  }
  
  .maze-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
  }
  
  .cell {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .cell.wall {
    background-color: #1f2937;
  }
  
  .cell.start {
    background-color: #3b82f6;
    color: white;
  }
  
  .cell.goal {
    background-color: #ef4444;
    color: white;
  }
  
  .cell.path {
    background-color: #10b981;
  }
  
  /* Pots Sample */
  .pots-sample {
    display: flex;
    justify-content: center;
    gap: 30px;
  }
  
  .sample-pot {
    position: relative;
    border: 3px solid #2c3e50;
    border-top: none;
    border-radius: 0 0 20px 20px;
    overflow: hidden;
    margin-bottom: 10px;
  }
  
  .large-pot {
    width: 80px;
    height: 160px;
  }
  
  .small-pot {
    width: 60px;
    height: 120px;
  }
  
  .water {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #3498db;
  }
  
  .pot-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
    z-index: 1;
  }
  
  .pot-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  /* Comparison Table */
  .comparison-section {
    margin: 40px 0;
  }
  
  .comparison-section h3 {
    color: #3498db;
    margin-bottom: 20px;
  }
  
  .comparison-table {
    overflow-x: auto;
  }
  
  .comparison-table table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  }
  
  .comparison-table th, .comparison-table td {
    border: 1px solid #e2e8f0;
    padding: 12px 15px;
    text-align: left;
  }
  
  .comparison-table th {
    background-color: #f1f5f9;
    font-weight: bold;
  }
  
  .comparison-table tr:nth-child(even) {
    background-color: #f8fafc;
  }
  
  /* Instructions */
  .instructions-section {
    background-color: #e3f2fd;
    border-radius: 8px;
    padding: 20px;
    margin-top: 30px;
  }
  
  .instructions-section h3 {
    color: #2196f3;
    margin-bottom: 15px;
  }
  
  /* Responsive Design */
  @media (max-width: 900px) {
    .explanation-content {
      flex-direction: column;
    }
    
    .explanation-image {
      margin-top: 20px;
    }
    
    .cell {
      width: 35px;
      height: 35px;
      font-size: 16px;
    }
  }
  </style>
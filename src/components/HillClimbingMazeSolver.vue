// HillClimbingMazeSolver.vue
<template>
  <div class="hill-climbing-container">
    <h1>Hill Climbing Maze Solver (Vue.js)</h1>
    
    <!-- Main content with maze and explanations side by side -->
    <div class="main-content">
      <!-- Left side: Maze and controls -->
      <div class="maze-section">
        <h2>Maze Visualization</h2>
        
        <!-- Controls -->
        <div class="controls">
          <button 
            class="play-btn" 
            @click="toggleRunning" 
            :disabled="isComplete"
          >
            <i :class="isRunning ? 'fas fa-pause' : 'fas fa-play'"></i>
            {{ isRunning ? 'Pause' : 'Play' }}
          </button>
          
          <button 
            class="step-btn" 
            @click="performStep" 
            :disabled="isRunning || isComplete"
          >
            <i class="fas fa-step-forward"></i>
            Step
          </button>
          
          <button 
            class="solve-btn" 
            @click="solveInstantly" 
            :disabled="isComplete"
          >
            <i class="fas fa-bolt"></i>
            Complete
          </button>
          
          <button 
            class="reset-btn" 
            @click="resetAlgorithm"
          >
            <i class="fas fa-undo"></i>
            Reset
          </button>
        </div>
        
        <!-- Speed control -->
        <div class="speed-control">
          <label for="speed">Animation Speed:</label>
          <div>
            <input 
              id="speed" 
              type="range" 
              min="50" 
              max="1000" 
              step="50" 
              v-model.number="speed" 
              class="speed-slider"
            >
          </div>
          <div class="speed-labels">
            <span>Fast</span>
            <span>Slow</span>
          </div>
        </div>
        
        <!-- Maze grid -->
        <div class="maze-grid">
          <div 
            v-for="(row, y) in maze" 
            :key="'row-' + y" 
            class="maze-row"
          >
            <div 
              v-for="(cell, x) in row" 
              :key="`${x}-${y}`"
              class="cell"
              :class="getCellClass(x, y)"
            >
              {{ getCellText(x, y) }}
              <span v-if="shouldShowHeuristic(x, y)" class="heuristic-value">
                {{ getHeuristicValue(x, y) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Legend -->
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color start"></div>
            <span>Start (★)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color goal"></div>
            <span>Goal (⛳)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color wall"></div>
            <span>Obstacle</span>
          </div>
          <div class="legend-item">
            <div class="legend-color visited"></div>
            <span>Visited</span>
          </div>
          <div class="legend-item">
            <div class="legend-color path"></div>
            <span>Path Taken</span>
          </div>
          <div class="legend-item">
            <div class="legend-color current"></div>
            <span>Current Position</span>
          </div>
        </div>
      </div>
      
      <!-- Right side: Current state and explanations -->
      <div class="explanation-section">
        <h2>Algorithm State</h2>
        
        <!-- Current Step Explanation -->
        <div class="current-step-explanation">
          <h3>Current Algorithm Step</h3>
          <p>{{ getCurrentStepExplanation() }}</p>
        </div>
        
        <!-- Stats -->
        <div class="stats">
          <h3>Statistics</h3>
          <p>Steps taken: <strong>{{ steps }}</strong></p>
          <p>Cells visited: <strong>{{ visited.length }}</strong></p>
          <p>Random restarts: <strong>{{ restarts }}</strong></p>
          <p v-if="isComplete" class="success-message">
            <i class="fas fa-check-circle"></i> Goal reached!
          </p>
          <p v-if="isStuck" class="stuck-message">
            <i class="fas fa-exclamation-triangle"></i> Stuck in local minimum! 
            (Will do a random restart after {{ 3 - stuckCount }} more attempts)
          </p>
        </div>
        
        <!-- Current position details -->
        <div class="current-details">
          <h3>Current Position ({{ currentPosition.x }}, {{ currentPosition.y }})</h3>
          <p><strong>Heuristic value:</strong> {{ currentPositionHeuristic }} (Manhattan distance to goal)</p>
          
          <div v-if="neighbors.length > 0" class="neighbors-section">
            <h4>Neighbor Analysis:</h4>
            <ul class="neighbor-list">
              <li v-for="(n, index) in neighbors" :key="index" class="neighbor-item"
                  :class="{'best-neighbor': n.isBest, 'visited-neighbor': n.isVisited}">
                Position ({{ n.position.x }}, {{ n.position.y }}): {{ n.value }}
                <span v-if="n.isBest" class="best-flag"> (Best choice)</span>
                <span v-if="n.isVisited" class="visited-flag"> (Already Visited)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Hill Climbing Explanation -->
    <div class="algorithm-explanation">
      <h2>Hill Climbing Algorithm Explanation</h2>
      
      <div class="explanation-grid">
        <div class="explanation-column">
          <h3>Problem Formulation</h3>
          <ul>
            <li><strong>State:</strong> Position (x,y) in the 2D grid</li>
            <li><strong>Initial state:</strong> Starting position (★)</li>
            <li><strong>Goal state:</strong> Finishing position (⛳)</li>
            <li><strong>Actions:</strong> Move in four directions (up, down, left, right)</li>
            <li><strong>Transition model:</strong> Moving from current cell to an adjacent cell if it's not an obstacle</li>
            <li><strong>Heuristic function:</strong> Manhattan distance to goal: |x₁-x₂| + |y₁-y₂|</li>
          </ul>
        </div>
        
        <div class="explanation-column">
          <h3>Hill Climbing Characteristics</h3>
          <ul>
            <li><strong>Local search algorithm:</strong> Only maintains current state, not paths to it</li>
            <li><strong>Greedy approach:</strong> Always moves to the neighbor with the best heuristic value</li>
            <li><strong>Local optima problem:</strong> Can get stuck when no neighbor improves the heuristic</li>
            <li><strong>Random restarts:</strong> Jump to a random position to escape local minima</li>
            <li><strong>Memory efficient:</strong> O(1) space complexity (vs. O(b^d) for BFS)</li>
            <li><strong>Not optimal:</strong> Does not guarantee the shortest path</li>
          </ul>
        </div>
      </div>
      
      <h3>Algorithm Steps</h3>
      <ol class="algorithm-steps">
        <li>Start at the initial position</li>
        <li>Calculate the heuristic value (Manhattan distance to goal)</li>
        <li>Generate all valid neighboring positions (not walls, within bounds)</li>
        <li>Calculate the heuristic value for each neighbor</li>
        <li>If there's a neighbor with a better (lower) heuristic value than the current position:
          <ul>
            <li>Move to that neighbor</li>
          </ul>
        </li>
        <li>If no neighbor has a better heuristic, or all better neighbors are already visited:
          <ul>
            <li>Increment stuck counter</li>
            <li>After being stuck for 3 attempts, perform a random restart</li>
          </ul>
        </li>
        <li>Repeat until reaching the goal or maximum steps</li>
      </ol>
      
      <h3>Local Minima and Random Restarts</h3>
      <p>
        A <strong>local minimum</strong> occurs when the current position has a lower heuristic value than all 
        its neighbors, but is not the goal state. In a maze, this can happen when walls create "traps" that
        temporarily increase the distance to the goal, even though moving that way is ultimately necessary.
      </p>
      <p>
        <strong>Random restarts</strong> are a simple but effective technique to escape local minima. When the
        algorithm detects it's stuck (no better unvisited neighbors), it jumps to a random valid position in
        the maze and continues searching from there. This helps explore different regions of the search space.
      </p>
      
      <h3>Heuristic Function: Manhattan Distance</h3>
      <p>
        The <strong>Manhattan distance</strong> (also known as city block distance) is calculated as:
      </p>
      <div class="formula">
        h(x,y) = |x - x<sub>goal</sub>| + |y - y<sub>goal</sub>|
      </div>
      <p>
        It represents the minimum number of horizontal and vertical moves needed to reach the goal in an
        ideal scenario with no obstacles. This makes it a good heuristic for grid-based pathfinding.
      </p>
      
      <h3>Comparison with Other Search Algorithms</h3>
      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Hill Climbing</th>
              <th>Breadth-First Search (BFS)</th>
              <th>A* Search</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Memory Usage</td>
              <td>Low (O(1))</td>
              <td>High (O(b<sup>d</sup>))</td>
              <td>High (O(b<sup>d</sup>))</td>
            </tr>
            <tr>
              <td>Guarantees Optimal Solution</td>
              <td>No</td>
              <td>Yes (for uniform costs)</td>
              <td>Yes (with admissible heuristic)</td>
            </tr>
            <tr>
              <td>Completeness</td>
              <td>No (without restarts)</td>
              <td>Yes</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Use of Heuristic</td>
              <td>Yes</td>
              <td>No</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Time Efficiency</td>
              <td>Often fast, but variable</td>
              <td>Slow for large problems</td>
              <td>Faster than BFS</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HillClimbingMazeSolver',
  data() {
    return {
      // Initial maze configuration
      initialMaze: [
        [2, 1, 0, 0],
        [0, 1, 0, 1],
        [0, 0, 0, 0],
        [0, 1, 1, 3]
      ],
      // Current maze state
      maze: [],
      // Start and goal positions
      startPos: { x: 0, y: 0 },
      goalPos: { x: 3, y: 3 },
      // Algorithm state
      currentPosition: { x: 0, y: 0 },
      visited: [],
      path: [],
      neighbors: [],
      steps: 0,
      stuckCount: 0,
      restarts: 0,
      isStuck: false,
      // Animation control
      isRunning: false,
      isComplete: false,
      speed: 300,
      animationTimer: null,
      // Step explanations based on state
      stepExplanations: {
        initial: "Starting at the initial position (0,0). The Manhattan distance to the goal is 6.",
        evaluating: "Evaluating the current position and its neighbors to find the best next move.",
        moving: "Moving to the neighbor with the lowest heuristic value (closest to the goal).",
        stuck: "Stuck in a local minimum. No unvisited neighbor has a better heuristic value.",
        restart: "Performing a random restart to escape the local minimum.",
        goal: "Goal reached! We've successfully found a path to the destination."
      }
    }
  },
  computed: {
    // Heuristic value of current position
    currentPositionHeuristic() {
      return this.manhattanDistance(
        this.currentPosition.x, 
        this.currentPosition.y, 
        this.goalPos.x, 
        this.goalPos.y
      )
    }
  },
  watch: {
    // Watch for running state to start/stop animation
    isRunning(val) {
      if (val) {
        this.startAnimation()
      } else {
        this.stopAnimation()
      }
    }
  },
  mounted() {
    // Initialize algorithm when component is mounted
    this.resetAlgorithm()
  },
  methods: {
    // Manhattan distance heuristic
    manhattanDistance(x1, y1, x2, y2) {
      return Math.abs(x1 - x2) + Math.abs(y1 - y2)
    },
    
    // Reset the algorithm to its initial state
    resetAlgorithm() {
      // Stop any running animation
      this.stopAnimation()
      
      // Deep copy the initial maze
      this.maze = JSON.parse(JSON.stringify(this.initialMaze))
      
      // Find start position if not set
      if (!this.startPos.x && !this.startPos.y) {
        for (let y = 0; y < this.maze.length; y++) {
          for (let x = 0; x < this.maze[y].length; x++) {
            if (this.maze[y][x] === 2) {
              this.startPos = { x, y }
              break
            }
          }
        }
      }
      
      // Find goal position if not set
      if (!this.goalPos.x && !this.goalPos.y) {
        for (let y = 0; y < this.maze.length; y++) {
          for (let x = 0; x < this.maze[y].length; x++) {
            if (this.maze[y][x] === 3) {
              this.goalPos = { x, y }
              break
            }
          }
        }
      }
      
      // Reset algorithm state
      this.currentPosition = { ...this.startPos }
      this.visited = [{ ...this.startPos }]
      this.path = [{ ...this.startPos }]
      this.steps = 0
      this.stuckCount = 0
      this.restarts = 0
      this.isStuck = false
      
      // Reset control state
      this.isRunning = false
      this.isComplete = false
      
      // Update neighbors
      this.updateNeighbors()
    },
    
    // Get all valid neighbors for the current position
    getNeighbors(position) {
      const directions = [
        { x: 0, y: -1 },  // up
        { x: 1, y: 0 },   // right
        { x: 0, y: 1 },   // down
        { x: -1, y: 0 },  // left
      ]
      
      const neighbors = []
      
      for (const dir of directions) {
        const newX = position.x + dir.x
        const newY = position.y + dir.y
        
        // Check if within bounds
        if (newX < 0 || newY < 0 || newY >= this.maze.length || newX >= this.maze[0].length) {
          continue
        }
        
        // Check if obstacle
        if (this.maze[newY][newX] === 1) {
          continue
        }
        
        neighbors.push({ x: newX, y: newY })
      }
      
      return neighbors
    },
    
    // Update the neighbors list with heuristic values
    updateNeighbors() {
      const neighborPositions = this.getNeighbors(this.currentPosition)
      const currentValue = this.manhattanDistance(
        this.currentPosition.x, 
        this.currentPosition.y, 
        this.goalPos.x, 
        this.goalPos.y
      )
      
      // Calculate heuristic values for neighbors
      const neighborValues = neighborPositions.map(neighbor => {
        const value = this.manhattanDistance(
          neighbor.x, 
          neighbor.y, 
          this.goalPos.x, 
          this.goalPos.y
        )
        
        return {
          position: neighbor,
          value,
          isVisited: this.visited.some(v => v.x === neighbor.x && v.y === neighbor.y),
          isBest: false
        }
      })
      
      // Sort by value (ascending - lower is better)
      neighborValues.sort((a, b) => a.value - b.value)
      
      // Mark the best unvisited neighbor
      for (const neighbor of neighborValues) {
        if (neighbor.value < currentValue && !neighbor.isVisited) {
          neighbor.isBest = true
          break
        }
      }
      
      this.neighbors = neighborValues
    },
    
    // Random restart to escape local minima
    randomRestart() {
      // Find all free cells in the maze
      const freeCells = []
      
      for (let y = 0; y < this.maze.length; y++) {
        for (let x = 0; x < this.maze[y].length; x++) {
          if (this.maze[y][x] === 0 || this.maze[y][x] === 2) {
            freeCells.push({ x, y })
          }
        }
      }
      
      // Pick a random free cell
      const randomCell = freeCells[Math.floor(Math.random() * freeCells.length)]
      
      // Update state
      this.currentPosition = { ...randomCell }
      this.path = [...this.path, { ...randomCell }]
      this.visited = [...this.visited, { ...randomCell }]
      this.stuckCount = 0
      this.restarts++
      this.isStuck = false
      
      // Update neighbors
      this.updateNeighbors()
    },
    
    // Perform one step of the hill climbing algorithm
    performStep() {
      // Check if we've reached the goal
      if (this.currentPosition.x === this.goalPos.x && 
          this.currentPosition.y === this.goalPos.y) {
        this.isRunning = false
        this.isComplete = true
        return
      }
      
      // Get updated neighbor information
      this.updateNeighbors()
      
      // Current position's value
      const currentValue = this.manhattanDistance(
        this.currentPosition.x, 
        this.currentPosition.y, 
        this.goalPos.x, 
        this.goalPos.y
      )
      
      // Check if we're stuck in a local minimum
      this.isStuck = true
      let nextPosition = null
      
      // Try to find a better neighbor first
      for (const neighbor of this.neighbors) {
        if (neighbor.value < currentValue && !neighbor.isVisited) {
          nextPosition = { ...neighbor.position }
          this.isStuck = false
          break
        }
      }
      
      // If still stuck, try any unvisited neighbor
      if (this.isStuck) {
        const unvisitedNeighbors = this.neighbors.filter(n => !n.isVisited)
        if (unvisitedNeighbors.length > 0) {
          nextPosition = { ...unvisitedNeighbors[0].position }
          this.isStuck = false
        }
      }
      
      if (this.isStuck) {
        // Increment stuck counter
        this.stuckCount++
        
        // If stuck too many times, do a random restart
        if (this.stuckCount >= 3) {
          this.randomRestart()
        }
      } else {
        // Move to the next position
        this.currentPosition = { ...nextPosition }
        this.path = [...this.path, { ...nextPosition }]
        this.visited = [...this.visited, { ...nextPosition }]
        this.stuckCount = 0
        
        // Update neighbors
        this.updateNeighbors()
      }
      
      // Increment step counter
      this.steps++
    },
    
    // Get an explanation of the current algorithm step
    getCurrentStepExplanation() {
      if (this.isComplete) {
        return this.stepExplanations.goal;
      }
      
      if (this.stuckCount >= 3) {
        return this.stepExplanations.restart + 
          ` Jumping to a new position (${this.currentPosition.x}, ${this.currentPosition.y}).`;
      }
      
      if (this.isStuck) {
        return this.stepExplanations.stuck + 
          ` Current stuck count: ${this.stuckCount}/3 before random restart.`;
      }
      
      if (this.steps === 0) {
        return this.stepExplanations.initial;
      }
      
      // Find the best neighbor
      const bestNeighbor = this.neighbors.find(n => n.isBest);
      
      if (bestNeighbor) {
        return this.stepExplanations.moving + 
          ` Moving to (${bestNeighbor.position.x}, ${bestNeighbor.position.y}) with heuristic value ${bestNeighbor.value}.`;
      }
      
      return this.stepExplanations.evaluating + 
        ` Current heuristic: ${this.currentPositionHeuristic}.`;
    },
    
    // Start animation loop
    startAnimation() {
      this.animationTimer = setInterval(() => {
        this.performStep()
        
        if (this.isComplete) {
          this.stopAnimation()
        }
      }, this.speed)
    },
    
    // Stop animation
    stopAnimation() {
      if (this.animationTimer) {
        clearInterval(this.animationTimer)
        this.animationTimer = null
      }
    },
    
    // Toggle running state
    toggleRunning() {
      this.isRunning = !this.isRunning
    },
    
    // Find solution instantly
    solveInstantly() {
      this.resetAlgorithm()
      
      // Maximum steps to prevent infinite loops
      const MAX_STEPS = 100
      
      // Keep stepping until complete or max steps reached
      for (let i = 0; i < MAX_STEPS; i++) {
        this.performStep()
        
        if (this.isComplete) {
          break
        }
      }
    },
    
    // Get CSS class for a cell
    getCellClass(x, y) {
      // Current position
      if (this.currentPosition.x === x && this.currentPosition.y === y) {
        return 'current'
      }
      
      // Path taken
      if (this.path.some(pos => pos.x === x && pos.y === y)) {
        return 'path'
      }
      
      // Visited cells
      if (this.visited.some(pos => pos.x === x && pos.y === y)) {
        return 'visited'
      }
      
      // Default cell styles
      switch (this.maze[y][x]) {
        case 0: return ''
        case 1: return 'wall'
        case 2: return 'start'
        case 3: return 'goal'
        default: return ''
      }
    },
    
    // Get text to display in a cell
    getCellText(x, y) {
      if (this.maze[y][x] === 2) return '★'
      if (this.maze[y][x] === 3) return '⛳'
      return ''
    },
    
    // Check if we should show heuristic value for a cell
    shouldShowHeuristic(x, y) {
      // Show for current position
      if (this.currentPosition.x === x && this.currentPosition.y === y) {
        return true
      }
      
      // Show for neighbors of current position
      return this.neighbors.some(n => n.position.x === x && n.position.y === y)
    },
    
    // Get heuristic value for a cell
    getHeuristicValue(x, y) {
      return this.manhattanDistance(x, y, this.goalPos.x, this.goalPos.y)
    }
  }
}
</script>

<style scoped>
.hill-climbing-container {
  max-width: 1000px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
}

h2 {
  margin-top: 20px;
  margin-bottom: 15px;
  color: #3498db;
}

h3 {
  margin-top: 15px;
  margin-bottom: 10px;
  color: #2980b9;
}

h4 {
  margin-top: 12px;
  margin-bottom: 8px;
  color: #2c3e50;
}

/* Main content layout with maze and explanations side by side */
.main-content {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.maze-section {
  flex: 1;
  min-width: 300px;
}

.explanation-section {
  flex: 1;
  min-width: 300px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  transition: background-color 0.2s;
}

button:hover {
  opacity: 0.9;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-btn {
  background-color: #3b82f6;
  color: white;
}

.step-btn {
  background-color: #10b981;
  color: white;
}

.solve-btn {
  background-color: #f59e0b;
  color: white;
}

.reset-btn {
  background-color: #ef4444;
  color: white;
}

.speed-control {
  margin-bottom: 20px;
  text-align: center;
}

.speed-slider {
  width: 100%;
  max-width: 300px;
}

.speed-labels {
  display: flex;
  justify-content: space-between;
  max-width: 300px;
  margin: 0 auto;
}

.maze-grid {
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  gap: 4px;
  margin: 20px 0;
}

.maze-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.cell {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  position: relative;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.cell.start {
  background-color: #3b82f6;
  color: white;
}

.cell.goal {
  background-color: #ef4444;
  color: white;
}

.cell.wall {
  background-color: #1f2937;
}

.cell.current {
  animation: pulse 1.5s infinite;
  background-color: #60a5fa;
  color: white;
}

.cell.visited {
  background-color: #fcd34d;
}

.cell.path {
  background-color: #10b981;
}

.heuristic-value {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
  font-weight: normal;
  color: #333;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 1px 3px;
  border-radius: 2px;
}

.legend {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 20px 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-color.start {
  background-color: #3b82f6;
}

.legend-color.goal {
  background-color: #ef4444;
}

.legend-color.wall {
  background-color: #1f2937;
}

.legend-color.visited {
  background-color: #fcd34d;
}

.legend-color.path {
  background-color: #10b981;
}

.legend-color.current {
  background-color: #60a5fa;
}

.current-step-explanation {
  padding: 15px;
  background-color: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
  margin-bottom: 20px;
}

.stats, .current-details {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 8px;
  margin-bottom: 20px;
}

.success-message {
  color: #10b981;
  font-weight: bold;
}

.stuck-message {
  color: #ef4444;
}

.neighbor-list {
  list-style-type: none;
  padding-left: 0;
}

.neighbor-item {
  padding: 8px;
  margin-bottom: 6px;
  border-radius: 4px;
  background-color: #f1f5f9;
}

.best-neighbor {
  background-color: #d1fae5;
  border-left: 3px solid #10b981;
}

.visited-neighbor {
  background-color: #fee2e2;
  border-left: 3px solid #ef4444;
}

.best-flag {
  color: #10b981;
  font-weight: bold;
}

.visited-flag {
  color: #ef4444;
}

.algorithm-explanation {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  margin-top: 30px;
}

.explanation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.explanation-column {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.explanation-column ul {
  padding-left: 20px;
}

.explanation-column li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.algorithm-steps {
  background-color: #fff;
  padding: 15px 15px 15px 40px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  line-height: 1.6;
}

.algorithm-steps li {
  margin-bottom: 10px;
}

.algorithm-steps ul {
  padding-left: 20px;
  margin-top: 8px;
}

.algorithm-explanation p {
  line-height: 1.6;
  margin-bottom: 15px;
}

.formula {
  background-color: #e0f2fe;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  margin: 15px 0;
}

.comparison-table {
  margin: 20px 0;
  overflow-x: auto;
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th, .comparison-table td {
  border: 1px solid #cbd5e1;
  padding: 10px;
  text-align: left;
}

.comparison-table th {
  background-color: #f1f5f9;
  font-weight: bold;
}

.comparison-table tr:nth-child(even) {
  background-color: #f8fafc;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

/* Responsive design */
@media (max-width: 900px) {
  .main-content, .explanation-grid {
    flex-direction: column;
    grid-template-columns: 1fr;
  }
}
</style>
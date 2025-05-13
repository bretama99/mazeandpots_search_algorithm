// HillClimbingMazeSolver.vue
<template>
  <div class="hill-climbing-container">
    <h1>Hill Climbing Maze Solver (Vue.js)</h1>
    
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
    
    <!-- Stats -->
    <div class="stats">
      <h2>Stats</h2>
      <p>Steps taken: {{ steps }}</p>
      <p>Cells visited: {{ visited.length }}</p>
      <p>Random restarts: {{ restarts }}</p>
      <p v-if="isComplete" class="success-message">
        Goal reached!
      </p>
      <p v-if="isStuck" class="stuck-message">
        Stuck in local minimum! (Will do a random restart after {{ 3 - stuckCount }} more attempts)
      </p>
    </div>
    
    <!-- Current position details -->
    <div class="current-details">
      <h2>Current Position ({{ currentPosition.x }}, {{ currentPosition.y }})</h2>
      <p>Heuristic value: {{ currentPositionHeuristic }} (Manhattan distance to goal)</p>
      
      <h3 v-if="neighbors.length > 0">Neighbor Heuristics:</h3>
      <ul v-if="neighbors.length > 0" class="neighbor-list">
        <li v-for="(n, index) in neighbors" :key="index" class="neighbor-item">
          Position ({{ n.position.x }}, {{ n.position.y }}): {{ n.value }}
          <span v-if="n.isBest" class="best-flag"> (Best)</span>
          <span v-if="n.isVisited" class="visited-flag"> (Already Visited)</span>
        </li>
      </ul>
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
      animationTimer: null
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
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
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
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
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
  font-size: 14px;
  color: #333;
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

.stats, .current-details {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 6px;
}

.success-message {
  color: #10b981;
  font-weight: bold;
}

.stuck-message {
  color: #ef4444;
}

.neighbor-list {
  list-style-type: disc;
  padding-left: 20px;
}

.best-flag {
  color: #10b981;
  font-weight: bold;
}

.visited-flag {
  color: #ef4444;
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
</style>
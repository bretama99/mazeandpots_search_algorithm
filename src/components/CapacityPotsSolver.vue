// CapacityPotsSolver.vue
<template>
  <div class="capacity-pots-container">
    <h1>Capacity Pots Problem Solver</h1>
    
    <!-- Visual representation of pots -->
    <div class="pots-display">
      <div class="pot-container">
        <div class="pot large-pot">
          <div 
            class="water" 
            :style="{ height: (pot5Level / 5) * 100 + '%' }"
          ></div>
          <div class="pot-label">
            {{ pot5Level }} / 5 L
          </div>
        </div>
        <div class="pot-capacity">5 Liter Pot</div>
      </div>
      
      <div class="pot-container">
        <div class="pot small-pot">
          <div 
            class="water" 
            :style="{ height: (pot3Level / 3) * 100 + '%' }"
          ></div>
          <div class="pot-label">
            {{ pot3Level }} / 3 L
          </div>
        </div>
        <div class="pot-capacity">3 Liter Pot</div>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="controls">
      <button 
        @click="startAnimation" 
        :disabled="isAnimating || isComplete" 
        class="start-btn"
      >
        <i class="fas fa-play"></i> Start Animation
      </button>
      
      <button 
        @click="nextStep" 
        :disabled="isAnimating || isComplete || currentStepIndex >= solution.length" 
        class="step-btn"
      >
        <i class="fas fa-step-forward"></i> Next Step
      </button>
      
      <button 
        @click="reset" 
        class="reset-btn"
      >
        <i class="fas fa-undo"></i> Reset
      </button>
    </div>
    
    <!-- Animation speed control -->
    <div class="speed-control">
      <label for="speed">Animation Speed:</label>
      <div>
        <input 
          id="speed" 
          type="range" 
          min="500" 
          max="2000" 
          step="100" 
          v-model.number="animationSpeed" 
          class="speed-slider"
        >
      </div>
      <div class="speed-labels">
        <span>Fast</span>
        <span>Slow</span>
      </div>
    </div>
    
    <!-- Solution steps -->
    <div class="solution-container">
      <h2>Solution:</h2>
      <div class="steps-container" ref="stepsContainer">
        <div 
          v-for="(step, index) in solution" 
          :key="index"
          class="step"
          :class="{ 'current-step': index === currentStepIndex }"
        >
          <div class="step-number">Step {{ index + 1 }}</div>
          <div class="step-action">{{ step.action }}</div>
          <div class="step-state">State: ({{ step.state[0] }}, {{ step.state[1] }})</div>
        </div>
      </div>
    </div>
    
    <!-- Solution explanation -->
    <div class="explanation">
      <h2>Problem Explanation:</h2>
      <p>In this problem, we have two pots with capacities of 5 liters and 3 liters, and an unlimited water supply. The goal is to measure exactly 4 liters of water.</p>
      <p>The problem is modeled as a search problem where:</p>
      <ul>
        <li>State: (x, y) representing water in 5L and 3L pots</li>
        <li>Initial state: (0, 0) - both pots empty</li>
        <li>Goal state: Any state with exactly 4L in either pot</li>
        <li>Actions: Fill a pot, empty a pot, or pour water from one pot to another</li>
      </ul>
      
      <h3>Algorithm Explanation:</h3>
      <p>We use Breadth-First Search (BFS) to find the shortest sequence of actions to reach the goal state. BFS guarantees the optimal solution for unit costs.</p>
      <p>The search space is limited to 24 possible states (6×4), which makes BFS efficient for this problem.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CapacityPotsSolver',
  data() {
    return {
      // Pot state
      pot5Level: 0,
      pot3Level: 0,
      
      // Solution steps
      solution: [],
      currentStepIndex: -1,
      
      // Animation control
      isAnimating: false,
      isComplete: false,
      animationTimer: null,
      animationSpeed: 1000,
    }
  },
  mounted() {
    // Solve the problem
    this.solvePotsProblem()
  },
  methods: {
    // Solve the problem using BFS
    solvePotsProblem() {
      const queue = []
      const visited = new Map()
      
      // Initial state with empty pots
      const initialState = [0, 0]
      queue.push(initialState)
      visited.set(initialState.toString(), { parent: null, action: "Start with empty pots" })
      
      // Define possible actions
      const actions = [
        { name: "Fill 5L pot", apply: ([, y]) => [5, y] },
        { name: "Fill 3L pot", apply: ([x,]) => [x, 3] },
        { name: "Empty 5L pot", apply: ([,y]) => [0, y] },
        { name: "Empty 3L pot", apply: ([x,]) => [x, 0] },
        { name: "Pour from 5L to 3L", apply: ([x, y]) => {
          const amount = Math.min(x, 3-y)
          return [x-amount, y+amount]
        }},
        { name: "Pour from 3L to 5L", apply: ([x, y]) => {
          const amount = Math.min(y, 5-x)
          return [x+amount, y-amount]
        }}
      ]
      
      // BFS loop
      while (queue.length > 0) {
        const current = queue.shift()
        
        // Check if goal reached (exactly 4L in either pot)
        if (current[0] === 4 || current[1] === 4) {
          // Reconstruct path
          this.solution = this.reconstructPath(current, visited)
          break
        }
        
        // Try all possible actions
        for (const action of actions) {
          const next = action.apply(current)
          const nextKey = next.toString()
          
          // Skip if already visited
          if (!visited.has(nextKey)) {
            queue.push(next)
            visited.set(nextKey, { 
              parent: current, 
              action: action.name 
            })
          }
        }
      }
    },
    
    // Reconstruct the solution path
    reconstructPath(goalState, visited) {
      const path = []
      let current = goalState
      
      while (current !== null) {
        const info = visited.get(current.toString())
        path.unshift({
          state: current,
          action: info.action
        })
        current = info.parent
      }
      
      return path
    },
    
    // Start automated animation
    startAnimation() {
      if (this.isComplete) return
      
      this.isAnimating = true
      
      // Start from the beginning if needed
      if (this.currentStepIndex < 0) {
        this.currentStepIndex = 0
        this.updatePotLevels()
      }
      
      this.animationTimer = setInterval(() => {
        // Move to next step
        this.currentStepIndex++
        this.updatePotLevels()
        
        // Scroll the step into view
        this.$nextTick(() => {
          const stepElements = this.$refs.stepsContainer.querySelectorAll('.step')
          if (stepElements[this.currentStepIndex]) {
            stepElements[this.currentStepIndex].scrollIntoView({
              behavior: 'smooth',
              block: 'nearest'
            })
          }
        })
        
        // Stop when complete
        if (this.currentStepIndex >= this.solution.length - 1) {
          clearInterval(this.animationTimer)
          this.isAnimating = false
          this.isComplete = true
        }
      }, this.animationSpeed)
    },
    
    // Move to next step manually
    nextStep() {
      if (this.isComplete || this.currentStepIndex >= this.solution.length - 1) return
      
      this.currentStepIndex++
      this.updatePotLevels()
      
      // Scroll the step into view
      this.$nextTick(() => {
        const stepElements = this.$refs.stepsContainer.querySelectorAll('.step')
        if (stepElements[this.currentStepIndex]) {
          stepElements[this.currentStepIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          })
        }
      })
      
      // Check if complete
      if (this.currentStepIndex >= this.solution.length - 1) {
        this.isComplete = true
      }
    },
    
    // Update pot water levels based on current step
    updatePotLevels() {
      if (this.currentStepIndex < 0 || this.currentStepIndex >= this.solution.length) return
      
      const currentState = this.solution[this.currentStepIndex].state
      this.pot5Level = currentState[0]
      this.pot3Level = currentState[1]
    },
    
    // Reset the animation
    reset() {
      // Stop any ongoing animation
      if (this.animationTimer) {
        clearInterval(this.animationTimer)
        this.animationTimer = null
      }
      
      // Reset state
      this.currentStepIndex = -1
      this.pot5Level = 0
      this.pot3Level = 0
      this.isAnimating = false
      this.isComplete = false
    }
  }
}
</script>

<style scoped>
.capacity-pots-container {
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

h2 {
  margin-top: 20px;
  margin-bottom: 10px;
}

.pots-display {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin: 30px 0;
}

.pot-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pot {
  position: relative;
  border: 3px solid #2c3e50;
  border-top: none;
  border-radius: 0 0 20px 20px;
  overflow: hidden;
  margin-bottom: 10px;
}

.large-pot {
  width: 100px;
  height: 200px;
}

.small-pot {
  width: 80px;
  height: 160px;
}

.water {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #3498db;
  transition: height 0.5s ease;
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

.pot-capacity {
  font-weight: bold;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.start-btn {
  background-color: #27ae60;
  color: white;
}

.step-btn {
  background-color: #3498db;
  color: white;
}

.reset-btn {
  background-color: #e74c3c;
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

.solution-container {
  margin: 20px 0;
}

.steps-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
}

.step {
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  background-color: #f8f9fa;
}

.current-step {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.step-number {
  font-weight: bold;
  margin-bottom: 5px;
}

.step-action {
  margin-bottom: 5px;
}

.explanation {
  margin-top: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #4caf50;
}

.explanation ul {
  padding-left: 20px;
}

.explanation li {
  margin-bottom: 5px;
}
</style>
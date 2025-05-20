<template>
  <div class="wumpus-grid">
    <div class="grid-actions">
      <div class="grid-status">
        <p>Iteration: {{ iteration }}</p>
        <p>Robot Pos: ({{ robotPosition.x }}, {{ robotPosition.y }})</p>
      </div>
      
      <div class="action-buttons">
        <button @click="$emit('find-safe-moves')" :disabled="gameOver" class="action-btn find-btn">
          <i class="fas fa-search"></i> Find Safe Moves
        </button>
        <button @click="$emit('make-best-move')" :disabled="gameOver || autoMode" class="action-btn move-btn">
          <i class="fas fa-star"></i> Make Best Move
        </button>
        <button v-if="hasGold(robotPosition.x, robotPosition.y) && !gameOver" @click="grabGold" class="action-btn gold-btn">
          <i class="fas fa-hand-rock"></i> Grab Gold
        </button>
      </div>
      
      <div class="auto-buttons">
        <button v-if="!autoMode" @click="$emit('start-auto-mode')" :disabled="gameOver" class="action-btn auto-btn">
          <i class="fas fa-play"></i> Auto Explore
        </button>
        <button v-else @click="$emit('stop-auto-mode')" class="action-btn stop-btn">
          <i class="fas fa-stop"></i> Stop Auto
        </button>
      </div>
      
      <div class="util-buttons">
        <button @click="$emit('reveal-world')" :disabled="isRevealed" class="action-btn reveal-btn">
          <i class="fas fa-eye"></i> Reveal World
        </button>
        <button @click="$emit('reset-game')" class="action-btn reset-btn">
          <i class="fas fa-redo"></i> Reset Game
        </button>
      </div>
    </div>
    
    <div class="grid-container">
      <div class="grid">
        <div 
          v-for="y in gridSize" 
          :key="'row-' + y" 
          class="row"
        >
          <div 
            v-for="x in gridSize" 
            :key="'cell-' + x + '-' + y" 
            :class="getCellClasses(x, gridSize - y + 1)"
            class="cell"
          >
            <div class="cell-content">
              <!-- Coordinate Label -->
              <div class="coordinate">{{ x }},{{ gridSize - y + 1 }}</div>
              
              <!-- Safety Probability -->
              <div v-if="isShowingProbabilities && !isRevealed" class="probability">
                <template v-if="hasVisited(x, gridSize - y + 1)">
                  <span class="prob-safe">Safe</span>
                </template>
                <template v-else>
                  <span :class="getProbClass(x, gridSize - y + 1)">
                    {{ formatProb(getSafeProb(x, gridSize - y + 1)) }}
                  </span>
                </template>
              </div>
              
              <!-- Wumpus Probability -->
              <div v-if="isShowingProbabilities && !isRevealed" class="probability wumpus-prob">
                <template v-if="getWumpusProb(x, gridSize - y + 1) > 0">
                  W: {{ formatProb(getWumpusProb(x, gridSize - y + 1)) }}
                </template>
              </div>
              
              <!-- Pit Probability -->
              <div v-if="isShowingProbabilities && !isRevealed" class="probability pit-prob">
                <template v-if="getPitProb(x, gridSize - y + 1) > 0">
                  P: {{ formatProb(getPitProb(x, gridSize - y + 1)) }}
                </template>
              </div>
              
              <!-- Robot & Dead Robots -->
              <div v-if="isRobotAt(x, gridSize - y + 1)" class="robot">
                <i class="fas fa-robot"></i>
              </div>
              
              <div v-if="hasDeadRobotAt(x, gridSize - y + 1)" class="dead-robot">
                <i class="fas fa-skull-crossbones"></i>
              </div>
              
              <!-- Wumpus, Pits, and Gold (if revealed) -->
              <div v-if="isRevealed">
                <div v-if="isWumpusAt(x, gridSize - y + 1)" class="wumpus">
                  <i class="fas fa-dragon"></i>
                </div>
                
                <div v-if="isPitAt(x, gridSize - y + 1)" class="pit">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                
                <div v-if="isGoldAt(x, gridSize - y + 1)" class="gold">
                  <i class="fas fa-coins"></i>
                </div>
              </div>
              
              <!-- Percepts (visible when visited) -->
              <div v-if="hasVisited(x, gridSize - y + 1) || isRevealed" class="percepts">
                <span v-if="hasBreezeAt(x, gridSize - y + 1)" class="breeze">B</span>
                <span v-if="hasStenchAt(x, gridSize - y + 1)" class="stench">S</span>
                <span v-if="isGoldAt(x, gridSize - y + 1)" class="glitter">G</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="legend">
      <div class="legend-item"><i class="fas fa-robot"></i> Robot</div>
      <div class="legend-item"><i class="fas fa-skull-crossbones"></i> Dead Robot</div>
      <div v-if="isRevealed" class="legend-item"><i class="fas fa-dragon"></i> Wumpus</div>
      <div v-if="isRevealed" class="legend-item"><i class="fas fa-exclamation-triangle"></i> Pit</div>
      <div v-if="isRevealed" class="legend-item"><i class="fas fa-coins"></i> Gold</div>
      <div class="legend-item"><span class="breeze-legend">B</span> Breeze</div>
      <div class="legend-item"><span class="stench-legend">S</span> Stench</div>
      <div class="legend-item"><span class="glitter-legend">G</span> Glitter</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WumpusGrid',
  props: {
    iteration: Number,
    robotPosition: Object,
    deadRobots: Array,
    visited: Object, // Set
    isRevealed: Boolean,
    isShowingProbabilities: Boolean,
    gameOver: Boolean,
    world: Object,
    hasGold: {
      type: Function,
      default: () => false
    },
    probabilities: Object,
    autoMode: Boolean
  },
  emits: [
    'find-safe-moves', 
    'make-best-move', 
    'start-auto-mode', 
    'stop-auto-mode', 
    'reveal-world', 
    'reset-game',
    'grab-gold'
  ],
  data() {
    return {
      gridSize: 4
    };
  },
  methods: {
    // Cell styling
    getCellClasses(x, y) {
      const classes = [];
      
      if (this.hasVisited(x, y)) {
        classes.push('visited');
      }
      
      if (this.isRobotAt(x, y)) {
        classes.push('robot-cell');
      }
      
      if (this.hasDeadRobotAt(x, y)) {
        classes.push('dead-robot-cell');
      }
      
      // Revealed state classes
      if (this.isRevealed) {
        if (this.isWumpusAt(x, y) || this.isPitAt(x, y)) {
          classes.push('danger-cell');
        }
        
        if (this.isGoldAt(x, y)) {
          classes.push('gold-cell');
        }
      }
      
      return classes;
    },
    
    // Probability display formatting
    formatProb(prob) {
      return (prob * 100).toFixed(0) + '%';
    },
    
    getProbClass(x, y) {
      const prob = this.getSafeProb(x, y);
      if (prob >= 0.8) return 'prob-high';
      if (prob >= 0.5) return 'prob-medium';
      return 'prob-low';
    },
    
    // Probability getters
    getSafeProb(x, y) {
      const key = `${x},${y}`;
      return this.probabilities.safe[key] || 0;
    },
    
    getWumpusProb(x, y) {
      const key = `${x},${y}`;
      return this.probabilities.wumpus[key] || 0;
    },
    
    getPitProb(x, y) {
      const key = `${x},${y}`;
      return this.probabilities.pit[key] || 0;
    },
    
    // Cell state checks
    isRobotAt(x, y) {
      return this.robotPosition.x === x && this.robotPosition.y === y;
    },
    
    hasDeadRobotAt(x, y) {
      return this.deadRobots.some(robot => robot.x === x && robot.y === y);
    },
    
    hasVisited(x, y) {
      return this.visited.has(`${x},${y}`);
    },
    
    isWumpusAt(x, y) {
      return this.world.wumpus.x === x && this.world.wumpus.y === y;
    },
    
    isPitAt(x, y) {
      return this.world.pits.some(pit => pit.x === x && pit.y === y);
    },
    
    isGoldAt(x, y) {
      return this.world.gold.x === x && this.world.gold.y === y;
    },
    
    // Percept checks
    hasBreezeAt(x, y) {
      return this.hasAdjacentPit(x, y);
    },
    
    hasStenchAt(x, y) {
      return this.hasAdjacentWumpus(x, y);
    },
    
    // Helper functions
    hasAdjacentPit(x, y) {
      return this.getAdjacentCells(x, y).some(cell => this.isPitAt(cell.x, cell.y));
    },
    
    hasAdjacentWumpus(x, y) {
      return this.getAdjacentCells(x, y).some(cell => this.isWumpusAt(cell.x, cell.y));
    },
    
    getAdjacentCells(x, y) {
      const adjacent = [];
      
      if (x > 1) adjacent.push({ x: x-1, y: y });
      if (x < this.gridSize) adjacent.push({ x: x+1, y: y });
      if (y > 1) adjacent.push({ x: x, y: y-1 });
      if (y < this.gridSize) adjacent.push({ x: x, y: y+1 });
      
      return adjacent;
    },
    
    // Actions
    grabGold() {
      if (this.isGoldAt(this.robotPosition.x, this.robotPosition.y)) {
        this.$emit('grab-gold');
      }
    }
  }
};
</script>

<style scoped>
.wumpus-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  min-width: 450px;
}

.grid-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
}

.grid-status, .action-buttons, .auto-buttons, .util-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.grid-status {
  display: flex;
  align-items: center;
  gap: 20px;
}

.grid-status p {
  margin: 0;
  font-weight: bold;
  font-size: 0.9rem;
  background-color: #f3f4f6;
  padding: 8px 12px;
  border-radius: 8px;
  color: #2c3e50;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.find-btn {
  background-color: #e3f2fd;
  color: #1976d2;
}

.move-btn {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.gold-btn {
  background-color: #fff8e1;
  color: #f57f17;
}

.auto-btn {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.stop-btn {
  background-color: #ffebee;
  color: #c62828;
}

.reveal-btn {
  background-color: #e8eaf6;
  color: #303f9f;
}

.reset-btn {
  background-color: #fff3e0;
  color: #e65100;
}

.grid-container {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

.grid {
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;
  background-color: #e0e0e0;
  padding: 4px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.row {
  display: flex;
  gap: 4px;
}

.cell {
  width: 100px;
  height: 100px;
  background-color: #f5f5f5;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s;
}

.cell-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.coordinate {
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 10px;
  color: #888;
}

.probability {
  position: absolute;
  top: 20px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  width: 100%;
}

.wumpus-prob {
  top: 36px;
  font-size: 10px;
  color: #c62828;
}

.pit-prob {
  top: 50px;
  font-size: 10px;
  color: #6a1b9a;
}

.prob-high {
  color: #2e7d32;
}

.prob-medium {
  color: #f57f17;
}

.prob-low {
  color: #c62828;
}

.prob-safe {
  color: #2e7d32;
}

.visited {
  background-color: #e3f2fd;
}

.robot-cell {
  background-color: #bbdefb;
  box-shadow: 0 0 0 2px #2196f3;
}

.dead-robot-cell {
  background-color: #ffcdd2;
}

.danger-cell {
  background-color: #ffebee;
}

.gold-cell {
  background-color: #fff8e1;
}

.robot {
  font-size: 36px;
  color: #2196f3;
  animation: pulse 2s infinite;
}

.dead-robot {
  font-size: 36px;
  color: #f44336;
}

.wumpus {
  font-size: 32px;
  color: #d32f2f;
}

.pit {
  font-size: 28px;
  color: #6a1b9a;
}

.gold {
  font-size: 28px;
  color: #f57f17;
  animation: glow 2s infinite;
}

.percepts {
  display: flex;
  gap: 4px;
  position: absolute;
  bottom: 5px;
  right: 5px;
}

.breeze {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 50%;
  font-weight: bold;
  font-size: 11px;
}

.stench {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #f3e5f5;
  color: #6a1b9a;
  border-radius: 50%;
  font-weight: bold;
  font-size: 11px;
}

.glitter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #fff8e1;
  color: #f57f17;
  border-radius: 50%;
  font-weight: bold;
  font-size: 11px;
  animation: glow 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes glow {
  0% { box-shadow: 0 0 0 0 rgba(245, 127, 23, 0.4); }
  50% { box-shadow: 0 0 0 5px rgba(245, 127, 23, 0.2); }
  100% { box-shadow: 0 0 0 0 rgba(245, 127, 23, 0); }
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.breeze-legend, .stench-legend, .glitter-legend {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 10px;
}

.breeze-legend {
  background-color: #e3f2fd;
  color: #1976d2;
}

.stench-legend {
  background-color: #f3e5f5;
  color: #6a1b9a;
}

.glitter-legend {
  background-color: #fff8e1;
  color: #f57f17;
}
</style>
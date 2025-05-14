<template>
  <div class="world-container">
    <div class="grid-label">
      <i class="fas fa-map-marked-alt"></i> Wumpus World - Robot #{{ iteration }}
    </div>
    
    <div class="legend">
      <div class="legend-item"><div class="indicator wumpus-indicator"></div> Wumpus</div>
      <div class="legend-item"><div class="indicator pit-indicator"></div> Pit</div>
      <div class="legend-item"><div class="indicator safe-indicator"></div> Safe</div>
      <div class="legend-item"><div class="indicator visited-indicator"></div> Visited</div>
    </div>
    
    <div class="board">
      <div v-for="y in 4" :key="'row-' + y" class="row">
        <div v-for="x in 4" :key="'cell-' + x + '-' + y" 
             :class="getCellClass(x, y)"
             class="cell">
          <div class="coordinate">{{ x }},{{ 5-y }}</div>
          <div class="cell-content">
            <template v-if="isRevealed">
              <div v-if="hasWumpus(x, 5-y)" class="wumpus"><i class="fas fa-dragon"></i></div>
              <div v-if="hasPit(x, 5-y)" class="pit"><i class="fas fa-hole"></i></div>
            </template>
            <div v-if="hasRobot(x, 5-y)" class="robot"><i class="fas fa-robot"></i></div>
            <div v-if="hasDeadRobot(x, 5-y)" class="dead-robot"><i class="fas fa-skull"></i></div>
            <div v-if="hasGold(x, 5-y)" class="gold"><i class="fas fa-coins"></i></div>
            
            <div class="percepts">
              <span v-if="hasStench(x, 5-y)" class="stench"><i class="fas fa-wind"></i></span>
              <span v-if="hasBreeze(x, 5-y)" class="breeze"><i class="fas fa-water"></i></span>
            </div>
            
            <div v-if="isShowingProbabilities" class="probabilities">
              <div :class="getProbabilityClass(safeProbability(x, 5-y))">
                {{ formatProbability(safeProbability(x, 5-y)) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="main-buttons">
      <button @click="$emit('find-safe-moves')" :disabled="gameOver">
        <i class="fas fa-search"></i> Find Safe Moves
      </button>
      <button @click="$emit('make-best-move')" :disabled="gameOver">
        <i class="fas fa-check-circle"></i> Best Move
      </button>
      <button @click="$emit('reveal-world')" :disabled="isRevealed">
        <i class="fas fa-eye"></i> Reveal
      </button>
      <button @click="$emit('reset-game')">
        <i class="fas fa-redo"></i> Reset
      </button>
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
    visited: Object,
    isRevealed: Boolean,
    isShowingProbabilities: Boolean,
    gameOver: Boolean,
    world: Object
  },
  emits: ['find-safe-moves', 'make-best-move', 'reveal-world', 'reset-game'],
  methods: {
    // Check if a cell has a wumpus
    hasWumpus(x, y) {
      return this.world.wumpus.x === x && this.world.wumpus.y === y;
    },
    
    // Check if a cell has a pit
    hasPit(x, y) {
      return this.world.pits.some(pit => pit.x === x && pit.y === y);
    },
    
    // Check if a cell has gold
    hasGold(x, y) {
      return this.world.gold.x === x && this.world.gold.y === y;
    },
    
    // Check if a cell has a stench (adjacent to wumpus)
    hasStench(x, y) {
      return this.getAdjacentCells(x, y).some(cell => this.hasWumpus(cell.x, cell.y));
    },
    
    // Check if a cell has a breeze (adjacent to pit)
    hasBreeze(x, y) {
      return this.getAdjacentCells(x, y).some(cell => this.hasPit(cell.x, cell.y));
    },
    
    // Check if the robot is at a position
    hasRobot(x, y) {
      return this.robotPosition.x === x && this.robotPosition.y === y;
    },
    
    // Check if there's a dead robot at a position
    hasDeadRobot(x, y) {
      return this.deadRobots.some(robot => robot.x === x && robot.y === y);
    },
    
    // Get adjacent cells
    getAdjacentCells(x, y) {
      const adjacent = [];
      const gridSize = 4;
      
      if (x > 1) adjacent.push({ x: x-1, y: y });
      if (x < gridSize) adjacent.push({ x: x+1, y: y });
      if (y > 1) adjacent.push({ x: x, y: y-1 });
      if (y < gridSize) adjacent.push({ x: x, y: y+1 });
      
      return adjacent;
    },
    
    // Get cell CSS class
    getCellClass(x, y) {
      // Transform coordinates to match the game logic (y-axis is inverted in display)
      const gameY = 5 - y;
      const posKey = `${x},${gameY}`;
      const classes = ['cell'];
      
      if (this.visited.has(posKey)) {
        classes.push('visited');
      }
      
      if (this.robotPosition.x === x && this.robotPosition.y === gameY) {
        classes.push('robot-location');
      }
      
      if (this.isRevealed) {
        // If world is revealed, show real state
        if (this.hasWumpus(x, gameY) || this.hasPit(x, gameY)) {
          classes.push('unsafe');
        } else {
          classes.push('safe');
        }
      } else {
        // Otherwise show inferred state based on probabilities
        const safeProb = this.safeProbability(x, gameY);
        if (safeProb >= 0.9999) {
          classes.push('safe');
        } else if (safeProb < 0.2) {
          classes.push('unsafe');
        } else if (safeProb < 0.7) {
          classes.push('unknown');
        } else {
          classes.push('safe');
        }
      }
      
      return classes.join(' ');
    },
    
    // Get the safety probability for a cell
    safeProbability(x, y) {
      // This is a simplified version - in the full app this would use the probabilities object
      // For the demo, we'll use some basic rules
      const posKey = `${x},${y}`;
      
      // Starting position is always safe
      if (x === 1 && y === 1) return 1.0;
      
      // If the cell is visited, it's safe
      if (this.visited.has(posKey)) return 1.0;
      
      // If adjacent to the robot and no percepts, it's safe
      const isAdjacent = this.getAdjacentCells(this.robotPosition.x, this.robotPosition.y)
        .some(cell => cell.x === x && cell.y === y);
      
      if (isAdjacent && !this.hasBreeze(this.robotPosition.x, this.robotPosition.y) && 
          !this.hasStench(this.robotPosition.x, this.robotPosition.y)) {
        return 1.0;
      }
      
      // If we know there's a wumpus or pit, it's unsafe
      if (this.isRevealed && (this.hasWumpus(x, y) || this.hasPit(x, y))) {
        return 0.0;
      }
      
      // Default probability (this would be calculated in the full app)
      return 0.6;
    },
    
    // Format probability for display
    formatProbability(prob) {
      return (prob * 100).toFixed(0) + '%';
    },
    
    // Get class for probability display
    getProbabilityClass(prob) {
      if (prob >= 0.7) return 'probability-high';
      if (prob >= 0.3) return 'probability-medium';
      return 'probability-low';
    }
  }
};
</script>

<style scoped>
.world-container {
  flex: 1;
  min-width: 400px;
  background-color: white;
  padding: 20px;
  height: 80%;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.grid-label {
  text-align: center;
  margin-bottom: 15px;
  font-weight: bold;
  font-size: 1.2rem;
  color: #3273a8;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 15px;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  background-color: white;
  padding: 5px 10px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}

.wumpus-indicator {
  background-color: #a83232;
}

.pit-indicator {
  background-color: #333;
}

.safe-indicator {
  background-color: #32a852;
}

.visited-indicator {
  background-color: #e6f7ff;
}

.board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
  height: 640px;
  border: 2px solid #3273a8;
  padding: 8px;
  background-color: #e6f7ff;
  border-radius: 8px;
}

.cell {
  position: relative;
  aspect-ratio: 1;
  background-color: #fff;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  text-align: center;
  padding: 4px;
  transition: all 0.3s;
  border-radius: 8px;
}

.visited {
  background-color: #e6f7ff;
}

.robot-location {
  background-color: #b3e0ff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(50, 168, 82, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(50, 168, 82, 0); }
  100% { box-shadow: 0 0 0 0 rgba(50, 168, 82, 0); }
}

.cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.wumpus {
  color: #a83232;
  font-weight: bold;
  font-size: 16px;
}

.pit {
  color: #333;
  font-weight: bold;
  font-size: 16px;
}

.stench {
  color: #a83232;
}

.breeze {
  color: #3273a8;
}

.gold {
  color: #d6af36;
  font-weight: bold;
  font-size: 16px;
}

.robot {
  color: #32a852;
  font-weight: bold;
  font-size: 18px;
}

.dead-robot {
  color: #a83232;
  font-weight: bold;
  font-size: 18px;
}

.coordinate {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 9px;
  color: #666;
}

.safe {
  border: 3px solid #32a852;
}

.unsafe {
  border: 3px solid #a83232;
}

.unknown {
  border: 3px solid #d6af36;
}

.percepts {
  margin-top: 4px;
  font-size: 10px;
}

.probabilities {
  font-size: 9px;
  margin-top: 4px;
}

.probability-high {
  color: #32a852;
  font-weight: bold;
}

.probability-medium {
  color: #d6af36;
  font-weight: bold;
}

.probability-low {
  color: #a83232;
  font-weight: bold;
}

.main-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 18px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;
  transition: all 0.3s;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

button:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
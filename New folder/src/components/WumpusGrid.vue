<template>
  <div class="wumpus-world">
    <h1>Wumpus World AI Agent</h1>
    
    <div class="world-controls">
      <button @click="startAutoMode" :disabled="autoMode || gameOver" class="auto-button">
        <i class="fas fa-play"></i> Start Automatic Agent
      </button>
      <button @click="stopAutoMode" :disabled="!autoMode" class="stop-button">
        <i class="fas fa-stop"></i> Stop Agent
      </button>
      <button @click="makeBestMove" :disabled="autoMode || gameOver" class="move-button">
        <i class="fas fa-step-forward"></i> Make Best Move
      </button>
      <button @click="resetGame" class="reset-button">
        <i class="fas fa-redo"></i> Reset World
      </button>
      <button @click="revealWorld" :disabled="isRevealed" class="reveal-button">
        <i class="fas fa-eye"></i> Reveal World
      </button>
    </div>
    
    <div class="world-status">
      <div class="status">Status: <span :class="statusClass">{{ gameStatus }}</span></div>
      <div class="deaths">Deaths: <span class="death-count">{{ robotDeaths }}</span></div>
      <div v-if="autoMode" class="auto-indicator">Auto Mode Active</div>
    </div>
    
    <div class="grid-container">
      <div class="grid">
        <div v-for="y in 4" :key="`row-${y}`" class="row">
          <div v-for="x in 4" :key="`cell-${x}-${y}`" 
               :class="getCellClasses(x, 5-y)" 
               class="cell">
            <div class="coordinate">{{ x }},{{ 5-y }}</div>
            
            <!-- Agent -->
            <div v-if="isAgentAt(x, 5-y)" class="agent">
              <i class="fas fa-robot"></i>
            </div>
            
            <!-- Dead Agent -->
            <div v-if="hasDeadAgentAt(x, 5-y)" class="dead-agent">
              <i class="fas fa-skull-crossbones"></i>
            </div>
            
            <!-- Revealed Content -->
            <template v-if="isRevealed || (isVisited(x, 5-y) && hasPerceptsAt(x, 5-y))">
              <!-- Wumpus -->
              <div v-if="isRevealed && isWumpusAt(x, 5-y)" class="wumpus">
                <i class="fas fa-dragon"></i>
              </div>
              
              <!-- Pit -->
              <div v-if="isRevealed && isPitAt(x, 5-y)" class="pit">
                <i class="fas fa-exclamation-circle"></i>
              </div>
              
              <!-- Gold -->
              <div v-if="isRevealed && isGoldAt(x, 5-y)" class="gold">
                <i class="fas fa-coins"></i>
              </div>
              
              <!-- Percepts -->
              <div class="percepts">
                <span v-if="hasStenchAt(x, 5-y)" class="stench">S</span>
                <span v-if="hasBreezeAt(x, 5-y)" class="breeze">B</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    
    <div class="legend">
      <div class="legend-item"><i class="fas fa-robot agent-icon"></i> Agent</div>
      <div class="legend-item"><i class="fas fa-dragon wumpus-icon"></i> Wumpus</div>
      <div class="legend-item"><i class="fas fa-exclamation-circle pit-icon"></i> Pit</div>
      <div class="legend-item"><i class="fas fa-coins gold-icon"></i> Gold</div>
      <div class="legend-item"><span class="stench">S</span> Stench</div>
      <div class="legend-item"><span class="breeze">B</span> Breeze</div>
    </div>
    
    <div class="log-container">
      <h3>Agent Log</h3>
      <div class="log-entries">
        <div v-for="(log, index) in logs.slice().reverse()" :key="index" :class="['log-entry', log.type]">
          <span class="log-time">{{ log.timestamp }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WumpusWorld',
  data() {
    return {
      // Game state
      gridSize: 4,
      agentPosition: { x: 1, y: 1 },
      wumpusPosition: { x: 0, y: 0 },
      pits: [],
      goldPosition: { x: 0, y: 0 },
      visitedCells: new Set(['1,1']),
      deadAgents: [],
      isRevealed: false,
      gameOver: false,
      goldFound: false,
      robotDeaths: 0,
      
      // Auto mode
      autoMode: false,
      autoModeInterval: null,
      
      // Knowledge representation
      safeCells: new Set(['1,1']),
      unsafeCells: new Set(),
      
      // Logging
      logs: [],
      gameStatus: 'Exploring'
    };
  },
  computed: {
    statusClass() {
      if (this.gameOver && this.goldFound) return 'success-status';
      if (this.autoMode) return 'auto-status';
      return 'normal-status';
    }
  },
  mounted() {
    this.initializeWorld();
  },
  beforeUnmount() {
    this.stopAutoMode();
  },
  methods: {
    // Initialize a new Wumpus World
    initializeWorld() {
      // Place Wumpus (not at start position)
      do {
        this.wumpusPosition.x = this.randomInt(1, this.gridSize);
        this.wumpusPosition.y = this.randomInt(1, this.gridSize);
      } while (this.wumpusPosition.x === 1 && this.wumpusPosition.y === 1);
      
      // Place pits (20% probability, not at start position)
      this.pits = [];
      for (let x = 1; x <= this.gridSize; x++) {
        for (let y = 1; y <= this.gridSize; y++) {
          if (x === 1 && y === 1) continue; // Skip start position
          if (Math.random() < 0.2) {
            this.pits.push({ x, y });
          }
        }
      }
      
      // Place gold (not at start position, not where wumpus or pit is)
      do {
        this.goldPosition.x = this.randomInt(1, this.gridSize);
        this.goldPosition.y = this.randomInt(1, this.gridSize);
      } while (
        (this.goldPosition.x === 1 && this.goldPosition.y === 1) || 
        this.isWumpusAt(this.goldPosition.x, this.goldPosition.y) ||
        this.isPitAt(this.goldPosition.x, this.goldPosition.y)
      );
      
      this.addLog('World initialized', 'info');
      this.addLog('Agent starts at position (1, 1)', 'info');
      this.logPercepts();
    },
    
    // Random integer between min and max (inclusive)
    randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Check if the agent is at a position
    isAgentAt(x, y) {
      return this.agentPosition.x === x && this.agentPosition.y === y;
    },
    
    // Check if there's a dead agent at a position
    hasDeadAgentAt(x, y) {
      return this.deadAgents.some(agent => agent.x === x && agent.y === y);
    },
    
    // Check if a cell is visited
    isVisited(x, y) {
      return this.visitedCells.has(`${x},${y}`);
    },
    
    // Check if a cell has the Wumpus
    isWumpusAt(x, y) {
      return this.wumpusPosition.x === x && this.wumpusPosition.y === y;
    },
    
    // Check if a cell has a pit
    isPitAt(x, y) {
      return this.pits.some(pit => pit.x === x && pit.y === y);
    },
    
    // Check if a cell has gold
    isGoldAt(x, y) {
      return this.goldPosition.x === x && this.goldPosition.y === y;
    },
    
    // Check if a cell has a stench (adjacent to Wumpus)
    hasStenchAt(x, y) {
      return this.getAdjacentCells(x, y).some(cell => this.isWumpusAt(cell.x, cell.y));
    },
    
    // Check if a cell has a breeze (adjacent to pit)
    hasBreezeAt(x, y) {
      return this.getAdjacentCells(x, y).some(cell => this.isPitAt(cell.x, cell.y));
    },
    
    // Check if a cell has perceptions (stench, breeze)
    hasPerceptsAt(x, y) {
      return this.hasStenchAt(x, y) || this.hasBreezeAt(x, y);
    },
    
    // Get adjacent cells
    getAdjacentCells(x, y) {
      const adjacent = [];
      
      if (x > 1) adjacent.push({ x: x-1, y: y });
      if (x < this.gridSize) adjacent.push({ x: x+1, y: y });
      if (y > 1) adjacent.push({ x: x, y: y-1 });
      if (y < this.gridSize) adjacent.push({ x: x, y: y+1 });
      
      return adjacent;
    },
    
    // Get cell classes for display
    getCellClasses(x, y) {
      const classes = [];
      
      if (this.isVisited(x, y)) {
        classes.push('visited');
      }
      
      if (this.isAgentAt(x, y)) {
        classes.push('agent-location');
      }
      
      if (this.isRevealed) {
        if (this.isWumpusAt(x, y) || this.isPitAt(x, y)) {
          classes.push('unsafe');
        } else {
          classes.push('safe');
        }
      } else {
        if (this.safeCells.has(`${x},${y}`)) {
          classes.push('safe');
        } else if (this.unsafeCells.has(`${x},${y}`)) {
          classes.push('unsafe');
        }
      }
      
      return classes;
    },
    
    // Move the agent to a position
    moveAgent(x, y) {
      if (!this.isValidPosition(x, y)) return false;
      
      this.agentPosition.x = x;
      this.agentPosition.y = y;
      const posKey = `${x},${y}`;
      
      if (!this.visitedCells.has(posKey)) {
        this.visitedCells.add(posKey);
        this.safeCells.add(posKey);
      }
      
      this.addLog(`Agent moved to (${x}, ${y})`, 'info');
      
      // Check for hazards
      if (this.isWumpusAt(x, y)) {
        this.deadAgents.push({ x, y, type: 'wumpus' });
        this.robotDeaths++;
        this.addLog(`Agent died from Wumpus at (${x}, ${y})!`, 'error');
        this.unsafeCells.add(posKey);
        this.safeCells.delete(posKey);
        this.restartAgent();
        return false;
      }
      
      if (this.isPitAt(x, y)) {
        this.deadAgents.push({ x, y, type: 'pit' });
        this.robotDeaths++;
        this.addLog(`Agent died from falling in a Pit at (${x}, ${y})!`, 'error');
        this.unsafeCells.add(posKey);
        this.safeCells.delete(posKey);
        this.restartAgent();
        return false;
      }
      
      if (this.isGoldAt(x, y)) {
        this.addLog(`Agent found gold at (${x}, ${y})!`, 'success');
        this.gameStatus = 'Gold Found!';
        this.goldFound = true;
        this.gameOver = true;
        this.stopAutoMode();
      }
      
      this.updateKnowledge();
      this.logPercepts();
      return true;
    },
    
    // Restart the agent at the starting position
    restartAgent() {
      this.agentPosition.x = 1;
      this.agentPosition.y = 1;
      this.gameStatus = 'Agent restarted';
      this.addLog('Agent restarted at position (1, 1)', 'info');
      this.logPercepts();
    },
    
    // Log percepts at the current position
    logPercepts() {
      const { x, y } = this.agentPosition;
      let perceptString = '';
      
      if (this.hasBreezeAt(x, y) && this.hasStenchAt(x, y)) {
        perceptString = 'Breeze and Stench';
      } else if (this.hasBreezeAt(x, y)) {
        perceptString = 'Breeze';
      } else if (this.hasStenchAt(x, y)) {
        perceptString = 'Stench';
      } else {
        perceptString = 'None';
      }
      
      if (this.isGoldAt(x, y)) {
        perceptString += ' and Glitter';
      }
      
      this.addLog(`Percepts at (${x}, ${y}): ${perceptString}`, 'info');
    },
    
    // Make the best move based on current knowledge
    makeBestMove() {
      if (this.gameOver) return;
      
      // If on gold, grab it and win
      if (this.isGoldAt(this.agentPosition.x, this.agentPosition.y)) {
        this.goldFound = true;
        this.gameOver = true;
        this.gameStatus = 'Gold Found!';
        this.addLog('Agent grabbed the gold!', 'success');
        return;
      }
      
      // Find safe unvisited cells to explore
      const safeMoves = this.findSafeMoves();
      
      if (safeMoves.length > 0) {
        // Choose an unvisited safe move if possible
        const unvisitedSafeMoves = safeMoves.filter(move => !this.visitedCells.has(`${move.x},${move.y}`));
        
        if (unvisitedSafeMoves.length > 0) {
          // Pick the first unvisited safe move
          const bestMove = unvisitedSafeMoves[0];
          this.moveAgent(bestMove.x, bestMove.y);
          return;
        }
        
        // If all safe moves are visited, pick the first one
        this.moveAgent(safeMoves[0].x, safeMoves[0].y);
        return;
      }
      
      // If no guaranteed safe moves, take a risk with the least dangerous cell
      const riskMove = this.findBestRiskMove();
      if (riskMove) {
        this.addLog(`Taking a risk by moving to (${riskMove.x}, ${riskMove.y})`, 'warning');
        this.moveAgent(riskMove.x, riskMove.y);
      } else {
        this.addLog('No valid moves available', 'error');
      }
    },
    
    // Find safe moves from the current position
    findSafeMoves() {
      const { x, y } = this.agentPosition;
      const safeMoves = [];
      
      // Check each adjacent cell
      const adjacentCells = this.getAdjacentCells(x, y);
      
      for (const cell of adjacentCells) {
        const posKey = `${cell.x},${cell.y}`;
        
        // If no percepts, all adjacent cells are safe
        if (!this.hasBreezeAt(x, y) && !this.hasStenchAt(x, y)) {
          safeMoves.push(cell);
          this.safeCells.add(posKey);
          continue;
        }
        
        // If we've marked it as safe from our knowledge base
        if (this.safeCells.has(posKey)) {
          safeMoves.push(cell);
        }
      }
      
      return safeMoves;
    },
    
    // Find the best risky move
    findBestRiskMove() {
      const { x, y } = this.agentPosition;
      const adjacentCells = this.getAdjacentCells(x, y);
      
      // Filter out cells known to be unsafe
      const possibleMoves = adjacentCells.filter(cell => 
        !this.unsafeCells.has(`${cell.x},${cell.y}`)
      );
      
      // Prefer unvisited cells
      const unvisitedMoves = possibleMoves.filter(cell => 
        !this.visitedCells.has(`${cell.x},${cell.y}`)
      );
      
      if (unvisitedMoves.length > 0) {
        return unvisitedMoves[0]; // Take the first unvisited move
      }
      
      if (possibleMoves.length > 0) {
        return possibleMoves[0]; // Take any possible move
      }
      
      return null; // No moves available
    },
    
    // Check if a position is valid
    isValidPosition(x, y) {
      return x >= 1 && x <= this.gridSize && y >= 1 && y <= this.gridSize;
    },
    
    // Update knowledge base based on percepts
    updateKnowledge() {
      const { x, y } = this.agentPosition;
      
      // If no percepts, all adjacent cells are safe
      if (!this.hasBreezeAt(x, y) && !this.hasStenchAt(x, y)) {
        const adjacentCells = this.getAdjacentCells(x, y);
        for (const cell of adjacentCells) {
          if (this.isValidPosition(cell.x, cell.y)) {
            this.safeCells.add(`${cell.x},${cell.y}`);
            this.unsafeCells.delete(`${cell.x},${cell.y}`);
          }
        }
      }
    },
    
    // Start automatic mode
    startAutoMode() {
      if (this.autoMode || this.gameOver) return;
      
      this.autoMode = true;
      this.gameStatus = 'Auto-exploring';
      this.addLog('Automatic exploration mode started', 'info');
      
      this.autoModeInterval = setInterval(() => {
        if (this.gameOver) {
          this.stopAutoMode();
          return;
        }
        this.makeBestMove();
      }, 1000); // Make a move every second
    },
    
    // Stop automatic mode
    stopAutoMode() {
      if (!this.autoMode) return;
      
      clearInterval(this.autoModeInterval);
      this.autoModeInterval = null;
      this.autoMode = false;
      
      if (!this.gameOver) {
        this.gameStatus = 'Exploring';
        this.addLog('Automatic exploration mode stopped', 'info');
      }
    },
    
    // Reveal the entire world
    revealWorld() {
      this.isRevealed = true;
      this.addLog('World revealed for debugging', 'info');
      this.addLog(`Wumpus at (${this.wumpusPosition.x}, ${this.wumpusPosition.y})`, 'info');
      
      let pitsStr = 'Pits at: ';
      if (this.pits.length === 0) {
        pitsStr += 'None';
      } else {
        pitsStr += this.pits.map(pit => `(${pit.x},${pit.y})`).join(', ');
      }
      this.addLog(pitsStr, 'info');
      
      this.addLog(`Gold at (${this.goldPosition.x}, ${this.goldPosition.y})`, 'info');
    },
    
    // Reset the game
    resetGame() {
      this.stopAutoMode();
      
      // Reset game state
      this.agentPosition = { x: 1, y: 1 };
      this.visitedCells = new Set(['1,1']);
      this.deadAgents = [];
      this.isRevealed = false;
      this.gameOver = false;
      this.goldFound = false;
      this.robotDeaths = 0;
      this.gameStatus = 'Exploring';
      
      // Reset knowledge
      this.safeCells = new Set(['1,1']);
      this.unsafeCells = new Set();
      
      // Reset logs
      this.logs = [];
      
      // Initialize new world
      this.initializeWorld();
    },
    
    // Add a log entry
    addLog(message, type = 'info') {
      const timestamp = new Date().toLocaleTimeString();
      this.logs.push({ message, type, timestamp });
      
      // Keep logs at a reasonable size
      if (this.logs.length > 100) {
        this.logs.shift();
      }
    }
  }
}
</script>

<style scoped>
.wumpus-world {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

.world-controls {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auto-button {
  background-color: #4caf50;
  color: white;
}

.stop-button {
  background-color: #f44336;
  color: white;
}

.move-button {
  background-color: #2196f3;
  color: white;
}

.reset-button {
  background-color: #ff9800;
  color: white;
}

.reveal-button {
  background-color: #9c27b0;
  color: white;
}

.world-status {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  font-weight: bold;
}

.success-status {
  color: #4caf50;
}

.auto-status {
  color: #2196f3;
}

.death-count {
  color: #f44336;
}

.auto-indicator {
  background-color: #e8f5e9;
  color: #4caf50;
  padding: 2px 10px;
  border-radius: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { background-color: #e8f5e9; }
  50% { background-color: #c8e6c9; }
  100% { background-color: #e8f5e9; }
}

.grid-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.grid {
  display: grid;
  grid-template-rows: repeat(4, 80px);
  gap: 5px;
  background-color: #e0e0e0;
  padding: 5px;
  border-radius: 5px;
}

.row {
  display: grid;
  grid-template-columns: repeat(4, 80px);
  gap: 5px;
}

.cell {
  position: relative;
  background-color: white;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.coordinate {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 10px;
  color: #757575;
}

.visited {
  background-color: #f5f5f5;
}

.agent-location {
  background-color: #bbdefb;
}

.safe {
  border-color: #4caf50;
}

.unsafe {
  border-color: #f44336;
}

.agent, .wumpus, .pit, .gold, .dead-agent {
  font-size: 24px;
  position: absolute;
}

.agent {
  color: #2196f3;
}

.dead-agent {
  color: #f44336;
}

.wumpus {
  color: #f44336;
}

.pit {
  color: #2c3e50;
}

.gold {
  color: #ffc107;
}

.percepts {
  display: flex;
  gap: 5px;
  margin-top: 25px;
  font-size: 12px;
  font-weight: bold;
}

.stench {
  color: green;
}

.breeze {
  color: red;
}

.legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.agent-icon {
  color: #2196f3;
}

.wumpus-icon {
  color: #f44336;
}

.pit-icon {
  color: #2c3e50;
}

.gold-icon {
  color: #ffc107;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 10px;
  margin-top: 20px;
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.log-entry {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
  display: flex;
}

.log-time {
  color: #757575;
  font-size: 12px;
  margin-right: 10px;
  white-space: nowrap;
}

.info {
  background-color: #e3f2fd;
}

.warning {
  background-color: #fff3e0;
}

.error {
  background-color: #ffebee;
}

.success {
  background-color: #e8f5e9;
}
</style>
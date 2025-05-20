<template>
  <div class="container">
    <h1>Wumpus World Multi-Agent Simulation</h1>
    
<div class="formalism-buttons">
  <button @click="setFormalism('prop')" :class="['formalism-button', { active: formalism === 'prop' }]">
    <i class="fas fa-cubes"></i> Propositional Logic
  </button>
  <button @click="setFormalism('fol')" :class="['formalism-button', { active: formalism === 'fol' }]">
    <i class="fas fa-brain"></i> First-Order Logic
  </button>
</div>
    
    <div class="game-container">
      <documentation-guide />
      
      <wumpus-grid 
        :iteration="iteration"
        :robot-position="robotPosition"
        :dead-robots="deadRobots"
        :visited="visited"
        :is-revealed="isRevealed"
        :is-showing-probabilities="isShowingProbabilities"
        :game-over="gameOver"
        :world="world"
        :has-gold="hasGold"
        @find-safe-moves="findSafeMoves"
        @make-best-move="makeBestMove"
        @start-auto-mode="startAutoMode"
        @stop-auto-mode="stopAutoMode"
        @reveal-world="revealWorld"
        @reset-game="resetGame"
      />
      
      <control-panel
        :formalism-name="formalismName"
        :game-status="gameStatus"
        :robot-deaths="robotDeaths"
        :robot-position="robotPosition"
        :percepts="getCurrentPercepts()"
        :knowledge-base="knowledgeBase"
        :logs="logs"
        :is-showing-probabilities="isShowingProbabilities"
        :game-over="gameOver"
        :auto-mode="autoMode"
        @move-robot="moveRobot"
        @toggle-probabilities="toggleProbabilities"
        @set-active-tab="setActiveTab"
        :active-tab="activeTab"
        :can-move="canMove"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import DocumentationGuide from '@/components/DocumentationGuide.vue';
import WumpusGrid from '@/components/WumpusGrid.vue';
import ControlPanel from '@/components/ControlPanel.vue';

export default {
  name: 'App',
  components: {
    DocumentationGuide,
    WumpusGrid,
    ControlPanel
  },
  setup() {
    // Game configuration
    const gridSize = 4;
    const formalism = ref('fol'); // 'fol' or 'asp'
    const activeTab = ref('kb');
    const isRevealed = ref(false);
    const isShowingProbabilities = ref(false);
    const iteration = ref(1);
    const robotDeaths = ref(0);
    const gameOver = ref(false);
    const autoMode = ref(false);
    const autoModeInterval = ref(null);
    const goldFound = ref(false);
    
    // World state
    const world = reactive({
      wumpus: { x: 0, y: 0 },
      pits: [],
      gold: { x: 0, y: 0 }
    });
    
    // Agent state
    const robotPosition = reactive({ x: 1, y: 1 });
    const deadRobots = ref([]);
    const visited = ref(new Set(['1,1']));
    const knowledgeBase = ref([]);
    const logs = ref([]);
    
    // Path planning    
    // Probability model
    const probabilities = reactive({
      wumpus: {},
      pit: {},
      safe: {}
    });
    
    // Game status
    const gameStatus = ref('Exploring');
    
    // Computed properties
    const formalismName = computed(() => {
      return formalism.value === 'fol' ? 'First-Order Logic' : 'Answer Set Programming';
    });
    
    // Initialize the world
    function initializeWorld() {
      // Place Wumpus (not at start position)
      do {
        world.wumpus.x = Math.floor(Math.random() * gridSize) + 1;
        world.wumpus.y = Math.floor(Math.random() * gridSize) + 1;
      } while (world.wumpus.x === 1 && world.wumpus.y === 1);
      
      // Place pits (20% probability, not at start position)
      world.pits = [];
      for (let x = 1; x <= gridSize; x++) {
        for (let y = 1; y <= gridSize; y++) {
          if (x === 1 && y === 1) continue; // Skip start position
          if (Math.random() < 0.2) {
            world.pits.push({ x, y });
          }
        }
      }
      
      // Place gold (not at start position and not where wumpus or pit is)
      do {
        world.gold.x = Math.floor(Math.random() * gridSize) + 1;
        world.gold.y = Math.floor(Math.random() * gridSize) + 1;
      } while (
        (world.gold.x === 1 && world.gold.y === 1) || 
        (world.gold.x === world.wumpus.x && world.gold.y === world.wumpus.y) ||
        world.pits.some(pit => pit.x === world.gold.x && pit.y === world.gold.y)
      );
      
      // Initialize probabilities
      for (let x = 1; x <= gridSize; x++) {
        for (let y = 1; y <= gridSize; y++) {
          const key = `${x},${y}`;
          
          // Starting position is safe
          if (x === 1 && y === 1) {
            probabilities.wumpus[key] = 0;
            probabilities.pit[key] = 0;
            probabilities.safe[key] = 1;
            continue;
          }
          
          // Initialize with prior probabilities
          probabilities.wumpus[key] = 1 / (gridSize * gridSize - 1); // One wumpus somewhere
          probabilities.pit[key] = 0.2; // 20% chance of pit
          
          // Calculate safe probability
          updateSafeProbability(x, y);
        }
      }
      
      // Initialize knowledge base
      initializeKnowledgeBase();
      
      // Add initial percepts
      updatePercepts();
      
      // Log initial state
      addLog('Game initialized with ' + formalismName.value, 'info');
      addLog('Robot starts at position (1, 1)', 'info');
      logPercepts();
    }
    
    // Initialize knowledge base based on selected formalism
    function initializeKnowledgeBase() {
      knowledgeBase.value = [];
      
      // Common initial knowledge
      addToKnowledgeBase('Safe(1,1)');
      addToKnowledgeBase('Visited(1,1)');
      
      if (formalism.value === 'fol') {
        // FOL specific axioms
        addToKnowledgeBase('∀x,y: Stench(x,y) ↔ ∃x\',y\'(Adjacent(x,y,x\',y\') ∧ Wumpus(x\',y\'))');
        addToKnowledgeBase('∀x,y: Breeze(x,y) ↔ ∃x\',y\'(Adjacent(x,y,x\',y\') ∧ Pit(x\',y\'))');
        addToKnowledgeBase('∀x,y: Safe(x,y) ↔ ¬Wumpus(x,y) ∧ ¬Pit(x,y)');
      } else {
        // ASP specific rules
        addToKnowledgeBase('% Grid positions (1-4,1-4)');
        addToKnowledgeBase('pos(1..4, 1..4).');
        addToKnowledgeBase('% Exactly one wumpus');
        addToKnowledgeBase('1 { wumpus(X,Y) : pos(X,Y) } 1.');
        addToKnowledgeBase('% Safe cell definition');
        addToKnowledgeBase('safe(X,Y) :- pos(X,Y), not wumpus(X,Y), not pit(X,Y).');
      }
    }
    
    // Helper function to add to knowledge base
    function addToKnowledgeBase(fact) {
      knowledgeBase.value.push(fact);
    }
    
    // Get percepts at the current position
    function getCurrentPercepts() {
      return {
        breeze: hasBreeze(robotPosition.x, robotPosition.y),
        stench: hasStench(robotPosition.x, robotPosition.y),
        glitter: hasGold(robotPosition.x, robotPosition.y)
      };
    }
    
    // Log current percepts
    function logPercepts() {
      const percepts = getCurrentPercepts();
      let perceptsMessage = 'Current percepts at (' + robotPosition.x + ',' + robotPosition.y + '): ';
      
      const perceptsList = [];
      if (percepts.breeze) perceptsList.push('Breeze');
      if (percepts.stench) perceptsList.push('Stench');
      if (percepts.glitter) perceptsList.push('Glitter');
      
      if (perceptsList.length > 0) {
        perceptsMessage += perceptsList.join(' and ');
      } else {
        perceptsMessage += 'None';
      }
      
      addLog(perceptsMessage, 'info');
    }
    
    // Check if a cell has a wumpus
    function hasWumpus(x, y) {
      return world.wumpus.x === x && world.wumpus.y === y;
    }
    
    // Check if a cell has a pit
    function hasPit(x, y) {
      return world.pits.some(pit => pit.x === x && pit.y === y);
    }
    
    // Check if a cell has gold
    function hasGold(x, y) {
      return world.gold.x === x && world.gold.y === y;
    }
    
    // Check if a cell has a stench (adjacent to wumpus)
    function hasStench(x, y) {
      const adjacentCells = getAdjacentCells(x, y);
      return adjacentCells.some(cell => hasWumpus(cell.x, cell.y));
    }
    
    // Check if a cell has a breeze (adjacent to pit)
    function hasBreeze(x, y) {
      const adjacentCells = getAdjacentCells(x, y);
      return adjacentCells.some(cell => hasPit(cell.x, cell.y));
    }
    
    // Check if the robot is at a position
    function hasRobot(x, y) {
      return robotPosition.x === x && robotPosition.y === y;
    }
    
    // Check if there's a dead robot at a position
    function hasDeadRobot(x, y) {
      return deadRobots.value.some(robot => robot.x === x && robot.y === y);
    }
    
    // Get adjacent cells
    function getAdjacentCells(x, y) {
      const adjacent = [];
      
      if (x > 1) adjacent.push({ x: x-1, y: y });
      if (x < gridSize) adjacent.push({ x: x+1, y: y });
      if (y > 1) adjacent.push({ x: x, y: y-1 });
      if (y < gridSize) adjacent.push({ x: x, y: y+1 });
      
      return adjacent;
    }
    
    // Check if a cell is visitable
    function isVisitable(x, y) {
      return x >= 1 && x <= gridSize && y >= 1 && y <= gridSize;
    }
    
    // Check if the robot can move in a direction
    function canMove(direction) {
      const { x, y } = robotPosition;
      
      switch (direction) {
        case 'up': return y < gridSize;
        case 'down': return y > 1;
        case 'left': return x > 1;
        case 'right': return x < gridSize;
        default: return false;
      }
    }
    
    // Move the robot
    function moveRobot(direction) {
      let newX = robotPosition.x;
      let newY = robotPosition.y;
      
      switch (direction) {
        case 'up': newY++; break;
        case 'down': newY--; break;
        case 'left': newX--; break;
        case 'right': newX++; break;
      }
      
      if (isVisitable(newX, newY)) {
        robotPosition.x = newX;
        robotPosition.y = newY;
        
        const posKey = `${newX},${newY}`;
        visited.value.add(posKey);
        
        addToKnowledgeBase(`Visited(${newX},${newY})`);
        
        // Check for hazards
        checkForHazards();
        
        // Update percepts
        updatePercepts();
        
        // Log the move
        addLog(`Robot moved to (${newX}, ${newY})`, 'info');
        logPercepts();
        
        // Update knowledge base based on percepts
        updateKnowledgeBase();
      }
    }
    
    // Find safe moves
    function findSafeMoves() {
      const safeMoves = [];
      const adjacentCells = getAdjacentCells(robotPosition.x, robotPosition.y);
      
      for (const cell of adjacentCells) {
        if (isSafeByCertainty(cell.x, cell.y)) {
          safeMoves.push(cell);
          addLog(`Safe move found: (${cell.x}, ${cell.y})`, 'info');
        } else {
          const safeProb = safeProbability(cell.x, cell.y);
          addLog(`Position (${cell.x}, ${cell.y}) has safety probability: ${formatProbability(safeProb)}`, 'info');
        }
      }
      
      if (safeMoves.length === 0) {
        addLog('No guaranteed safe moves found. Consider probabilistic move.', 'warning');
        
        // Find the best probabilistic move
        const bestMove = getBestProbabilisticMove();
        if (bestMove) {
          addLog(`Best probabilistic move: (${bestMove.x}, ${bestMove.y}) with safety probability ${formatProbability(safeProbability(bestMove.x, bestMove.y))}`, 'info');
        } else {
          addLog('No unvisited adjacent cells available.', 'error');
        }
      }
      
      return safeMoves;
    }
    
    // Make the best move based on current knowledge
    function makeBestMove() {
      // Check if we've already found gold
      if (getCurrentPercepts().glitter) {
        grabGold();
        return;
      }
      
      // First try to find guaranteed safe moves
      const safeMoves = findSafeMoves();
      
      if (safeMoves.length > 0) {
        // Choose an unvisited safe move if possible
        const unvisitedSafeMoves = safeMoves.filter(move => !visited.value.has(`${move.x},${move.y}`));
        
        if (unvisitedSafeMoves.length > 0) {
          // Pick the first unvisited safe move
          const bestMove = unvisitedSafeMoves[0];
          moveToPosition(bestMove.x, bestMove.y);
          return;
        }
        
        // If all safe moves are visited, pick the first one
        moveToPosition(safeMoves[0].x, safeMoves[0].y);
        return;
      }
      
      // If no guaranteed safe moves, use probabilistic reasoning
      const bestMove = getBestProbabilisticMove();
      
      if (bestMove) {
        addLog(`Making probabilistic move to (${bestMove.x}, ${bestMove.y}) with safety probability ${formatProbability(safeProbability(bestMove.x, bestMove.y))}`, 'warning');
        moveToPosition(bestMove.x, bestMove.y);
      } else {
        addLog('No valid moves available.', 'error');
      }
    }
    
    // Get the best move based on probabilities
    function getBestProbabilisticMove() {
      const adjacentCells = getAdjacentCells(robotPosition.x, robotPosition.y);
      let bestCell = null;
      let bestProb = -1;
      
      for (const cell of adjacentCells) {
        const posKey = `${cell.x},${cell.y}`;
        const safeProb = safeProbability(cell.x, cell.y);
        
        // Prefer unvisited cells
        if (!visited.value.has(posKey) && safeProb > bestProb) {
          bestProb = safeProb;
          bestCell = cell;
        }
      }
      
      // If no unvisited cells, consider all adjacent cells
      if (!bestCell) {
        for (const cell of adjacentCells) {
          const safeProb = safeProbability(cell.x, cell.y);
          if (safeProb > bestProb) {
            bestProb = safeProb;
            bestCell = cell;
          }
        }
      }
      
      return bestCell;
    }
    
    // Grab gold
    function grabGold() {
      if (hasGold(robotPosition.x, robotPosition.y)) {
        goldFound.value = true;
        addLog(`Robot grabbed gold at (${robotPosition.x}, ${robotPosition.y})!`, 'success');
        gameStatus.value = 'Found Gold!';
        gameOver.value = true;
        stopAutoMode();
      }
    }
    
    // Move to a specific position
    function moveToPosition(x, y) {
      if (x === robotPosition.x && y === robotPosition.y) return;
      
      // Determine direction
      let direction;
      if (x < robotPosition.x) direction = 'left';
      else if (x > robotPosition.x) direction = 'right';
      else if (y < robotPosition.y) direction = 'down';
      else if (y > robotPosition.y) direction = 'up';
      
      // Move in that direction
      moveRobot(direction);
    }
    
    // Check for hazards at the current position
    function checkForHazards() {
      const { x, y } = robotPosition;
      
      if (hasWumpus(x, y)) {
        deadRobots.value.push({ x, y, type: 'wumpus' });
        robotDeaths.value++;
        addLog(`Robot died from Wumpus at (${x}, ${y})`, 'error');
        restartRobot();
        return;
      }
      
      if (hasPit(x, y)) {
        deadRobots.value.push({ x, y, type: 'pit' });
        robotDeaths.value++;
        addLog(`Robot died from falling in a Pit at (${x}, ${y})`, 'error');
        restartRobot();
        return;
      }
      
      if (hasGold(x, y)) {
        addLog(`Robot found gold at (${x}, ${y})!`, 'success');
        gameStatus.value = 'Found Gold!';
        
        // In auto mode, immediately grab the gold
        if (autoMode.value) {
          grabGold();
        } else {
          addLog('Press "Grab Gold" to complete the mission!', 'info');
        }
      }
    }
    
    // Restart the robot at the starting position
    function restartRobot() {
      iteration.value++;
      robotPosition.x = 1;
      robotPosition.y = 1;
      gameStatus.value = 'Robot restarted, retaining knowledge';
      addLog(`Robot restarted at position (1, 1) with accumulated knowledge`, 'info');
      
      // Update the knowledge base with certainty about the death location
      const lastDeath = deadRobots.value[deadRobots.value.length - 1];
      if (lastDeath.type === 'wumpus') {
        // We know exactly where the wumpus is
        const key = `${lastDeath.x},${lastDeath.y}`;
        probabilities.wumpus[key] = 1;
        
        // Update knowledge that this is definitely a wumpus
        addToKnowledgeBase(`Wumpus(${lastDeath.x},${lastDeath.y})`);
        
        // Update all other positions to have 0 probability of wumpus
        for (let x = 1; x <= gridSize; x++) {
          for (let y = 1; y <= gridSize; y++) {
            const posKey = `${x},${y}`;
            if (posKey !== key) {
              probabilities.wumpus[posKey] = 0;
              updateSafeProbability(x, y);
            }
          }
        }
      } else if (lastDeath.type === 'pit') {
        // We know exactly where a pit is
        const key = `${lastDeath.x},${lastDeath.y}`;
        probabilities.pit[key] = 1;
        
        // Update knowledge that this is definitely a pit
        addToKnowledgeBase(`Pit(${lastDeath.x},${lastDeath.y})`);
        
        // Update safety probability for this cell
        updateSafeProbability(lastDeath.x, lastDeath.y);
      }
      
      // Update percepts at the new position
      updatePercepts();
      logPercepts();
    }
    
    // Update percepts based on the current position
    function updatePercepts() {
      const { x, y } = robotPosition;
      const percepts = getCurrentPercepts();
      
      if (percepts.breeze) {
        addToKnowledgeBase(`Breeze(${x},${y})`);
      } else {
        addToKnowledgeBase(`¬Breeze(${x},${y})`);
        
        // If no breeze, all adjacent cells have no pits
        const adjacentCells = getAdjacentCells(x, y);
        for (const cell of adjacentCells) {
          if (isVisitable(cell.x, cell.y)) {
            const posKey = `${cell.x},${cell.y}`;
            probabilities.pit[posKey] = 0;
            updateSafeProbability(cell.x, cell.y);
            addToKnowledgeBase(`¬Pit(${cell.x},${cell.y})`);
          }
        }
      }
      
      if (percepts.stench) {
        addToKnowledgeBase(`Stench(${x},${y})`);
      } else {
        addToKnowledgeBase(`¬Stench(${x},${y})`);
        
        // If no stench, all adjacent cells have no wumpus
        const adjacentCells = getAdjacentCells(x, y);
        for (const cell of adjacentCells) {
          if (isVisitable(cell.x, cell.y)) {
            const posKey = `${cell.x},${cell.y}`;
            probabilities.wumpus[posKey] = 0;
            updateSafeProbability(cell.x, cell.y);
            addToKnowledgeBase(`¬Wumpus(${cell.x},${cell.y})`);
          }
        }
      }
      
      if (percepts.glitter) {
        addToKnowledgeBase(`Glitter(${x},${y})`);
      }
    }
    
    // Update knowledge base based on percepts and current state
    function updateKnowledgeBase() {
      const { x, y } = robotPosition;
      
      // Mark current position as safe
      addToKnowledgeBase(`Safe(${x},${y})`);
      
      // If we're at a position with no percepts, all adjacent cells are safe
      const percepts = getCurrentPercepts();
      if (!percepts.breeze && !percepts.stench) {
        const adjacentCells = getAdjacentCells(x, y);
        for (const cell of adjacentCells) {
          if (isVisitable(cell.x, cell.y)) {
            addToKnowledgeBase(`Safe(${cell.x},${cell.y})`);
            
            // Update probabilities
            const posKey = `${cell.x},${cell.y}`;
            probabilities.wumpus[posKey] = 0;
            probabilities.pit[posKey] = 0;
            probabilities.safe[posKey] = 1;
          }
        }
      } else {
        // Apply Bayesian reasoning for uncertain cells
        updateProbabilitiesBasedOnPercepts();
      }
    }
    
    // Update probabilities based on percepts
    function updateProbabilitiesBasedOnPercepts() {
      const { x, y } = robotPosition;
      const percepts = getCurrentPercepts();
      const adjacentCells = getAdjacentCells(x, y);
      
      if (percepts.breeze) {
        // At least one adjacent cell has a pit
        const unknownCells = adjacentCells.filter(cell => {
          const posKey = `${cell.x},${cell.y}`;
          return isVisitable(cell.x, cell.y) && probabilities.pit[posKey] > 0;
        });
        
        if (unknownCells.length > 0) {
          // Equal distribution of pit probability among unknown cells
          for (const cell of unknownCells) {
            const posKey = `${cell.x},${cell.y}`;
            // If this cell is the only possible pit, it must be a pit
            if (unknownCells.length === 1) {
              probabilities.pit[posKey] = 1;
            } else {
              // Otherwise, increase pit probability
              probabilities.pit[posKey] = Math.min(
                1, 
                probabilities.pit[posKey] + (1 - probabilities.pit[posKey]) * 0.3
              );
            }
            updateSafeProbability(cell.x, cell.y);
          }
        }
      }
      
      if (percepts.stench) {
        // At least one adjacent cell has a wumpus
        const unknownCells = adjacentCells.filter(cell => {
          const posKey = `${cell.x},${cell.y}`;
          return isVisitable(cell.x, cell.y) && probabilities.wumpus[posKey] > 0;
        });
        
        if (unknownCells.length > 0) {
          // If this cell is the only possible wumpus, it must be a wumpus
          if (unknownCells.length === 1) {
            const cell = unknownCells[0];
            const posKey = `${cell.x},${cell.y}`;
            probabilities.wumpus[posKey] = 1;
            
            // Update all other cells to have 0 wumpus probability
            for (let wx = 1; wx <= gridSize; wx++) {
              for (let wy = 1; wy <= gridSize; wy++) {
                const wKey = `${wx},${wy}`;
                if (wKey !== posKey) {
                  probabilities.wumpus[wKey] = 0;
                }
                updateSafeProbability(wx, wy);
              }
            }
          } else {
            // Otherwise, distribute wumpus probability among unknown cells
            const probPerCell = 1 / unknownCells.length;
            for (const cell of unknownCells) {
              const posKey = `${cell.x},${cell.y}`;
              probabilities.wumpus[posKey] = probPerCell;
              updateSafeProbability(cell.x, cell.y);
            }
          }
        }
      }
    }
    
    // Update safety probability for a cell
    function updateSafeProbability(x, y) {
      const posKey = `${x},${y}`;
      const wumpusProb = probabilities.wumpus[posKey] || 0;
      const pitProb = probabilities.pit[posKey] || 0;
      
      // P(safe) = P(no wumpus AND no pit) = (1 - P(wumpus)) * (1 - P(pit))
      probabilities.safe[posKey] = (1 - wumpusProb) * (1 - pitProb);
    }
    
    // Get the safety probability for a cell
    function safeProbability(x, y) {
      const posKey = `${x},${y}`;
      return probabilities.safe[posKey] || 0;
    }
    
    // Check if a cell is safe with certainty
    function isSafeByCertainty(x, y) {
      return safeProbability(x, y) >= 0.9999;
    }
    
    // Format probability for display
    function formatProbability(prob) {
      return (prob * 100).toFixed(0) + '%';
    }
    
    // Get class for probability display
    function getProbabilityClass(prob) {
      if (prob >= 0.7) return 'probability-high';
      if (prob >= 0.3) return 'probability-medium';
      return 'probability-low';
    }
    
    // Reveal the world
    function revealWorld() {
      isRevealed.value = true;
      addLog('World revealed! Wumpus position: (' + world.wumpus.x + ',' + world.wumpus.y + ')', 'info');
      
      let pitsStr = 'Pits at: ';
      if (world.pits.length === 0) {
        pitsStr += 'None';
      } else {
        pitsStr += world.pits.map(pit => `(${pit.x},${pit.y})`).join(', ');
      }
      addLog(pitsStr, 'info');
      
      addLog('Gold at: (' + world.gold.x + ',' + world.gold.y + ')', 'info');
    }
    
    // Add a log entry
    function addLog(message, type = 'info') {
      logs.value.push({ message, type, timestamp: new Date().toLocaleTimeString() });
      // Keep logs at a reasonable size
      if (logs.value.length > 100) {
        logs.value.shift();
      }
    }
    
    // Reset the game
    function resetGame() {
      // Stop auto mode if running
      stopAutoMode();
      
      // Reset game state
      isRevealed.value = false;
      iteration.value = 1;
      robotDeaths.value = 0;
      gameOver.value = false;
      gameStatus.value = 'Exploring';
      goldFound.value = false;
      
      // Reset agent state
      robotPosition.x = 1;
      robotPosition.y = 1;
      deadRobots.value = [];
      visited.value = new Set(['1,1']);
      knowledgeBase.value = [];
      logs.value = [];
      
      // Initialize new game
      initializeWorld();
    }
    
    // Set the active tab
    function setActiveTab(tab) {
      activeTab.value = tab;
    }
    
    // Set the logical formalism
    function setFormalism(newFormalism) {
      formalism.value = newFormalism;
      resetGame();
    }
    
    // Toggle probability display
    function toggleProbabilities() {
      isShowingProbabilities.value = !isShowingProbabilities.value;
    }
    
    // Start automatic mode
    function startAutoMode() {
      if (autoMode.value || gameOver.value) return;
      
      autoMode.value = true;
      addLog('Automatic exploration mode started', 'info');
      gameStatus.value = 'Auto-exploring';
      
      // Set interval for automatic moves
      autoModeInterval.value = setInterval(() => {
        if (gameOver.value) {
          stopAutoMode();
          return;
        }
        makeBestMove();
      }, 1000); // Make a move every 1 second
    }
    
    // Stop automatic mode
    function stopAutoMode() {
      if (!autoMode.value) return;
      
      clearInterval(autoModeInterval.value);
      autoModeInterval.value = null;
      autoMode.value = false;
      
      if (!gameOver.value) {
        gameStatus.value = 'Exploring';
        addLog('Automatic exploration mode stopped', 'info');
      }
    }
    
    // Clean up on unmount
    onMounted(() => {
      initializeWorld();
    });
    
    // Make sure to clear the interval when component is unmounted
    onUnmounted(() => {
      if (autoModeInterval.value) {
        clearInterval(autoModeInterval.value);
      }
    });
    
    return {
      gridSize,
      formalism,
      formalismName,
      activeTab,
      isRevealed,
      isShowingProbabilities,
      iteration,
      robotDeaths,
      gameOver,
      world,
      robotPosition,
      deadRobots,
      visited,
      knowledgeBase,
      logs,
      gameStatus,
      autoMode,
      goldFound,
      hasWumpus,
      hasPit,
      hasGold,
      hasStench,
      hasBreeze,
      hasRobot,
      hasDeadRobot,
      getCurrentPercepts,
      canMove,
      moveRobot,
      findSafeMoves,
      makeBestMove,
      grabGold,
      revealWorld,
      resetGame,
      setActiveTab,
      setFormalism,
      toggleProbabilities,
      startAutoMode,
      stopAutoMode,
      safeProbability,
      formatProbability,
      getProbabilityClass
    };
  }
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
  font-size: 2.2rem;
}

.game-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.formalism-buttons {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.formalism-button {
  background-color: #3273a8;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  font-size: 1rem;
  padding: 12px 20px;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
}

.formalism-button.active {
  background-color: #2c3e50;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.formalism-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
</style>
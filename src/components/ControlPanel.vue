
<template>
  <div class="controls-container">
    <h2><i class="fas fa-gamepad"></i> Control Panel - {{ formalismName }}</h2>
    
    <div class="status-container">
      <div><strong>Status:</strong> <span :style="{color: gameOver ? '#a83232' : '#32a852'}">{{ gameStatus }}</span></div>
      <div><strong>Robot Deaths:</strong> {{ robotDeaths }}</div>
      <div><strong>Current Position:</strong> ({{ robotPosition.x }}, {{ robotPosition.y }})</div>
      <div><strong>Percepts:</strong> 
        <span v-if="percepts.breeze" class="breeze"><i class="fas fa-water"></i> Breeze</span>
        <span v-if="!percepts.breeze"><i class="fas fa-times"></i> No Breeze</span>,
        <span v-if="percepts.stench" class="stench"><i class="fas fa-wind"></i> Stench</span>
        <span v-if="!percepts.stench"><i class="fas fa-times"></i> No Stench</span>
      </div>
    </div>
    
    <div class="direction-buttons">
      <button class="direction-button" disabled></button>
      <button class="direction-button" @click="$emit('move-robot', 'up')" :disabled="!canMove('up') || gameOver">
        <i class="fas fa-arrow-up"></i>
      </button>
      <button class="direction-button" disabled></button>
      <button class="direction-button" @click="$emit('move-robot', 'left')" :disabled="!canMove('left') || gameOver">
        <i class="fas fa-arrow-left"></i>
      </button>
      <button class="direction-button center">
        <i class="fas fa-robot"></i>
      </button>
      <button class="direction-button" @click="$emit('move-robot', 'right')" :disabled="!canMove('right') || gameOver">
        <i class="fas fa-arrow-right"></i>
      </button>
      <button class="direction-button" disabled></button>
      <button class="direction-button" @click="$emit('move-robot', 'down')" :disabled="!canMove('down') || gameOver">
        <i class="fas fa-arrow-down"></i>
      </button>
      <button class="direction-button" disabled></button>
    </div>
    
    <button @click="$emit('toggle-probabilities')" class="toggle-button" :class="{ active: isShowingProbabilities }">
      <i class="fas fa-percentage"></i> {{ isShowingProbabilities ? 'Hide Probabilities' : 'Show Probabilities' }}
    </button>
      
    <div class="tab-container">
      <div class="tab-buttons">
        <button class="tab-button" :class="{ active: activeTab === 'kb' }" @click="$emit('set-active-tab', 'kb')">
          <i class="fas fa-brain"></i> Knowledge Base
        </button>
        <button class="tab-button" :class="{ active: activeTab === 'logs' }" @click="$emit('set-active-tab', 'logs')">
          <i class="fas fa-list"></i> Logs
        </button>
      </div>
      
      <div class="tab-content" :class="{ active: activeTab === 'kb' }">
        <div class="kb-visualizer">
          <div v-for="(fact, index) in knowledgeBase" :key="'kb-' + index">
            {{ fact }}
          </div>
        </div>
      </div>
      
      <div class="tab-content" :class="{ active: activeTab === 'logs' }">
        <div class="logs">
          <div v-for="(log, index) in logs" :key="'log-' + index" :class="'log-entry log-' + log.type">
            {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ControlPanel',
  props: {
    formalismName: String,
    gameStatus: String,
    robotDeaths: Number,
    robotPosition: Object,
    percepts: Object,
    knowledgeBase: Array,
    logs: Array,
    isShowingProbabilities: Boolean,
    gameOver: Boolean,
    activeTab: String,
    canMove: Function
  },
  emits: ['move-robot', 'toggle-probabilities', 'set-active-tab']
};
</script>

<style scoped>
.controls-container {
  flex: 1;
  min-width: 400px;
  height: 100%;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

h2 {
  margin-top: 0;
  color: #3273a8;
  font-size: 1.5rem;
  border-bottom: 2px solid #e6f7ff;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.status-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
}

.direction-buttons {
  display: grid;
  grid-template-columns: repeat(3, 60px);
  grid-template-rows: repeat(3, 60px);
  gap: 5px;
  margin: 20px auto;
  width: fit-content;
}

.direction-button {
  padding: 0;
  height: 60px;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.direction-button:hover:not(:disabled) {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.direction-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.direction-button.center {
  background-color: #f1f1f1;
  color: #333;
}

.toggle-button {
  padding: 10px 18px;
  background-color: #f1f1f1;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  display: block;
  width: 100%;
}

.toggle-button.active {
  background-color: #3273a8;
  color: white;
}

.toggle-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.tab-container {
  margin-bottom: 20px;
}

.tab-buttons {
  display: flex;
  border-bottom: 1px solid #ccc;
}

.tab-button {
  padding: 10px 20px;
  cursor: pointer;
  background-color: #f1f1f1;
  border: none;
  transition: 0.3s;
  margin: 0;
  border-radius: 8px 8px 0 0;
  font-weight: normal;
  box-shadow: none;
}

.tab-button.active {
  background-color: #4CAF50;
  color: white;
}

.tab-content {
  display: none;
  padding: 20px;
  border: 1px solid #ccc;
  border-top: none;
  background-color: white;
  height: 200px;
  overflow-y: auto;
  border-radius: 0 0 8px 8px;
}

.tab-content.active {
  display: block;
}

.kb-visualizer {
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
}

.logs {
  font-family: monospace;
  font-size: 12px;
  margin-bottom: 10px;
  white-space: pre-wrap;
  line-height: 1.4;
}

.log-entry {
  margin-bottom: 4px;
  padding: 2px 4px;
  border-radius: 2px;
}

.log-info {
  background-color: #e6f7ff;
}

.log-warning {
  background-color: #fff7e6;
}

.log-error {
  background-color: #ffe6e6;
}

.breeze {
  color: #3273a8;
}

.stench {
  color: #a83232;
}
</style>
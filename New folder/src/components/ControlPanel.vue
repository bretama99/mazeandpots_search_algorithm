<template>
  <div class="control-container">
    <div class="panel-header">
      <i class="fas fa-brain"></i> {{ formalismName }} Agent Control
    </div>
    
    <div class="tabs">
      <button 
        @click="$emit('set-active-tab', 'kb')" 
        :class="['tab-button', { active: activeTab === 'kb' }]"
      >
        <i class="fas fa-database"></i> Knowledge Base
      </button>
      <button 
        @click="$emit('set-active-tab', 'logs')" 
        :class="['tab-button', { active: activeTab === 'logs' }]"
      >
        <i class="fas fa-list"></i> Agent Logs
      </button>
      <button 
        @click="$emit('set-active-tab', 'controls')" 
        :class="['tab-button', { active: activeTab === 'controls' }]"
      >
        <i class="fas fa-gamepad"></i> Manual Controls
      </button>
    </div>
    
    <div class="percept-panel">
      <div class="percept-title">Current Percepts:</div>
      <div class="percept-icons">
        <div v-if="percepts.breeze" class="percept breeze">B</div>
        <div v-if="percepts.stench" class="percept stench">S</div>
        <div v-if="percepts.glitter" class="percept glitter"><i class="fas fa-coins"></i></div>
        <div v-if="!percepts.breeze && !percepts.stench && !percepts.glitter" class="percept none">None</div>
      </div>
    </div>
    
    <div class="tab-content">
      <!-- Knowledge Base Tab -->
      <div v-if="activeTab === 'kb'" class="kb-container">
        <div class="kb-scroll">
          <div v-for="(fact, index) in knowledgeBase" :key="'kb-' + index" class="kb-fact">
            {{ fact }}
          </div>
        </div>
        <div class="toggle-probabilities">
          <button @click="$emit('toggle-probabilities')" class="toggle-btn">
            <i class="fas" :class="isShowingProbabilities ? 'fa-toggle-on' : 'fa-toggle-off'"></i>
            Show Probabilities
          </button>
        </div>
      </div>
      
      <!-- Logs Tab -->
      <div v-if="activeTab === 'logs'" class="logs-container">
        <div class="logs-scroll">
          <div v-for="(log, index) in logs" :key="'log-' + index" :class="['log-entry', log.type]">
            <span class="log-time">{{ log.timestamp || '00:00:00' }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
      
      <!-- Controls Tab -->
      <div v-if="activeTab === 'controls'" class="controls-container">
        <div class="status-panel">
          <div>Position: ({{ robotPosition.x }}, {{ robotPosition.y }})</div>
          <div>Deaths: {{ robotDeaths }}</div>
          <div>Status: <span :class="gameOver ? 'status-game-over' : ''">{{ gameStatus }}</span></div>
        </div>
        
        <div class="movement-controls">
          <div class="move-row">
            <div></div>
            <button @click="$emit('move-robot', 'up')" :disabled="!canMove('up') || gameOver || autoMode" class="move-btn">
              <i class="fas fa-arrow-up"></i>
            </button>
            <div></div>
          </div>
          <div class="move-row">
            <button @click="$emit('move-robot', 'left')" :disabled="!canMove('left') || gameOver || autoMode" class="move-btn">
              <i class="fas fa-arrow-left"></i>
            </button>
            <div class="robot-indicator">
              <i class="fas fa-robot"></i>
            </div>
            <button @click="$emit('move-robot', 'right')" :disabled="!canMove('right') || gameOver || autoMode" class="move-btn">
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <div class="move-row">
            <div></div>
            <button @click="$emit('move-robot', 'down')" :disabled="!canMove('down') || gameOver || autoMode" class="move-btn">
              <i class="fas fa-arrow-down"></i>
            </button>
            <div></div>
          </div>
        </div>
        
        <div class="auto-controls">
          <div v-if="autoMode" class="auto-status active">Automatic Mode Active</div>
          <div v-else class="auto-status">Manual Mode</div>
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
    canMove: Function,
    autoMode: Boolean
  },
  emits: ['move-robot', 'toggle-probabilities', 'set-active-tab']
};
</script>

<style scoped>
.control-container {
  flex: 1;
  min-width: 400px;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  text-align: center;
  margin-bottom: 15px;
  font-weight: bold;
  font-size: 1.2rem;
  color: #3273a8;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.tab-button {
  flex: 1;
  padding: 10px;
  background-color: #f0f4f8;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tab-button.active {
  background-color: #3273a8;
  color: white;
}

.tab-button:hover {
  background-color: #d9e6f2;
}

.tab-button.active:hover {
  background-color: #2c64a0;
}

.percept-panel {
  margin-bottom: 15px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.percept-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #2c3e50;
}

.percept-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.percept {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.breeze {
  background-color: #e3f2fd;
  color: #0099cc;
}

.stench {
  background-color: #f3e5f5;
  color: #8e44ad;
}

.glitter {
  background-color: #fff8e1;
  color: #d6af36;
}

.none {
  background-color: #f5f5f5;
  color: #757575;
}

.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  overflow: hidden;
}

.kb-container, .logs-container, .controls-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.kb-scroll, .logs-scroll {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: white;
  padding: 10px;
  margin-bottom: 10px;
}

.kb-fact {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  font-family: monospace;
  font-size: 14px;
}

.log-entry {
  padding: 8px;
  margin-bottom: 6px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  gap: 10px;
}

.log-time {
  color: #757575;
  font-size: 12px;
  white-space: nowrap;
}

.log-message {
  flex: 1;
}

.info {
  background-color: #e3f2fd;
}

.warning {
  background-color: #fff8e1;
}

.error {
  background-color: #ffebee;
}

.success {
  background-color: #e8f5e9;
}

.toggle-probabilities {
  display: flex;
  justify-content: center;
}

.toggle-btn {
  padding: 6px 12px;
  background-color: #3273a8;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
  font-size: 13px;
}

.toggle-btn:hover {
  background-color: #2c64a0;
}

.status-panel {
  background-color: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  font-weight: bold;
}

.status-game-over {
  color: #a83232;
}

.movement-controls {
  display: grid;
  grid-template-rows: repeat(3, 60px);
  max-width: 220px;
  margin: 0 auto 20px;
}

.move-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.move-btn {
  height: 100%;
  width: 100%;
  background-color: #3273a8;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.move-btn:hover:not(:disabled) {
  background-color: #2c64a0;
  transform: translateY(-2px);
}

.move-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.robot-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #3273a8;
}

.auto-controls {
  margin-top: auto;
  padding-top: 15px;
  text-align: center;
}

.auto-status {
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  background-color: #f5f5f5;
}

.auto-status.active {
  background-color: #e8f5e9;
  color: #2e7d32;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { background-color: #e8f5e9; }
  50% { background-color: #c8e6c9; }
  100% { background-color: #e8f5e9; }
}
</style>
<template>
  <div class="documentation">
    <div class="docs-header">
      <div class="docs-icon"><i class="fas fa-book"></i></div>
      <h2>Quick Guide</h2>
    </div>
    
    <div class="docs-content">
      <div class="docs-section">
        <h3><i class="fas fa-info-circle"></i> About Wumpus World</h3>
        <ul>
          <li>The agent navigates a 4×4 grid containing hazards (Wumpus and pits)</li>
          <li>The agent perceives <span class="stench">Stench</span> near Wumpus and <span class="breeze">Breeze</span> near pits</li>
          <li>Goal: Navigate safely using logical reasoning and avoid hazards</li>
          <li>When a robot dies, a new one starts with previous knowledge</li>
        </ul>
      </div>
      
      <div class="docs-section">
        <h3><i class="fas fa-gamepad"></i> How to Play</h3>
        <ul>
          <li>Use directional buttons or "Make Best Move" to navigate</li>
          <li>"Find Safe Moves" shows logical deductions of safe positions</li>
          <li>The agent learns from both percepts and deaths</li>
          <li>Green border = safe, red border = unsafe, yellow = uncertain</li>
        </ul>
      </div>
      
      <div class="docs-section">
        <h3><i class="fas fa-cogs"></i> Logic Formalisms</h3>
        <ul>
          <li><strong>First-Order Logic (FOL):</strong> Uses logical predicates with universal quantifiers</li>
          <li><strong>Answer Set Programming (ASP):</strong> Uses rules and constraints for non-monotonic reasoning</li>
          <li>Both combine with probabilistic learning from experience</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentationGuide'
};
</script>

<style scoped>
.documentation {
  flex: 1;
  min-width: 300px;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  max-width: 350px;
  height: 80%;
}

.docs-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.docs-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.docs-icon {
  font-size: 24px;
  color: #3273a8;
}

h2 {
  margin-top: 0;
  color: #3273a8;
  font-size: 1.5rem;
  border-bottom: 2px solid #e6f7ff;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.docs-section > h3 {
  color: #3273a8;
  border-bottom: 1px solid #e6f7ff;
  padding-bottom: 5px;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.docs-section > ul {
  padding-left: 20px;
}

.docs-section > ul > li {
  margin-bottom: 5px;
}

.stench {
  color: #a83232;
}

.breeze {
  color: #3273a8;
}
</style>
<template>
  <div class="doc-container" v-if="showDocs">
    <div class="doc-header">
      <h2><i class="fas fa-book"></i> Wumpus World Guide</h2>
      <button @click="showDocs = false" class="close-btn"><i class="fas fa-times"></i></button>
    </div>
    
    <div class="doc-content">
      <div class="doc-section">
        <h3>What is Wumpus World?</h3>
        <p>
          Wumpus World is a classic AI problem used to teach logical reasoning and knowledge representation. 
          It features an agent navigating a grid-based world with hazards like pits and a monster called the Wumpus.
        </p>
      </div>
      
      <div class="doc-section">
        <h3>Game Elements</h3>
        <ul>
          <li><b>Agent</b>: Your robot explorer, starting at position (1,1)</li>
          <li><b>Wumpus</b>: A monster that kills the agent if they enter the same cell</li>
          <li><b>Pits</b>: Holes that the agent falls into if entered</li>
          <li><b>Gold</b>: The treasure the agent is seeking</li>
          <li><b>Breeze (B)</b>: Felt in cells adjacent to pits</li>
          <li><b>Stench (S)</b>: Smelled in cells adjacent to the Wumpus</li>
          <li><b>Glitter</b>: Seen in cells with gold</li>
        </ul>
      </div>
      
      <div class="doc-section">
        <h3>Multi-Agent Learning</h3>
        <p>
          In this implementation, the agent is a "technological master of puppets" that remotely guides robots.
          When a robot dies, a new robot starts from the bottom-left tile (1,1), but retains all knowledge
          from previous robots. This allows for accumulated learning across multiple attempts.
        </p>
      </div>
      
      <div class="doc-section">
        <h3>Logical Formalisms</h3>
        <div class="logic-options">
          <div class="logic-option">
            <h4>Propositional Logic</h4>
            <p>
              Uses boolean propositions to represent specific facts about the world:
              <code>Pit(1,2)</code>, <code>Wumpus(3,3)</code>, <code>¬Safe(2,1)</code>
            </p>
            <p>
              Good for encoding specific percepts and immediate inferences 
              but less flexible for general rules.
            </p>
          </div>
          
          <div class="logic-option">
            <h4>First-Order Logic (FOL)</h4>
            <p>
              Extends propositional logic with variables, quantifiers, and predicates:
              <code>∀x,y: Safe(x,y) ↔ ¬Wumpus(x,y) ∧ ¬Pit(x,y)</code>
            </p>
            <p>
              More powerful for expressing general rules and relationships across 
              the entire grid.
            </p>
          </div>
        </div>
      </div>
      
      <div class="doc-section">
        <h3>Probabilistic Reasoning</h3>
        <p>
          When logical certainty isn't possible, the agent uses Bayesian probability to estimate 
          the likelihood of squares being safe. It updates probabilities based on:
        </p>
        <ul>
          <li>Initial prior probabilities (e.g. 20% chance of pit in unknown cells)</li>
          <li>Percepts (breeze near pits, stench near Wumpus)</li>
          <li>Knowledge gained from robot deaths</li>
        </ul>
        <p>
          Toggle "Show Probabilities" to visualize safety estimates for each cell.
        </p>
      </div>
      
      <div class="doc-section">
        <h3>Agent Decision Making</h3>
        <ul>
          <li><b>Safe cells</b>: The agent prefers to move to unvisited safe cells</li>
          <li><b>Probabilistic exploration</b>: When no guaranteed safe unvisited cells exist, the agent chooses cells with the highest safety probability</li>
          <li><b>Knowledge transfer</b>: New robots benefit from the discoveries and deaths of previous robots</li>
        </ul>
      </div>
    </div>
    
    <div class="doc-footer">
      <button @click="showDocs = false" class="close-btn-bottom">Close Guide</button>
    </div>
  </div>
  <div v-else class="show-doc-button">
    <button @click="showDocs = true"><i class="fas fa-question-circle"></i> Show Guide</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'DocumentationGuide',
  setup() {
    const showDocs = ref(true);
    
    return {
      showDocs
    };
  }
};
</script>

<style scoped>
.doc-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  width: 100%;
  overflow: hidden;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.doc-header {
  padding: 15px 20px;
  background-color: #3273a8;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.doc-header h2 {
  margin: 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn, .close-btn-bottom {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-btn:hover, .close-btn-bottom:hover {
  transform: scale(1.1);
}

.doc-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.doc-section {
  margin-bottom: 20px;
}

.doc-section h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1rem;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 5px;
}

.doc-section p {
  margin: 10px 0;
  line-height: 1.5;
  color: #333;
}

.doc-section ul {
  padding-left: 20px;
}

.doc-section li {
  margin-bottom: 6px;
  line-height: 1.5;
}

.logic-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 10px;
}

.logic-option {
  flex: 1;
  min-width: 250px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #3273a8;
}

.logic-option h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #3273a8;
}

.logic-option code {
  background-color: #e9ecef;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

.doc-footer {
  padding: 10px 20px;
  background-color: #f8f9fa;
  text-align: center;
}

.close-btn-bottom {
  background-color: #3273a8;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
}

.show-doc-button {
  margin-bottom: 20px;
  text-align: center;
}

.show-doc-button button {
  background-color: #3273a8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.show-doc-button button:hover {
  background-color: #2c64a0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
</style>
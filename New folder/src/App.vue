<!-- src/App.vue -->
<template>
  <div id="app">
    <nav class="main-nav">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">Intelligent  Agents</router-link>
        <div class="nav-links">
                    <router-link to="/wumpus">Logic
Formalisms</router-link>
          <router-link to="/maze">Maze Solver</router-link>
          <router-link to="/pots">Pots Solver</router-link>

        </div>
      </div>
    </nav>
    
    <router-view/>
    
    <footer class="main-footer">
      <p>Created by Dream Team</p>
    </footer>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-nav {
  background-color: #2c3e50;
  color: white;
  padding: 15px 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-links a:hover, .nav-links a.router-link-active {
  background-color: rgba(255,255,255,0.2);
}

.main-footer {
  margin-top: auto;
  background-color: #f8f9fa;
  padding: 15px;
  text-align: center;
  color: #666;
}

router-view {
  flex: 1;
}
</style>
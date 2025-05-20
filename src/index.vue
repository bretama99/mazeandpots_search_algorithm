<template>
  <div id="app">
    <app />
  </div>
</template>

<script>
import App from './App.vue';

export default {
  name: 'Index',
  components: {
    App
  },
};
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  color: #333;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* Global styles */
button {
  cursor: pointer;
}

button:focus {
  outline: none;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
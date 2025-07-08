<template>
  <div class="app">
    <RouterLink to="/other">other</RouterLink>
    <RouterView />
  </div>
</template>
<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>
<style scoped>
.app {
  width: 100%;
  height: 100%;
}
</style>

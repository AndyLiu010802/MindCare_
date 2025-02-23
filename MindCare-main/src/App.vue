<script setup></script>

<template>
  <div
    v-if="isOffline"
    style="
      background-color: red;
      opacity: 0.6;
      width: 100%;
      height: 20hv;
      color: white;
      font-weight: bold;
      display: flex;
      justify-content: center;
    "
  >
    <p>You are offline!</p>
  </div>
  <router-view></router-view>
</template>

<script>
export default {
  data() {
    return {
      isOffline: !navigator.onLine
    }
  },
  created() {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  methods: {
    updateOnlineStatus() {
      this.isOffline = !navigator.onLine
    }
  }
}
</script>

<style scoped></style>

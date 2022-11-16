<template>
  <div class="v-layout-full-page">
    <router-view :key="$route.fullPath"></router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="less" scoped>
  .v-layout-full-page {
    height: 100%;
  }
</style>

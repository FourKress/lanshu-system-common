<template>
  <el-dropdown
    class="v-more-dropdown"
    @command="handler">
    <span class="el-dropdown-link">
      {{title}}<i class="el-icon-arrow-down el-icon--right"></i>
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item
        v-for="(menu, index) in menus"
        :command="menu.value"
        :key="index">{{menu.label}}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    title: {
      type: String,
      default: '更多',
    },
    menus: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    handler(command) {
      this.$emit('click', command);
    },
  },
};
</script>

<style lang="less" scoped>
  .v-more-dropdown {
    .el-dropdown-link{
      font-size: 12px;
      color: #5A8DEE;
      cursor: pointer;
    }
  }
</style>

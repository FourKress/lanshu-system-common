<template>
  <el-container class="frame-view">
    <el-header height="40px">
      <v-bread-crumb v-if="showCrumb" class="v-page-view-crumb" v-bind="$attrs"></v-bread-crumb>
    </el-header>
    <el-container>
      <el-aside width="258px" class="frame-aside">
        <slot name="aside"></slot>
      </el-aside>
      <el-main class="frame-main">
        <slot name="main"></slot>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  props: {
    showCrumb: {
      type: Boolean,
      default: true,
    },
  },
};
</script>
<style lang="less" scoped>
.frame-view {
  height: 100%;
  .el-container {
    height: calc(100% - 50px);
    padding: 16px;
  }
  .frame-aside {
    width: 250px;
    height: 100%;
    background: white;
    box-shadow: 0px 0px 6px 0px rgba(71, 95, 123, 0.12);
    border-radius: 4px;
    margin-right: 8px;
  }
  .frame-main {
    width: 1422px;
    // height: 974px;
    height: 100%;
    background: white;
    box-shadow: 0px 0px 6px 0px rgba(71, 95, 123, 0.12);
    border-radius: 4px;
    padding: 16px;
  }
  .v-page-view-crumb {
    height: 40px;
    padding: 0 16px;
    background-color: #fff;
  }
  /deep/.el-header {
    padding: 0;
  }
}
</style>

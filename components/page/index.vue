<template>
  <div class="v-pagination">
    <el-pagination
      class="v-page"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="page.current"
      :page-size.sync="page.size"
      :total="page.total"
      :page-sizes="pageSizeArr"
      :layout="layout"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    page: {
      type: Object,
      default: () => {
        return {
          current: 1,
          size: 20,
          total: 100,
        };
      },
    },
    pageType: {
      type: String,
      default: 'all',
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper',
    },
    pageSizeArr: {
      type: Array,
      default: () => {
        return [20, 40, 60, 100];
      },
    },
  },
  methods: {
    handleSizeChange: _.debounce(function () {
      this.$emit('changePage', { ...this.page, current: 1 });
    }),
    handleCurrentChange: _.debounce(function () {
      if (this.page.size <= this.page.total) this.$emit('changePage', this.page);
    }),
  },
};
</script>

<style lang="less" scoped>
.v-pagination {
  background-color: #ffffff;
  width: 100%;
  color: #304156;
  /deep/ button {
    height: 28px;
    line-height: 28px;
  }
  /deep/ span:not([class*='suffix']) {
    height: 28px;
    line-height: 28px;
  }
  /deep/ .el-pager li {
    height: 28px;
    line-height: 28px;
  }
}
</style>

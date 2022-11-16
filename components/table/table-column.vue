<template>
  <el-table-column
    :class-name="_column.rowClassName"
    :resizable="resizable"
    :label-class-name="_column.labelClassName"
    :label="_column.label"
    :fixed="_column.fixed"
    :fit="_column.fit"
    :prop="_column.key"
    :show-overflow-tooltip="_column.tooltip"
    :sortable="_column.sortable"
    :min-width="_column.minWidth"
    :align="getAlign(_column)"
    :sort-method="_column.sortMethod"
    :width="_column.width"
  >
    <template slot="header">
      <span class="filter-header-label">
        <Expand
          v-if="_column.headerRender"
          :render="_column.headerRender"
        ></Expand>
        <label v-else>{{ _column.label }}</label>
      </span>
    </template>
    <template slot="default" slot-scope="scope">
      <!-- render优先级最高 -->
      <Expand
        v-if="_column.render"
        fillEmpty
        :row="scope.row"
        :render="_column.render"
        :index="scope.$index"
      ></Expand>
      <template v-else-if="_column.type === 'operation'">
        <table-operation :row="scope" :column="_column"></table-operation>
      </template>
      <template v-else>
        <span :class="getStatusClass(scope.row, _column, scope.$index)">{{
          renderContent(scope.row, _column, scope.$index)
        }}</span>
      </template>
    </template>
  </el-table-column>
</template>

<script>
import _ from "lodash";
import { isNull, renderContent } from "../../utils";
import * as utils from "./utils";
import Expand from "./expand";
import TableOperation from "./table-opteration";

export default {
  components: {
    Expand,
    TableOperation,
  },
  data() {
    return {};
  },
  props: {
    column: Object,
    emptyPlaceholder: String,
    resizable: { 
      type: Boolean, 
      default: false 
    },
  },
  computed: {
    _column() {
      const { column } = this;
      const { fixed, tooltip } = column;
      return {
        ...column,
        tooltip: this.setPropDefaultValue(tooltip, true),
        fixed: this.setPropDefaultValue(fixed, false),
        labelClassName: this.computedLabelClassNames(),
      };
    },
  },
  methods: {
    ...utils,
    renderContent,
    /**
     * 设置缺省值
     * */
    setPropDefaultValue(value, defaultValue) {
      return isNull(value) ? defaultValue : value;
    },
    /**
     * 设置labelClass
     * */
    computedLabelClassNames() {
      const { labelClassName, textType } = this.column;
      const classArr = [labelClassName];
      if (textType === "money") classArr.push("v-table-text-right");
      return classArr.join(" ");
    },
    handleTableOperation(value, row) {
      this.handler(value, row);
    },
  },
};
</script>

<style lang="less" scoped>
.table-column {
}
</style>

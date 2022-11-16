<template>
  <div class="v-table-warp" :style="getTableStyles()">
    <el-table
      v-if="refreshTable"
      :key="tableKey"
      ref="table"
      class="v-table-common"
      tooltip-effect="dark"
      :height="tableHeight"
      :row-key="rowKey"
      :data="tableList"
      :border="border"
      @header-dragend="headerDragend"
      :row-style="rowStyle"
      :cell-class-name="cellClassName"
      :header-cell-class-name="headerCellClassName"
      :default-expand-all="defaultExpandAll"
      :expand-row-keys="expandRowKeys"
      :tree-props="treeProps"
      :span-method="spanMethod"
      :indent="indent"
      :lazy="lazy"
      :load="load"
      v-bind="$attrs"
      v-on="$listeners"
      :summary-method="getSummaryMethod"
      @sort-change="sortChange"
      @select-all="selectAll"
      @selection-change="selectionChange"
      @select="handleSelect"
      @mousewheel.native="wheel"
    >
      <template v-for="column in selfColumns">
        <template v-if="showColumn(column)">
          <!--type = ['selection', 'index', 'expand']-->
          <el-table-column
            v-if="getColumnType(column)"
            :resizable="resizable"
            :type="column.type"
            :key="column.key"
            :class-name="column.rowClassName"
            :label-class-name="column.labelClassName"
            :label="column.label"
            :fixed="column.fixed"
            :prop="column.key"
            :show-overflow-tooltip="column.tooltip"
            :sortable="column.sortable"
            :min-width="column.minWidth"
            :align="getAlign(column)"
            :sort-method="column.sortMethod"
            :selectable="column.selectable"
            :width="column.width"
          ></el-table-column>
          <!--type = ['slot']-->
          <el-table-column
            v-else-if="column.type === 'slot'"
            :resizable="resizable"
            :key="column.key"
            :class-name="column.rowClassName"
            :label-class-name="column.labelClassName"
            :label="column.label"
            :fixed="column.fixed"
            :prop="column.key"
            :show-overflow-tooltip="column.tooltip"
            :sortable="column.sortable"
            :min-width="column.minWidth"
            :align="getAlign(column)"
            :sort-method="column.sortMethod"
            :width="column.width"
          >
            <template slot-scope="scope" v-if="column.type === 'slot'">
              <slot :name="column.key" :data="scope">
                {{ renderContent(scope.row, column) }}
              </slot>
            </template>
          </el-table-column>
          <!--nested 嵌套-->
          <el-table-column
            v-else-if="column.type === 'nested'"
            :width="column.width"
            :label="column.label"
            :fixed="column.fixed"
            :key="column.key"
            :class-name="column.rowClassName"
            :label-class-name="column.labelClassName"
            :min-width="column.minWidth"
            :align="getAlign(column)"
          >
            <template slot="header" slot-scope="scope">
              <span class="filter-header-label">
                <Expand
                  v-if="column.headerRender"
                  :row="scope.row"
                  :render="column.headerRender"
                ></Expand>
                <label v-else>{{ column.label }}</label>
              </span>
            </template>
            <el-table-column
              v-for="columnChild in column.nestedList"
              :key="columnChild.key"
              :class-name="columnChild.rowClassName"
              :resizable="resizable"
              :label-class-name="columnChild.labelClassName"
              :label="columnChild.label"
              :fixed="columnChild.fixed"
              :prop="columnChild.key"
              :show-overflow-tooltip="columnChild.tooltip"
              :sortable="columnChild.sortable"
              :min-width="columnChild.minWidth"
              :align="getAlign(columnChild)"
              :sort-method="columnChild.sortMethod"
              :width="columnChild.width"
            >
              <template slot="default" slot-scope="scope">
                <!-- render优先级最高 -->
                <Expand
                  v-if="columnChild.render"
                  :row="scope.row"
                  :render="columnChild.render"
                  :index="scope.$index"
                ></Expand>
                <template v-else-if="columnChild.type === 'operation'">
                  <table-operation
                    :row="scope"
                    :column="columnChild"
                  ></table-operation>
                </template>
                <template v-else>
                  <span
                    :class="
                      getStatusClass(scope.row, columnChild, scope.$index)
                    "
                  >
                    {{ renderContent(scope.row, columnChild, scope.$index) }}
                  </span>
                </template>
              </template>
            </el-table-column>
          </el-table-column>
          <table-column
            v-else
            :resizable="resizable"
            :key="column.key"
            :column="column"
            :tooltips="tooltips"
          ></table-column>
        </template>
      </template>
      <template slot="append">
        <slot name="append"></slot>
      </template>
    </el-table>
    <!--    <filter-header-->
    <!--      v-if="hasFilterHeader"-->
    <!--      class="v-table-filter-header-container"-->
    <!--      @change="changeFilterHeader"-->
    <!--      @changeColumn="changeColumn"-->
    <!--      :tableList="selfColumnsNotHide"-->
    <!--      :data="tableList"-->
    <!--    />-->
  </div>
</template>

<script>
import Expand from './expand';
import TableColumn from './table-column';
import FilterHeader from './filter-header';
import * as utils from './utils';
import {
  isEmpty,
  isNull,
  renderContent,
  DEFAULT_PLACEHOLDER,
  formatMoney,
  getDeepValue,
} from '../../utils';
import { mapActions, mapGetters } from 'vuex';
import _ from 'lodash';

const COLUMN_TYPE = ['selection', 'index', 'expand'];

export default {
  components: {
    Expand,
    TableColumn,
    FilterHeader,
  },
  data() {
    return {
      tooltips: false,
      tableHeight: undefined,
      checkedColumn: [],
      selfColumns: [],
      hasFilterHeader: false,
      tableKey: new Date().getTime(), // 为了强制重绘table
      showCounter: 99999,
      refreshTable: true,
      filterNum: 10,
      defaultExpandAllOrigin: false, // 用于判断当前展开是否变化
    };
  },
  props: {
    selectable: {
      type: Function,
      default: null,
    },
    tableList: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      default: () => [],
    },
    tableStyle: {
      type: [String, Object],
    },
    rowKey: [Function, String],
    expandRowKeys: Array,
    defaultExpandAll: {
      type: Boolean,
    },
    treeProps: Object,
    cellClassName: String,
    headerCellClassName: String,
    border: {
      type: Boolean,
      default: true,
    },
    rowStyle: Function,
    spanMethod: Function,
    indent: Number,
    lazy: Boolean,
    load: Function,
    height: [Number, String],
    resizable: {
      type: Boolean,
      default: true,
    },
    cacheId: [String, Number],
    filterHeader: {
      type: Boolean,
      default: true,
    },
    fixedColumnWidth: {
      type: Boolean,
      default: true,
    },
  },
  created() {
    if (this.columns?.length >= this.filterNum && this.filterHeader) {
      this.hasFilterHeader = true;
    }
    this.computedTableHeight();
    this.initCache();
    this.defaultExpandAllOrigin = this.defaultExpandAll;
    this.combineCheckedColumn = this.checkedColumn;
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.tooltips = true;
      }, 10);
    });
  },
  computed: {
    ...mapGetters('global', ['cacheIds']),
    selfColumnsNotHide() {
      return this.selfColumns.filter((d) => this.isShow(d));
    },
  },
  watch: {
    height() {
      this.computedTableHeight();
    },
    columns: {
      handler(value) {
        if (value.length >= this.filterNum && this.filterHeader) {
          this.hasFilterHeader = true;
        }
        this.updateColumns();
      },
      deep: true,
      immediate: true,
    },
    checkedColumn: {
      handler(value) {
        if (
          value?.length > 0 &&
          this.columns.find((item) => item.key === 'action')
        ) {
          this.combineCheckedColumn = this.checkedColumn.concat(['action']);
        } else {
          this.combineCheckedColumn = this.checkedColumn;
        }
        if (this.hasFilterHeader) this.updateColumns();
        this.$emit('customizeColumns', value || []);
      },
      deep: true,
      immediate: true,
    },
    tableList(value) {
      if (value && this.defaultExpandAllOrigin !== this.defaultExpandAll) {
        this.refreshTable = false;
        this.defaultExpandAllOrigin = this.defaultExpandAll;
        this.$nextTick(() => {
          this.refreshTable = true;
        });
      }
    },
    cacheId: {
      handler() {
        if (!isEmpty(this.cacheId)) {
          const newCache = this.cacheIds;
          newCache[this.$route.path] = this.cacheId;
          this.setCache(newCache);
        }
        this.initCache();
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('global', ['setCache']),
    ...utils,
    renderContent,
    initCache() {
      // if (this.hasFilterHeader) {
      if (false) {
        const { cacheId } = this;
        const cacheKey = `${this.$route?.path}${
          isNull(cacheId) ? '' : cacheId
        }`;
        this.checkedColumn = utils.getCache(cacheKey);
      }
    },
    isShow(column, key = 'hide') {
      if (column) {
        const hide = column[key];
        if (typeof hide === 'function') return !hide(this.tableList);
        return isEmpty(hide) ? true : !hide;
      }
      return false;
    },
    // 内置的计算表格高度的方法
    computedTableHeight() {
      const { height } = this;
      if (isNaN(height)) {
        this.tableHeight = height;
      } else if (height > 0) {
        this.tableHeight = `${height}px`;
      } else if (height < 0) {
        this.tableHeight = `${
          document.documentElement.clientHeight + height
        }px`;
      }
    },
    sortChange(data) {
      const { order, prop } = data;
      const ascMap = {
        ascending: true,
        descending: false,
      };
      const column = this.selfColumns.filter((item) => item.key === prop);
      this.$emit(
        'sortChange',
        {
          orders: [
            {
              column:
                column[0].sortKey?.replace('.label', '') ||
                prop?.replace('.label', ''),
              asc: ascMap[order],
            },
          ],
        },
        column,
      );
    },
    // 选中所有
    selectAll(checkList) {
      this.$emit('selectChange', checkList);
    },
    /**
     * 暴露el-table的selection-change事件
     */
    selectionChange(selection) {
      const selectionColumn = this.selfColumns.find(
        (d) => d.type === 'selection',
      );
      if (selection.length !== this.tableList.length) {
        selectionColumn.labelClassName = 'is-indeterminate';
      } else {
        selectionColumn.labelClassName = '';
      }
      this.$emit('selectionChange', selection);
    },
    handleSelect(checkList, row) {
      this.$emit('handleSelect', checkList, row);
    },
    // 对有type的特殊处理
    getColumnType({ type }) {
      return type && COLUMN_TYPE.includes(type);
    },
    // 计算样式
    getTableStyles() {
      return {};
    },
    changeFilterHeader(value) {
      this.checkedColumn = [...value];
    },
    changeColumn(columns) {
      this.selfColumns = _.cloneDeep(columns.map((column) => column.column));
    },
    updateColumns() {
      this.$nextTick(() => {
        const newColumns = this.sortColumns(
          this.columns,
          this.combineCheckedColumn,
        );

        this.selfColumns = this.fixedColumnAttrs(
          newColumns,
          this.fixedColumnWidth,
        );
        this.tableKey = new Date().getTime();
      });
    },
    /**
     * 对column的宽度做重置：当所有要显示的column都有width并且之和小于显示区域, 则去掉第一个column的width
     * */
    fixedColumnAttrs(columns, fixedColumnWidth) {
      if (!fixedColumnWidth || !this.hasFilterHeader) return columns;
      const filterColumns = columns.filter(
        (column) =>
          this.showColumn(column) && !COLUMN_TYPE.includes(column.type),
      );
      const withWidthColumns = filterColumns.filter(
        (column) =>
          column.width > 0 ||
          (!isEmpty(column.width) &&
            typeof column.width === 'string' &&
            column.width?.endsWith('px')),
      );

      if (filterColumns.length === withWidthColumns.length) {
        const totalWidth = withWidthColumns.reduce((acc, column) => {
          return acc + Number(column.width);
        }, 0);
        const wrapWidth = this.$refs.table?.$el?.clientWidth;

        if (totalWidth < wrapWidth) {
          // width之和小于显示区域 去掉第一个可用column的width
          columns.some((column) => {
            if (this.showColumn(column) && !COLUMN_TYPE.includes(column.type)) {
              column.width = '';

              return true;
            }
          });
        }
      }

      return columns;
    },
    /**
     * 对columns进行排序，主要根据filterColumn来做
     * */
    sortColumns(columns, sortList) {
      if (isEmpty(sortList) || !Array.isArray(sortList)) return columns;
      let counter = 0;
      const newColumns = _.cloneDeep(columns).map((column, index) => {
        const { key } = column;
        const sort =
          key && sortList.indexOf(key) !== -1 ? sortList.indexOf(key) : -1;
        const showColumn = this.showColumn(column);
        if (showColumn) counter += 1;
        if (sort === -1) {
          return {
            ...column,
            _index: index,
          };
        }
        return {
          ...column,
          _index: sort,
        };
      });
      this.showCounter = counter;
      return newColumns.sort((pre, nxt) => pre._index - nxt._index);
    },
    showColumn(column) {
      if (!this.isShow(column, 'hide')) return false;
      const isVisible = this.isShow(column, 'visible');
      if (!this.hasFilterHeader) {
        return isVisible;
      }
      const { key, type, notFilter } = column;
      const { combineCheckedColumn } = this;
      if (
        notFilter ||
        COLUMN_TYPE.includes(type) ||
        isEmpty(combineCheckedColumn)
      )
        return isVisible;
      if (combineCheckedColumn.length > 0)
        return (
          combineCheckedColumn.includes(key) ||
          isEmpty(key) ||
          ['action', 'handle', 'handler'].includes(key)
        );
      return isVisible;
    },
    resizeTable() {
      this.$nextTick(() => {
        this.$refs.table?.doLayout();
      });
    },
    wheel() {
      if (document.querySelector('div[role="tooltip"]')) {
        let pops = this.$refs.table.$el.querySelectorAll(
          'span[aria-describedby]',
        );
        let ids = Array.prototype.map.call(pops, (d) => {
          return d.getAttribute('aria-describedby');
        });
        ids.map((d) => {
          const pop = document.getElementById(d);
          if (pop?.style.display !== 'none') {
            document.body.click();
          }
        });
      }
    },
    //表格行高度变化时，fix定位的列可能无法自动适配，此方法在拖拽改变列宽时重排表格单元格
    headerDragend(newWidth, oldWidth, column) {
      this.selfColumns.forEach((item, i) => {
        if (item.label === column.label && !this.selfColumns[i].width) {
          this.selfColumns[i].width = newWidth; //解决没有设置width时无法触发tooltips的问题
          this.tableKey = new Date().getTime();
        }
      });
      this.$refs.table.doLayout();
    },
    // 获取合计
    getSummaryMethod(params) {
      if (![undefined, false, 0].includes(this.$attrs.showSummary)) {
        const { columns, data } = params;
        const sums = [];
        columns.map((d, i) => {
          const key = d.property?.replace(/\-.{1,}$/g, '');
          const column = this.columns.find((d) => d.key === key);
          const findObj = data.find((dd) => getDeepValue(dd, key, ''));
          const findValue = getDeepValue(findObj, key);
          if (i === 0) {
            sums.push(this.$attrs['sum-text'] || this.$attrs.sumText || '合计');
          } else if (['checkbox'].includes(d.type) || isEmpty(d.property)) {
            sums.push('');
          } else if (
            !/号码$/g.test(d.label || '') &&
            !(column && [false, 0].includes(column.summary)) &&
            !/(Code|Account|Ratio|No|account|remark|Id|Name|Number|Count|Bank|bank)$/g.test(
              key,
            ) &&
            findObj &&
            /\d+/g.test(findValue) &&
            !/((^(\d+\-))|\:|[\u4e00-\u9fa5])/g.test(findValue) &&
            !data.find((dd) => isEmpty(getDeepValue(dd, key, 0)))
          ) {
            let total = _.sum(
              data.map((dd) => {
                let value = getDeepValue(dd, key, 0);
                value =
                  typeof value === 'string'
                    ? value.replace(/(,|\.00)/g, '')
                    : value;
                return Number(value);
              }),
            );
            const fixString = JSON.stringify(
              data.find((dd) => !isEmpty(getDeepValue(dd, key, ''))),
            );
            const num = /\.(\d+)/g.exec(fixString)?.[1]?.length;
            sums.push(num > 0 ? formatMoney(total, num) : total);
          } else {
            sums.push(DEFAULT_PLACEHOLDER);
          }
        });
        return sums;
      }
      return [];
    },
  },
};
</script>

<style lang="less" scoped>
.v-table-warp {
  position: relative;
  /*height: 200px;*/
  /deep/.v-table-common {
    /*height: 100%;*/
  }
  .v-table-filter-header-container {
    position: absolute;
    z-index: 99;
    top: 0;
    right: 0;
  }
}
.filter-header-label {
  display: inline-block;
  line-height: 40px;
}
</style>

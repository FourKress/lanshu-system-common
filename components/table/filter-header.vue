<template>
  <div class="filter-header-warp">
    <el-tooltip
      effect="dark"
      content="自定义表格"
      placement="top-end"
    >
      <span
        @click="showDialog"
        class="morebtn-wrap"
      >
        <v-icon
          size="10"
          icon="icon-more"
        ></v-icon>
      </span>
    </el-tooltip>
    <v-dialog
      v-if="dialogVisible"
      class="filter-header-dialog"
      width="800px"
      top="80px"
      title="自定义表格显示字段"
      :visible="dialogVisible"
      @dialogSure="dialogSureDebounce"
      @close="closeDialog"
    >
      <div class="filter-dialog-content">
        <p class="filter-dialog-tips">
          列表已显示
          <span class="v-red">{{ checkList.length }}</span>个字段， 还剩
          <span class="v-red"> {{ allLen - checkList.length }} </span>个字段未显示
          <span class="tips-right">可进行拖拽排序</span>
        </p>
        <div class="filter-content-table">
          <table class="filter-table-header">
            <thead>
              <tr>
                <th
                  v-for="(column, i) in columns"
                  :key="i"
                  :width="column.width"
                >
                  {{ column.label }}
                </th>
              </tr>
            </thead>
          </table>
          <div class="table-key-container">
            <el-checkbox-group v-model="checkList">
              <native-base-table
                :tableList="tableData"
                :columns="columns"
                :draggable="true"
                @dragSortChange="dragSortChange"
              >
                <template
                  slot="checkbox"
                  slot-scope="{ data: { row } }"
                >
                  <el-checkbox :label="row.key"></el-checkbox>
                </template>
              </native-base-table>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script>
import { isEmpty, isNull } from '../../utils';
import { getCache, setCache } from './utils';
import NativeBaseTable from '../native-base-table';
import _ from 'lodash';
import { mapGetters } from 'vuex';

const COLUMN_TYPE = ['selection', 'index', 'expand'];

export default {
  components: {
    NativeBaseTable,
  },
  props: {
    tableList: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      a: [],
      dialogVisible: false,
      checkSureList: [],
      checkList: [],
      neTableData: [],
      drag: false,
      _tableList: [],
      columns: [
        {
          key: 'label',
          label: '字段名称',
          width: 450,
        },
        {
          type: 'slot',
          label: '是否显示',
          key: 'checkbox',
        },
        {
          width: 100,
          label: '序位',
          key: 'index',
          render: (h, { row, index }) => <span>{index + 1}</span>,
        },
      ],
      dialogSureDebounce: _.debounce(this.dialogSure, 100),
    };
  },
  created() {
    this._tableList = _.cloneDeep(this.tableList);

    // 设置more按钮的高度，使其在header居中
    setTimeout(() => {
      const tableEle = this.$parent.$refs.table?.$el;
      const tableHeaderElem = tableEle?.querySelector(
        '.el-table__header-wrapper',
      );
      const moreEle = this.$parent.$el.querySelector(
        '.v-table-filter-header-container',
      );
      let height = '0px';
      if (tableHeaderElem) {
        height = window.getComputedStyle(tableHeaderElem)?.height;
      }

      moreEle.style.height = height === '0px' || 'auto' ? '40px' : height;
    }, 500);
  },
  watch: {
    dialogVisible: {
      handler(value) {
        if (value) {
          this.getInitCheckedColumns();
        }
      },
      immediate: true,
    },
    tableList: {
      handler(value) {
        this._tableList = _.cloneDeep(value);
      },
      immediate: true,
    },
  },
  computed: {
    ...mapGetters('global', ['cacheIds']),
    // cacheKey() {
    //   const path = this.$route?.path;
    //   const cacheId = this.cacheIds[path];
    //   console.log(cacheId);
    //   return `${path}${isNull(cacheId) ? '' : cacheId}`;
    // },
    tableData: {
      get() {
        return this.dealList(_.cloneDeep(this._tableList));
      },
      set(value) {
        this.neTableData = _.cloneDeep(value);
        return value;
      },
    },
    allLen() {
      return this.tableData.length;
    },
  },
  methods: {
    dragSortChange(list) {
      this.drag = true;
      this.tableData = list;
    },

    // 过滤一些不必要字段
    dealList(tableList = []) {
      const sortedColumns = this.sortList(tableList, this.checkSureList).filter(
        (data) => {
          const { type, key, hide } = data;
          // 默认 selection 和 操作栏 隐藏
          return !(
            type === 'selection' ||
            ['action', 'handle', 'handler'].includes(key) ||
            isEmpty(key) ||
            (!isEmpty(hide) && typeof hide !== 'function' && hide) ||
            (typeof hide === 'function' && hide(this.data))
          );
        },
      );
      const columns = sortedColumns.map((column, i) => {
        const { type, notFilter, key, label, hide } = column;
        const isHide =
          (!isEmpty(hide) && typeof hide !== 'function' && hide) ||
          (typeof hide === 'function' && hide(this.data)) ||
          COLUMN_TYPE.includes(type) ||
          notFilter;

        return {
          key,
          label,
          hide: isHide,
          column,
        };
      });
      return columns;
    },
    sortList(list, sortArr) {
      if (sortArr?.length > 0) {
        return list.sort((nxt, pre) => {
          const preIndex = sortArr.indexOf(pre.key);
          const nxtIndex = sortArr.indexOf(nxt.key);
          const sortIndex = preIndex - nxtIndex;
          return preIndex >= 0 && nxtIndex >= 0 ? -sortIndex : sortIndex;
        });
      } else {
        return list;
      }
    },
    getInitCheckedColumns() {
      const tableListCp = _.cloneDeep(this._tableList) || [];
      // 如果有缓存就读缓存的数据

      const path = this.$route?.path;
      const cacheId = this.cacheIds[path];
      const cacheKey = `${path}${isNull(cacheId) ? '' : cacheId}`;

      const cache = getCache(cacheKey);
      if (cache && cache.length > 0) {
        this.checkSureList = cache.filter(
          (d) => !!tableListCp.find((dd) => dd.key === d),
        );
        this.checkList = [...this.checkSureList];
        return;
      }

      const checked = tableListCp.reduce((acc, { visible, key, type }) => {
        if (
          key &&
          !visible &&
          !['action', 'handle', 'handler'].includes(key) &&
          type !== 'selection' &&
          !!this.tableData.find((dd) => dd.key === key)
        ) {
          acc.push(key);
        }
        return acc;
      }, []);

      this.checkList = [...checked];
      this.checkSureList = checked;
    },
    showDialog() {
      this.dialogVisible = true;
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    dialogSure() {
      const { checkList } = this;
      const tableData =
        this.neTableData.length === 0 ? this._tableList : this.neTableData;
      const newCheckList = tableData
        .filter((d) => checkList.includes(d.key))
        ?.map((d) => d.key);

      if (isEmpty(newCheckList)) {
        this.$message({
          type: 'error',
          message: '请先选择要显示的字段',
        });
        return;
      }
      // 缓存到localstorage
      const path = this.$route?.path;
      const cacheId = this.cacheIds[path];
      const cacheKey = `${path}${isNull(cacheId) ? '' : cacheId}`;
      setCache(cacheKey, newCheckList);
      this.closeDialog();
      setTimeout(() => {
        this.checkList = _.cloneDeep(newCheckList);
        this.checkSureList = _.cloneDeep(this.checkList);
        this.change(newCheckList, tableData);
        this.$message({
          type: 'success',
          message: '自定义表格字段设置成功！',
        });
      }, 0);
    },
    change(list, columns) {
      this.$emit('change', list);
      this.$emit('changeColumn', columns);
    },
  },
};
</script>

<style lang="less" scoped>
.filter-header-warp {
  display: inline-flex;
  align-items: center;
  margin-right: 12px;
  height: 40px;
  cursor: pointer;
  // background-color: #eff2f9;
}
.filter-dialog-content {
  margin-bottom: 20px;
  .filter-dialog-tips {
    font-size: 12px;
    margin-bottom: 10px;
  }
  .tips-right {
    float: right;
  }
  /deep/.el-checkbox__label {
    display: none;
  }
}
/deep/.filter-dialog-content .v-table-draggable thead {
  display: none;
}
.filter-table-header {
  width: 100%;
  border-collapse: collapse;
  th {
    padding: 0 0 0 11px;
    border: 1px solid #e8ebee;
    height: 40px;
    text-align: left;
    font-size: 12px;
    background: #eff2f9;
    color: #304156;
    line-height: 40px;
    border-bottom: 0;
  }
}
// .table-key-container {
//   max-height: 500px;
//   overflow-y: auto;
// }

.morebtn-wrap > i {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  background-color: #fff;
  text-align: center;
  border-radius: 24px;
}
</style>

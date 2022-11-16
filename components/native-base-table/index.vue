<template>
  <div class="v-native-base-table">
    <table :class="computedTableClass()">
      <thead>
        <tr>
          <template v-for="(column, i) in columns">
            <th
              :class="computedThClass(column, i)"
              v-show="showColumn(column)"
              :key="i"
              :width="column.width"
              v-if="renderLabel(column) && renderLabel(column).tag"
            >
              <JsxToTemplate :vnode="renderLabel(column)" />
            </th>
            <th
              v-else
              :class="computedThClass(column, i)"
              v-show="showColumn(column)"
              :width="column.width"
              :key="i"
              v-html="renderLabel(column)"
            ></th>
          </template>
        </tr>
      </thead>
      <tbody
        :id="tbodyId"
        :style="{ height: height }"
      >
        <template v-for="(list, i) in tableData">
          <tr :key="i">
            <template v-for="(column, j) in columns">
              <td-enhance
                :colrowSpan="
                  handleSpanMethod({
                    row: list,
                    column: column,
                    rowIndex: i,
                    columnIndex: j,
                  })
                "
                v-show="showColumn(column)"
                :key="j"
                :width="column.width"
                :class="computedThClass(column, j)"
              >
                <slot
                  :name="column.key"
                  :data="{ row: list, index: i, columnIndex: j }"
                >
                  <Expand
                    v-if="column.render"
                    :index="i"
                    :row="{ row: list, index: i, columnIndex: j }"
                    :render="column.render"
                  ></Expand>
                  <div
                    class="v-native-base-table-cell"
                    v-else
                  >{{ renderContent(list, column, i) }}</div>
                </slot>
              </td-enhance>
            </template>
          </tr>
        </template>
      </tbody>
    </table>
    <div
      class="v-empty-data"
      v-if="emptyShow"
    >暂无数据</div>
  </div>
</template>

<script>
import Sortable from 'sortablejs';
import Expand from './expand';
import { isEmpty, renderContent } from '../../utils';
import JsxToTemplate from '../jsx-to-template';
import TdEnhance from './td-enhance';

export default {
  components: {
    Expand,
    JsxToTemplate,
    TdEnhance,
    // TemplateVars: {
    //   functional: true,
    //   render: (h, { props, scopedSlots }) => h('template', scopedSlots.default(props)),
    // },
  },
  props: {
    columns: {
      type: Array,
      default: () => [],
    },
    tableList: {
      type: Array,
      default: () => [],
    },
    /**
     * 处理表格合并
     * 需要返回:
     * {
     *    rowspan?: number,
     *    colspan?: number,
     * }
     */
    spanMethod: {
      type: Function,
      default: () => () => {},
    },
    draggable: {
      type: Boolean,
      default: false,
    },
    height: [String, Number],
  },
  data() {
    return {
      sortedList: [],
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.dragTr();
    });
  },
  computed: {
    tableData: {
      set(value) {
        this.$emit('input', value);
      },
      get() {
        return _.cloneDeep(this.tableList);
      },
    },
    tbodyId() {
      return `tbody-${new Date().getTime()}`;
    },
    emptyShow() {
      return isEmpty(this.tableData);
    },
  },
  methods: {
    renderContent,
    renderLabel(column) {
      const { label, renderHeader } = column;
      if (renderHeader && typeof renderHeader === 'object') {
        return renderHeader;
      }
      if (renderHeader && typeof renderHeader === 'function') {
        return renderHeader(column);
      }
      return label;
    },
    showColumn(column) {
      const { hide } = column;
      if (typeof hide === 'function') return !hide();
      return !hide;
    },
    dragTr() {
      if (!this.draggable) return;
      const el = document.getElementById(this.tbodyId);
      if (!el) return;
      new Sortable(el, {
        animation: 150,
        ghostClass: 'v-table-draggable-tr',
        onEnd: (evt) => {
          console.log('onEnd evt===>', evt);
          const { oldIndex, newIndex } = evt;
          this.sortList(oldIndex, newIndex);
        },
      });
    },
    sortList(oldIndex, newIndex) {
      const { sortedList, tableData } = this;
      const list = _.cloneDeep(
        sortedList && sortedList.length > 0 ? sortedList : tableData,
      );
      const oldList = list.splice(oldIndex, 1);
      console.log('oldList===>', oldList);
      list.splice(newIndex, 0, ...oldList);
      this.sortedList = list;
      this.$emit('dragSortChange', _.cloneDeep(list));
    },
    computedTableClass() {
      const arr = [];
      if (this.draggable) arr.push('v-table-draggable');
      return arr.join(' ');
    },
    computedThClass(column, index) {
      const { textType } = column;
      if (textType === 'money') {
        return 'is-right';
      }
    },

    handleSpanMethod(params) {
      if (this.spanMethod) {
        return this.spanMethod(params);
      }
      return {
        rowspan: undefined,
        colspan: undefined,
      };
    },
  },
};
</script>

<style lang="less" scoped>
@primaryText: #304156;
@regularText: #475f7b;
@secondaryText: #5a8dee;
@placeholderText: #bbc1c8;
@background: #eaf0f7;
@tableHeader: #eff2f9;
@tableCol: #e8ebee;
@inputBorder: #dce0e3;
@inputDisabled: #f6f7fa;
.v-native-base-table {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  /*border: 1px solid @tableCol;*/
  th,
  td {
    padding: 0 11px;
    border: 1px solid @tableCol;
    /*border-top: 0;*/
    /*border-left: 0;*/
    height: 40px;
    text-align: left;
    font-size: 12px;
    &[rowspan='0'],
    &[colspan='0'] {
      display: none;
    }
    &.td-enhance {
      div.tooltip-td {
        & > * {
          display: inline-block;
          width: inherit;
          &:not(.el-form-item) {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: text-bottom;
          }
        }
      }
    }
  }
  th {
    background: @tableHeader;
    color: @primaryText;
    line-height: 40px;
    &.is-right {
      text-align: right;
    }
  }
  td {
    color: @regularText;
    &.is-right {
      text-align: right;
    }
  }
  tr:hover {
    td {
      background: @inputDisabled;
    }
  }
  .v-native-base-table-cell {
    /*height: 28px;*/
    /*line-height: 40px;*/
  }
}
.v-table-draggable {
  tr {
    cursor: move;
  }
  .v-table-draggable-tr {
    background: #f6f7fa;
  }
}
.v-empty-data {
  width: 100%;
  height: 54px;
  line-height: 54px;
  text-align: center;
  border: 1px solid @tableCol;
  border-top: 0;
  color: #475f7b;
}
</style>

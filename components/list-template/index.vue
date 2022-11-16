<template>
  <div
    class="list-template"
    ref="vContainer"
    :style="{ height: height }"
  >
    <layout-header v-if="slotSet.has('title') || title || slotSet.has('header-event')">
      <template v-slot:title>
        <slot name="title"><b>{{ title }}</b></slot>
      </template>
      <slot name="header-event"></slot>
    </layout-header>
    <hr
      class="dotte-line"
      v-if="dashLine"
    />
    <slot name="search-top-slot"></slot>
    <v-search
      ref="vSearch"
      :class="dashLine ? 'v-search-padding-7' : 'v-search-padding-0'"
      v-if="conditions && !_isDestroyed"
      :limit="limit"
      :conditions="locationConditions"
      :enterSearch="enterSearch"
      @search="search"
      @change="changeCondition"
      @exposeHeight="getVTableHeight"
    />
    <div
      v-if="slotSet.has('notice-message')"
      ref="noticeMessage"
      class="notice-message"
    >
      <slot
        name="notice-message"
        v-bind:selectedRows="selectedRows"
      >
        <!-- 用于填写表格上方的文字提示信息 -->
      </slot>
    </div>

    <v-table
      ref="vTable"
      :height="tableHeightSummary"
      v-on="$listeners"
      v-bind="$attrs"
      @selectionChange="selectionChange"
      :rowKey="rowKey"
      v-loading="loading"
      :resizable="resizable"
      :tableList="tableList"
      :lazy="true"
      :load="load"
      :columns="locationColumns"
      @sortChange="sortChange"
    />
    <div
      class="page-bottom"
      v-if="
        pagination || (batchOperation && batchOperation.length > 0) || slotSet.has('bottom-left')
      "
    >
      <div class="left-bottom-buttons">
        <slot
          name="bottom-left"
          v-bind:selectedRows="selectedRows"
        >
          <div v-if="showBatchs">
            <span class="btn-text">
              已选
              <b>{{ selectedRows.length }}</b> 条
            </span>
            <template v-for="item in batchOperation">
              <v-button
                v-if="handleVif(item)"
                v-auth="item.auth"
                :key="item.text"
                :type="item.type"
                :size="item.size || 'mini'"
                :icon="item.icon"
                :fill="item.fill || true"
                :plain="item.plain || true"
                @click="batchEventHandler(item,item.passCheck)"
                :class="item.class"
              >{{ item.text }}</v-button>
            </template>
          </div>
        </slot>
      </div>
      <div
        v-if="tableList.length > 0 && isLoadMore"
        class="to-right"
      >
        <v-button
          type="primary"
          size="small"
          @click="loadMoreList()"
        >加载更多</v-button>
      </div>
      <div v-else>
        <v-page
          v-if="tableList.length > 0 && this.pagination !== false"
          :pageSizeArr="pageSizeArr"
          class="to-right"
          :page="page"
          @changePage="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import crud from './crud';
import heightSetting from './heightSetting';
import LayoutHeader from '../layout-header';
import { getDeepValue, isEmpty } from '../../utils';
import { columnsFormat, conditionFormat } from '../../utils/format';
import { setCache, getCache, removeCache } from '../../utils/cache';

export default {
  components: {
    LayoutHeader,
  },
  props: {
    isLoadMore: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      // required: true,
      default: '',
    },
    dashLine: {
      type: Boolean,
    },
    columns: {
      type: Array,
      required: true,
    },
    conditions: {
      type: Array,
    },
    conditionsFormat: {
      type: Function,
    },
    searchCallback: {
      type: Function,
    },
    batchOperation: {
      type: Array,
      default: () => [],
    },
    mockData: {
      type: Array,
    },
    forceSelectable: {
      type: Boolean,
      default: false,
    },
    rowKey: {
      type: String,
      default: 'id',
    },
    limit: {
      type: Number,
      default: 3,
    },
    pageSizeArr: {
      type: Array,
      default: () => [20, 40, 60, 100],
    },
    height: String,
    vtableHeight: String,
    conditionCache: Boolean, // 缓存当前表查询条件
    isVxe: Boolean, // 是否采用大数据表格
    resizable: Boolean,
    requestCancel: {
      // 配置是否需要取消请求
      type: Boolean,
      default: false,
    },
    enterSearch: {
      // 是否需要回车搜索
      type: Boolean,
      default: true,
    },
  },
  mixins: [crud, heightSetting],
  created() {
    if (this.mockData) {
      this.tableList = this.mockData;
    }
  },
  data() {
    return {
      loading: false,
      selectedRows: [],
      locationOrders: [],
      handleCancelFnc: () => {}, // 保存手动取消请求的方法
    };
  },
  computed: {
    cacheId() {
      return this.$attrs.cacheId;
    },
    borderHeight() {
      const $container = getDeepValue(this.$refs, 'vcontainer', {});
      return $container.offsetHeight;
    },

    tableHeightSummary() {
      if (this.height === 'false') {
        return undefined;
      }
      if (this.height) {
        return `${parseFloat(this.height) - 45}px`;
      }
      if (this.vtableHeight) {
        return this.vtableHeight;
      }
      return this.tableHeight;
    },
    slotSet() {
      return new Set(
        Object.keys(this.$slots).concat(Object.keys(this.$scopedSlots)),
      );
    },
    /**
     * 本地计算的列配置
     */
    locationColumns() {
      // 不是强制可选时 && 有批量操作按钮时 && 第一列type是selection时 && 第一列没有设置hide属性时
      if (
        !this.forceSelectable
        && !this.showBatchs
        && this.columns?.[0]?.type === 'selection'
        && !this.columns?.[0].hide
      ) {
        const _columns = _.cloneDeep(this.columns);
        _columns[0].hide = true;
        return columnsFormat(_columns);
      }
      return columnsFormat(this.columns);
    },
    /**
     * 本地过滤条件计算
     */
    locationConditions() {
      let conditionCp;
      if (this.conditions) {
        conditionCp = conditionFormat(this.conditions);
      }
      if (this.conditionCache) {
        if (getCache('backpage')) {
          removeCache('backpage');
          const newParams = getCache(this.cacheKey);
          conditionCp.map((d) => {
            let val = [];
            if (Array.isArray(d.key)) {
              d.key.map(k => {
                val.push(newParams[k]);
              });
            } else {
              val = newParams[d.key];
            }
            if (!isEmpty(val)) {
              d.value = val;
            }
          });
          this.$nextTick(() => {
            this.page = {
              ...this.page,
              ..._.pick(newParams, ['size', 'page']),
            };
          });

          this.params = {
            ...newParams,
          };
        }
      }
      return conditionCp;
    },
    /**
     * 是否有批量处理按钮显示
     */
    showBatchs() {
      const { batchOperation } = this;
      if ((batchOperation || []).length <= 0) return false;
      const authBtns = batchOperation.filter(
        (x) => _.isEmpty(x.auth) || this.$hasAuth(x.auth),
      );
      return authBtns.length > 0;
    },
    /**
     * 暴露elment table组件
     */
    refTable() {
      return this.$refs.vTable.$refs.table;
    },
    titleContent() {
      return this.$slots.title || this.title;
    },
    cacheKey() {
      return this.$route.path + (!isEmpty(this.cacheId) ? this.cacheId : '');
    },
  },
  beforeDestroy() {
    this.tableList = [];
  },
  methods: {
    /**
     * 批量操作事件
     */
    batchEventHandler(option, passCheck) {
      if (passCheck) {
        option.func(this.selectedRows);
        return;
      }
      // isChecked 验证 true 外部验证，内部不验证， false 内部验证
      const isChecked = !option.isChecked;
      if (this.selectedRows.length === 0 && isChecked) {
        this.$message(option.uncheckedMsg || '请选择需要批量操作的数据！');
      } else if (
        !isEmpty(option.min)
        && this.selectedRows.length < option.min
      ) {
        this.$message(`请至少选择${option.min}条数据进行批量操作！`);
      } else if (
        !isEmpty(option.max)
        && this.selectedRows.length > option.max
      ) {
        this.$message(`请最多选择${option.min}条数据进行批量操作！`);
      } else {
        option.func(this.selectedRows);
      }
    },
    async changePage(page) {
      this.page = page;
      await this.readMethod();
      setTimeout(() => {
        // 暴露changePage事件
        this.$emit('changePage', page);
      }, 200);
    },
    /* 加载更多按钮方法 */
    loadMoreList() {
      if (this.tableList?.length === 0) {
        this.$message('没有更多数据');
        return;
      }
      this.page.page++;

      const params = Object.assign(
        {
          ...this.params,
          page: this.page.page,
          size: this.page.size,
          orders: this.locationOrders,
        },
        this.externalParams,
      );
      this.$https[this.httpMethod](this.readUrl, this.httpMethod.toLowerCase() === 'post' ? params : { params })
        .then((res) => {
          if (res.code === 10000) {
            if (res.data.records?.length === 0) {
              this.$message('没有更多数据');
              this.page.page--;
              return;
            }
            res.data.records = res.data.records.map((item, i) => {
              item.sort = i + this.tableList.length + 1;
              return item;
            });
            this.tableList = [...this.tableList, ...res.data.records];
          }
        })
        .catch((err) => {
          this.page.page--;
        });
    },
    /**
     * 行选择变化事件
     */
    selectionChange(checkList) {
      if (checkList) {
        this.selectedRows = checkList;
        this.$emit('selectionChange', checkList);
      }
    },
    /**
     * 排序触发事件
     */
    sortChange(info = {}) {
      let orders = info.orders;
      if (typeof orders[0]?.asc === 'undefined') {
        orders = this?.copyExternalParams?.orders;
      }
      if (this.isLoadMore) this.page.page = 1;
      this.locationOrders = orders;
      this.readMethod({});
      this.$emit('sort-change', orders);
    },
    handleVif(item) {
      if (typeof item.vif === 'function') {
        return item.vif();
      }
      if (!isEmpty(item.vif)) {
        return item.vif;
      }
      if (typeof item.hide === 'function') {
        return !item.hide();
      }
      if (isEmpty(item.hide)) {
        return !item.hide;
      }
      return true;
    },
  },
};
</script>

<style lang="less">
.list-template {
  // padding-bottom: 16px;
  // height: calc(100vh - 110px);
  overflow: hidden;
  .v-layout-header-padding {
    padding-bottom: 4px !important;
    font-size: 14px;
  }
  .dotte-line {
    height: 1px;
    border: none;
    border-top: 1px dashed #dce0e3;
    margin-top: 8px;
    font-size: 0px;
  }
  .v-search-padding-11 {
    padding-top: 11px !important;
  }
  .v-search-padding-7 {
    padding-top: 7px !important;
  }
  .v-search-padding-0 {
    padding-top: 0px !important;
  }
  .page-bottom {
    margin-top: 9px;
    margin-bottom: 9px;
    display: flex;
    justify-content: space-between;
    .left-bottom-buttons {
      min-height: 32px;
      display: flex;
      align-items: center;
      span.btn-text {
        font-size: 12px;
        color: rgba(48, 65, 86, 1);
        line-height: 14px;
        margin-right: 8px;
        b {
          color: #5a8dee;
        }
      }
    }
  }
  .to-right {
    text-align: right;
  }
}
</style>

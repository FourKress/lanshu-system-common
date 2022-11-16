<template>
  <div class="v-search-warp" ref="searchContainer">
    <template v-for="(condition, i) in conditions">
      <div
        class="v-search-item-warp"
        v-show="showItem(condition, i)"
        :key="condition.conditionKey || i"
        :style="getStyles(condition, i)"
      >
        <component
          :ref="`vSearch${condition.key}`"
          class="v-search-item"
          :class="getItemClass(condition, i)"
          :is="componentName[condition.type]"
          :value="reallyValue(condition)"
          :toClear="toClear"
          :options="condition"
          :conditionsValue="params"
          @change="change"
        ></component>
      </div>
    </template>
    <span v-if="conditions.length > 0">
      <search-btn
        :style="{ width: `${buttonWidth}px` }"
        :expand="selfExpand"
        :showExpand="showExpand"
        @expandAll="expandAll"
        @search="search"
        @refresh="refresh"
      ></search-btn>
    </span>
    <!--插入一些其他按钮等情况，如数据导出按钮-->
    <slot></slot>
  </div>
</template>

<script>
// import optionsMixins from './optionsMixins';
import { getDataType, isNull, isEmpty, getDeepValue } from '../../utils';
import searchBtn from './components/button/search-button';
import SearchSelect from './components/select';
import SearchLazySelect from './components/lazy-select';
import SearchInput from './components/input';
import SearchDatePicker from './components/date-picker';
import SearchDateRangerPicker from './components/date-ranger-picker';
import FilterTree from './components/filter-tree';
import ValueRangerInput from './components/value-ranger-input';
import RemoteInput from './components/remote-input';
import KeyInput from './components/key-input';

export default {
  components: {
    searchBtn,
    SearchSelect,
    SearchLazySelect,
    SearchInput,
    SearchDatePicker,
    SearchDateRangerPicker,
    FilterTree,
    ValueRangerInput,
    RemoteInput,
    KeyInput,
  },
  // mixins: [optionsMixins],
  data() {
    return {
      componentName: {
        select: 'SearchSelect',
        input: 'SearchInput',
        date: 'SearchDatePicker',
        dateRanger: 'SearchDateRangerPicker',
        city: 'CityCascader',
        industry: 'IndustryCascader',
        tree: 'FilterTree',
        valueRanger: 'ValueRangerInput',
        industryRoot: 'Industry',
        lazySelect: 'SearchLazySelect',
        industryComplex: 'IndustryComplex',
        remoteInput: 'RemoteInput',
        keyInput: 'KeyInput',
      },
      params: {},
      filterKeys: [],
      selfExpand: false,
      toClear: undefined,

    };
  },
  provide() {
    return {
      enterSearch: this.enterSearch,
    };
  },
  props: {
    conditions: {
      type: Array,
      default: () => [],
    },
    // 限制每一行的个数
    limit: {
      type: Number,
      default: 3,
    },
    // 是否展开, 默认会根据limit的个数自动计算，也可以手动指定
    expend: Boolean,
    slotWidth: {
      type: Number,
    },
    enterSearch: {
      // 是否需要回车搜索
      type: Boolean,
      default: false,
    },
  },
  watch: {
    expand() {
      const { expand } = this;
      // this.selfExpand = isNull(expand) ? false : expand;
      this.selfExpand = true;
    },
    conditions: {
      handler() {
        this.initParams(this.params);
      },
      deep: true,
    },
    enterSearch(val) {
      this.initEnterKey(val);
    },
  },
  created() {
    this.initParams();
    this.initEnterKey(this.enterSearch);
  },
  mounted() {
    this.$nextTick(() => {
      this.$emit('exposeHeight', this.$refs.searchContainer.offsetHeight);
    });
  },
  computed: {
    showExpand() {
      const { conditions, limit } = this;
      return (
        limit < conditions.filter((d, ii) => !this.handleHide(d, ii)).length
      );
    },
    buttonWidth() {
      const { showExpand } = this;
      // return showExpand ? 123 : 44;
      return 123;
    },
    trueConditions() {
      return this.conditions.filter((d, ii) => !this.handleHide(d, ii));
    },
    showFrontFlag() {
      const frontIndex = this.trueConditions.findIndex((n) => n.front);
      if (frontIndex === -1) return false;
      return frontIndex + 1 >= this.limit;
    },
  },
  methods: {
    initParams(params = {}) {
      this.conditions.map(async (condition) => {
        if (typeof condition.options === 'function') {
          condition.options = (await condition.options())?.data || [];
        }
        const dealParams = this.dealValue(condition.value, condition);
        // 找出原参数中已存在的参数，不重置数据
        const alreadyParams = _.pickBy(
          params,
          (val, key) => !_.isNil(val) && _.has(dealParams, key),
        );

        Object.assign(params, dealParams, alreadyParams);
      });

      this.params = params;
      // this.selfExpand = false;
      this.selfExpand = true;
    },

    initParams2(params = {}) {
      this.conditions.map(async (condition) => {
        if (typeof condition.options === 'function') {
          condition.options = (await condition.options())?.data || [];
        }
        const _params = this.dealValue(condition.value, condition);
        // 找出原参数中已存在的参数，不重置数据
        const alreadyParams = _.pickBy(params, (val, key) =>
          _.has(_params, key),
        );

        params = { ..._params, ...alreadyParams };
      });
    },
    change(value, options, selfValue) {
      const params = this.dealValue(value, options, selfValue);
      Object.keys(params).map((d) => {
        this.params[d] = params[d];
      });
      if (typeof options.change === 'function') {
        options.change(value, options);
      }
      this.$emit('change', value, options);
    },
    dealValue(value, options, selfValue) {
      const { key } = options;
      const keyType = getDataType(key);
      const realVal = typeof value === 'function' ? value() : value;
      const type = getDataType(realVal);
      let params = {};
      if (type === 'array' && keyType === 'array') {
        (key || []).map((val, i) => {
          params[val] = realVal[i];
        });
      } else if (
        type === 'array' &&
        keyType === 'string' &&
        (realVal || []).includes('chooseAll') &&
        options.chooseAll
      ) {
        // 枚举增加全选反选
        params[key] = selfValue;
      } else if (type === 'object') {
        params = { ...params, ...realVal };
      } else {
        params[key] = realVal;
      }
      return params;
    },
    reallyValue(condition) {
      const { value, key } = condition;
      let reVal;
      if (typeof value === 'function') {
        reVal = value();
      } else {
        reVal = value;
      }
      return reVal;
    },
    replaceValue(params) {
      const data = {};
      Object.keys(params).map((key) => {
        const value = params[key];
        data[key] = isEmpty(value) ? undefined : value;
      });
      return data;
    },
    search() {
      const params = this.replaceValue(this.params);
      this.$emit('search', params);
    },
    refresh() {
      this.clearAll();
    },
    clearAll() {
      this.toClear = new Date().getTime();
      this.$nextTick(() => {
        this.$emit('clearAll');
      });
    },
    getStyles(item, i) {
      const { limit, selfExpand } = this;
      const styles = {};
      const prevHide =
        this.conditions.filter((d, ii) => this.handleHide(d, ii) && ii < i)
          ?.length || 0;
      const len = this.conditions.filter((d, ii) => !this.handleHide(d, ii))
        .length;
      const counter = len >= limit ? limit : len;
      const trueIndex = i - prevHide;
      const isFront = this.getFrontFlag(item);
      if (trueIndex + 1 !== len) {
        styles.width = `${100 / counter}%`;
        if (!selfExpand && isFront && this.showFrontFlag) {
          styles.width = this.setWidth(trueIndex, counter);
        }
      } else {
        styles.width = this.setWidth(trueIndex, counter);
      }
      return styles;
    },
    setWidth(trueIndex, counter) {
      const { slotWidth, buttonWidth } = this;
      const deliveryNumber = this.selfExpand ? (trueIndex + 1) % counter : 0;
      const width =
        (deliveryNumber ? counter - deliveryNumber + 1 : 1) * (100 / counter);
      return `calc(${width}% - ${buttonWidth + (slotWidth || 0)}px)`;
    },
    getItemClass(item, i) {
      const styles = {};
      const prevHide =
        this.conditions.filter((d, ii) => this.handleHide(d, ii) && ii < i)
          ?.length || 0;
      const count = i + 1 - prevHide;
      const allCount = this.conditions.filter(
        (d, ii) => !this.handleHide(d, ii),
      ).length;
      if (
        count % this.limit === 0 &&
        count < allCount &&
        (!this.getFrontFlag(item) || this.selfExpand)
      ) {
        return 'v-search-item-r0';
      }
      return styles;
    },
    showItem(item, i) {
      const { limit, selfExpand, showExpand } = this;
      const prevHide =
        this.conditions.filter((d, ii) => this.handleHide(d, ii) && ii < i)
          ?.length || 0;
      const frontItem = this.getConditionsFront();
      if (this.getFrontFlag(item) && this.showFrontFlag) {
        return true;
      }
      const trueLen = this.trueConditions?.length;
      const trueIndex = i - prevHide;
      const show =
        !showExpand ||
        selfExpand ||
        trueIndex + 1 < limit ||
        (frontItem && this.showFrontFlag ? false : trueIndex + 1 === trueLen);
      const isHide = this.handleHide(item, i);
      if (
        isHide &&
        !this.conditions.find((d) => d.key === item.key && !this.handleHide(d))
      ) {
        this.resetConditionItem(item);
      }
      // if (!show) {
      //   this.$nextTick(() => {
      //     this.params = { ...this.params, ...this.dealValue(undefined, item) };
      //   });
      // }
      return show && !isHide;
      // return true;
    },
    getConditionsFront() {
      const frontItem = this.trueConditions.find(
        (d) =>
          d.front &&
          (d.key !== 'keywords' ||
            (d?.condition && d.condition.key !== 'keywords')),
      );
      return frontItem || '';
    },
    getFrontFlag(item) {
      const frontItem = this.getConditionsFront();
      const isFront = frontItem && frontItem.key === item.key;
      return isFront;
    },
    handleHide(item, i) {
      if (isEmpty(item.hide)) {
        return false;
      }
      let res = false;
      if (typeof item.hide === 'function') {
        res = item.hide(item);
      } else if (!isEmpty(item.hide)) {
        res = item.hide;
      }
      return res;
    },
    resetConditionItem(item) {
      const keys = item.key.split('.');
      const lastKey = keys[keys.length - 1];
      if (keys?.length > 1) {
        keys.pop();
        const obj = getDeepValue(this.params, keys);
        obj[lastKey] = undefined;
      } else {
        this.params[item.key] = undefined;
      }
      this.resetFormField(item.key);
    },
    expandAll() {
      this.selfExpand = !this.selfExpand;
      this.$emit('update:expand', this.selfExpand);
      this.$emit('expandAll', this.selfExpand);
      this.$nextTick(() => {
        this.$emit('exposeHeight', this.$refs.searchContainer.offsetHeight);
      });
    },
    resetFormField(key) {
      if (key instanceof Array) {
        key.map((d) => {
          const refCom = this.$refs[`vSearch${d}`];
          refCom?.map((dd) => {
            if (typeof dd?.reset === 'function') {
              dd.reset();
            }
          });
        });
      } else if (key) {
        const refCom = this.$refs[`vSearch${key}`];
        refCom?.map((dd) => {
          if (typeof dd?.reset === 'function') {
            dd.reset();
          }
        });
      } else {
        this.conditions.forEach((condition) => {
          const refCom = this.$refs[`vSearch${condition.key}`];
          refCom?.map((dd) => {
            if (typeof dd?.reset === 'function') {
              dd.reset();
            }
          });
        });
      }
    },
    enterKey(event) {
      // 存在遮盖层时，禁用回车搜索事件
      if (document.getElementsByClassName('v-modal').length > 0) {
        return;
      }
      const isEnter = event.key === 'Enter' && event.code === 'Enter';
      if (isEnter) {
        this.search();
      }
    },
    initEnterKey(enterSearch) {
      if (enterSearch) {
        document.addEventListener('keyup', this.enterKey);
      } else {
        document.removeEventListener('keyup', this.enterKey);
      }
    },
  },
  beforeDestroy() {
    this.enterSearch && document.removeEventListener('keyup', this.enterKey);
  },
};
</script>

<style lang="less" scoped>
.v-search-warp {
  padding: 5px 0;
  font-size: 12px;
}
.v-search-item-warp {
  display: inline-block;
}
/deep/.v-search-item {
  width: 100%;
  margin: 5px 0 5px 0;
  .el-input,
  .el-select,
  .v-filter-tree {
    font-size: 12px;
    vertical-align: top;
    flex: 1;
  }
  .v-search-item-content {
    border: 1px solid #dce0e3;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    margin-right: 10px;
    .v-date-ranger-picker-time-seg,
    .split-line {
      line-height: 24px;
    }
  }
  .v-search-input {
    /*width: 100%;*/
    flex: 1;
  }
  .el-input__inner {
    border: 0;
    color: #475f7b;
    height: 27px !important;
    line-height: 28px;
    // margin-top: 1px;
  }
  .v-search-label {
    display: block;
    vertical-align: top;
    line-height: 28px;
    height: 28px;
    margin: 0 5px 0 11px;
    min-width: 30px;
    color: #727e8c;
  }
}
/deep/.v-search-item-r0 {
  .v-search-item-content {
    margin-right: 0;
  }
}
</style>

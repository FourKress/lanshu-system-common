<template>
  <div>
    <div class="v-search-item-content">
      <span class="v-search-label">{{ params.label }}</span>
      <filter-tree
        v-model="selfValue"
        :placeholder="params.placeholder"
        :defaultProps="mapKey"
        :onlyCheckLastLevel="params.onlyCheckLastLevel"
        :nodeKey="mapKey.value|| mapKey.id"
        :filterKeys="params.filterKeys"
        :filterPlaceholder="params.filterPlaceholder"
        :startCheckLevel="params.startCheckLevel"
        :multiple="params.multiple"
        :dataRemoteParams="params.dataRemoteParams"
        :checkStrictly="params.checkStrictly"
        :treeData="items"
        :defaultExpandAll="params.defaultExpandAll"
        :defaultExpandedKeys="params.defaultExpandedKeys"
        :defaultCheckedKeys="params.defaultCheckedKeys"
        :checkStrictlySyncChildren="params.checkStrictlySyncChildren"
        @change="change"
        :allSelect="params.allSelect"
      ></filter-tree>
    </div>
  </div>
</template>

<script>
import { isNull } from '../../../utils';
import FilterTree from '../../../components/filter-tree';
import _ from 'lodash';
const DEFAULT_OPTIONS = {
  placeholder: '请选择',
  multiple: false,
};

const DEFAULT_PROPS = {
  label: 'name',
  children: 'children',
  id: 'id',
};

export default {
  components: {
    FilterTree,
  },
  data() {
    return {
      selfValue: '',
    };
  },
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
    value: {
      type: [Number, String, Array],
    },
    toClear: Number,
  },
  created() {
    this.initValue();
  },
  watch: {
    value() {
      this.initValue();
    },
    toClear() {
      this.clearValue();
    },
  },
  computed: {
    params() {
      return {
        ...DEFAULT_OPTIONS,
        ...this.options,
      };
    },
    items() {
      let { options = [], allSelect = false,multiple } = this.params;
      if (typeof options === 'function') {
        return [];
      }
      const allOption = [
        {
          [this.mapKey.value]: 'all',
          [this.mapKey.id]: 'all',
          [this.mapKey.label]: '全部',
          children: options,
        },
      ];
      if (allSelect) {
        this.params.defaultExpandedKeys = ['all'];
      }
      this.params.defaultCheckedKeys = Array.isArray(this.selfValue)
        ? this.selfValue
        : [this.selfValue];
      return allSelect ? allOption : options;
    },
    mapKey() {
      const { props = {} } = this.options;
      return {
        ...DEFAULT_PROPS,
        ...props,
      };
    },
  },
  methods: {
    clearValue() {
      this.selfValue = this.setValue('', this.params);
      this.change(this.selfValue);
    },
    initValue() {
      const value = this.reallyValue(this.params);
      // 为了全部选项在清空时能够被选中
      this.selfValue = this.setValue(value, this.params);
    },
    reallyValue(condition) {
      const { value } = condition;
      if (typeof value === 'function') {
        return value();
      }
      return value;
    },
    setValue(value, { multiple }) {
      if (isNull(value)) {
        return multiple ? [] : '';
      }
      return value;
    },
    // filterEmptyValue(value) {
    //   if (isNull(value)) return;
    //   if (!this.params.multiple) {
    //     return value;
    //   }
    //   const valueRes = [];
    //   value.map((val) => {
    //     if (!isNull(val)) valueRes.push(val);
    //   });
    //   return valueRes;
    // },
    change(value) {
      let newValue = value;
      if (Array.isArray(value)&&value.length) {
        //使用全部选项时，输出值去掉'全部'的id 'all'
        newValue = _.cloneDeep(value);
        newValue = newValue.filter((item) => {
          return item !== 'all';
        });
      }
      if(newValue==='all')newValue=undefined
      this.$emit('change', newValue, this.options);
    },
    reset() {
      this.initValue();
      this.change(this.selfValue);
    },
  },
};
</script>

<style lang="less" scoped>
/deep/.v-search-item-content {
  .v-filter-tree {
    width: 100%;
    /deep/.tree-input-hide {
      height: 28px;
      line-height: 28px;
    }
    /deep/.tree-tag-container {
      height: 28px;
      padding-bottom: 0;
    }
  }
  .tree-tag-container {
    border: 0;
  }
}
</style>

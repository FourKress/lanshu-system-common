<template>
  <div>
    <div class="v-search-item-content">
      <span class="v-search-label">{{ params.label }}</span>
      <lazy-select
        class="v-search-input"
        v-model="selfValue"
        :clearable="params.clearable"
        :optionsFilter="filterOption"
        :multiple="params.multiple"
        :collapse-tags="true"
        :filterable="params.filterable"
        :editable="params.editable"
        :enumCode="params.enumCode"
        :placeholder="params.placeholder"
        :size="params.size"
        :lazy="params.lazy"
        :noCache="params.noCache"
        :optionUrl="getOptionUrl()"
        :optionParams="params.optionParams"
        :labelKey="mapKey.label"
        :valueKey="mapKey.value"
        :options="items"
        :no-data-text="params.noDataText"
        @change="change"
      ></lazy-select>
    </div>
  </div>
</template>

<script>
import LazySelect from '../../lazy-select';
import { isNull } from '../../../utils';

const DEFAULT_OPTIONS = {
  placeholder: '请选择',
  clearable: true,
  multiple: false,
  editable: false,
  noDataText: '无数据',
};

const DEFAULT_PROPS = {
  label: 'label',
  value: 'value',
};

export default {
  components: { LazySelect },
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
      type: [Number, String],
    },
    toClear: Number,
    conditionsValue: Object,
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
      const { options = [] } = this.params;
      if (typeof options === 'function') {
        return [];
      }
      // 当有enumCode时，并且存在数据时。
      return [
        // all,
        ...options,
      ];
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
    filterEmptyValue(value) {
      if (isNull(value)) return;
      if (!this.params.multiple) {
        return value;
      }
      const valueRes = [];
      value.map((val) => {
        if (!isNull(val)) valueRes.push(val);
      });
      // if (valueRes.length === this.items.length - 1) valueRes.unshift('');
      return valueRes;
    },
    change(value) {
      const valueRes = this.filterEmptyValue(value);
      // this.selfValue = valueRes;
      this.$emit('change', valueRes, this.options);
      if (typeof this.params.change === 'function') this.params.change(valueRes, this.options);
    },
    filterOption(item, i) {
      const { filterOption } = this.params;
      if (typeof filterOption === 'function') {
        return filterOption(item, _.cloneDeep(this.conditionsValue), i);
      }
      return true;
    },
    getOptionUrl() {
      const { optionUrl } = this.params;
      return typeof optionUrl === 'function' ? optionUrl() : optionUrl;
    },
    reset() {
      this.initValue();
      this.change(this.selfValue);
    },
  },
};
</script>

<style lang="less" scoped></style>

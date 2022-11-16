<template>
  <el-select
    v-on="$listeners"
    v-bind="$attrs"
    :loading="loading"
    :clearable="clearable"
    @focus="focusAction"
    @change="change"
    ref="ElLazySelect"
    @visible-change="visibleChange"
  >
    <el-option
      v-for="(op, i) in filteredOptions"
      :key="op.key || i"
      :label="op[labelKey] || op.label"
      :value="op[valueKey] || op.value"
      :disabled="checkDisabled(op)"
    >
      <slot
        name="option"
        :data="op"
      ></slot>
    </el-option>
    <slot :data="filteredOptions"></slot>
  </el-select>
</template>

<script>
import _ from 'lodash';
import { isEmpty, isNull } from '../../utils';

export default {
  props: {
    options: {
      type: [Array, Object],
    },
    initDelay: {
      type: Number,
      default: 0,
    },
    optionUrl: {
      type: [String, Object],
    },
    optionParams: {
      type: Object,
    },
    labelKey: {
      type: String,
      default: 'name',
    },
    valueKey: {
      type: String,
      default: 'code',
    },
    // options筛选函数
    optionsFilter: {
      type: Function,
      default: undefined,
    },
    // 禁用的值
    disableValues: {
      type: [Array, Function],
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    // 重新组织option
    packOption: {
      type: Function,
      default: undefined,
    },
    lazy: {
      type: Boolean,
      default: true,
    },
    validAlways: Boolean,
    isTriggerChangeByQuery: {
      type: Boolean,
      default: false,
    },
    defaultLabel: String,
  },
  inject: {
    enterSearch: {
      default: true,
    },
  },
  async mounted() {
    // 当有传递options参数时，直接赋值
    if (isEmpty(this.options) && this.optionUrl) {
      setTimeout(() => {
        // 当数据v-model绑定时，直接请求数据接口
        if (this.$attrs.value) {
          // this.locationOptions = await optionsPromise();
          this.queryOptions();
        }
      }, this.initDelay);
    }
  },
  watch: {
    optionUrl() {
      this.updateOptions = true;
      if (this.lazy) return;
      this.queryOptions();
    },
    selfValue() {
      // 监听value的变化 防止当有this.optionUrl
      // 而this.$attrs.value没有值是不会触发初始请求option
      if (this.optionUrl && isEmpty(this.options) && !this.loading) {
        this.queryOptions();
      }
    },
    filteredOptions: {
      handler(value) {
        if (!this.isCheckedValue || this.validAlways) {
          // 验证无效值
          this.validValue(value);
          if (!this.isCheckedValue) {
            this.isCheckedValue = true;
          }
        }
      },
      deep: true,
    },
  },
  computed: {
    // 筛选过后的options
    filteredOptions() {
      let options = _.cloneDeep(this.locationOptions);
      if (typeof this.packOption === 'function') {
        options = this.packOption(options);
      }
      if (typeof this.optionsFilter === 'function') {
        options = options?.filter(this.optionsFilter);
      }
      return options;
    },

    selfValue() {
      return this.$attrs.value;
    },
  },
  data() {
    return {
      locationOptions: [],
      loading: false,
      updateOptions: false,
      isCheckedValue: false, // 是否已验证无效值
    };
  },
  methods: {
    focusAction(event) {
      this.$emit('focus', event);
      if (!this.lazy) return;
      this.queryOptions();
    },
    // 检测禁用值
    checkDisabled(option) {
      const value = option[this.valueKey] || option.value;
      if (this.disableValues instanceof Array) {
        return this.disableValues.includes(value);
      }
      if (typeof this.disableValues === 'function') {
        return this.disableValues(value, option);
      }
      return false;
    },
    queryOptions() {
      // 如果没有请求参数或者已经有选项时，不执行后续操作。
      if (isNull(this.optionUrl)) {
        this.locationOptions = this.options || [];
        this.updateOptions = true;
        return;
      }
      if (!this.updateOptions && !this.lazy) {
        if (this.locationOptions.length > 0) {
          return;
        }
      }
      this.loading = true;
      const exre = /^_+([a-zA-Z]+)_+\//g.exec(this.optionUrl);
      let type = 'get';
      if (exre) {
        type = exre[1] || 'get';
      }
      this.$https(
        typeof this.optionUrl === 'string'
          ? {
              url: this.optionUrl.replace(/^_+([a-zA-Z]+)_+\//g, ''),
              method: type,
              params:
                type.toLowerCase() === 'get' ? this.optionParams : undefined,
              data:
                type.toLowerCase() === 'post' ? this.optionParams : undefined,
              loading: false,
            }
          : this.optionUrl,
      )
        .then((res) => {
          const data = res.data || [];
          if (
            this.selfValue &&
            !data.find((item) => item[this.valueKey] === this.selfValue) &&
            this.defaultLabel !== undefined
          ) {
            data.push({
              [this.valueKey]: this.selfValue,
              [this.labelKey]: this.defaultLabel,
            });
          }
          this.locationOptions = data;
          this.loading = false;
          this.updateOptions = false;
          if (this.isTriggerChangeByQuery) {
            this.change(this.$attrs.value);
          }
        })
        .catch(() => {
          this.loading = false;
          this.updateOptions = true;
        });
    },
    /**
     * @description: 检测值是否为无效值
     * @param {type}
     * @return:
     */
    validValue(list) {
      const multiple = this.$attrs.multiple;
      const defValue = multiple ? [] : '';
      if (list?.length > 0) {
        const value = this.$attrs.value ? _.cloneDeep(this.$attrs.value).toString() : '';
        if (
          value &&
          !list.find(
            (option) =>
              option[this.valueKey] === this.$attrs.value ||
              option.value === this.$attrs.value ||
              value.includes(option[this.valueKey]) ||
              value.includes(option.value),
          )
        ) {
          // 下拉框未找到相对的值
          this.change(defValue);
        }
      } else if (isEmpty(list) && this.isCheckedValue) {
        this.change(defValue);
      }
    },
    change(value) {
      this.$emit('input', value);
      this.$emit(
        'changeOption',
        value,
        this.filteredOptions.find(
          (option) => option[this.valueKey] === value || option.value === value,
        ),
      );
    },
    visibleChange(value) {
      if (value && this.enterSearch) {
        this.$refs.ElLazySelect.selectOption = () => {};
      }
    },
  },
};
</script>

<style lang="less" scoped>
.el-select {
  width: 100%;
}
</style>

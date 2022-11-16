<template>
  <div class="r-remote-input">
    <nostyle-item>
      <el-select
        ref="remoteInput"
        :value="value"
        filterable
        :remote="remote"
        :reserve-keyword="reserveKeyword"
        :value-key="propKeys.value"
        :remote-method="remoteMethod"
        :loading="loading"
        :clearable="clearable"
        v-bind="$attrs"
        v-on="$listeners"
        :multiple="multiple"
        :collapse-tags="collapseTags"
        @change="change"
        @blur="handleBlur"
        :style="{ width: '100%' }"
        @focus="handleFocus"
        @clear="handleClear"
        :placeholder="placeholder"
        @visible-change="visibleChange"
      >
        <template v-for="(item, i) in options">
          <el-option
            :key="`selectall-${i}`"
            v-if="i === 0 && showSelected"
            :class="{ selected: selectedAll }"
            value="__select_all__"
            label="选择全部"
          >
          </el-option>
          <el-option
            :key="item[propKeys.value] || i"
            :label="item[propKeys.label]"
            :value="item[propKeys.value]"
          >
            <slot :data="item"></slot>
            <expand
              v-if="optionRender"
              :render="optionRender"
              :data="item"
            ></expand>
          </el-option>
        </template>
      </el-select>
    </nostyle-item>
  </div>
</template>

<script>
import Emitter from '@common/mixins/emitter';
import _ from 'lodash';
import { isEmpty, isNull } from '../../utils';
import Expand from './expand';
import NostyleItem from './nostyle-item';

const DEFAULT_MAP_KEY = {
  label: 'label',
  value: 'value',
};

export default {
  components: { Expand, NostyleItem },
  mixins: [Emitter],
  props: {
    value: {
      type: [Array, Number, String],
    },
    label: {
      type: [Array, Number, String],
    },
    mapKey: Object,
    emptyLabel: {
      type: [Number, String],
      default: ' ',
    },
    multiple: Boolean,
    collapseTags: {
      type: Boolean,
      default: true,
    },
    placeholder: { type: [String, Number], default: '请输入' },
    validateEvent: {
      type: Boolean,
      default: true,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    // 数据还原的方式：remote时，表示通过请求接口的方式进行数据还原
    initType: {
      type: [String],
    },
    autoAddQueryToOption: {
      type: Boolean,
      default: false,
    },
    // 是否可使用自定义输入，不选择模糊搜索的结果列表中的内容时，仍然保存输入的内容
    isAutoClear: {
      type: Boolean,
      default: true,
    },
    // option自定义渲染
    optionRender: {
      type: Function,
    },
    // focus时总是发起请求
    focusAlwaysRequest: {
      type: Boolean,
      default: false,
    },
    // 默认下拉框值
    defaultOptions: {
      type: Array,
    },
    focusTrigger: Boolean,
    reserveKeyword: {
      type: Boolean,
      default: false,
    },
    showSelected: {
      type: Boolean,
      default: false,
    },
  },
  inject: {
    enterSearch: {
      default: true,
    },
  },
  data() {
    return {
      options: [],
      loading: false,
      propKeys: {},
      isRemote: false,
      searchValue: undefined,
      remote: false,
      throttleFetchRemote: _.throttle(this.fetchRemoteOptions, 200),
    };
  },
  created() {
    this.propKeys = { ...DEFAULT_MAP_KEY, ...this.mapKey };
  },
  mounted() {
    if (!this.isAutoClear) {
      const _input = this.$refs.remoteInput.$refs.reference.$refs.input;
      _input.onblur = () => {
        this.change(_input.value);
      };
    }
  },
  computed: {
    _defaultOptions() {
      const { value, label, isRemote, initType } = this;
      if (isRemote || isEmpty(value)) return [];
      if (initType === 'remote') {
        this.remoteMethod(label);
        return null;
      }
      let options = [];
      if (this.multiple) {
        if (this.defaultOptions?.length > 0) {
          options = _.cloneDeep(this.defaultOptions);
        } else {
          (label || []).map((l, index) => {
            options.push({
              [this.propKeys.label]: l,
              [this.propKeys.value]: value[index],
            });
          });
        }
      } else {
        const isEmptyLabel = isEmpty(label);
        const isEmptyValue = isEmpty(value);
        if (isEmptyValue) return null;
        if (this.defaultOptions?.length > 0) {
          options = _.cloneDeep(this.defaultOptions);
        } else if (this.propKeys.value) {
          options.push({
            [this.propKeys.value]: value,
            [this.propKeys.label]: isEmptyLabel ? this.emptyLabel : label,
          });
        }
      }
      return options;
    },
    selectedAll() {
      return this.value?.length === this.options.length;
    },
  },
  watch: {
    _defaultOptions: {
      handler(options) {
        if (isEmpty(options)) return;
        this.options = options;
      },
      deep: true,
      immediate: true,
    },
    options: {
      handler(options) {
        this.value && this.checkValueEffective(options);
      },
      deep: true,
    },
    value(val) {
      const isResetOptions = this.multiple
        ? val?.length <= 0
        : val === '' || _.isNil(val);

      if (
        isResetOptions &&
        (this.searchValue === '' || this.searchValue === undefined)
      ) {
        // 重置下拉
        this.options = [];
      }
    },
  },
  methods: {
    handleFocus() {
      if (!this.remote) {
        this.remote = true;
      }
      if (
        (!this.options.length && this.focusTrigger) ||
        this.focusAlwaysRequest
      ) {
        this.isRemote = true;
        this.loading = true;
        this.$emit('remoteMethod', '', this.setOptions);
      }

      this.$emit('focus');
    },
    handleClear() {
      this.focusTrigger && (this.options = []);
    },
    handleBlur(event) {
      this.$emit('blur', event);
      if (this.validateEvent) {
        this.dispatch('ElFormItem', 'el.form.blur', [this.value]);
      }
      // if (!this.isAutoClear) {
      //   const val = this.$refs.remoteInput.$refs.reference.$refs.input.value;
      // }
    },
    /**
     * 检查value的有效性，如果value和没有对应匹配的option，则清除value的值
     * */
    checkValueEffective(options) {
      if (!this.isAutoClear) return;
      // TODO: 注意没考虑多选
      if (this.multiple) return;
      const option = options.find((x) => x[this.propKeys.value] === this.value);
      // const val = this.value;
      if (!isEmpty(option)) return;
      this.change();
    },
    change(value) {
      if (isEmpty(value)) {
        this.$emit('changeOption', value, []);
      } else if (this.multiple) {
        if (value.find((key) => key === '__select_all__')) {
          const all = this.options.map((opt) => opt[this.propKeys.value]);
          this.$emit('input', all);
          this.$emit('changeOption', all, this.options);
          return false;
        }
        const options = value.map(
          (v) => this.options.find((x) => x[this.propKeys.value] === v) || {},
        );
        const labels = options.map((option) => option[this.propKeys.label]);
        const all = this.options.map((opt) => opt[this.propKeys.value]);
        let oldOptions = _.cloneDeep(this.options);

        this.$emit('input', value);
        this.$emit('update:label', labels);
        this.$emit('changeOption', value, options);
        this.$nextTick(() => {
          if (this.options?.length < oldOptions?.length)
            this.options = oldOptions;
        });
        return true;
      } else {
        const option =
          this.options.find((x) => x[this.propKeys.value] === value) || {};
        const newValue = option[this.propKeys.value];
        const label = option[this.propKeys.label];
        value = isEmpty(newValue) ? value : newValue;
        this.$emit('input', value);
        this.$emit('update:label', label);
        this.$emit('changeOption', value, option);
      }

      this.dispatch('ElFormItem', 'el.form.change', value);
    },
    remoteMethod(query) {
      // 使用节流方法请求数据
      this.throttleFetchRemote(query);
    },

    fetchRemoteOptions(query) {
      this.searchValue = query;
      if (!isNull(query)) {
        this.isRemote = true;
        this.loading = true;
        this.$emit('remoteMethod', query, this.setOptions);
      } else if (this.multiple) {
        this.options = this.options.filter((d) =>
          this.value.includes(d[this.propKeys.value]),
        );
      } else {
        this.options = [];
      }

      this.$emit('queryChange', query);
    },
    getOldOptions(options, values) {
      if (isEmpty(values)) return [];
      return options.filter(
        (option) =>
          values.includes(option[this.propKeys.value]) &&
          !option.isAutoAddEmptyOption,
      );
    },
    setOptions(data) {
      const oldOptions = this.multiple
        ? this.getOldOptions(
            this.options,
            this.multiple ? this.value : [this.value],
          )
        : [];
      this.loading = false;
      let newOptions = isEmpty(data) ? [] : data;
      const { label, value } = this.propKeys;
      newOptions = oldOptions.concat(newOptions);
      if (
        (isEmpty(newOptions) || newOptions?.length === 0) &&
        this.autoAddQueryToOption
      ) {
        if (!isNull(this.searchValue)) {
          newOptions = [
            {
              [label]: this.searchValue,
              [value]: this.searchValue,
              isAutoAddEmptyOption: true,
            },
          ];
        }
      }
      this.options = _.unionBy(newOptions, value);
    },
    visibleChange(value) {
      if (value && this.enterSearch) {
        this.$refs.remoteInput.selectOption = () => {};
      }
    },
  },
};
</script>

<style lang="less" scoped>
.r-remote-input {
  width: 100%;
  /deep/.el-input.el-input--suffix {
    .el-select__caret.el-icon- {
      &:before {
        content: '\E6E1';
      }
    }
    &.is-focus {
      .el-select__caret.el-icon- {
        transform: rotateZ(0);
      }
    }
  }
}
</style>

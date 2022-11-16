<template>
  <div>
    <div class="v-search-item-content">
      <span class="v-search-label">{{params.label}}</span>
      <el-date-picker
        class="v-search-input v-search-date"
        v-model="selfValue"
        @change="change"
        :type="params.type"
        :editable="params.editable"
        :picker-options="params.pickerOptions"
        :value-format="params.valueFormat"
        :placeholder="params.placeholder"
        :size="params.size"
      ></el-date-picker>
    </div>
  </div>
</template>

<script>
const DEFAULT_OPTIONS = {
  placeholder: '请选择日期',
  editable: false,
};
const DEFAULT_FORMAT = {
  year: 'yyyy',
  month: 'yyyy-MM',
  date: 'yyyy-MM-dd',
};

export default {
  data() {
    return {
      selfValue: undefined,
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
  },
  created() {
    this.initValue();
  },
  watch: {
    value() {
      this.initValue();
    },
    'options.value': function () {
      this.initValue();
    },
    toClear() {
      this.clearValue();
    },
  },
  computed: {
    params() {
      const { showType = 'date' } = this.options;
      return {
        ...DEFAULT_OPTIONS,
        ...this.options,
        type: showType,
        valueFormat: this.getValueFormat(),
      };
    },
  },
  methods: {
    clearValue() {
      this.selfValue = undefined;
      this.change(this.selfValue);
    },
    initValue() {
      this.selfValue = this.reallyValue(this.options);
    },
    reallyValue(condition) {
      const { value } = condition;
      if (typeof value === 'function') {
        return value();
      }
      return value;
    },
    getValueFormat() {
      const { showType = 'date', valueFormat } = this.options;
      return valueFormat || DEFAULT_FORMAT[showType] || DEFAULT_FORMAT[0];
    },
    change(value) {
      this.$emit('change', value, this.options);
    },
    reset() {
      this.initValue();
      this.change(this.selfValue);
    },
  },
};
</script>

<style lang="less" scoped>
.v-search-date {
  /deep/.el-input__icon {
    line-height: 28px;
  }
}
</style>

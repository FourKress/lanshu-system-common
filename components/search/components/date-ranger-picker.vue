<template>
  <div>
    <div class="v-search-item-content">
      <span class="v-search-label">{{params.label}}</span>
      <date-ranger-picker
        class="v-search-input v-search-date-ranger"
        v-model="selfValue"
        :options="params"
        @change="change"
      ></date-ranger-picker>
    </div>
  </div>
</template>

<script>
import DateRangerPicker from '../../date-ranger-picker';

const DEFAULT_OPTIONS = {
  placeholder: ['开始时间', '结束时间'],
};
const DEFAULT_FORMAT = {
  year: 'yyyy',
  month: 'yyyy-MM',
  date: 'yyyy-MM-dd',
  datetime: 'yyyy-MM-dd HH:mm',
};

export default {
  components: {
    DateRangerPicker,
  },
  data() {
    return {
      selfValue: [],
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
    placeholder: {
      type: Array,
      default: () => ['开始日期', '结束日期'],
    },
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
      const { showType = 'date' } = this.options;
      return {
        ...this.options,
        type: showType,
        valueFormat: this.getValueFormat(),
      };
    },
  },
  methods: {
    clearValue() {
      this.selfValue = [];
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
      return value || [];
    },
    getValueFormat() {
      const { showType, valueFormat } = this.options;
      return valueFormat || DEFAULT_FORMAT[showType] || DEFAULT_FORMAT.date;
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
.v-search-date-ranger {
  /deep/.el-input__icon {
    line-height: 28px;
  }
}
</style>

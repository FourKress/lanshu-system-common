<template>
  <div class="v-date-ranger-picker" :class="getClassNames()">
    <el-date-picker
      class="v-date-ranger-picker-input"
      ref="date-ranger-picker-start"
      v-model="startTime"
      :type="_options.type"
      :align="_options.align"
      :disabled="disabled"
      :editable="_options.editable"
      :prefix-icon="_options.prefixIcon"
      :picker-options="startTimeOptions"
      :placeholder="_options.placeholder[0]"
      :value-format="_options.valueFormat"
      :format="_options.format"
      :size="_options.size"
      @change="changeStart"
      @focus="handleFocus"
      @blur="handleBlur"
      :validateEvent="false"
    ></el-date-picker>
    <span class="v-date-ranger-picker-time-seg">-</span>
    <el-date-picker
      class="v-date-ranger-picker-input v-date-ranger-picker-input-end"
      ref="date-ranger-picker-end"
      v-model="endTime"
      :type="_options.type"
      :prefix-icon="'1'"
      :align="_options.align"
      :disabled="disabled"
      :editable="_options.editable"
      :picker-options="endTimeOptions"
      :placeholder="_options.placeholder[1]"
      :value-format="_options.valueFormat"
      :format="_options.format"
      :size="_options.size"
      @change="changeEnd"
      @focus="handleFocus"
      @blur="handleBlur"
      :validateEvent="false"
    ></el-date-picker>
  </div>
</template>

<script>
import Emitter from '@common/mixins/emitter';
import { dateIsAfter } from '../../utils';

const DEFAULT_OPTIONS = {
  type: 'date',
  placeholder: ['开始时间', '结束时间'],
  minDate: '',
  maxDate: '',
  prefixIcon: 'el-icon-date',
  valueFormat: 'yyyy-MM-dd',
  editable: false,
};

export default {
  mixins: [Emitter],
  data() {
    const validateStartTime = (time) => {
      const { endTime } = this;
      const { maxDate, minDate } = this._options;
      if (endTime && dateIsAfter(time, endTime)) return true;
      if (maxDate && dateIsAfter(time, maxDate)) return true;
      if (minDate && dateIsAfter(minDate, time)) return true;
    };
    const validateEndTime = (time) => {
      const { startTime } = this;
      const { maxDate, minDate } = this._options;
      if (startTime && dateIsAfter(startTime, time)) return true;
      if (minDate && dateIsAfter(minDate, time)) return true;
      if (maxDate && dateIsAfter(time, maxDate)) return true;
    };
    return {
      startTimeOptions: {
        disabledDate: this.validateStart || validateStartTime,
      },
      endTimeOptions: {
        disabledDate: this.validateEnd || validateEndTime,
      },
      startTime: undefined,
      endTime: undefined,
      focusStock: 0,
    };
  },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    disabled: Boolean,
    options: {
      type: Object,
      default: () => ({}),
    },
    styleType: {
      type: String,
      // union
      default: '',
    },
    index: Number,
    validateStart: Function,
    validateEnd: Function,

    validateEvent: {
      type: Boolean,
      default: true,
    },
  },
  inject: {
    enterSearch: {
      default: true,
    },
  },
  created() {
    this.startTime = this.value[0];
    this.endTime = this.value[1];
  },
  watch: {
    value: {
      deep: true,
      handler(value) {
        this.startTime = value[0];
        this.endTime = value[1];
      },
    },
  },
  computed: {
    _options() {
      const options = { ...DEFAULT_OPTIONS, ...this.options };
      return options;
    },
  },
  methods: {
    changeStart() {
      if (this.endTime === undefined) {
        this.$refs['date-ranger-picker-end'].focus();
        if (this.enterSearch) this.change();
      } else {
        this.change();
      }
    },
    changeEnd() {
      if (this.startTime === undefined) {
        this.$refs['date-ranger-picker-start'].focus();
        if (this.enterSearch) this.change();
      } else {
        this.change();
      }
    },
    handleFocus() {
      this.focusStock++;
    },
    handleBlur() {
      this.focusStock--;
      this.$nextTick(() => {
        if (this.focusStock === 0) {
          this.change();
        }
      });
    },

    change() {
      const startTime = this.startTime;
      const endTime = this.endTime;
      let value = [startTime, endTime];
      if (!startTime && !endTime) {
        value = [];
      }
      if (this.validateEvent) {
        this.dispatch('ElFormItem', 'el.form.change', value);
      }

      this.$emit('input', value);
      this.$emit('change', value, this.index);
    },

    getClassNames() {
      const classNames = [];
      if (this.styleType) classNames.push(`v-date-ranger-picker-${this.styleType}`);
      if (this.disabled) classNames.push('v-date-ranger-picker-disabled');
      return classNames.join(' ');
    },
  },
};
</script>

<style lang="less" scoped>
@disabledBackground: #f6f7fa;
@disabledBorder: #dce0e3;
@segWidth: 15px;
.v-date-ranger-picker {
  border-radius: 4px;
}
/deep/.v-date-ranger-picker-input {
  &.is-disabled .el-input__inner {
    background: @disabledBackground;
    border-color: @disabledBorder;
  }
  &.el-input {
    display: inline-block;
    width: calc((100% - @segWidth) / 2);
  }
}
.v-date-ranger-picker-time-seg {
  display: inline-block;
  width: @segWidth;
  text-align: center;
}
/* union样式 */
.v-date-ranger-picker-union {
  border: 1px solid @disabledBorder;
  &.v-date-ranger-picker-disabled {
    background: @disabledBackground;
  }
  /deep/.v-date-ranger-picker-input {
    .el-input__inner {
      border: 0;
      background: transparent;
    }
  }
  .v-date-ranger-picker-input-end {
    .el-input__inner {
      padding-left: 10px;
    }
  }
}
</style>

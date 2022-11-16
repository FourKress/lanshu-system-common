<template>
  <div class="v-input-ranger-wrap" :class="getClass()">
    <el-input
      class="v-input-ranger-input"
      v-model="start"
      :type="_options.type"
      :disabled="disabled"
      :size="_options.size"
      :clearable="_options.clearable"
      :placeholder="_options.placeholder[0]"
      v-bind="$attrs"
    >
      <template slot="append">
        <slot name="start"></slot>
      </template>
    </el-input>
    <span class="v-input-ranger-seg">-</span>
    <el-input
      class="v-input-ranger-input"
      v-model="end"
      :type="_options.type"
      :disabled="disabled"
      :size="_options.size"
      :clearable="_options.clearable"
      :placeholder="_options.placeholder[1]"
      v-bind="$attrs"
    >
      <template slot="append">
        <slot name="end"></slot>
      </template>
    </el-input>
    <p class="error-msg" v-show="!_options.showErrorMsg">{{ errorMsg }}</p>
  </div>
</template>

<script>
import regexRule from '../../utils/regex';
import { isEmpty, isNull } from '../../utils';

const DEFAULT_OPTIONS = {
  type: 'number',
  placeholder: ['起始值', '结束值'],
  min: undefined,
  max: undefined,
  showErrorMsg: true,
  clearable: true,
};
export default {
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
    needCheck: {
      type: Boolean,
      default: true,
    },
    index: Number,
    border: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      start: undefined,
      end: undefined,
      errorMsg: '',
    };
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(value) {
        if (isEmpty(value)) value = [];
        this.start = value[0];
        this.end = value[1];
      },
    },
    start(val) {
      this.change(val);
    },
    end(val) {
      this.change(val);
    },
  },
  computed: {
    _options() {
      return { ...DEFAULT_OPTIONS, ...this.options };
    },
  },
  methods: {
    getClass() {
      const { size } = this._options;
      const { border } = this;
      const arr = [];
      if (border) arr.push('v-input-ranger-border');
      if (size) arr.push(`v-input-ranger-${size}`);
      return arr.join(' ');
    },
    change(val) {
      if (this.needCheck && this.adjust(val)) return;
      this.$emit('input', [this.start, this.end]);
      this.$emit('change', [this.start, this.end], this.index);
    },
    adjust(val) {
      const msg = this.adjustInput(val);
      if (msg) {
        if (this._options.showErrorMsg) {
          this.$message.error(msg);
          this.errorMsg = msg;
        }
      } else {
        this.errorMsg = '';
      }
      return !!msg;
    },
    isNumber(val) {
      if (isNull(val)) return false;

      if (!regexRule.number.test(val)) return false;

      return true;
    },
    adjustInput(val) {
      const { min, max } = this._options;
      if (this.isNumber(val)) {
        if (!isNull(min) && val < min) return `输入值不能小于${min}`;
        if (!isNull(max) && val > max) return `输入值不能大于${max}`;
      } else if (!isNull(val)) return '只支持数字';
      if (!isNull(this.start) && !isNull(this.end) && parseFloat(this.start) > parseFloat(this.end)) return '起始值必须小于结束值';
      return '';
    },
  },
};
</script>

<style lang="less" scoped>
@height24: 24px;
@height30: 30px;
/deep/.v-input-ranger-wrap {
  height: @height24 + 2;
  line-height: @height24 + 2;
  .el-input__inner {
    height: @height24;
    height: @height24;
  }
  .v-input-ranger-input {
    height: @height24;
    line-height: @height24;
    vertical-align: top;
  }
}
/deep/.v-input-ranger-wrap-32 {
  height: @height30 + 2;
  line-height: @height30 + 2;
  .el-input__inner {
    height: @height30;
    height: @height30;
  }
  .v-input-ranger-input {
    height: @height30;
    line-height: @height30;
    vertical-align: top;
  }
}
.v-input-ranger-input.el-input {
  display: inline-block;
  width: calc((100% - 25px) / 2);
}
.v-input-ranger-seg {
  display: inline-block;
  width: 25px;
  text-align: center;
}
/* 第二种样式框 */
/deep/.v-input-ranger-border {
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  .el-input__inner {
    border: 0;
  }
  .v-input-ranger-input-end {
    .el-input__inner {
      padding-left: 10px;
    }
  }
}
/deep/.el-input__inner {
  line-height: initial;
}
</style>

<template>
  <div>
    <div class="v-search-item-content">
      <span class="v-search-label">{{ params.label }}</span>
      <el-input
        ref="input1"
        type="number"
        :min="params.min"
        :max="params.max"
        v-model="selfValue[0]"
        :placeholder="params.placeholder[0]"
        @blur="change"
        :clearable="params.clearable"
        @clear="clear"
        :size="params.size"
      >
        <template slot="append" class="value-ranger-append">
          <span class="split-line">-</span>
          <el-input
            type="number"
            :min="params.min"
            :max="params.max"
            v-model="selfValue[1]"
            :placeholder="params.placeholder[1]"
            @change="change"
            :clearable="params.clearable"
            @clear="clear"
            :size="params.size"
          />
        </template>
      </el-input>
    </div>
  </div>
</template>

<script>
const DEFAULT_OPTIONS = {
  clearable: true,
  placeholder: ['请输入初始值', '请输入结束值'],
};
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  data() {
    return {
      selfValue: [undefined, undefined],
    };
  },
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
    value: {
      type: Array,
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
  },
  methods: {
    clearValue() {
      this.selfValue = [];
      this.change(this.selfValue);
    },
    initValue() {
      const value = this.reallyValue(this.options);
      this.selfValue = value || [];
    },
    reallyValue(condition) {
      const { value } = condition;
      if (typeof value === 'function') {
        return value();
      }
      return value;
    },
    change() {
      const { min, max } = this.params;
      if (min !== undefined) {
        this.selfValue = this.selfValue.map((x) => {
          if (x && Number(x) < min) {
            x = min;
          }
          return x;
        });
      }
      if (max !== undefined) {
        this.selfValue = this.selfValue.map((x) => {
          if (x && Number(x) > max) {
            x = max;
          }
          return x;
        });
      }
      this.$emit('change', this.selfValue, this.options);
    },
    clear() {
      this.$emit('change', this.selfValue, this.options);
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
  .el-input-group {
    width: 75%;
    display: inline-flex;
  }
  .el-input-group__append {
    width: calc(100% + 10px);
    padding-left: 0;
    padding-right: 0;
    background: white;
    border: none;
    .el-input__inner {
      flex: 1;
    }
  }
  .el-input__suffix {
    margin-top: -2px;
  }
  /deep/.el-input--suffix {
    width: calc(100% - 16px);
  }
  .el-input {
    input {
      padding-right: 0;
      line-height: inherit;
      padding-top: 2px;
    }
  }
  .split-line {
    color: #000;
    margin-right: 16px;
  }
  .el-input__suffix-inner {
    margin-bottom: 2px !important;
  }
}
.value-ranger-td {
  width: 100%;
  border: 1px solid #dce0e3;
  border-radius: 4px;
  height: 28px;
  .v-search-item-content {
    line-height: 36px;
  }
  /deep/.el-input-group {
    width: 100%;
    input,
    .el-input--suffix,
    .el-input-group__append {
      border: none;
      background: transparent;
    }
    .el-input__suffix {
      top: 4px;
    }
    .el-input__inner {
      padding-top: 0;
    }
  }
}
</style>

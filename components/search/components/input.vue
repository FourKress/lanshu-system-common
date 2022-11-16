<template>
  <div>
    <div class="v-search-item-content">
      <!--      <span class="v-search-label">{{params.label}}</span>-->
      <el-input
        :class="{ 'v-search-input': true, 'mini-size': params.size === 'mini' }"
        v-model="selfValue"
        @change="change"
        :suffix-icon="params.icon"
        :clearable="params.clearable"
        :placeholder="params.placeholder"
        :size="params.size"
      >
        <span slot="suffix">
          <el-tooltip
            class="item"
            effect="dark"
            :content="params.placeholder"
            placement="bottom-start"
          >
            <i class="el-input__icon el-icon-info"></i>
          </el-tooltip>
        </span>
      </el-input>
    </div>
  </div>
</template>

<script>
const DEFAULT_OPTIONS = {
  placeholder: '请输入关键字',
  clearable: true,
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
    change(value) {
      let filterValue = value;
      // 处理value为 undefined 的情况
      if (this.options.filterSpace && value) {
        filterValue = value.replace(/\s/g, '');
      }
      this.$emit('change', filterValue, this.options);
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
  .v-search-input {
    .el-input__suffix-inner {
      margin-top: -2px;
      vertical-align: top;
      display: inline-block;
    }
    &.el-input--mini .el-input__icon {
      line-height: 28px;
    }
  }
  .mini-size {
    .el-input__suffix-inner {
      margin-top: 0 !important;
    }
  }
}
</style>

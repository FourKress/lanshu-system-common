<template>
  <el-radio-group
    v-bind="$attrs"
    v-on="$listeners"
    @change="change"
  >
    <template v-if="type === 'radio'">
      <el-radio
        v-for="(item) in locationOptions"
        :label="item.value"
        clearable
        :key="item.value"
      >{{item.label}}</el-radio>
    </template>
    <template v-else>
      <el-radio-button
        v-for="(item) in locationOptions"
        :label="item.value"
        clearable
        :key="item.value"
      >{{item.label}}</el-radio-button>
    </template>
    <slot></slot>
  </el-radio-group>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  props: {
    enumCode: {
      type: String,
    },
    type: {
      type: String,
      default: 'button',
    },
  },
  created() {
    // 当有枚举值code时，触发请求枚举options方法
    if (this.enumCode) {
      this.getEmumOptions(this.enumCode);
    }
  },
  computed: {
    ...mapGetters('global', ['enumOptions']),
    locationOptions() {
      if (this.$slots && this.$slots.default) {
        // 当有default slots的时候，不使用options渲染
        return null;
      }
      if (this.enumCode) {
        // 当有enumCode时，使用vuex的枚举值。
        const _options = this.enumOptions[this.enumCode] || [];
        return _options;
      }
      return null;
    },
  },
  methods: {
    ...mapActions('global', ['getEmumOptions']),
    change(value) {
      this.$emit('input', value);
    },
  },
};
</script>
<style lang="less" scoped>
</style>

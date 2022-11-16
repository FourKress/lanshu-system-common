<template>
  <div class="v-clear" :class="{ 'v-layout-header': true, 'v-layout-header-padding': withContent }">
    <slot name="title">
      {{ title }}
    </slot>
    <span class="v-fr">
      <slot></slot>
    </span>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    title: String,
  },
  methods: {},
  computed: {
    withContent() {
      const title = this.$slots.title;
      const deft = this.$slots.default;
      const text = title?.[0]?.text || '';
      const tag = title?.[0]?.tag;
      // 当组件里面没有任何内容时，取消组件的padding
      if (text.trim() === '' && !tag && !deft && !this.title) {
        return false;
      }
      return true;
    },
  },
};
</script>

<style lang="less" scoped>
.v-layout-header {
  color: #304156;
  font-size: 14px;
  font-weight: bold;
  line-height: 36px;
}
.v-layout-header-padding {
  padding-bottom: 14px;
  padding-top: 16px;
}
</style>

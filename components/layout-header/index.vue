<template>
  <div :class="{ 'v-layout-header': true, 'v-layout-header-padding': withContent }">
    <slot name="title" class="left">
      {{ title }}
    </slot>
    <span class="right">
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
  height: 34px;
  padding: 8px 0;
  box-sizing: content-box;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .left {
    flex: 1;
  }

  .right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
.v-layout-header-padding {
  padding-bottom: 3px;
  padding-top: 7px;
}
</style>

<template>
  <el-button
    ref="v-button"
    v-bind="$attrs"
    :type="type"
    @click="handleClick"
    :class="classNames"
  >
    <v-icon
      v-if="$attrs.icon && $attrs.icon.startsWith('icon')"
      :icon="$attrs.icon"
      :size="$attrs.iconSize || 12"
      class="mr6"
    ></v-icon>
    <slot></slot>
  </el-button>
</template>

<script>
import _ from 'lodash';
import VIcon from '../icon';

export default {
  props: ['fill', 'type'],
  components: {
    VIcon,
  },
  created() {
    if (this.autofocus) {
      this.$nextTick(() => {
        this.$refs['v-button'].$el.focus();
      });
    }
  },
  computed: {
    classNames() {
      const classArr = [];
      if (this.fill !== undefined) classArr.push('is-fill');
      return classArr.join(' ');
    },
  },
  methods: {
    handleClick: _.debounce(
      function () {
        // 防抖
        this.$emit('click');
      },
      300,
      { leading: true, trailing: false },
    ),
  },
};
</script>
<style lang="less" scoped></style>

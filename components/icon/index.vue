<template>
  <!-- svg -->
  <svg
    v-if="renderSvg"
    aria-hidden="true"
    class="v-icon-svg"
    :style="svgStyle"
    @click="handClick">
    <use :xlink:href="`#v-icon-${icon}`"></use>
  </svg>
  <!-- class模式 -->
  <i
    v-else
    class="v-icon v-icon-font"
    :class="iconClass"
    :style="iconStyle"
    @click="handClick"
    ></i>
</template>

<script>
import _ from 'lodash';

export default {
  props: {
    icon: {
      type: String,
    },
    color: {
      type: String,
    },
    renderSvg: {
      type: Boolean,
      default: false,
    },
    size: [String, Number],
    width: [String, Number],
    height: [String, Number],
  },
  computed: {
    iconClass() {
      const { icon } = this;
      return `v-icon-${icon}`;
    },
    svgStyle() {
      const { color, width, height } = this;
      return {
        color,
        width: width || 16,
        height: height || 16,
      };
    },
    iconStyle() {
      const { size, color } = this;
      return {
        fontSize: size ? `${size}px` : '',
        color,
      };
    },
  },
  methods: {
    handClick: _.debounce(function () {
      // 防抖
      this.$emit('click');
    },
    300,
    { leading: true, trailing: false }),
  },
};
</script>
<style lang="less" scoped>
  .icon-transform {
    overflow: hidden;
    transition: transform ease-in-out 0.3s;
    transform-origin: center;
  }

  .v-icon {
    &-svg {
      display: inline-block;
      vertical-align: middle;
      color: inherit;
    }
    &-font {
      display: inline-block;
      vertical-align: middle;
      color: inherit;
    }
  }
</style>

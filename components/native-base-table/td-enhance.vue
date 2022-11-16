<template>
  <td
    v-if="show"
    v-bind="bandProps"
    class="td-enhance"
    :style="{width: width}"
  >
    <el-tooltip
      v-if="width && isOverWidth"
      class="item"
      effect="dark"
      placement="top-start"
    >
      <template #content>
        <slot></slot>
      </template>
      <div
        :class="{'tooltip-td' : width && isOverWidth}"
        :style="{width: width}"
      >
        <slot></slot>
      </div>
    </el-tooltip>
    <template v-else>
      <div :style="{width: width}">
        <slot></slot>
      </div>
    </template>
  </td>
</template>

<script>
/**
 * 处理表格行和列合并
 */
export default {
  props: {
    colrowSpan: {
      type: [Object, Function],
      default: () => ({ rowspan: 1, colspan: 1 }),
    },
  },
  computed: {
    spanProps() {
      return _.omitBy(this.colrowSpan, (val) => val === 1 || _.isNil(val));
    },

    show() {
      return _.every(this.spanProps, (span) => span !== 0);
    },

    bandProps() {
      return Object.assign({}, this.$attrs, this.spanProps);
    },
    width() {
      let w = this.bandProps.width;
      if (w) {
        w = typeof w === 'number' ? `${w}px` : w;
      }
      return w;
    },
    isOverWidth() {
      const defaultNode = this.$slots.default || [];
      const text = defaultNode[0]?.children?.[0]?.text || '';
      return this.sizeOf(text) * 6.25 > this.width?.replace('px', '') * 1;
    },
  },
  methods: {
    sizeOf(str) {
      return str.replace(/[^\u0000-\u00ff]/g, 'aa').length || 0;
    },
  },
};
</script>

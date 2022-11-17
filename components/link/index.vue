<template>
  <a class="v-link" :href="href" :target="target">
    <slot></slot>
  </a>
</template>

<script>
import { generateUrl } from '../../utils';

export default {
  data() {
    return {};
  },
  props: {
    path: {
      type: [Number, String],
    },
    target: {
      type: String,
    },
  },
  computed: {
    href() {
      const { path } = this;

      if (/^(\/\/|http)/.test(path)) {
        return path;
      }

      return generateUrl({ path });
    },
  },
  methods: {},
};
</script>

<style lang="less" scoped>
.v-link {
  /*display: inline-block;*/
  /*width: 100%;*/
  color: #5a8dee;
}
</style>

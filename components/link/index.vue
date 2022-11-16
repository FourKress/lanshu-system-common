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
    module: {
      type: String,
    },
  },
  computed: {
    href() {
      const { path, module } = this;

      if (/^(\/\/|http)/.test(path)) {
        return path;
      }
      // 如果以/开头则被视为vue路由，构造成一个普通的url链接
      return generateUrl({ module, path });
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

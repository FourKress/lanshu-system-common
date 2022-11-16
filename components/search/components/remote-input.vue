<template>
  <div>
    <div class="v-search-item-content">
      <span class="v-search-label">{{ options.label }}</span>
      <v-remote-input
        v-model="selValue"
        class="v-search-input"
        popper-class="v-search-input-popper"
        @changeOption="changeOption"
        :mapKey="options.mapKey"
        :multiple="options.multiple"
        :collapseTags="options.collapseTags"
        :validateEvent="options.validateEvent"
        :clearable="options.clearable"
        :initType="options.initType"
        :autoAddQueryToOption="options.autoAddQueryToOption"
        :isAutoClear="options.isAutoClear"
        :optionRender="options.optionRender"
        :defaultOptions="options.defaultOptions"
        :focusTrigger="options.focusTrigger"
        :placeholder="options.placeholder"
        :showSelected="options.showSelected"
        @remoteMethod="options.remoteMethod"
      ></v-remote-input>
    </div>
  </div>
</template>
<script>
import vRemoteInput from '../../remote-input';

export default {
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
    value: {
      type: [Number, String],
    },
    toClear: Number,
    conditionsValue: Object,
  },
  data() {
    return {
      selValue: '',
    };
  },
  components: {
    vRemoteInput,
  },
  methods: {
    changeOption(value, option) {
      this.$emit('change', value, this.options);
    },
    reset() {
      this.selValue = '';
      this.changeOption('', undefined);
    },
  },
};
</script>
<style lang="less">
.v-search-input-popper {
  max-width: 20vw;
}
</style>

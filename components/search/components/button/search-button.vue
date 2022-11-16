<template>
  <div
    class="search-button-warp"
    :class="{ 'search-expand-button-warp': showExpand }"
  >
    <!--    <template v-if="showExpand">-->
    <template v-if="true">
      <el-button-group>
        <v-button
          class="search-button"
          type="primary"
          icon="v-icon v-icon-font v-icon-search"
          @click="search"
        ></v-button>
        <!--        <v-button-->
        <!--          class="expand-button"-->
        <!--          type="primary"-->
        <!--          plain-->
        <!--          @click="expandAll">-->
        <!--          {{expand ? '收起筛选' : '展开筛选'}}-->
        <!--        </v-button>-->
        <v-button class="expand-button" type="primary" plain @click="refresh">
          重置
        </v-button>
      </el-button-group>
    </template>
    <template v-else>
      <v-button
        class="search-button"
        type="primary"
        @click="search"
        icon="v-icon v-icon-font v-icon-search"
      ></v-button>
    </template>
  </div>
</template>

<script>
import VButton from '../../../button';

export default {
  components: {
    VButton,
  },
  data() {
    return {};
  },
  props: {
    expand: Boolean,
    showExpand: Boolean,
  },
  methods: {
    search() {
      this.$emit('search');
    },
    expandAll() {
      this.$emit('expandAll');
    },
    refresh() {
      this.$emit('refresh');
    },
  },
};
</script>

<style lang="less" scoped>
.search-button-warp {
  text-align: right;
  display: inline-block;
  padding-top: 6px;
  vertical-align: top;
}
/deep/.search-button {
  height: 28px;
  box-shadow: none;
  padding: 0 15px;
  &:hover {
    box-shadow: none;
  }
  i {
    font-size: 12px;
  }
}
.expand-button {
  height: 28px;
  padding: 0 15px;
}
</style>

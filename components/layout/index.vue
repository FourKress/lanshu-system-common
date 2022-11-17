<template>
  <div class="v-layout" v-loading.fullscreen.lock="loading">
    <r-header
      class="v-layout-header"
      @collapse="collapse"
      :isCollapse="isCollapse"
    ></r-header>
    <div class="v-layout-content">
      <r-menu
        class="v-layout-menu open"
        :class="isCollapse ? '' : 'close'"
        :isCollapse="isCollapse"
      ></r-menu>
      <div
        class="v-layout-view"
        :class="isCollapse ? 'pl200' : 'pl60'"
        @scroll="handleScroll"
      >
        <router-view
          @scroll="hasScrollEvent"
          :key="$route.fullPath"
        ></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import RHeader from '../header';
import RMenu from '../menu';

const { domain } = LANSHU_CONFIG;
export default {
  components: {
    RHeader,
    RMenu,
  },
  data() {
    return {
      isCollapse: !Cookies.get('collapse', { domain }), // 默认打开
      hasScroll: false, // 是否需要监听scroll事件
    };
  },
  computed: {
    loading() {
      return this.$store.state.global.fullScreenLoading;
    },
  },
  methods: {
    collapse() {
      this.isCollapse = !this.isCollapse;
      if (this.isCollapse) {
        Cookies.remove('collapse', { domain });
      } else {
        Cookies.set('collapse', true, { domain });
      }
    },
    hasScrollEvent(cb) {
      this.hasScroll = cb;
    },
    handleScroll(dom) {
      if (this.hasScroll && typeof this.hasScroll === 'function') {
        this.hasScroll(dom);
      }
    },
    handleUnload() {
      window.localStorage.removeItem('resources');
    },
  },
  mounted() {
    window.addEventListener('unload', this.handleUnload);
  },
  beforeDestroy() {
    window.removeEventListener('unload', this.handleUnload);
  },
};
</script>

<style lang="less" scoped>
.v-layout {
  min-width: 1200px;
  min-height: 100vh;
  background: #eaf0f7;
  position: relative;
  .v-layout-menu {
    background-color: #fff;
    height: 100%;
    position: fixed;
    flex-direction: column;
    min-height: 100vh;
    overflow: hidden;
    transition: all 0.1s ease-out;
    box-shadow: 0 0 6px 0 rgba(71, 95, 123, 0.12);
    display: flex;
    z-index: 99;
    &.open {
      width: 200px;
    }
    &.close {
      width: 60px;
    }
  }
  .v-layout-content {
    height: 100%;
    position: relative;
    float: left;
    min-height: 100vh;
    width: 100%;
  }
  .v-layout-view {
    position: relative;
    height: calc(100vh - 50px);
    overflow-x: hidden;
    overflow-y: auto;
    margin-top: 50px;
    // padding: 0 16px 16px 16px;
    display: block;
  }
  .pl200 {
    padding-left: 200px;
  }
  .pl60 {
    padding-left: 60px;
  }
}
</style>

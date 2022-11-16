<template>
  <div
    :class="{
      'v-page-view': true,
      'v-page-view-handle': isHandle && !plain,
      'v-page-view-handle-plain': isHandle && plain,
      'v-page-plain-title': plain && !!title,
    }"
  >
    <v-bread-crumb
      v-if="showCrumb"
      class="v-page-view-crumb"
      v-bind="$attrs"
    ></v-bread-crumb>
    <div class="crumb-block" v-else></div>
    <div class="v-page-view-content-wraper">
      <div
        class="v-page-view-content"
        :class="{
          'v-page-view-no-plain': !plain,
          'has-header': title,
        }"
        :style="{ 'max-width': contentWidth }"
      >
        <div v-if="title" class="v-page-view-content-header">
          <div class="v-page-view-content-header-title">{{ title }}</div>
        </div>
        <div class="v-page-view-content-body" :class="{ 'no-padding': plain }">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    showCrumb: {
      type: Boolean,
      default: true,
    },
    plain: Boolean,
    handle: Boolean,
    contentWidth: {
      type: String,
      default: '100%',
    },
    title: String,
  },
  data() {
    return {
      isHandle: false,
    };
  },
  created() {
    this.isHandle = this.handle;
  },
  methods: {
    addHandle(flag) {
      this.isHandle = flag;
    },
  },
};
</script>
<style lang="less" scoped>
@import '~@common/assets/styles/variables';
.v-page-view {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
.v-page-view-crumb {
  height: 40px;
  padding: 0 16px;
  background-color: #fff;
  z-index: 2;
  box-shadow: 0px 0px 6px 0px rgba(71, 95, 123, 0.12);
}
.crumb-block {
  height: 16px;
}
.v-page-view-content-wraper {
  display: block;
  height: calc(100vh - 90px);
  overflow-y: auto;
  padding: 16px;
  /deep/.v-page-view-content-wraper {
    height: auto;
  }
}
.v-page-view-content {
  border-radius: 4px;
  flex: 1;
  min-height: calc(100vh - 124px);
  margin: 0 auto;
  &.has-header {
    padding: 0;
    .v-page-view-content-body {
      padding: 16px;
      &.no-padding {
        padding: 0;
      }
    }
  }
  // min-height: calc(100% - 40px);
}
.v-page-view-no-plain {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 6px 0 rgba(71, 95, 123, 0.12);
  padding: 0 16px;
  .v-page-view-content-header {
    border-bottom: solid 1px #dfe3e7;
  }
}
.boxshadow,
.v-page-view-handle-plain,
.v-page-view-handle {
  .v-page-view-crumb {
    box-shadow: 0px 0px 10px 0px rgba(71, 95, 123, 0.2);
    z-index: 2;
  }
}
.v-page-view-handle-plain,
.v-page-view-handle {
  .v-page-view-content-wraper {
    .v-page-view-content {
      margin-bottom: 60px;
    }
  }
}

.v-page-view-content-header {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 50px;
  padding: 0 24px;
  margin-bottom: 16px;
  &-title {
    font-size: 14px;
    font-weight: 600;
    color: @primaryText;
  }
  // &:before {
  //   content: '';
  //   position: absolute;
  //   left: 0;
  //   display: block;
  //   width: 2px;
  //   height: 16px;
  //   background-color: #5a8dee;
  // }
}
.v-page-plain-title {
  .v-page-view-content-header {
    height: auto !important;
  }
}
</style>

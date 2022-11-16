<template>
  <el-dialog
    :visible.sync="dialogVisible"
    v-drag="isCanDrag"
    :width="width"
    :top="top"
    :append-to-body="true"
    :show-close="false"
    :modal="!isCanDrag"
    class="v-dialog"
    :before-close="beforeClose"
    :close-on-click-modal="closeOnClickModal"
    :class="{ [customClass]: true, noHeader: !showHeader }"
    :custom-class="dialogClass"
  >
    <template slot="title">
      <!-- 支持自定义渲染标题 -->
      <slot
        name="title"
        class="dialog-title"
      >
        <span
          v-if="title"
          :style="{ color: titleColor }"
          v-html="title"
          class="v-dialog-title"
        ></span>
      </slot>
      <span
        class="v-dialog-close"
        @click="closeDialog"
      >
        <v-icon
          icon="close"
          size="12"
        ></v-icon>
      </span>
    </template>
    <slot></slot>
    <div
      slot="footer"
      v-if="showFooter"
    >
      <!-- 支持自定义渲染 footer -->
      <slot
        name="footer"
        class="dialog-footer"
      >
        <v-button
          class="cancel"
          type="default"
          @click="dialogCancel"
          v-if="showBtnCancel"
          :autofocus="true"
        >
          <span>{{ cancelText }}</span>
        </v-button>
        <v-button
          type="primary"
          @click="dialogSure"
          v-if="showBtnSure"
        >{{
          sureText
        }}</v-button>
      </slot>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: {
    sureText: {
      type: String,
      default: '确定',
    },
    cancelText: {
      type: String,
      default: '取消',
    },
    isCanDrag: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    customClass: {
      type: [String, Array],
      default: '',
    },
    dialogClass: {
      type: [String, Array],
      default: '',
    },
    visible: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: '',
    },
    minWidth: {
      type: String,
      default: '',
    },
    top: {
      type: String,
      default: '10vh',
    },
    showBtnSure: {
      type: Boolean,
      default: true,
    },
    showBtnCancel: {
      type: Boolean,
      default: true,
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    closeOnClickModal: {
      type: Boolean,
      default: false,
    },
    modal: {
      type: Boolean,
      default: false,
    },
    type: String,
    titleColor: String,
  },
  data() {
    return {
      dialogVisible: false,
      beforeClose: () => {
        this.closeDialog();
      },
    };
  },
  watch: {
    visible: {
      handler(val) {
        this.dialogVisible = val || false;
      },
      immediate: true,
    },
  },
  methods: {
    closeDialog() {
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    dialogCancel() {
      this.$emit('dialogCancel');
      this.closeDialog();
    },
    dialogSure() {
      this.$emit('dialogSure');
    },
  },
};
</script>
<style lang="less" scoped>
.dialog-footer {
  .el-button {
    padding: 10px 29px;
  }
}
.el-button--gray {
  color: #a1a1a1;
}
.v-dialog-close {
  cursor: pointer;
  .v-icon {
    color: #aab2ba;
    &:hover {
      color: #5a8dee;
    }
  }
}
.v-dialog-title {
  font-size: 14px;
}
/deep/.el-dialog .el-dialog__header {
  padding: 0 24px;
}
.el-dialog__wrapper {
  // pointer-events: none;
  background: rgba(0, 0, 0, 0.05);
}
.drag_dialog {
  //使用拖拽功能时 customClass添加此样式
  /deep/.el-dialog {
    overflow-x: scroll;
    cursor: se-resize;
    resize: both;
    height: 70vh;
    box-shadow: 0 1px 20px rgba(0, 0, 0, 0.2);
    .el-dialog__body {
      pointer-events: all;
      padding: 0;
      height: calc(100% - 50px);
      max-height: 100vh;
    }
    .el-dialog__header {
      pointer-events: all;
    }
  }
}
.full_dialog {
  pointer-events: all;
  /deep/.el-dialog {
    height: 100vh;
    margin-top: 0 !important;
    margin-bottom: 0;
  }
  /deep/.el-dialog__body {
    height: calc(100vh - 16px);
  }
}
.noHeader {
  /deep/.el-dialog__header {
    display: none;
  }
}
</style>

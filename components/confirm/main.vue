<template>
  <v-dialog
    ref="confirmDialog"
    :width="width"
    :title="title"
    :visible.sync="visible"
    :top="top"
    :sureText="sureText"
    :cancelText="cancelText"
    :customClass="renderClass()"
    @dialogSure="dialogSure"
    @close="closeSure"
    :showBtnSure="showBtnSure"
    :showBtnCancel="showBtnCancel"
    :fullscreen="fullscreen"
    :class="{ full: fullscreen }"
  >
    <div class="confirm-box">
      <!-- 这里使用v-html 方便颜色和图标的渲染 -->
      <v-icon :icon="type" v-if="type" size="14"></v-icon>
      <Expand v-if="render" :render="render"></Expand>
      <div v-if="text" v-html="text" class="confirm-box-text"></div>
    </div>
  </v-dialog>
</template>
<script>
import Expand from './expand';

export default {
  components: { Expand },
  data() {
    return {
      title: '提示',
      visible: false,
      top: '200px',
      width: '430px',
      text: '',
      sureText: '',
      cancelText: '',
      customClass: '',
      showBtnSure: true, // 是否展示确认按钮
      showBtnCancel: true, // 是否展示取消按钮
      promiseStatus: null,
      render: undefined,
      type: '',
      fullscreen: false, // 是否为全屏
      returnType: 0,
      iconObject: {
        warn: 'warn',
        error: 'error',
        success: 'prompt-success',
      },
    };
  },
  methods: {
    open(data = {}) {
      const {
        title = '提示',
        top = '200px',
        text = '',
        customClass = '',
        sureText = '',
        cancelText = '',
        type = '',
        showBtnSure = true,
        showBtnCancel = true,
        width = '430px',
        returnType = 0,
        fullscreen = false,
        render = undefined,
      } = data;
      this.title = title;
      this.top = top;
      this.text = text;
      this.sureText = sureText || '确定';
      this.cancelText = cancelText || '取消';
      this.showBtnSure = showBtnSure;
      this.showBtnCancel = showBtnCancel;
      this.type = this.iconObject[type] || type;
      this.visible = true;
      this.customClass = customClass;
      this.width = width;
      this.render = render;
      this.returnType = returnType;
      this.fullscreen = fullscreen;
      if (this.returnType === 1) {
        return this;
      }
      return new Promise((resolve, reject) => {
        this.promiseStatus = { resolve, reject };
      });
    },
    dialogSure() {
      this.visible = false;
      this.promiseStatus && this.promiseStatus.resolve(true);
    },
    closeSure() {
      if (this.promiseStatus) {
        if (typeof this.promiseStatus.reject === 'function') {
          this.promiseStatus.reject();
        } else {
          this.promiseStatus.resolve(false);
        }
      }
    },
    renderClass() {
      return `confirm ${this.customClass} `;
    },
  },
  watch: {
    visible(value) {
      if (!value && this.$el && this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
      }
    },
  },
};
</script>
<style lang="less" scoped>
.confirm {
  /deep/ .el-dialog__body {
    padding-top: 16px;
  }
  .confirm-box {
    display: flex;
    align-items: flex-start;
    .v-icon-warn {
      color: #fdac41;
    }
    .v-icon-prompt-success {
      color: #44cd87;
    }
    .v-icon-error {
      color: #ff5b5c;
    }
    .v-icon {
      transform: translateY(-2px);
    }
  }
  .confirm-box-text {
    flex: 1;
    margin-left: 5px;
  }
  .desc {
    font-size: 12px;
    margin-top: 10px;
  }
}
</style>

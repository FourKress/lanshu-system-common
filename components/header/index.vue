<template>
  <div class="v-header">
    <v-link path="/">
      <div
        class="v-header-logo v-cursor"
        :class="!isCollapse ? 'collapse' : ''"
        v-if="isCollapse"
      >
        <v-icon icon="menu-website-clues" height="100%"></v-icon>
        <span class="title">后台管理系统</span>
      </div>
    </v-link>
    <div class="v-header-content">
      <div class="v-header-left">
        <span class="v-header_icon" @click="collapse">
          <v-icon
            icon="collapse"
            size="14"
            class="v-header-left__collapse"
          ></v-icon>
        </span>
        <span class="v-header_icon" @click="goHome">
          <v-icon icon="home" size="16" class="v-header-left__home"></v-icon>
        </span>
      </div>
      <div class="v-header-right">
        <span class="v-header_icon mr32" @click="toggleScreen">
          <v-icon
            :icon="
              !isFullScreen ? 'icon-full-screen' : 'icon-close-full-screen'
            "
            size="16"
          ></v-icon>
        </span>

        <el-dropdown @command="handleCommand" :hide-on-click="false">
          <span class="v-header_user-container">
            <el-avatar
              class="v-header_user-container-avatar"
              :src="userInfo.avatarFileUrl"
            >
              <v-icon icon="icon-avatar" size="28"></v-icon>
            </el-avatar>
            <span class="v-header_user-container__name">
              {{ userInfo.name }}
            </span>
            <i class="el-icon-arrow-down"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="edit">修改密码</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <!-- 修改密码 -->
    <VEditPassword :visible.sync="editPassDialogVisible" @sure="editPassSure" />

    <!-- 系统错误相关信息提示 -->
    <v-dialog
      :visible="userInfoError.visible"
      title="系统提示"
      custom-class="err-tips-dialog"
      @close="closeTips('close')"
      @dialogSure="closeTips('sure')"
      width="480px"
    >
      <div class="err-tips-content">
        <div class="icon-container">
          <v-icon icon="warn"></v-icon>
        </div>
        <div class="text">{{ userInfoError.message }}</div>
      </div>
    </v-dialog>

    <!-- 密码修改成功提示 -->
    <v-dialog
      :visible="editPassTipsVisible"
      title="系统提示"
      custom-class="err-tips-dialog"
      @close="logOutSys"
      :showBtnCancel="false"
      @dialogSure="logOutSys"
      width="480px"
    >
      <div class="err-tips-content">
        <div class="icon-container-success">
          <v-icon icon="prompt-success"></v-icon>
        </div>
        <div class="text">密码修改成功！请重新登录系统！</div>
      </div>
    </v-dialog>
  </div>
</template>

<script>
import { removeToken } from '../../utils/token';
import VIcon from '../icon';
import VDialog from '../dialog';
import VEditPassword from '../editPassword';

export default {
  components: {
    VIcon,
    VDialog,
    VEditPassword,
  },
  props: {
    isCollapse: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isFullScreen: false,
      editPassDialogVisible: false,
      editPassTipsVisible: false,
      systemTypes: undefined,
      systemTypesPre: undefined,
    };
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo;
    },
    userInfoError() {
      return this.$store.state.user.userInfoError;
    },
  },
  created() {
  },
  mounted() {
  },
  methods: {
    collapse() {
      this.$emit('collapse');
    },
    goHome() {
      const { path } = this.$route;
      if (path !== '/') this.$router.push('/');
    },
    toggleScreen() {
      if (!this.isFullScreen) {
        this.fullScreen();
      } else {
        this.exitFullscreen();
      }
      this.isFullScreen = !this.isFullScreen;
    },
    fullScreen() {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      }
    },
    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    },
    handleCommand(command) {
      switch (command) {
        case 'edit':
          this.$refs.form && this.$refs.form.resetFields();
          this.editPassDialogVisible = true;
          break;
        case 'logout':
          this.logout();
          break;
        default:
          break;
      }
    },
    logout() {
      this.$Rconfirm({ text: '确定退出系统吗？' })
        .then(() => {
          this.logOutSys();
        })
        .catch(() => {});
    },
    logOutSys() {
      this.$https
        .post('/login/out', {
          disabledErrorMessage: true,
          userId: this.userInfo.userId,
        })
        .then(() => {
          this.handleOut();
        })
        .catch(() => {
          this.handleOut();
        });
    },
    handleOut() {
      removeToken();
      window.location.replace(`${window.location.origin}/#/login`);
    },
    closeTips(type) {
      // 退出类型 并且是确定按钮
      if (this.userInfoError.type === 'logout' && type === 'sure') {
        // this.logOutSys()
        removeToken();
      } else {
        this.$store.commit('user/userInfoError', {
          visible: false,
          message: '',
        });
      }
    },
    editPassSure(form) {
      const { oldPassword, newPassword } = form;
      this.$https
        .post('user/pwd/change', {
          oldPwd: oldPassword,
          newPwd: newPassword,
        })
        .then((res) => {
          this.editPassTipsVisible = true;
        });
    },
  },
};
</script>

<style lang="less" scoped>
.v-header {
  height: 50px;
  background-color: #38506d;
  display: flex;
  padding-right: 16px;
  position: fixed;
  z-index: 100;
  width: 100%;
  .v-header-logo {
    height: 50px;
    width: 160px;
    box-shadow: 0 1px 6px 0 rgba(71, 95, 123, 0.12);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    transition: width 0.1s ease-out;
    color: #fff;
    padding-left: 18px;

    .v-icon {
      color: #fff;
      font-size: 20px;
    }
    .title {
      padding-left: 2px;
      font-size: 14px;
    }
    &.collapse {
      width: 60px;
    }
    /deep/ .v-icon-content {
      height: 100%;
      width: 100%;
      text-align: center;
    }
  }
  .v-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
  }
  .v-header_icon {
    cursor: pointer;
    color: #bbc1c8;
    &.mr32 {
      margin-right: 32px;
    }
  }
  .v-header-left__collapse {
    margin: 0 26px 0 20px;
  }
}

.v-header_user-container {
  display: inline-block;
  cursor: pointer;
  color: #bbc1c8;
}

.v-header_user-container-avatar {
  width: 28px;
  height: 28px;
  line-height: 28px;
  vertical-align: middle;
}

.v-header_user-container__name {
  font-size: 12px;
  margin: 0 10px 0 6px;
}

.err-tips-dialog {
  /deep/ .err-tips-content {
    display: flex;
    margin-bottom: 16px;
    line-height: 24px;
    .icon-container {
      color: #fdac41;
      margin-right: 8px;
      .v-icon {
        vertical-align: 0;
      }
    }
    .icon-container-success {
      color: #44cd87;
      margin-right: 8px;
      .v-icon {
        vertical-align: 0;
      }
    }
    .el-icon-warning {
      font-size: 20px;
    }
  }
}

.header-system-select {
  width: 180px !important;
  margin-right: 32px;
  /deep/.el-input__inner {
    background-color: #485d78;
    color: #bbc1c8;
    border-width: 0px;
  }
  /deep/.el-input__prefix {
    i {
      line-height: 32px;
      margin-left: 4px;
    }
  }
}

/deep/.v-page-empty {
  padding-bottom: 16px;
}
.v-header-right {
  display: flex;
  align-items: center;
}
</style>

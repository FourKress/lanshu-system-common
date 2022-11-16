<template>
  <div class="v-menu">
    <div class="v-menu-container" :class="!collapse ? 'collapse' : ''">
      <el-menu
        :default-active="shortcutMenuOpenEds ? '' : active"
        class="v-menu-container_menu"
        :collapse-transition="false"
        :collapse="!collapse"
        :unique-opened="true"
        :default-openeds="[activeOpenEds]"
        @open="handleMenuOpen"
      >
        <el-submenu
          v-for="route in routes"
          :key="route.path || route.name"
          :index="route.path || route.name"
        >
          <template slot="title">
            <v-icon
              :icon="route.icon"
              style="padding-right: 4px; transform: translateY(-1px)"
            ></v-icon>
            <span>{{ route.title }}</span>
          </template>
          <el-menu-item
            v-for="r in route.children"
            :key="r.path"
            :index="r.path"
            @click="handleNavClick(r.path, route.name)"
          >
            {{ currentRouteName(r.meta) }}
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { groupRoute } from '@/router/router-list';

export default {
  props: {
    isCollapse: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      active: '/',
      isHome: false,
      routes: [],
      shortcutMenuOpenEds: '',
      activeOpenEds: '',
    };
  },
  computed: {
    collapse() {
      return this.isCollapse;
    },
    userInfo() {
      return this.$store.state.user.userInfo || {};
    },
    menuList() {
      return this.$store.state.user.userMenu || [];
    },
  },
  created() {
    const codes = this.menuList.map((d) => d.code);
    // this.routes = groupRoute.filter((d) => {
    //   let children = d.children;
    //   if (children?.length) {
    //     d.children = children.filter((n) => {
    //       return this.checkRoute(n, codes);
    //     });
    //   }
    //   return this.checkRoute(d, codes);
    // });
    this.routes = groupRoute;
  },
  mounted() {
    this.setActiveMenu();
    if (!this.active) {
      this.isHome = true;
    }
  },
  watch: {
    $route: {
      handler() {
        this.setActiveMenu();
      },
      deep: true,
    },
    active: {
      handler(val) {
        if (!val) {
          this.isHome = true;
        }
      },
    },
  },
  methods: {
    checkRoute(route, codes) {
      const code = route.meta?.code;
      const leaf = route.meta?.leaf;
      if (!code) {
        return !leaf;
      }
      if (Array.isArray(code)) {
        let flag = false;
        code.forEach((n) => {
          if (codes.includes(n)) {
            flag = true;
          }
        });
        if (flag) return !leaf;
      } else if (codes.includes(code)) {
        return !leaf;
      }
      return false;
    },
    setActiveMenu() {
      setTimeout(() => {
        const { path, meta } = this.$route;
        let targetPath = '';
        let activeOpenEds = '';
        this.routes.forEach((d) => {
          const child = d.children;
          child.forEach((c) => {
            if (c.path === path) {
              targetPath = c.path;
              activeOpenEds = d.name;
            } else if (meta.bread?.length) {
              const flag = meta.bread.some((n) => n.path === c.path);
              if (flag) {
                activeOpenEds = d.name;
                targetPath = meta.bread[0].path;
              }
            }
          });
        });
        this.active = targetPath || '/';
        this.activeOpenEds = activeOpenEds;
      }, 10);
    },

    handleNavClick(path, parentNav = '') {
      if (!path) return;
      if (path === this.$route.path) return;
      if (!parentNav) {
        this.shortcutMenuOpenEds = 'shortcutMenu';
        this.activeOpenEds = '';
      } else {
        this.activeOpenEds = parentNav;
        this.shortcutMenuOpenEds = '';
      }
      this.$router.push(path);
    },
    handleMenuOpen(index) {
      this.activeOpenEds = index;
      this.shortcutMenuOpenEds = '';
    },
    isActiveMatchMenu(menuList, path) {
      menuList.map((item) => {
        if (path === item.path && item.resourceType.value === 2) {
          console.log('path', path, item.path);
          this.active = path;
          this.isHome = false;
        } else if (item.children.length) {
          this.isActiveMatchMenu(item.children, path);
        }
      });
    },
    convertMenu(data, menu = []) {
      data.forEach((item) => {
        menu.push(item);
        if (item.children && item.children.length > 0) {
          menu.concat(...this.convertMenu(item.children, menu));
        }
      });
      return menu;
    },
    currentRouteName(meta) {
      const bread = _.cloneDeep(meta.bread);
      return bread.reverse()[0].name;
    },
  },
};
</script>

<style lang="less">
.v-menu {
  .v-menu-container {
    height: calc(100vh - 50px);
    overflow-y: auto;
    overflow-x: hidden;
    margin-top: 50px;
    margin-right: -17px;
    padding: 0px 0 30px 0;
    width: 217px;
    .v-menu-container__content + .v-menu-container__content {
      margin-top: 20px;
    }
    &.collapse {
      .v-menu-container__content + .v-menu-container__content {
        margin-top: 0;
      }
    }
  }

  .v-menu-container_title {
    color: #304156;
    font-weight: bold;
    font-size: 12px;
    padding-left: 20px;
  }
  .v-menu-container_menu {
    border-right: none;
  }
  .el-menu-item,
  .el-submenu__title {
    height: 36px;
    line-height: 36px;
  }
  .v-menu-container_submenu_text {
    margin-left: 10px;
  }
  .v-menu-container_submenu_text2 {
    margin-left: 5px;
  }
  .el-submenu__icon-arrow {
    left: 170px !important;
    right: unset;
    color: #bbc1c8 !important;
  }
}

.el-submenu__title {
  height: 36px;
  line-height: 36px;
  color: #475f7b;
  &:hover {
    background-color: #f6f7fa;
  }
}

.el-menu--collapse {
  .el-submenu__title {
    height: 36px;
    line-height: 36px;
    &:hover {
      background-color: #f6f7fa;
    }
  }
  .el-submenu__icon-arrow {
    display: none;
  }
  .el-menu-item,
  .el-submenu {
    &.is-active {
      background-color: #eef3fd;
    }
    &:hover {
      background-color: #f6f7fa;
    }
  }
}

.el-menu-item {
  height: 36px;
  line-height: 36px;
  position: relative;
  &:hover {
    background-color: #f6f7fa;
  }
}

.el-submenu {
  .el-menu-item {
    width: 200px;
    height: 36px;
    line-height: 36px;
    padding-left: 48px !important;
    .v-link {
      color: #475f7b;
      font-size: 12px;
      display: inline-block;
      width: 100%;
    }
    &.is-active {
      border-right: 2px solid #5a8dee;
      color: #5a8dee;
      background-color: #eef3fd;
      .v-link {
        color: #5a8dee;
      }
    }
    &:hover {
      background-color: #f6f7fa;
    }
  }
  &.is-active {
    .el-submenu__title {
      color: #5a8dee;
      .el-submenu__icon-arrow,
      .el-icon-arrow-down {
        color: #5a8dee !important;
      }
    }
  }
}

.popper-menu-item {
  height: 48px;
  line-height: 48px;
  background: #f6f7fa;
  color: #3e3e3e;
  padding: 0 20px;
  border: none;
  border-radius: 2px;
  margin-top: -2px;
  margin-left: 20px !important;
  &:hover {
    background: #eef3fd;
    cursor: pointer;
  }
  .v-link {
    display: inline-block;
    width: 100%;
    color: #3e3e3e !important;
    &:hover {
      color: #5a8dee !important;
    }
  }
}

.el-menu--collapse {
  .no-child-menu-item {
    height: 48px;
    line-height: 48px;
  }
}

.el-tooltip__popper {
  max-height: 500px;
  .v-link {
    color: #fff;
  }
}

// 收起后的样式修改
.el-menu--vertical {
  .el-menu-item {
    color: #727e8c;
    &.is-active {
      color: #5a8dee;
      background-color: #eef3fd;
      border-right: 2px solid #5a8dee;
      .v-link {
        color: #5a8dee;
        font-size: 12px;
      }
    }
    .v-link {
      color: #727e8c;
      font-size: 12px;
      display: inline-block;
      width: 100%;
    }
  }
  .before {
    vertical-align: middle;
    margin-bottom: 1px;
    height: 4px;
    display: inline-block;
    width: 4px;
    border-radius: 100%;
    background: #ccc;
    margin-right: 8px;
  }
  .el-menu--vertical--item {
    height: 48px;
    line-height: 48px;
    // background: rgba(238, 243, 253, 1);
    color: #475f7b !important;
    font-weight: bold;
  }
}

.el-menu--popup {
  padding: 0;
  min-width: 150px;
}

.el-menu--popup-right-start {
  margin: 0;
}
.isActive {
  background: #fff !important;
  .v-icon-font {
    color: #475f7b !important;
  }
}

.el-submenu {
  .el-submenu {
    .el-submenu__title {
      padding-left: 48px !important;
    }
  }
}

.nav-title {
  .set {
    margin-left: 8px;
    transform: translateY(-1px);
    opacity: 0;
  }
  &:hover {
    .set {
      opacity: 1;
      margin-left: 8px;
      transform: translateY(-1px);
    }
  }
}
</style>

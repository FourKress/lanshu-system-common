<template>
  <div>
    <el-breadcrumb
      v-if="crumbsList.length > 1"
      separator-class="el-icon-arrow-right"
      class="v-bread-crumb"
    >
      <template v-for="(item, index) in crumbsList">
        <el-breadcrumb-item
          v-if="crumbsList.length !== index + 1"
          :key="index"
          :class="renderClass(item)"
        >
          <span class="breadcrumb-item" :class="renderClass(item)">
            <v-link
              v-if="item.path"
              class="breadcrumb-link"
              :path="getPath(item.path)"
            >
              {{ item.name }}
            </v-link>
            <template v-else>{{ item.name }}</template>
          </span>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-else :key="index">
          <span class="breadcrumb-item-last">
            {{ crumbsList[crumbsList.length - 1].name }}
          </span>
        </el-breadcrumb-item>
      </template>
    </el-breadcrumb>
    <span class="v-bread-crumb-right" v-if="showRight">
      <slot name="right">
        <span @click="goPage">
          <v-icon
            icon="icon-lastyear"
            size="22"
            style="vertical-align: bottom"
          ></v-icon>
          返回上一页
        </span>
      </slot>
    </span>
  </div>
</template>

<script>
import { isEmpty } from '../../utils';

export default {
  data() {
    return {
      crumbsList: [],
    };
  },
  props: {
    toPage: String,
    showRight: {
      type: Boolean,
      default: false,
    },
    pathName: [String],
    crumbs: Array,
    targetPath: Array,
    lastCrumbName: String,
  },
  created() {
    this.getMenu();
  },
  watch: {
    $route: {
      deep: true,
      handler() {
        this.getMenu();
      },
    },
    pathName() {
      this.getMenu();
    },
  },
  methods: {
    renderClass(item) {
      if (item.path && (item.path.includes('/') || item.path === '')) {
        return 'pointer';
      }
      return '';
    },
    getPath(path) {
      // 匹配动态路由
      const dynamicRoute = path.match(/(:[^/]+)(\/)?/g);
      if (dynamicRoute) {
        const { params } = this.$route;

        dynamicRoute.forEach((part) => {
          const repPart = part.replace(/\//, '');
          const key = part.replace(/:/, '');
          if (params[key]) {
            path = path.replace(repPart, params[key]);
          }
        });
      }

      if (this.targetPath instanceof Array) {
        const [oldPath, newPath] = this.targetPath;
        if (oldPath && newPath && oldPath === path) {
          return newPath;
        }
      }
      return path;
    },
    getMenu() {
      const userMenu = this.$store.state.user.userMenu || [];
      const data = this.convertMenu(Object.assign([], userMenu));
      this.getCrumbsList(data);
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
    getCrumbsList(menu) {
      if (!isEmpty(this.crumbs)) {
        this.crumbsList = _.cloneDeep(this.crumbs);
        return;
      }
      const {
        path, meta = {}, matched = [],
      } = this.$route;
      let crumbsList = [];
      if (meta.bread?.length > 0) {
        crumbsList = [{ name: '首页', path: '/' }, ...meta.bread];
      } else {
        // 已匹配的路径
        const lastMatched = matched[matched?.length - 1] || {};
        const findLast = menu.find((item) => {
          return item.path === (meta.path || lastMatched.path || path);
        });
        if (findLast) {
          if (this.pathName) {
            findLast.name = this.pathName;
          }
          crumbsList.push(findLast);
          let parentList = this.getParentList(findLast, menu);
          if (parentList && parentList.length > 0) {
            parentList = parentList.reverse();
            parentList = parentList.filter((item) => {
              return item.parentId && item.resourceType?.value !== 1;
            });
            crumbsList = [
              { name: '首页', path: '/' },
              ...parentList,
              ...crumbsList,
            ];
          }
        }
      }

      if (this.lastCrumbName) {
        const lastCrumbs = crumbsList.pop();
        lastCrumbs.name = this.lastCrumbName;
        crumbsList.push(lastCrumbs);
      }

      this.setTitle(crumbsList);
      this.crumbsList = crumbsList;
    },

    /**
     * 设置title
     */
    setTitle(crumbsList) {
      const currentItem = _.last(crumbsList);

      if (currentItem) {
        document.title = `${currentItem.name} - 管理系统系统`;
      }
    },

    /**
     * 获取父面包屑的内容
     */
    getParentList(data, menu, list = []) {
      const parentId = data.parentId;
      const find = menu.find((item) => {
        return item.id === parentId;
      });
      if (find) {
        list.push(find);
        this.getParentList(find, menu, list);
      }
      return list;
    },

    goPage() {
      if (this.toPage) {
        this.$router.push(this.toPage);
      } else {
        this.$router.go(-1);
      }
    },
  },
};
</script>

<style lang="less">
.el-breadcrumb__separator[class*='icon'] {
  margin: 0 3px;
}

.v-bread-crumb {
  height: 40px;
  line-height: 40px;
  font-size: 12px;
  display: inline-block;
  .el-breadcrumb__item {
    user-select: none;
    &.pointer {
      cursor: pointer;
    }
  }
  .breadcrumb-item {
    color: #727e8c;
    &.pointer {
      &:hover {
        color: #727e8c;
      }
    }
  }
  .breadcrumb-item-last {
    color: #475f7b;
  }
}
.v-bread-crumb-right {
  float: right;
  display: inline-block;
  height: 40px;
  line-height: 40px;
  color: #5a8dee;
  border-left: 1px solid #e8ebee;
  padding-left: 12px;
  cursor: pointer;
  i {
    margin-right: 6px;
  }
}
.breadcrumb-link.v-link {
  color: inherit;
  font-weight: normal;
  &:hover {
    color: inherit;
  }
}
</style>

<template>
  <div class="v-filter-tree">
    <el-popover
      ref="popover"
      v-model="showPopover"
      class="v-filter-tree-input"
      :popper-class="popperClass"
      placement="bottom-start"
      :arrow-offset="35"
      @show="popoverOpen"
      @hide="popoverHide"
      trigger="click"
      :disabled="treeDisabled"
    >
      <el-input
        :placeholder="filterPlaceholder"
        class="mb10"
        v-model="filterText"
      ></el-input>
      <el-tree
        ref="tree"
        :key="treeKey"
        v-bind="$attrs"
        v-on="$listeners"
        class="v-filter-tree-limit"
        :class="{ 'v-filter-tree-single': !multiple }"
        :style="{ width }"
        :node-key="nodeKey"
        :show-checkbox="showCheckbox"
        :data="selfTreeData"
        :props="mapKey"
        :expand-on-click-node="selfExpandOnClickNode"
        :check-on-click-node="true"
        :default-expanded-keys="expandedKeys"
        :default-expand-all="defaultExpandAll"
        :default-checked-keys="defaultCheckedKeys || expandedKeys"
        :check-strictly="checkStrictly"
        :filter-node-method="filterNode"
        @node-click="singleCheck"
        @check-change="checkChange"
      >
        <template slot-scope="{ data, node }">
          <slot :data="data">
            <div
              class="tree-content"
              :title="data[mapKey.label]"
              :class="setClassName(data, node)"
            >
              {{ data[mapKey.label] }}
            </div>
          </slot>
        </template>
      </el-tree>
      <div class="tree-btn" v-if="multiple">
        <span class="tree-multipleCheck-btn v-blue" @click="multipleCheck"
          >确定</span
        >
      </div>
      <tag-input
        slot="reference"
        :placeholder="placeholder"
        :multiple="multiple"
        :collapseTags="collapseTags"
        :show="showPopover"
        :mapKey="mapKey"
        :inputLable="inputLable"
        :checked="checkedList"
        @clearAll="clearAll"
        @clear="clear"
        :disabled="treeDisabled"
        :disabledClose="disabledClose"
      ></tag-input>
    </el-popover>
  </div>
</template>

<script>
import { isNull, isEmpty } from '../../utils';
import TagInput from './tag-input';
import https from '../../utils/https';

const DEFAULT_MAP_KEY = {
  label: 'label',
  id: 'id',
  children: 'children',
};

export default {
  components: {
    TagInput,
  },
  inject: {
    // 注入el 表单的公共属性
    elForm: {
      default: '',
    },
    elFormItem: {
      default: '',
    },
  },
  data() {
    return {
      checkedList: [],
      showPopover: false,
      selfTreeData: [],
      filterText: undefined,
      showCheckbox: true,
      treeKey: new Date().getTime(),
      remoteTreeData: [],
      disabledKeysArr: [],
      disabledKeysFunc: undefined,
      tempCheckedValue: [], // 被禁用的选项，临时被取消选中
    };
  },
  props: {
    popperClass: {
      type: String,
      default: 'v-filter-tree-popover',
    },
    value: [Array, String, Number],
    treeData: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
    filterPlaceholder: {
      type: String,
      default: '输入关键字进行过滤',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    defaultProps: Object,
    nodeKey: {
      type: String,
      default: 'id',
    },
    defaultExpandedKeys: {
      type: Array,
      default: () => [],
    },
    expandOnClickNode: {
      type: Boolean,
      default: false,
    },
    checkStrictly: {
      type: Boolean,
      default: false,
    },
    checkStrictlySyncChildren: Boolean,
    defaultExpandAll: {
      type: Boolean,
      default: false,
    },
    disabledKeys: {
      type: [Array, Function],
      default: () => [],
    },
    defaultCheckedKeys: {
      type: Array,

    },
    collapseTags: {
      type: Boolean,
      default: true,
    },
    width: {
      type: [String, Number],
      default: '100%',
    },
    remote: {
      type: Boolean,
      default: false,
    },
    remoteMethod: Function,
    onlyCheckLastLevel: {
      type: Boolean,
      default: false,
    },
    startCheckLevel: {
      type: Number,
      default: 0,
    },
    // 用于过滤id
    filterKeys: Function,
    inputLable: String,
    // 用于处理单选时node是否能选中
    nodeCheck: Function,
    dataRemoteParams: [Object, String],
    size: String,
    disabled: Boolean,
    disabledClose: Boolean,
    allSelect: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    mapKey() {
      return _.cloneDeep({ ...DEFAULT_MAP_KEY, ...this.defaultProps });
    },
    initValue() {
      const { value, selfTreeData } = this;
      return this.pickCheckedList(selfTreeData, value);
    },
    expandedKeys() {
      const { value, defaultExpandedKeys } = this;
      if (!isEmpty(defaultExpandedKeys)) return defaultExpandedKeys;
      if (isEmpty(value)) return [];
      if (Array.isArray(value)) return value;
      return [value];
    },
    selfExpandOnClickNode() {
      const { expandOnClickNode, onlyCheckLastLevel } = this;
      if (expandOnClickNode || onlyCheckLastLevel) return true;
      return expandOnClickNode;
    },
    treeDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },
  },
  created() {
    // 单选时打开，多选时关闭复选框
    this.showCheckbox = this.multiple;
    // this.initTreeData(this.treeData);
  },
  watch: {
    treeData: {
      handler(data) {
        if (this.dataRemoteParams) {
          this.initTreeData(this.remoteTreeData);
          return;
        }
        this.initTreeData(data);
      },
      deep: true,
    },
    filterText(value) {
      if (this.remote) {
        this.remoteMethod(value);
        return;
      }
      this.$refs.tree.filter(value);
    },
    initValue(value) {
      this.checkedList = _.cloneDeep(value);
    },
    disabledKeys: {
      handler(value) {
        if (typeof value === 'function') {
          this.disabledKeysFunc = value;
        } else {
          this.disabledKeysArr = value;
        }
        this.initTreeData(this.treeData);
      },
      deep: true,
      immediate: true,
    },
    showPopover(value) {
      // 当关闭下拉框时，没有确认，则还原临时取消的已禁用选项
      if (!value && this.tempCheckedValue?.length > 0) {
        this.initTreeData(this.selfTreeData);
      }
      this.$nextTick(() => {
        this.treeKey = new Date().getTime();
      });
    },
    dataRemoteParams: {
      immediate: true,
      handler(params) {
        if (isEmpty(params)) return;
        if (typeof params === 'string') params = { url: params, method: 'get' };
        https(params).then((res) => {
          if (res.code === 10000) {
            if (this.allSelect) {
              const allOption = [
                {
                  [this.mapKey.value]: 'all',
                  [this.mapKey.id]: 'all',
                  [this.mapKey.label]: '全部',
                  children: res.data,
                },
              ];

              this.remoteTreeData = allOption;
              return;
            }
            this.remoteTreeData = res.data;
          }
        });
      },
    },
    remoteTreeData: {
      deep: true,
      handler(data) {
        this.initTreeData(data);
      },
    },
  },
  methods: {
    /**
     * 检查当前值是否选中，多选为时Value为数组数组，单选为数字或者字符串
     * */
    checkValue(value, data) {
      const id = data[this.nodeKey];
      if (this.multiple) return value.includes(id);
      return value === id;
    },
    /**
     * 初始化时，获取被选中的数据，还原数据: 根据单选和多选，父级和子集是否严格关联来还原
     * checkAll：参数用来控制全选。一般用在父级选中后，子级全选
     * */
    pickCheckedList(treeData, value, checkAll) {
      if (isEmpty(value)) return [];
      // 如果checkStrictly为true，说明父级和子集不严格关联
      if (this.checkStrictly) checkAll = false;
      const checked = [];
      treeData.map((tree) => {
        // 如果是checkAll = true，说明其父级已经被选中, 并设置为严格关联
        const isChecked = checkAll || this.checkValue(value, tree);
        const children = tree[this.mapKey.children];
        if (isChecked) checked.push(tree);
        // 遍历子级
        if (children && children.length > 0) {
          checked.push(
            ...this.pickCheckedList(
              children,
              value,
              isChecked && this.multiple,
            ),
          );
        }
      });
      return checked;
    },
    /**
     * 对treeData进行初始化或者重新赋值
     * */
    initTreeData(data) {
      this.selfTreeData = this.mapTreeData(_.cloneDeep(data), {});
    },
    /**
     * 初始化树结构
     * 加上disabled等必要参数
     * data：原始的tree数据
     * options: 需要添加的额外必要参数
     */
    mapTreeData(data = [], options = {}) {
      const { disabled } = options;
      const treeData = [];
      const {
        disabledKeysArr, disabledKeysFunc, nodeKey, mapKey,
      } = this;
      data.map((tree) => {
        if (!tree) return;
        const { enableFlag } = tree;
        const status = disabled
          || disabledKeysArr.includes(tree[nodeKey])
          || (typeof disabledKeysFunc === 'function' && disabledKeysFunc(tree))
          || (enableFlag?.value === 0
            && !this.checkedList.includes(tree[nodeKey]));
        const children = this.mapTreeData(tree[mapKey.children] || [], {
          disabled: status,
        });
        const disabledLen = children.filter((child) => child.disabled).length;
        const newTree = {
          ...tree,
          disabled:
            status
            || (!this.checkStrictly
              && disabledLen > 0
              && disabledLen === children.length),
        };
        if (
          (_.isArray(this.value) && this.value.includes(newTree[nodeKey]))
          || this.value === newTree[nodeKey]
        ) {
          newTree.disabled = false;
        }
        newTree[mapKey.children] = children;
        treeData.push(newTree);
      });
      return treeData;
    },
    /**
     * 单选时设置选中样式, 根据value来渲染
     * */
    setClassName(data, { disabled }) {
      // console.log('node===>', disabled);
      const { value } = this;
      if (isNull(value)) return;
      const arr = [];
      if (this.checkValue(value, data)) arr.push('v-filter-tree-checked');
      if (disabled) arr.push('v-filter-tree-disabled');
      return arr.join(' ');
    },
    /**
     * 打开面板初始化
     * */
    popoverOpen() {
      if (this.multiple) this.setChecked(this.value);
    },
    /**
     * popover面板隐藏时
     * */
    popoverHide() {
      this.filterText = undefined;
      if (isEmpty(this.value)) {
        this.syncValue(this.value, []);
      }
    },
    /**
     * 多选：选中效果
     * */
    setChecked(check) {
      if (!Array.isArray(check)) check = [check];
      this.$refs.tree.setCheckedKeys(check);
    },
    /**
     * 搜索时筛选
     * */
    filterNode(value, data) {
      if (isNull(value)) return true;
      return data[this.mapKey.label].indexOf(value) !== -1;
    },
    /**
     * 多选时根据外部的方法过滤Key值
     * */
    dealKeys(checkNodes) {
      const {
        onlyCheckLastLevel,
        startCheckLevel,
        mapKey,
        filterKeys,
        nodeKey,
      } = this;
      const { children } = mapKey;
      const checkFun = typeof filterKeys === 'function';
      const nodes = [];
      const keys = [];
      checkNodes.map((node) => {
        if (
          node.disabled
          || (checkFun && !filterKeys(node))
          || (!isEmpty(node.level) && node.level < startCheckLevel)
        ) return;
        if (onlyCheckLastLevel && !isEmpty(node[children]) && !node.isLeaf) return;
        nodes.push(node);
        keys.push(node[nodeKey]);
      });
      return {
        keys,
        nodes,
      };
    },
    /**
     * 双向绑定值
     * */
    syncValue(checkKeys, data) {
      if (this.multiple) {
        const checkData = this.dealKeys(data);
        checkKeys = checkData.keys;
        data = _.cloneDeep(checkData.nodes);
        this.checkedList = _.cloneDeep(checkData.nodes);
      } else {
        this.checkedList = _.cloneDeep([data]);
      }
      this.$emit('input', checkKeys, data);
      this.$emit('change', checkKeys, data);
      this.fieldValidate();
    },
    /**
     * 单选时，选中
     * */
    singleCheck(data, node, store) {
      // 被禁用
      if (node.disabled) return;
      // 设置了只有末级节点能选, 如果有子节点，则不能选择
      if (this.onlyCheckLastLevel) {
        const children = data[this.mapKey.children];
        if (children && children.length > 0) return;
      } else if (node.level < this.startCheckLevel) {
        // 设置了从哪一级开始才能选择
        return;
      }
      const { multiple, nodeKey } = this;
      if (multiple) return;

      if (typeof this.nodeCheck === 'function') {
        const result = this.nodeCheck(data, node, store);

        // 返回false 则不选中
        if (!result) {
          return;
        }
      }
      this.syncValue(data[nodeKey], data);
      this.showPopover = false;
    },
    /**
     * 多选时，确认按钮
     * */
    multipleCheck() {
      this.syncValue(
        this.$refs.tree.getCheckedKeys(),
        this.$refs.tree.getCheckedNodes(),
      );
      this.tempCheckedValue = [];
      this.showPopover = false;
    },
    /**
     * 清除全部
     * */
    clearAll() {
      const checked = this.multiple ? [] : undefined;
      this.$emit('change', checked, []);
      this.$emit('input', checked, []);
      this.$emit('clearAll');
      checked && this.$refs.tree.setCheckedNodes(checked);

      this.fieldValidate();
    },
    /**
     * 删除单个
     * */
    clear(i) {
      if (this.multiple) {
        this.checkedList.splice(i, 1);
        const checked = this.checkedList.map((item) => item[this.nodeKey]);
        this.$refs.tree.setCheckedNodes(checked);
        this.$emit('change', checked, []);
        this.$emit('input', checked, []);
        this.$emit('clear');

        this.fieldValidate();
      }
    },
    /**
     * 字段校验
     */
    fieldValidate() {
      if (this.$parent && this.$parent.onFieldChange) {
        this.$parent.onFieldChange();
      }
    },
    checkChange(item, value) {
      if (
        this.checkStrictly
        && !this.onlyCheckLastLevel
        && this.checkStrictlySyncChildren
      ) {
        const checkedKeys = this.$refs.tree?.getCheckedKeys() || [];
        const childrenKeys = this.getChildrenKeyRecursion(item);
        let newCheckedKeys = checkedKeys;
        if (value) {
          // 选中
          newCheckedKeys = Array.from(
            new Set(checkedKeys.concat(childrenKeys)),
          );
        } else {
          // 取消选中
          newCheckedKeys = checkedKeys.filter((d) => !childrenKeys.includes(d));
        }
        this.$refs.tree.setCheckedKeys(newCheckedKeys);
      }

      if (item.enableFlag?.value === 0 && !value) {
        item.disabled = true;
        this.tempCheckedValue.push(item[this.nodeKey]);
      }
    },
    getChildrenKeyRecursion(obj) {
      const { enableFlag } = obj;
      let res = enableFlag?.value === 0 ? [] : [obj[this.nodeKey]];
      const children = obj[this.mapKey?.children];
      if (children?.length > 0) {
        children.map((d) => {
          res = res.concat(this.getChildrenKeyRecursion(d));
        });
      }
      return res;
    },
  },
};
</script>

<style lang="less" scoped>
/deep/.v-filter-tree {
  .v-filter-tree-popover {
    width: 100%;
  }
}
.tree-content {
  max-width: calc(100% - 45px);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 12px;
}
.tree-btn {
  margin-top: 10px;
  height: 30px;
  text-align: right;
  position: relative;
  padding-right: 12px;
  .tree-multipleCheck-btn {
    position: absolute;
    line-height: 40px;
    height: 40px;
    display: inline-block;
    top: 0;
    right: 10px;
    width: 40px;
    text-align: center;
  }
  &:before {
    content: ' ';
    position: absolute;
    top: 0;
    left: -10px;
    width: calc(100% + 20px);
    height: 1px;
    background: #e8ebee;
  }
}
</style>

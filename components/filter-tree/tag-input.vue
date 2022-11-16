<template>
  <div
    class="tree-input"
    :class="{
      'tree-input-checked': !noTag,
      disabled,
    }"
  >
    <el-input
      v-if="!multiple || noTag"
      readonly
      class="tree-input-hide"
      :value="renderText()"
      :placeholder="placeholder"
      :disabled="disabled"
    ></el-input>
    <div class="tree-tag-container">
      <div class="tree-tag-warp tag-flex-1">
        <template v-if="multiple">
          <template v-if="collapseTags">
            <template v-if="!noTag">
              <el-tag
                class="tree-tag tag-flex-1"
                size="small"
                type="info"
                :closable="!disabled"
                @close="clear(0)"
                >{{ renderText() }}</el-tag
              >
              <el-tag v-if="tags.length > 1" class="tree-tag" size="small" type="info"
                >+{{ tags.length - 1 }}</el-tag
              >
            </template>
          </template>
          <el-tag
            v-else
            class="tree-tag"
            v-for="(tag, i) in tags"
            :key="i"
            size="small"
            type="info"
            :closable="!disabled"
            @close="clear(i)"
            >{{ tag[mapKey.label] }}</el-tag
          >
        </template>
      </div>
      <span :class="{'tree-input-icon': true, hasClose: !disabledClose}">
        <i class="el-icon-circle-close" @click.stop="clearAll"></i>
        <i class="el-icon-arrow-up" :class="{ 'tree-tag-icon-reverse': show }"></i>
      </span>
    </div>
  </div>
</template>

<script>
import { isNull } from '../../utils';

export default {
  data() {
    return {
      tags: [],
    };
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    checked: {
      type: Array,
      default: () => [],
    },
    placeholder: String,
    multiple: Boolean,
    mapKey: Object,
    inputLable: String,
    collapseTags: Boolean,
    disabled: Boolean,
    disabledClose: Boolean,
  },
  created() {
    this.updateTags(this.checked);
  },
  watch: {
    checked(checked) {
      this.updateTags(checked);
    },
  },
  computed: {
    noTag() {
      const { tags } = this;
      return isNull(tags) || tags.length === 0;
    },
  },
  methods: {
    updateTags(checked = []) {
      const tags = [];
      checked.map((item) => {
        tags.push(item);
      });
      this.tags = _.cloneDeep(tags);
    },
    renderText() {
      const { tags = [] } = this;
      return tags && tags[0] ? tags[0][this.inputLable || this.mapKey.label] : '';
    },
    clearAll() {
      this.tags = [];
      this.$emit('clearAll');
    },
    clear(i) {
      this.tags.splice(i, 1);
      this.$emit('clear', i);
    },
  },
};
</script>

<style lang="less" scoped>
.tree-input {
  position: relative;
}
.tree-input-hide {
  height: 28px;
  line-height: 28px;
}
.tree-tag-container {
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  border: 1px solid #dce0e3;
  border-radius: 4px;
  height: 28px;
  cursor: pointer;
  padding-left: 8px;
}
.tag-flex-1 {
  flex: 1;
}
.tree-tag-warp {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 28px;
}
.tree-tag {
  max-width: 100%;
  margin-right: 5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: middle;
}
.tree-input-icon {
  display: inline-block;
  padding-left: 10px;
  margin-top: 2px;
  line-height: 22px;
  height: 22px;
  i {
    color: #c0c4cc;
    font-size: 12px;
    transition: transform 0.3s;
    transform: rotateZ(180deg);
    cursor: pointer;
    margin-right: 10px;
    line-height: 22px;
    height: 22px;
  }
  .el-icon-arrow-up {
    margin-right: 10px;
  }
  .tree-tag-icon-reverse {
    transform: rotateZ(0);
  }
}
/deep/.tree-input-hide {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 8;
  .el-input__inner {
    border: 0;
  }
}
.el-icon-circle-close {
  display: none;
  transition: all ease-in-out 0.3s;
}
.tree-input-checked {
  &.disabled .tree-tag-container {
    cursor: not-allowed;
  }
  &:not(.disabled):hover {
    .hasClose {
      .el-icon-arrow-up {
        display: none;
      }
      .el-icon-circle-close {
        display: inline-block;
      }
    }

  }
}
</style>

<template>
  <div class="nostyle">
    <slot></slot>
  </div>
</template>

<script>
/**
 * 阻断el-select 组件dispatch向上传递、
 * 使用自定义组件中 自己触发dispatch
 */
export default {
  componentName: 'ElFormItem',
};
</script>

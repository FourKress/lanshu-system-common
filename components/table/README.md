# 表格组件

## 样式统一

在el-table上加上className v-table-common会把表格样式重置为符合我们项目设计规范的样式

例如

``` html
<el-atble
  :data="tableData"
  class="v-table-common"
  >
</el-table>
```

## 封装通用的表格

把表格进行了再次封装

### Table Props

- ELEMENT-UI的全部table props
- cacheId: 页面的一些缓存默认会存储到当前路由为key的localstorage中，当页面存在多个表格时，会引起缓存数据冲突，此时需要用cacheId保持唯一
- filterHeader：是否打开筛选表头的功能
- fixedColumnWidth：是否修正表头宽度引起的布局问题（使用filterHeader后，可能会由于表头减少引起表格宽度问题，filterHeader=true时，会默认修复）
- customizeColumns：表格自定义展示字段变动时的回调, 返回值为更改后的columns的key集合

### Column Props

- 借鉴`iview-ui`框架数据渲染模式，尽量少的在`template`里面写渲染逻辑
- 暴露了一些`element-ui`常用的`props`和`methods`等字段
- 对项目的常规的操作进行了规范处理
  - 金额格式化：textType = 'money'
  - 空字符处理
  - hide=true，表示隐藏当前字段，优先级高于一切，不出现在filter-header的选择列表中，变为false后，可以在filter-header列表中看到
  - type=nested，表示是否使用嵌套表头，nested和nestedList联合使用
  - nestedList：nested和nestedList联合使用
  - type = 'filter-header', 启用表格头部字段动态配置, 表格内容必须使用render渲染
    - 需要filter的表格，必须有key字段
  - notFilter = true: 表示type = 'filter-header'时，不过滤此字段(不出现在filter-header的选择列表中，和hide=true的区别是，不会隐藏当前字段)
  - visible = true, 表示隐藏当前字段, 可配合filter-header实现第一次渲染隐藏该字段， notFilter = true，此字段无效
  - summary = false, 表示合计金额时，不计算该列
- 表格列的cell样式名动态计算computedClass，主要用来渲染状态等

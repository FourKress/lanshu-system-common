# filter-tree组件

> 树形结构组件：使用el-tree组件实现

- 支持多级和一级结构的数据
- 支持单选和多选：multiple
- 多标签折叠：collapseTags
- 支持指定从多少级开始才能选中：startCheckLevel
- 支持最末级才能选中：onlyCheckLastLevel
- 支持el-tree的全特性(如果有问题，请提出)
- 支持前端搜索
- 支持数据还原
- 支持双向绑定
- 支持根据某些特征过滤选择结果：filterKeys
- 支持内置http请求(传http的options参数)：dataRemoteParams
- 支持完全自定义的远程请求(主要为了实现远程搜索)：remote/remoteMethod
- 支持完全外部传入Tree数据：treeData
- 支持禁用keys：disabledKeys
- 支持对指定节点自动展开：defaultExpandedKeys
- 支持对数据键值的映射：defaultProps


## 注意

- 不支持懒加载
- 不支持后端搜索

## props

> 继承element的tree组件的props和event

### defaultProps[Object]

> 键值映射：避免在外部重新构建一次数据问题

- 会使用DEFAULT_MAP_KEY变量的预设值补全defaultProps

### treeData[Array]

> 树形结构数据: 直接传入在外部处理好的数据

- 和dataRemoteParams/remote属性天然冲突

### dataRemoteParams[String, Object(https)]

> 内置的数据请求方法的options

- 和treeData/remote属性天然冲突
- 支持string，一般是请求url
- 支持Object，内部会判断后直接调用https(dataRemoteParams), 所以dataRemoteParams支持this.$https方法的所有特性

``` vue
<!-- 加载行业 -->
<v-filter-tree dataRemoteParams="/common/trade">

<!-- 加载未被禁用的职位，带参数 -->
<v-filter-tree dataRemoteParams="/common/postion?enable=1">

<!-- 其他更加复杂的情况 -->
<v-filter-tree dataRemoteParams="{ url: '/common/any', data: {start: 1} }">

```

### remote[Boolean]

> 是否开启远程数据请求

- 和treeData/dataRemoteParams属性天然冲突
- 必须配合remoteMethod属性使用，否则无意义

### remoteMethod[Function]

> 为了实现远程搜索，内部调用此方法时，会把搜索框的值传出来：调用远程方法获取数据，然后在外部给treeData赋值

### disabledKeys[Array]

> 禁用的某些选项

- 被禁用数据的事件将会失效

### onlyCheckLastLevel[Boolean]

> 是否最后一级才可以点击选择

- 默认false
- 与startCheckLevel冲突

### startCheckLevel[Number]

> 从某一级开始才能选择

- 默认为0，表示从第一级开始就能选中

### filterKeys[Function]

> 对选择的结果进行过滤: 一般用于根据节点特征进行过滤的场景，所以会把节点属性传递出来

### defaultExpandedKeys[Array]

> 默认展开的节点

### inputLable[String] 

> 选中的展示字段

## checkStrictlySyncChildren[Boolean]

> 是否同步选择子集

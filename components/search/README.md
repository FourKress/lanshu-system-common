# 搜索组件

## Search Props

### conditions[Array<Object>]

> 搜索条件的具体事项

### Conditions Props

#### type: 条件类型
- input：普通input输入框，调用el-input组件
- valueRanger：普通input输入框，调用value-ranger-input组件
- select: 普通下拉选择框，调用select组件
- lazySelect：懒加载下拉选择框，调用lazy-select组件
- tree：树形结构下拉，调用filter-tree组件组件
- city：城市多级结构下拉选择，调用city-cascader组件
- industry：行业多级结构下拉选择，调用industry-cascader组件
- industryRoot：一级行业下拉选择，调用el-select组件
- date: 时间组件，调用el-date-picker组件
- dateRanger: 时间组件，调用date-ranger-picker组件

#### key: 当前条件绑定的key值，用作结果输出

如果type为valueRanger, dateRanger时，key为一个数组，输出结果会对key(数组)进行解构

#### label：当前条件的中文释义

#### value: 用作初始化值

#### filterOption(option, conditionsValue, i): type为select生效，过滤当前select的options，返回true值显示，false则隐藏

- option：当前的condition的option索引
- conditionsValue：整个conditions的结果，相当于search事件的params
- i：当前condition的索引

1.实现值的过滤

```javascript
const conditions = [
  {
    type: 'select',
    label: '测试',
    key: 'test',
    filterOption: (item, conditionsValue, i) => item.value > 2,
  }
]
```

2.可以实现联动效果

条件“测试2”由于“测试1”(可以多个联动)值变化而变化

```javascript
const conditions = [
  {
    type: 'select',
    label: '测试1',
    key: 'test1',
  },
  {
    type: 'select',
    label: '测试2',
    key: 'test2',
    filterOption: (item, conditionsValue, i) => conditionsValue.test1 > 2,
  }
]
```

#### 其他props

根据type的不同，其他props也有所不同，可以自行查看各个组件

### limit[Number]

> 每行的个数，默认为3

### expend[Boolean]

> 当conditions个数超过limit值后生效，true表示展开，false表示收起


## search Events

### change(value, option)

当某个条件发生变化时，触发change事件
value：变化后的值
option：当前的condition

### search(params)

点击搜索按钮时，触发当前事件
params: 当前组件所有的搜索条件结果。返回的数据是通过isEmpty过滤后的值

### expandAll(expand)

点击展开或收起按钮时触发
expand: 值为true表示展开，false表示收起

### clearAll

清除当前选择的全部条件
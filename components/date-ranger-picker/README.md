# 日期范围组件

> ELEMENT官方的时间范围组件，交互体验不是很友好，根据产品需求，开始时间和结束时间分开选择。故使用el-date-picker组件封装

- 支持el-date-picker的特性
- 支持最大时间和最小时间设定
- 支持开始时间和结束时间的校验
- 支持开始时间和结束时间的自定义校验
- 支持两种UI显示方式

## Props

### value[Array]

> 可以直接使用v-model

- 默认值为false
- 设置为true后，会默认显示返回上一页按钮，支持插槽覆盖

### disabled[Boolean]

> 禁用模式，两种UI显示方式都支持

### options[Object]

> 对el-dater-picker单独的设置，原则上放到这里

### styleType[Array]

> 样式显示方式

- 默认为空，视觉呈现两个输入框，开始时间和结束时间
- 值为union时，视觉呈现一个输入框

### index[Number]

> 用于标记当前表单，一般用在有循环时定位，会在change时间中返回

### validateStart[Function]

> 开始时间验证规则

- 默认为空，此时使用内置的验证规则
- 不为空，则会调用此方法进行验证

### validateEnd[Function]

> 结束时间验证规则

- 默认为空，此时使用内置的验证规则
- 不为空，则会调用此方法进行验证


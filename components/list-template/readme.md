# 列表页模块

[toc]

## demo

> 此处以职务管理页面为例

- **template**:

```html
<template>
  <div>
    <r-list-template
      ref="listTemplate"
      title="职务管理"
      createUrl="/pc/position"
      readUrl="/pc/positions"
      updateUrl="/pc/position/${id}"
      deleteUrl="/pc/positions"
      :conditions="conditions"
      :columns="columns"
      :batchOperation="batchOperation"
      :pagination="pagination"
    >
      <!-- 头部事件按钮区域 -->
      <template v-slot:header-event>
        <v-button type="primary" @click="addDialogShow">添加职务</v-button>
      </template>
    </r-list-template>
  </div>
</template>
```

- **script**:

```javascript
import dayjs from "dayjs";

export default {
  data() {
    return {
      conditions: [],
      columns: [],
      batchOperation: [],
      pagination: {
        page: 1,
        size: 20
      }
    };
  },
  methods: {}
};
```

## props 参数定义

> 在使用的时候，只需要把一下参数的第一级传给`list-template`即可，使用方法如下。模块在开发的时候在`v-table`上添加了`v-on="$listeners" v-bind="$attrs"`,会全部接受 props 传递给`v-table`。就不在以下描述`v-table`的 props 参数了。具体查看`v-table`的定义

```html
<v-list-template
  ref="listTemplate"
  title="职务管理"
  createUrl="/pc/position"
  readUrl="/pc/positions"
  updateUrl="/pc/position/${id}"
  deleteUrl="/pc/positions"
  :conditions="conditions"
  :columns="columns"
  :batchOperation="batchOperation"
  :pagination="pagination"
>
</v-list-template>
```

- **title**:表格标题。
- **dashLine**：是否显示虚线。
- **orders**：设置默认排序规则。
- **forceSelectable**：是否强制可以显示 selection，默认为 false。注意，并不是为 true 就显示可选性，还是要自己设置`type：'selection'`列。
- **externalParams**：外部参数，用于外部注入组件的参数，用于表格查询数据使用。
- **resetParamsFlag**：布尔值，当同一个list-template有多个condition切换时，需要重置不同condition中搜索的params，用到这个属性，切换condition的时候取反resetParamsFlag即可
- **mockData**：类型`Array`，模拟列表数据
- **createUrl**：新增 api 接口链接,使用非 post 方法的时候添加双下划线分割的前缀，例如：`__get__/ums/xxx`。
- **readUrl**：查询 api 接口链接,使用非 post 方法的时候添加双下划线分割的前缀，例如：`__get__/ums/xxx`。
- **successHandle**：获取表格数据处理后要执行的方法。
- **updateUrl**：更新 api 接口链接,使用非 post 方法的时候添加双下划线分割的前缀，例如：`__get__/ums/xxx`。
- **deleteUrl**：删除 api 接口链接,使用非 post 方法的时候添加双下划线分割的前缀，例如：`__get__/ums/xxx`。
- **adjustHeight**：高度调整参数。
- **handleData**: 处理 tableList 数据
- **conditions**：类型：`Array<object>`，搜索框参数。
  - **type**：查询字段类型。
  - **key**：查询字段 key 值。
  - **label**：查询字段标题。
  - **front**：类型`Boolean`，折叠时控件默认放置在第三个查询项位置, 默认为`false`,
  - **其他参数**：字段组件的其他参数，如`options`、`placeholder`等。
- **conditionsFormat**：类型`Function`，方法用来进行查询参数的特殊化处理，入参为`v-search`的参数，返回参数为自己处理过的`params`参数。
- **searchCallback**：类型`Function`，用来执行查询的回调函数
- **columns**：类型：`Array<object>`，表格列参数配置。
  - **type**：字段类型，如`selection`。
  - **label**：字段标题。
  - **key**：字段对应数据 key 值。
  - **render**：render 自定义组件。
  - **width**：字段宽度。
  - **name**：当 name 等于`true`的时候，在列表中展示字段对象`{label:"xxx",value:"xxx"}`中的 label 之。当 name 为字符串类型时，渲染 row 数据中对于 name 字符串名称的值。
- **batchOperation**：类型：`Array<object>`，批量操作按钮设置。
  - **text**：按钮显示文字。
  - **func**：按钮点击调用方法。方法入参为选中的行数据数组。
  - **auth**：添加权限设置，默认不填时会显示按钮。
  - **type**：按钮类型，如`primary`、`primary`等。
  - **size**：按钮大小，默认为“mini”。
  - **plain**：对应 element 中按钮的 plain 参数，默认为 true。
  - **fill**：是否填充颜色，默认为 true。
  - **uncheckedMsg**：未选中提示信息。
  - **min**：触发该批量操作最少选择数量
  - **max**：触发该批量操作最多选择数量
- **pagination**：类型`[Object|Boolean]`,当值为 false 时，不启用分页功能。当类型为 Object 时，字段定义如下
  - **page**：当前页。
  - **size**：每页显示条数。
    **pageSizeArr**: 分页数组[20, 40, 60, 100],
    **height**: 表格高度,类型`String`,当 false 字符串时的时候，不设置 table 的高度。当为 String 类型的时候，填写表格高度的数字字符串。
- **conditionCache**: 是否缓存搜索条件，用于返回上一页
- **isVxe**: 是否采用大数据表格
- **requestCancel**: 类型`Boolean`，是否启用表格切换时取消当前的列表请求，默认`false`不启用。适用于表格有tabs切换项的情况
- **enterSearch**: 类型`Boolean`，启用回车键搜索 默认为`false`不启用

## slot 定义

> 组件定义了两个具名 slot，具体使用方法如下。

- **header-event**：此 slot 用于放置新增按钮等。
- **bottom-left**：此 slot 用于放置左侧底部的批量处理功能。这里定义了默认显示内容。可以通过`batchOperation`参数生成按钮。也可以自定义按钮显示。此处暴露的是带 scope 的 slot。具体的查看具体的定义。
- **title**：重写 title 部位过滤组件。使用的时候不要传 title 的 props 参数。
- **notice-message**：设置表格上方的文字描述。

## 内置默认 methods

> 模块内置了增删查改及查询的方法，方便内部调用，也可以在外部通过`$refs`调用。

- **createMethod**：新增数据方法。
- **readMethod**：查询数据方法。
- **updateMethod**：更新书序方法。
- **deleteMethod**：删除数据方法。
- **search**:带参数查询数据方法。
- **resetFormField**：重设条件，传入参数为key，不传重置所有

## title 部分设置

> 默认该区域的显示默认使用 title 的 prop 参数显示表格标题。但是有的页面不显示标题，而是在该位置显示操作功能或者字段过滤。所有就有了如下的写法。

```html
<r-list-template>
  ...
  <template v-slot:title>
    <el-select placeholder="请选择" v-model="xxx">
      <el-option :value="1" label="选项1" />
      <el-option :value="2" label="选项2" />
      <el-option :value="3" label="选项3" />
    </el-select>
  </template>
  ...
</r-list-template>
```

## 其他

### 添加 computed 方法缩短 ref 检索路径

- **refTable**：会直接返回组件里面的 element-ui 的 table 组件。

## 监听方法
- **changeCondition**: 条件改变触发，返回当前params

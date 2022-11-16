# 面包屑

- 自动根据当前路由从路由列表[后端返回的路由权限列表]中获取一个完整的面包屑List
- 支持自定义动态路由最后一级名字：pathName
- 支持完全自定义当前页面的面包屑：crumbs
- 右侧内容显示：showRight
- 右侧内返回上一页，自定义返回的路由：toPage
- 每一级路由跳转都是使用link组件实现，向link组件传递path和module两个参数

## Props

### targetPath[Array]
 > 提换指定的路由
 
- [old, new]
- old 需要提换的路由
- new 提换的新路由

### showRight[Boolean]

> 是否显示右侧内容区域

- 默认值为false
- 设置为true后，会默认显示返回上一页按钮，支持插槽覆盖

### toPage[String, Object]

> 返回上一页

- 默认没有值，调用$router的go(-1)
- 如果有值，则调用this.$router(toPage)

### pathName[String, Number]

> 自定义面包屑最后一级路由名字，主要用于动态路由情况

### crumbs[Array]

> 完全的自定义面包屑



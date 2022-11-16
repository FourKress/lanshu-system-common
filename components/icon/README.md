# 图标组件

> 全局字体图标组件的封装

- 支持单色/彩色：renderSvg

## props

### icon[String]

> 图标名

### renderSvg[Boolean]

> 是否启用svg渲染：主要解决多色问题

- 默认false，使用class形式渲染，只支持单色
- 设置为true，启用svg渲染，支持多色和单色

### color[String]

> 颜色：对于单色起作用

### size[Number, String]

> 大小：renderSvg为false起作用，表示字体大小

### width/height[Number, String]

> 大小：renderSvg为true起作用，为svg限定尺寸

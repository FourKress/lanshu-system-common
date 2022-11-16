
# 懒加载下拉选择

> 懒加载的下拉选择框

# Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| :-----| ----: | :----: |
| packOption | 对下拉选择的option自定义组装 | Function | - | - |
| optionsFilter | 筛选显示项，用于filter方法中 | Function | - | - |
| disableValues | 禁用项，如果为数组，模式为[value,...]，函数为(value) => {} | Function、Array | - | - |

#### optionUrl
> 下拉列表获取远程连接，可使用前缀__POST__/区分接口访问方法
### optionParams
> 下拉列表获取远程连接参数，会根据方法自动选择传入param还是data
### isTriggerChangeByQuery
> 是否在请求发起后出发change事件
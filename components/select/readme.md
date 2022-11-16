# select 组件使用方法

[toc]

## 默认使用规则

* 优先使用`slot default`
* 当传入`options prop`时，并且没有`slot default`，`options`为数组，且长度大于0时，使用`options`参数生成选项。
* 以上两点均不符合的时候使用 **`enumCode`** 查询并生成options选项。
* **disableValues**：设置禁用的value值。可以为`Array`，也可以为`函数`，（value）=> true
* **optionsDispose**：`[type=Function]`，对select的options做一些自己特定需要的处理。该方法会把options作为参数值，必须返回处理后的options对象。
* **valueKey**：映射组件选中的value。
* **labelKey**：可以传字符串，也可以传数组字符串。当传数组字符串的时候会拼接两个字段的值。
### validAlways [type=Boolean] 是否在每次改变options验证值

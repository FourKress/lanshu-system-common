# 远程搜索的input框

> 主要解决在编辑时，初始状态如何还原数据的问题，所在内部渲染了option，不支持外部渲染

ps: 多选的某些功能未实现！

## Props

### mapKey: 默认值 {label: 'label', value: 'value' }
解决编辑时还原数据的必须参数，用于对应各种接口返回的option的value和label的关系
如：接口返回数据为{ id: 1, name: '测试' },那么mapKey应该为{label: 'name', value: 'id' }

### initType[String]
初始化时还原option使用的方式
默认为空，使用label和value拼接的形式还原
initType = remote时，会讲label作为关键字调用内部remoteMethod方法，去获取options

请注意，内部会对options进行监听，如果value和options的值不匹配，将会把value置空，只支持单选

### label[String, Number]: 支持sync
initType为空时，使用label和value拼接的形式还原option，解决显示异常问题


## Events

> element-ui的select组件的所有event

### remoteMethod(query, callback)
获取option的方法, query表示输入的关键字，callback或set option，需要传入请求回来的options

### changeOption(value, option)
option表示当前value对应的option，不支持多选

### optionRender(h, row)
option自定义渲染

### queryChange(query)
query发生改变时触发
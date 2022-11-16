/**
 * 表格列参数数据格式化
 * @param {*} columns
 */
export const columnsFormat = (columns = []) => {
  return columns.map((column) => {
    const _column = _.cloneDeep(column);
    if (_column.table) {
      Object.assign(_column, _column.table);
      delete _column.table;
    }
    if (_column.name && !_column.render) {
      // 当name字段为true时，返回值对象的label字段（后端约定的返回形式）
      if (_column.name === true) {
        _column.render = (h, { row }) => <span>{row[_column.key]?.label}</span>;
      } else {
        // 当name为字段字符串时
        _column.render = (h, { row }) => <span>{row[_column.name]}</span>;
      }
    }
    return _column;
  });
};
/**
 * 列表查询过滤条件
 * @param {*} conditions
 */
export const conditionFormat = (conditions = []) => {
  return conditions.map((item) => {
    if (item.condition) {
      item = { ...item, ...item.condition };
      delete item.condition;
    }
    return item;
  });
};

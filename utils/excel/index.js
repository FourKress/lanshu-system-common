import { export_json_to_excel } from './Export2Excel';
import { isEmpty, isNull, getDataType } from '..';
import { handleSpecialData } from './format';

/**
 * 格式化时间
 * */
export function formatDate(date, fmt) {
  date = new Date(date);
  if (String(date) === 'Invalid Date') {
    console.error('formatDate ===> 时间格式不对', date);
    return;
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length));
  }
  return fmt;
}

/**
 * 对特定格式的数据做处理
 * */
function formatData(val, t) {
  const type = getDataType(val);
  if (isNull(val)) {
    return '';
  } if (t === 'time') {
    return formatDate(new Date(val), 'yyyy-MM-dd');
  } if (t === 'money') {
    return type === 'number' ? +val : val;
  } if (t === 'string') {
    return [val].join('');
  }
  return val;
}

/**
 * 处理columns
 * 分离出header和以及对应的
 * */
function dealColumns(columns) {
  if (isEmpty(columns)) return {};
  const _tHeader = [];
  const _filterKey = [];
  const _render = {};
  columns.map((c) => {
    const {
      key, label, type, exportKey, disExport, renderText,
    } = c;
    if (renderText) _render[key] = renderText;
    if (type === 'selection' || disExport) return;
    _tHeader.push(label);
    if (['time', 'money'].includes(type)) {
      const o = {};
      o[key] = type;
      _filterKey.push([o]);
    } else if (type === 'range-time') {
      const a = [];
      key.map((_k) => {
        const o = {};
        o[_k] = 'time';
        a.push(o);
      });
      _filterKey.push(a);
    } else {
      _filterKey.push(exportKey || key);
    }
  });
  return { _tHeader, _filterKey, _render };
}

function renderData(filterKey, data, render) {
  return handleSpecialData(data).map(v => filterKey.map((k) => {
    if (render && getDataType(render[k]) === 'function') {
      const val = render[k](v);
      return val && !isNaN(val) ? parseFloat(val) : val;
    }
    const t = getDataType(k);

    if (t === 'array') {
      const tV = [];
      k.map((m) => {
        const _k = getDataType(m) === 'object' ? Object.keys(m)[0] : m;
        tV.push(formatData(v[_k], m[_k]));
      });
      return tV.length === 1 ? tV[0] : tV.join('至');
    }
    return formatData(k.split('.').reduce((obj, i) => {
      return obj[i] === 0 ? 0 : obj[i] || '';
    }, v));
  }));
}

/**
 * 导出逻辑
 * */
function exportExcel(OPTIONS = {}, callback) {
  const {
    data,
    title,
    tHeader,
    filterKey,
    // columns优先级大于tHeader, filterKey
    columns,
    render,
  } = OPTIONS;
  if (isEmpty(data)) {
    callback && callback({
      message: '暂无导出数据',
      type: 'error',
    });
    return;
  }
  callback && callback({
    message: '导出成功',
    type: 'success',
  });


  const {
    _tHeader = tHeader,
    _filterKey = filterKey,
    _render = render,
  } = dealColumns(columns);

  const textData = isEmpty(_filterKey) ? data : renderData(_filterKey, data, _render);
  export_json_to_excel(_tHeader, textData, title);
}

export { exportExcel };

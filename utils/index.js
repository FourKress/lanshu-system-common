/* eslint-disable no-nested-ternary */
/**
 * utils方法
 */

import dayjs from 'dayjs';
import accounting from 'accounting';

// 统一占位符
export const DEFAULT_PLACEHOLDER = '--';

export const DEFAULT_FILE_TYPE = {
  image: [1, 'jpg', 'jpeg', 'png', 'image', 'img'],
  word: [2, 'doc', 'docx', 'word'],
  pdf: [3, 'pdf'],
};

/**
 * 判断一个变量是否为无意义的空值
 * 0和false在这里被界定为有意义的类型
 * '', undefined, null, NaN, 目前这个方法不能判断void 0
 * @param {any} param
 * @returns Boolean
 */
export function isNull(param) {
  return ['', undefined, null, NaN].includes(param);
}

/**
 * 精准的获取数据类型
 * @param {any} param
 * @returns string: 判断结果返回小写
 */
export function getDataType(param) {
  const dataType = typeof param;
  if (dataType === 'number' && isNaN(param)) return 'NaN';
  if (dataType !== 'object') return dataType;
  return Object.prototype.toString
    .call(param)
    .match(/\s([a-zA-Z]+)\]$/)[1]
    .toLowerCase();
}

/**
 * isNull的补充
 * 对空数组和对象做校验
 * @param {any} param 需要检查的数据
 * @param {Boolean} isSt 是否严格判断，如果是false，则等价于isNull
 * @returns {Boolean}
 */
export function isEmpty(param, isSt = true) {
  if (isNull(param)) return true;
  if (!isSt) return false;
  const type = getDataType(param);
  if (type === 'array') {
    return param.length === 0;
  }
  if (type === 'object') {
    return Object.keys(param).length === 0;
  }
  return false;
}

/**
 * 把所有值能转换为数字的转换成数字类型
 * @param  {any} param
 * @returns {any}
 */
export function changeToNumber(param) {
  const dataType = getDataType(param);
  if (dataType === 'string') {
    return isNaN(param) ? param : +param;
  }
  if (dataType === 'array') {
    return param.map((value) => changeToNumber(value));
  }
  if (dataType === 'object') {
    const obj = {};
    Object.keys(param).map((key) => {
      obj[key] = changeToNumber(param[key]);
    });
    return obj;
  }
  return param;
}

/**
 * 根据文件名或者URL获取文件类型
 * @param  {string} fileName
 * @returns {string} 返回文件后缀小写
 */
export function getFileType(fileName) {
  if (isNull(fileName)) return '';
  return fileName.split(/[.\/]/).pop().split('?')[0].toLowerCase();
}

/**
 * 根据文件后缀/类型获取符合项目规范(DEFAULT_FILE_TYPE)的类型
 * @param {any}
 * @returns {String}
 * */
export function getMimeType(fileType) {
  const type = fileType && fileType.toLowerCase();
  const matchType = Object.keys(DEFAULT_FILE_TYPE).find((key) =>
    DEFAULT_FILE_TYPE[key].includes(type),
  );
  return matchType || type;
}

/**
 * 格式化金额成千分位格式
 * 如1234567.989 => 1,234,567.989
 * @param  {any} money
 * @returns string
 */
export function formatMoney(money, num = 2) {
  if (money) {
    return accounting.formatMoney(money, '', num);
  }
  return money;
}

/**
 * 格式化金额成千分位格式，且小数点后补位0
 */
export function espFormatMoney(money) {
  const type = getDataType(money);
  if (['string', 'number'].includes(type) && !isNaN(money)) {
    const num = String(money).split('.');
    num[0] = num[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    if (num[1]) {
      if (num[1].length >= 2) {
        num[1] = num[1].slice(0, 2);
      } else if (num[1].length === 1) {
        num[1] += '0';
      }
    } else {
      num[1] = '00';
    }
    return num.join('.');
  }
  console.warn('formatMoney：参数不是数字！');
  return money;
}

/**
 * 根据路由生成菜单URL
 * @param path 路由路径
 * @returns {string} 完整的地址
 * */
export function generateUrl({ path }) {
  return `${location.origin}/#${path}`;
}

/**
 * 根据当前url(window.location.href)上的fromurl字段获取回显url，默认参数没有，会返回配置项的defaultUrl
 * 一般用于跳转到某个页面操作之后，需要返回之前的页面，如登陆之后返回之前的页面
 * @param {String} url
 * @returns {String}
 */
export function getFromUrl(url) {
  if (isNull(url)) url = window.location.href;
  const arr = url.split('?');
  const obj = {};
  if (arr.length > 1) {
    for (const i of arr[1].split('&')) {
      obj[i.split('=')[0]] = i.split('=')[1];
    }
  }
  return obj.fromurl
    ? decodeURIComponent(obj.fromurl)
    : LANSHU_CONFIG.defaultUrl;
}

/**
 * 基于dayjs封装的时间格式化
 * 默认是YYYY-MM-DD HH:mm格式
 * @param time
 * @param format
 * @returns {String}
 */
export const formatDate = (time, format) => {
  if (!isNull(time) && dayjs(time).isValid()) {
    return dayjs(time).format(format || 'YYYY-MM-DD HH:mm');
  }
  return '';
};

/**
 * 比较时间
 * @param time1
 * @param time2
 * @returns {boolean}
 */
export const dateIsAfter = (time1, time2) => {
  if (dayjs(time1).isValid() && dayjs(time2).isValid()) {
    return dayjs(time1).isAfter(dayjs(time2));
  }
  return false;
};

/**
 * 权限对比
 * @param {String|Array|Object} auth: 权限判断的参数
 * @param {Array} auths: 当前用户拥有的权限
 * @return {Boolean} true表示有权限，false表示无权限
 *
 * 支持场景1:
 * 单个权限判断，比如：compareAuth('delete', auths);
 *
 * 支持场景2：
 * 多个权限同时满足：compareAuth(['delete1', 'delete2'], auths);
 *
 * 支持场景3：
 * 多个权限, 满足任意一个条件时(通过设置cover参数来完成，默认为true)：compareAuth({ auth: ['delete1', 'delete2'], cover: false }, auths);
 * */
export const compareAuth = (auth, auths = []) => {
  const type = getDataType(auth);
  let authKey;
  // 是否需要同时满足所有的权限，true是，false为只需要满足其中一个
  let cover = true;
  if (type === 'object') {
    authKey = auth.auth;
    cover = isNull(auth.cover) ? cover : auth.cover;
  } else {
    authKey = auth;
  }
  if (Array.isArray(authKey)) {
    const union = authKey.filter((x) => compareAuth(x, auths));
    return cover ? union.length === authKey.length : union.length > 0;
  }
  return _.isEmpty(authKey) || auths.includes(authKey);
};

/**
 * 表格渲染的公共方法
 * @param {Object} data 需要渲染的数据data
 * @param {Object} column 表格的column
 * */
export function renderContent(data, column, index) {
  const {
    // 文本类型，会调用内置的渲染方式
    textType,
    // 对应的data的key，支持getDeepValue方法(等价于lodash的get方法)
    key,
    // 自定义的文本渲染形式，只能返回TXT文本或HTML文本
    formatter,
    // 空白时的占位符
    emptyPlaceholder,
    // 单位，会在数据后面添加单位
    unit = '',
  } = column;
  const { emptyPlaceholder: tableEmptyPlaceholder } = this;
  // 自定义格式化内容，优先级最高
  if (typeof formatter === 'function' && formatter)
    return formatter(data, column, index);
  let value = getDeepValue(data, key);
  // 格式化money
  if (textType === 'money') {
    value = formatMoney(value);
  }
  // 空白值的占位符
  const placeholderText = (() => {
    if (!isNull(emptyPlaceholder)) return emptyPlaceholder;
    if (!isNull(tableEmptyPlaceholder)) return tableEmptyPlaceholder;
    return DEFAULT_PLACEHOLDER;
  })();
  return isNull(value) ? placeholderText : `${value}${unit}`;
}

// 页面滚动到错误位置，从上到下
export const scrollToError = () => {
  // 将错误的地方展示在可视区域
  document.querySelector('div.is-error')?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
};

/**
 * 去除字符串中的所有空格
 * 可以使用Lodash中的_.trim方法
 * @param {string} str
 * @returns {string}
 */
export function trim(str) {
  if (isNull(str)) return '';
  if (getDataType(str) !== 'string') {
    console.warn('trim: str参数不是字符串');
    return '';
  }
  return str.replace(/\s/g, '');
}

/**
 * 深度取值，防止报错
 * 可以使用Lodash的_.get方法, 参数一致
 * @param  {string} props
 * @param  {object} target
 */
export function getDeepValue(target, props, defaultValue) {
  if (isNull(props) || isNull(target)) return defaultValue;
  const _props =
    typeof props === 'string'
      ? props.replace(/\[([a-zA-Z\d]+)\]/g, '.$1').split('.')
      : Array.isArray(props)
      ? props
      : [];
  return _props.reduce((pre, nxt) => {
    if (isNull(pre) || isNull(pre[nxt])) return defaultValue;
    return pre[nxt];
  }, target);
}

/**
 * 深层次过滤Array或者Object中的空数组
 * 可以使用lodash的_.filter方法
 * @param  {any[] | object} param
 * @param  {Boolean} isSt, 是否严格检查空判断，默认是非严格
 * @returns {any[] | object}
 */
export function filterEmptyKey(param, isSt = false) {
  const dataType = getDataType(param);
  if (dataType === 'array') {
    return param.filter((value) => !isEmpty(filterEmptyKey(value, isSt)), isSt);
  }
  if (dataType === 'object') {
    const obj = {};
    Object.keys(param).map((key) => {
      const value = filterEmptyKey(param[key]);
      if (!isEmpty(value, isSt)) obj[key] = value;
    });
    return obj;
  }
  return param;
}

/**
 * 过滤或者返回（根据reverse参数控制）Object中指定的keys
 * 浅层次过滤
 * 可以使用lodash中的_.filter方法
 * @param  {object} param
 * @param  {string[]} filterKeys：要过滤的键集合
 * @param  {boolean} reverse：false为过滤，true为反向过滤(返回)
 * @returns object: 返回一个不同引用的地址
 */
export function filterTargetKey(param, { filterKeys = [], reverse = false }) {
  if (isNull(filterKeys)) return param;
  const dataType = getDataType(param);
  if (dataType === 'object') {
    const obj = {};
    if (reverse) {
      filterKeys.map((key) => {
        obj[key] = param[key];
      });
    } else {
      Object.keys(param).map((key) => {
        if (!filterKeys.includes(key)) obj[key] = param[key];
      });
    }
    return obj;
  }
  return param;
}

/**
 * 时间戳转换为格式化的文本，如：
 * xx天xx小时xx分xx秒
 */
export function timestampToFormatText(timestamp) {
  timestamp = Number(timestamp);
  if (isNaN(timestamp)) return '';

  const d = Math.floor(timestamp / (24 * 3600));
  timestamp %= 24 * 3600;

  const h = Math.floor(timestamp / 3600);
  timestamp %= 3600;

  const m = Math.floor(timestamp / 60);
  timestamp %= 60;

  const s = timestamp;
  let text = '';

  const addText = (count, type) => {
    if (count === 0) return;
    text += `${count}${type}`;
  };

  addText(d, '天');
  addText(h, '小时');
  addText(m, '分');
  addText(s, '秒');

  return text;
}

const escapEncodeCode = {
  '-': '&ndash;',
};
const escapDecodeCode = {
  '&ndash;': '-',
};
// 对字符串进行编码
export function encode(str) {
  let res = window.encodeURIComponent(str);
  Object.keys(escapEncodeCode).map((k) => {
    res.replace(k, escapEncodeCode[k]);
  });
  return res;
}
export function decode(str) {
  let res = str;
  Object.keys(escapDecodeCode).map((k) => {
    res.replace(k, escapDecodeCode[k]);
  });
  return window.decodeURIComponent(res);
}

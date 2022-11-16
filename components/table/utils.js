/**
 * table的工具
 * */
import * as cache from '../../utils/cache';

export function getStatusClass(data, column, index) {
  const { computedClass } = column;
  if (typeof computedClass === 'function') return computedClass(data, column, index);
}

/**
 * 设置align
 * */
export function getAlign(column) {
  const o = {
    money: 'right',
  };
  const {
    textType,
    align,
  } = column;
  return o[textType] || align;
}

const ROOT_KEY = 'TABLE_HEADER';

export function getCache(key) {
  return cache.getCache([ROOT_KEY, key]);
}

export function setCache(key, data) {
  if (!key) return;
  cache.setCache([ROOT_KEY, key], data);
}

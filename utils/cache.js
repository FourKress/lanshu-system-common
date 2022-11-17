/**
 * Localstorage缓存: 对账号进行隔离
 * */
import store from '@/store';
import { isEmpty } from '.';

function getCacheKey() {
  const { userInfo } = store.state.user;
  const cacheKey = LANSHU_CONFIG.authKey || 'auth.dev';

  return userInfo.id || cacheKey;
}

export function getAllCache(id) {
  const str = window.localStorage.getItem(id || getCacheKey());
  return JSON.parse(str) || {};
}

export function getCache(keys, id) {
  const data = getAllCache(id) || {};
  if (Array.isArray(keys)) {
    return data[keys.join('_')];
  }
  return data[keys];
}

export function setCache(keys, data, id) {
  if (isEmpty(keys)) return;
  const cacheData = getAllCache();
  const newData = isEmpty(cacheData) ? {} : cacheData;
  newData[keys instanceof Array ? keys.join('_') : keys] = data;
  const keyId = id || getCacheKey();
  window.localStorage.setItem(keyId, JSON.stringify(newData));
}

export function removeCache(keys, id) {
  if (isEmpty(keys)) return;
  const cacheData = getAllCache();
  const newData = isEmpty(cacheData) ? {} : cacheData;
  const key = keys instanceof Array ? keys.join('_') : keys;
  delete newData[key];
  const keyId = id || getCacheKey();
  window.localStorage.setItem(keyId, JSON.stringify(newData));
}

export function getAllSession() {
  const sessionKey = LANSHU_CONFIG.authKey || 'auth.dev';
  return JSON.parse(window.localStorage.getItem(sessionKey) || '{}');
}

export function getSession(keys) {
  const data = getAllSession();
  if (keys instanceof Array) {
    return data[keys.join('_')];
  }
  return data[keys];
}

/**
 * 获取本地Token
 * 更新本地Token
 * 删除本地Token
 */

import Cookies from 'js-cookie';

const { authKey, domain } = WD_CONFIG || {};

// 获取本地token
export function getToken() {
  return Cookies.get(authKey, { domain });
}

// 设置/更新本地token
export function setToken(data) {
  const { token } = data;
  return Cookies.set(authKey, token, {
    domain,
  });
}

// 移除本地token
export function removeToken(key = authKey) {
  Cookies.remove(key, { domain });
  localStorage.clear();
}

/**
 * 检查本地token状态
 * @returns {number} status: 0 = 不存在/过期，1 = 正常，2 = 更新;
 * @returns {string} refresh_token: status = 2时会返回;
 * }
 */
export function checkToken() {
  return getToken();
}

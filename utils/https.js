/**
 * ajax请求工具, 基于axios封装
 * options的参数说明：
 * {
 * }
 */

import axios from 'axios';
import qs from 'qs';
import _ from 'lodash'
import store from '@/store';
import { getToken, setToken, removeToken } from './token';

/**
 * 延长token
 */
const expandToken = _.debounce(
  () => {
    const token = getToken();
    token && setToken({ token });
  },
  1000,
  { leading: true, trailing: false },
);

//  全局变量
const { baseURL } = WD_CONFIG || {};

const { mock, mockReplace } = CONFIG;

const DEFAULT_HTTP_OPTIONS = {
  timeout: 20000,
  withCredentials: false,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL,
  paramsSerializer(params) {
    return qs.stringify(params, { arrayFormat: 'repeat' });
  },
  // 非200的响应全部进入reject
  // validateStatus(status) {
  //   // 默认设置
  //   // return status >= 200 && status < 300;
  //   return status === 200;
  // },

  // 自定义参数
  // 是否需要全局loading
  // loading: true,
  // 是否禁用自动的错误提示
  disabledErrorMessage: false,
};

const HEADER_AUTH = 'Authorization';

const instance = axios.create(DEFAULT_HTTP_OPTIONS);

instance.interceptors.request.use(
  (config) => {
    const {
      // 是否加上token, false表示不加，1000表示普通, 1001表示登录
      setToken = 1000,
      token,
      // 是否打开全局loading
      loading,
      method,
      // 是否是否吧参数处理成formData形式
      serialize,
      // API的版本号
      apiVersion = 1,
      // 是否传递Authorization
      isAuth = true,
    } = config;
    let { data, params } = config;
    // 如果请求类型不是get类型，并且loading ! == false

    if (method.toLowerCase() === 'get') {
      if (loading === true) store.commit('global/fullScreenLoading');
    } else if (loading !== false) store.commit('global/fullScreenLoading');
    if (serialize) {
      if (data) data = qs.stringify(data);
      if (params) data = qs.stringify(params);
    }
    config.data = data;
    config.params = params;
    config.method = method.toLowerCase();
    if (mock) {
      const mockPre = config.url.match(/\/*([a-zA-Z\-]+)/);
      if (mock === true || (mock?.length > 0 && mock.includes(mockPre[1]))) {
        config.baseURL = baseURL;
        if (mockReplace) {
          config.url = config.url.replace(mockPre[0], '');
        }
      }
    }
    return config;
  },
  (error) => {
    // 如果报错，会强制关闭全局loading
    store.commit('global/forceCloseLoading');
    store.commit('global/errorMessage', '操作错误，请稍候再试！');
    return Promise.reject(error);
  },
);

// 添加响应拦截器
instance.interceptors.response.use(
  (response) => {
    expandToken();
    const { headers, config } = response;
    const { url } = config;
    let { data } = response;
    const { disabledErrorMessage } = headers.config || config || {};
    // if (config.loading) store.commit('global/closeLoading');
    store.commit('global/closeLoading');
    // 下载类型的请求, 返回值为ArrayBuffer类型,做特殊处理, 请求时需要设置 responseType: 'arraybuffer',
    const isArrayBuffer = data instanceof ArrayBuffer;
    if (isArrayBuffer) {
      const utf8decoder = new TextDecoder();
      const u8arr = new Uint8Array(data);
      // 将二进制数据转化为字符串
      const resInfo = utf8decoder.decode(u8arr);
      if (resInfo.includes('code')) {
        // 重置data数据
        data = JSON.parse(resInfo);
      } else {
        // 返回文件流
        return new Blob([data]);
      }
    }
    let { code, msg } = data || {};
    if (code !== '0') {
      if (url.includes('/api/login/out')) {
        return Promise.reject(data);
      }
      store.commit('global/errorMessage', msg);
      const codeList = ['10000100', '10000102'];
      if (codeList.includes(code)) {
        removeToken();
        window.location.replace(`${window.location.origin}/#/login`);
      }
      return Promise.reject(data);
    }
    return isArrayBuffer ? Promise.reject(data) : data;
  },
  (error) => {
    /* 如果报错，会强制关闭全局loading */
    store.commit('global/forceCloseLoading');
    expandToken();
    const { response, request, config, message } = error;
    const { disabledErrorMessage } = config || {};
    if (message.includes('timeout of')) {
      console.log('响应超时');
      store.commit('global/errorMessage', '请求超时');
    } else if (message.includes('Network Error')) {
      console.log('网络出错：Network Error');
      store.commit('global/errorMessage', '网络连接异常');
    } else if (response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = response;
      let { msg } = data || {};
      if (status === 200) {
        // msg = '正常'
        // console.log(msg);
      } else if (status === 401) {
        console.log('请求401: 无权限');
        msg = '系统错误，请稍候再试！';
        console.log(msg);
      } else if (status === 403) {
        msg = '系统错误，请稍候再试！';
        console.log(msg);
      } else if (status === 404) {
        msg = '系统错误，请稍候再试！';
        console.log(msg);
      } else if (status === 500) {
        msg = '系统错误，请稍候再试！';
        console.log(msg);
      } else {
        msg = '系统错误，请稍候再试！';
        console.log(msg);
      }
      if (!disabledErrorMessage) store.commit('global/errorMessage', msg);
    } else if (request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log('request====>', request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('error.message', message);
    }
    return Promise.reject(error);
  },
);

export default instance;

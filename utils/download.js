/**
 * 封装流下载
 */
import axios from 'axios';
import qs from 'qs';
import store from '@/store';

function convertRes2Blob(response) {
  // 提取文件名 https://www.cnblogs.com/smiler/p/8708815.html
  // const filename = response.headers['content-disposition']?.match(/filename=(.*)/)[1]
  //   || '导出文件.xlsx';
  const filename = '导出文件.xlsx';

  // 将二进制流转为blob
  const blob = new Blob([response.data], {
    type: response.headers['content-type'],
  });
  // 创建新的URL并指向File对象或者Blob对象的地址
  const blobURL = window.URL.createObjectURL(blob);
  // 创建a标签，用于跳转至下载链接
  const tempLink = document.createElement('a');
  tempLink.style.display = 'none';
  tempLink.href = blobURL;
  tempLink.setAttribute('download', decodeURI(filename));
  // 兼容：某些浏览器不支持HTML5的download属性
  if (typeof tempLink.download === 'undefined') {
    tempLink.setAttribute('target', '_blank');
  }
  // 挂载a标签
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  // 释放blob URL地址
  window.URL.revokeObjectURL(blobURL);
}

//  全局变量
const { baseURL } = LANSHU_CONFIG || {};

const DEFAULT_HTTP_OPTIONS = {
  timeout: 20000,
  responseType: 'blob',
  baseURL,
  paramsSerializer(params) {
    return qs.stringify(params, { arrayFormat: 'repeat' });
  },
  disabledErrorMessage: false,
};

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
    } = config;
    let { data, params } = config;

    if (loading !== false) store.commit('global/fullScreenLoading');
    if (serialize) {
      if (data) data = qs.stringify(data);
      if (params) data = qs.stringify(params);
    }
    config.data = data;
    config.params = params;
    config.method = method.toLowerCase();

    return config;
  },
  (error) => {
    store.commit('global/forceCloseLoading');
    store.commit('global/errorMessage', '操作错误，请稍候再试！');
    return Promise.reject(error);
  },
);

// 添加响应拦截器
instance.interceptors.response.use(
  (response) => {
    store.commit('global/closeLoading');
    convertRes2Blob(response);

    return Promise.resolve();
  },
  (error) => {
    store.commit('global/forceCloseLoading');
    return Promise.reject(error);
  },
);

export default instance;

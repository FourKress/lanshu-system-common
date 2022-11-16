/**
 * 全局方法或者变量缓存
 */
import actions from './actions';
import mutations from './mutations';
import getters from './getters';

const state = {
  // 全屏遮罩
  fullScreenLoading: false,
  fullScreenLoadingCounter: 0,
  // 全局的错误信息管理
  errorMessage: undefined,
  enumOptions: {},
  enumCodes: [],
  cacheIds: {},
};


export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
};

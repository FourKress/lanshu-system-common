import https from '../../utils/https';
import * as types from './types';

export default {
  /**
   * 获取枚举值
   * @param {*} param0
   * @param {*} param1
   */
  async getEmumOptions({ dispatch, commit, state }, codes) {
    let _codes = state.enumCodes.concat();
    if (typeof codes === 'string') {
      _codes.push(codes);
    } else if (codes.constructor === Array) {
      _codes = _codes.concat(codes);
    }
    commit(types.SET_ENUM_CODES, _codes);
    dispatch('debounceEnumOptions');
  },
  debounceEnumOptions({ commit, state }) {
    const _codes = [...new Set(state.enumCodes)];
    if (window.ENUM_QUERY_DEBOUNCE) {
      clearTimeout(window.ENUM_QUERY_DEBOUNCE);
    }
    window.ENUM_QUERY_DEBOUNCE = setTimeout(() => {
      https({
        url: '/config/dict/params/value-label/batch',
        method: 'post',
        loading: false,
        data: {
          codes: _codes,
        },
      }).then((res) => {
        if (res.code === 10000) {
          // 填充Options
          commit(types.GET_ENUM_OPTIONS, res.data);
          // 重置防抖code缓存池的code
          commit(types.SET_ENUM_CODES, []);
        }
      });
    }, 200);
  },
  setCache({ commit }, data) {
    commit('setCache', data);
  },
};

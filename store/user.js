/**
 * 用户信息持久化
 * @type {string}
 */
const USER_INFO = localStorage.getItem('userInfo');
const USER_MENU = localStorage.getItem('userMenu');
const AUTH_BTN = localStorage.getItem('authBtn');

const state = {
  userInfo: USER_INFO ? JSON.parse(USER_INFO) : {},
  userMenu: USER_MENU ? JSON.parse(USER_MENU) : [],
  authBtn: AUTH_BTN ? JSON.parse(AUTH_BTN) : [],
  userInfoError: {
    visible: false,
    message: '',
    type: '',
  },
  userInfoErrorCode: undefined,
};

const getters = {
  userInfo(data) {
    return data.userInfo;
  },
  userMenu(data) {
    return data.userMenu;
  },
  authBtn(data) {
    return data.authBtn;
  },
  userInfoError(data) {
    return data.userInfoError;
  },
  userInfoErrorCode(state) {
    return state.userInfoErrorCode;
  },
};

const mutations = {
  updateUserInfo(data, value) {
    const { resources } = value || {};
    data.userInfo = value;
    data.userMenu = resources;
    localStorage.setItem('userInfo', JSON.stringify(value));
    localStorage.setItem('userMenu', JSON.stringify(resources));
  },
  updateAuthBtn(data, value) {
    const codes = value.map((d) => d.code);
    data.authBtn = codes;
    localStorage.setItem('authBtn', JSON.stringify(codes));
  },
  clearUserInfo(data) {
    data.userInfo = {};
  },
  userInfoError(data, value) {
    data.userInfoError = value;
  },
  setUserInfoErrorCode(state, value) {
    state.userInfoErrorCode = value;
  },
};

const actions = {
  setUserInfoErrorCode({ commit }, value) {
    commit('setUserInfoErrorCode', value);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

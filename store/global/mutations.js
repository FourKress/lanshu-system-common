import * as types from './types';

export default {
  fullScreenLoading(data) {
    data.fullScreenLoadingCounter += 1;
    data.fullScreenLoading = true;
  },
  closeLoading(data) {
    data.fullScreenLoadingCounter -= 1;
    if (data.fullScreenLoadingCounter <= 0) {
      data.fullScreenLoading = false;
      data.fullScreenLoadingCounter = 0;
    }
  },
  forceCloseLoading(data, value) {
    data.fullScreenLoading = false;
    data.fullScreenLoadingCounter = 0;
  },
  errorMessage(data, value) {
    data.errorMessage = value;
  },
  [types.GET_ENUM_OPTIONS](state, data) {
    state.enumOptions = Object.assign({}, state.enumOptions, data);
  },
  [types.SET_ENUM_CODES](state, data) {
    state.enumCodes = data;
  },
  setCache(state, data) {
    state.cacheIds = data;
  },
};

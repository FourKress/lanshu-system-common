/**
 * 需要挂载到Vue原型链上的方法
 * 统一由$开头以示区别
 */

import store from '@/store';
import * as ELEMENT from 'element-ui';
import https from './https';
import MessageEvent from './message';
import { compareAuth } from '.';

export default {
  https,
  message: MessageEvent(ELEMENT.Message),
  hasAuth(authKey) {
    const { authBtn = [] } = store.state.user;
    return compareAuth(authKey, authBtn);
  },
  someAuth(authKeys = []) {
    return authKeys.some((authKey) => {
      const { authBtn = [] } = store.state.user;
      return compareAuth(authKey, authBtn);
    });
  },
  everyAuth(authKeys = []) {
    return authKeys.every((authKey) => {
      const { authBtn = [] } = store.state.user;
      return compareAuth(authKey, authBtn);
    });
  },
};

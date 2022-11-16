import { checkToken } from '@common/utils/token';
import store from '@/store';

/**
 * 路由鉴权
 * 1：是否需要鉴权 white 白名单
 * 2：鉴权 cookie信息是否存在
 * 3：用户信息是否存在
 * 4：鉴权（鉴权依据可动态验证，根据后端返回结果验证是否有权限）
 * */
export default () => {
  return async (to, form, next) => {
    try {
      return next();
      // if (to.name === 'login') return next();
      // const token = checkToken();
      // const { userMenu } = store.state.user;
      // if (token && token !== 'undefined' && userMenu?.length) {
      //   const code = to.meta?.code || '';
      //   const codes = userMenu.map((d) => d.code);
      //   if (to.name === 'dashboard') {
      //     return next();
      //   }
      //   if (Array.isArray(code)) {
      //     code.forEach((d) => {
      //       if (codes.includes(d)) {
      //         next();
      //       }
      //     });
      //   } else if (codes.includes(to.meta?.code)) {
      //     next();
      //   }
      //   return next(false);
      // }
      // return next('/login')
    } catch (e) {
      store.commit('user/userInfoError', {
        visible: true,
        message: e,
      });
      next(false);
    }
  };
};

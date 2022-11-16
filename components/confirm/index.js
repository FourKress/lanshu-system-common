import Confirm from './main';
import store from '@/store';

export default {
  install(Vue) {
    const ConfirmBox = Vue.extend(Confirm);

    Vue.prototype.$Rconfirm = (options) => {
      // 注入store
      const instance = new ConfirmBox({ store }).$mount();
      document.body.appendChild(instance.$el);
      return instance.open(options);
    };
  },
};

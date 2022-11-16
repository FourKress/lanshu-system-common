/**
 * 对window上的onresize等方法进行整合处理，以便实现在多处使用
 * 可以使用addEventListener方法绑定，ie8需要处理兼容问题，使用attachEvent
 * */

const eventIntegr = ({ eventName, event }) => {
  const oldEvent = window[eventName] || function () {};
  window[eventName] = function () {
    oldEvent();
    event();
  };
};

export default eventIntegr;

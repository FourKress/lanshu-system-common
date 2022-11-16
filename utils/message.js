/**
 * 对message进行拦截管理: 用于只展示第一个信息的场景
 * */

// 信息计数器
let messageCounter = 0;
// 标记时间戳
let instanceTimeStamp;

const ICONS = {
  warning: 'v-icon-warn r-message-warn',
  error: 'v-icon-error r-message-error',
  success: 'v-icon-prompt-success r-message-success',
};

/**
 * 处理配置，改写onClose方法
 * */
function dealOptions(options, method) {
  if (typeof options === 'string') {
    options = {
      type: 'info',
      message: options,
    };
  }
  const { type } = options;
  const _options = {
    ...options,
    onClose() {
      const { onClose } = options;
      if (onClose) onClose();
      messageCounter--;
      instanceTimeStamp = undefined;
    },
  };
  const icon = ICONS[method] || ICONS[type];
  if (icon) _options.iconClass = `v-icon v-icon-font ${icon}`;
  return _options;
}

/**
 * 对比时间戳
 * */
function compareTime() {
  const nowTime = new Date().getTime();
  if (!instanceTimeStamp || nowTime - instanceTimeStamp > 1000) return nowTime;
  return false;
}

/**
 * 重新组装Message方法
 * */
function packMethod(instance, options, method) {
  const timestamp = compareTime();
  if (messageCounter >= 1) {
    if (timestamp) {
      instance.closeAll();
    } else {
      return;
    }
  }
  messageCounter++;
  instanceTimeStamp = timestamp;
  instance(dealOptions(options, method));
}

/**
 * 遍历message(传入的instance)上的方法重新包装
 * */
function packMessage(instance) {
  function messageInstance(options) {
    packMethod(instance, options, options.type);
  }

  Object.keys(instance).map((method) => {
    messageInstance[method] = (options) => {
      packMethod(instance, options, method);
    };
  });
  return messageInstance;
}

export default packMessage;

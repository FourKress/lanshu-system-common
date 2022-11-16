import { isNull, DEFAULT_PLACEHOLDER } from '@common/utils';
import _ from 'lodash';

/**只处理包含的标签 */
const tags = ['span'];

/**
 * 对渲染函数进行封装，如果渲染结果会出现空 则使用占位符填充
 */
const packCreateElement = (h, ctx) => (...args) => {
  const tag = args[0];
  const dataIdx = _.isPlainObject(args[1]) ? 2 : 1;
  const rowText = args[dataIdx];
  // 当渲染文本为空或者空数组或者 只有一个节点并且节点innerText为空时
  // 输出空占位符"DEFAULT_PLACEHOLDER"
  if (
    tags.includes(tag) &&
    (isNull(rowText) ||
      (typeof rowText === 'object' &&
        rowText?.length <= 1 &&
        isNull(rowText[0])))
  ) {
    const { emptyPlaceholder } = ctx.props;
    args[dataIdx] = _.isNil(emptyPlaceholder)
      ? DEFAULT_PLACEHOLDER
      : emptyPlaceholder;
  }

  return h.apply(this, args);
};

export default {
  name: 'TableExpand',
  functional: true,
  props: {
    row: Object,
    render: Function,
    index: Number,
    // 当为空时 是否填充默认字符
    fillEmpty: Boolean,
    emptyPlaceholder: String,
    column: {
      type: Object,
      default: null,
    },
  },
  render: (h, ctx) => {
    const params = {
      row: ctx.props.row,
      index: ctx.props.index,
    };
    if (ctx.props.column) params.column = ctx.props.column;

    if (ctx.props.fillEmpty) {
      return ctx.props.render(packCreateElement(h, ctx), params);
    } else {
      return ctx.props.render(h, params);
    }
  },
};

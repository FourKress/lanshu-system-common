export default {
  functional: true,
  props: ['vnode'],
  render(h, context) {
    const { vnode } = context.props;
    return vnode || null;
  },
};

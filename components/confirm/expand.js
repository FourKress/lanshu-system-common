export default {
  props: {
    render: Function,
  },
  name: 'confirmRender',
  functional: true,
  render: (h, ctx) => {
    return ctx.props.render(h);
  },
};

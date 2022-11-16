export default {
  props: {
    render: [Function],
    data: [Object],
  },
  name: 'remoteInputRender',
  functional: true,
  render: (h, ctx) => {
    return ctx.props.render(h, ctx.props.data);
  },
};

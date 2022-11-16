export default {
  functional: true,
  props: {
    render: {
      type: Function,
      default: () => null,
    },
    props: {
      type: Array,
      default: () => [],
    },
  },
  render(h, context) {
    let { render, props } = context.props;
    if (typeof render !== 'function') return null;

    !Array.isArray(props) && (props = []);
    const rendered = render(h, ...props);
    if (
      typeof description === 'object'
        && description.hasOwnProperty('componentOptions') // eslint-disable-line
    ) {
      return rendered;
    }
    return <span>{rendered}</span>;
  },
};

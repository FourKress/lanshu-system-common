module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      "@babel/preset-env",
      {
        modules: false,
        targets: {
          browsers: ["> 1%", "last 5 versions", "ie >= 9"],
        },
        useBuiltIns: "usage",
        corejs: 3,
      },
    ],
    "@vue/babel-preset-jsx",
  ];
  const plugins = [
    "@babel/plugin-transform-runtime",
    [
      "@babel/plugin-proposal-class-properties",
      {
        loose: false,
      },
    ],
    [
      "@babel/plugin-proposal-decorators",
      {
        legacy: true,
      },
    ],
    [
      "component",
      {
        libraryName: "element-ui",
        styleLibraryName:
          "~/node_modules/@lanshu/system-common/assets/styles/element/theme",
      },
    ],
  ];

  return {
    presets,
    plugins,
  };
};

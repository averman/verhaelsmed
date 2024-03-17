module.exports = {
    jest: {
      configure: {
        transformIgnorePatterns: [
          "node_modules/(?!mui-rte/.*)"
        ],
      },
    },
  };
  
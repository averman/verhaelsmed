module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
    //   'plugin:react/recommended',
    //   'plugin:@typescript-eslint/recommended',
    //   'plugin:jsx-a11y/recommended',
    ],
    plugins: [
    //   'react',
    //   '@typescript-eslint',
    //   'jsx-a11y',
    ],
    rules: {
      "prefer-const": "off"
    //   '@typescript-eslint/no-unused-vars': 'warn',
    //   'eqeqeq': 'warn',
    //   'no-eval': 'warn',
    //   'no-throw-literal': 'warn',
    //   'jsx-a11y/anchor-is-valid': 'warn',
    //   'react-hooks/exhaustive-deps': 'warn',
    //   "react-hooks/rules-of-hooks": "error",
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  };
  
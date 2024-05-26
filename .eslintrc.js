module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:jsx-a11y/recommended',
      'prettier',
      'prettier/@typescript-eslint',
    ],
    plugins: [
      'react',
      '@typescript-eslint',
      'jsx-a11y',
      'prettier',
    ],
    rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'eqeqeq': 'warn',
      'no-eval': 'warn',
      'no-throw-literal': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  };
  
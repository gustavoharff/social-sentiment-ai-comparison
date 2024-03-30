/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@rocketseat/eslint-config/next', 'next/core-web-vitals'],
  plugins: ['simple-import-sort'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'simple-import-sort/imports': 'error',
    camelcase: 'off',
  },
}

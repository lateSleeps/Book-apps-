module.exports = {
  root: true,
  extends: ['next/core-web-vitals', '@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/no-cycle': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabeticalOrder: true
      }
    ]
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_' }
        ]
      }
    }
  ]
};

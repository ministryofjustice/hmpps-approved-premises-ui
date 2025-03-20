import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraIgnorePaths: ['public', 'assets', 'cypress.json', 'reporter-config.json', 'playwright-report', 'esbuild'],
  }),
  {
    name: 'CAS1-specific rules',
    files: ['**/*.ts'],
    ignores: ['**/*.js'],
    rules: {
      'import/prefer-default-export': 'off',
      'max-classes-per-file': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-unused-vars': [
        1,
        {
          argsIgnorePattern: 'res|next|^err|_',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
      'no-param-reassign': ['error', { props: false }],
      'no-underscore-dangle': [2, { allowAfterThis: true }],
      'no-empty-function': ['error', { allow: ['constructors'] }],
    },
  },
]

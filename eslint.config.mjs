import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  eslint.configs.recommended,

  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],

      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/label-has-associated-control': 'warn',
    },
  },

  ...astroPlugin.configs.recommended,

  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroPlugin.parser,
      parserOptions: {
        parser: tsparser,
        extraFileExtensions: ['.astro'],
      },
    },
    rules: {
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
    },
  },

  {
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      '.netlify/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
    ],
  },
];

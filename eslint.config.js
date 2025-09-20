// Flat ESLint config for RegexPlay
// Minimal ruleset focusing on common best practices for a small CLI project.
// Extend later with stylistic preferences as needed.

const js = require('@eslint/js');
const pluginImport = require('eslint-plugin-import');
const pluginN = require('eslint-plugin-n');
const pluginPromise = require('eslint-plugin-promise');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly'
      }
    },
    plugins: {
      import: pluginImport,
      n: pluginN,
      promise: pluginPromise
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': 'off',
      'import/no-unresolved': 'error',
      'n/no-missing-require': 'error',
      'promise/always-return': 'off',
      'promise/catch-or-return': 'warn'
    }
  }
];

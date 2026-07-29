import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'docs/legacy-portal']),

  // ── Public React site ──────────────────────────────────────────────────────
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // `catch (_) {}` is a deliberate, readable "ignore this" in this codebase.
      'no-empty': ['error', { allowEmptyCatch: true }],
      // An unused `catch (err)` binding is intentional, not a defect.
      // `React` is consumed by the JSX transform, not by any visible reference.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_|^React$', caughtErrors: 'none', ignoreRestSiblings: true }],
    },
  },

  // ── CMS admin UI (classic browser script, no bundler) ──────────────────────
  {
    files: ['app.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.browser,
      sourceType: 'script',
    },
    rules: {
      // Top-level functions here are entry points invoked from inline `onclick`
      // handlers in the generated markup, which ESLint cannot see. `vars: 'local'`
      // keeps the check for genuinely dead local variables while not flagging
      // every render/open/save/delete handler as unused.
      'no-unused-vars': ['error', { vars: 'local', args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },

  // ── Node backend (CommonJS) ────────────────────────────────────────────────
  {
    files: ['**/*.cjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
      sourceType: 'commonjs',
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_|^next$', varsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true }],
    },
  },

  // ── Build scripts (ESM) ────────────────────────────────────────────────────
  {
    files: ['scripts/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true }],
    },
  },

  // ── Tests (vitest) ─────────────────────────────────────────────────────────
  {
    files: ['**/*.test.{js,jsx}', 'src/test/**/*.{js,jsx}', 'server/__tests__/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.vitest },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_|^React$' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
])

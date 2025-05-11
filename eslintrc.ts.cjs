// eslintrc.ts.cjs
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      project: './tsconfig.json',
      tsconfigRootDir: __dirname
    },
    plugins: ['@typescript-eslint'],
    extends: [
      'plugin:@typescript-eslint/recommended',
      'prettier'
    ],
    ignorePatterns: [
      'node_modules/',
      'sauvegarde/',
      'src/data/',
      '*.astro'
    ]
  };
// eslintrc.ts.cjs
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      project: './tsconfig.json',
      tsconfigRootDir: __dirname
    },
    plugins: ['@typescript-eslint'],
    extends: [
      'plugin:@typescript-eslint/recommended',
      'prettier'
    ],
    ignorePatterns: [
      'node_modules/',
      'sauvegarde/',
      'src/data/',
      '*.astro'
    ],
    overrides: [
      {
        // Désactive la plainte sur les triple-slash dans env.d.ts
        files: ['src/env.d.ts'],
        rules: {
          '@typescript-eslint/triple-slash-reference': 'off'
        }
      },
      {
        // Assouplit (ou désactive) la règle any dans strapi.ts
        files: ['src/lib/strapi.ts'],
        rules: {
          '@typescript-eslint/no-explicit-any': 'off'
        }
      }
    ]
  };
    
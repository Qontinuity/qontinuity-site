// eslintrc.astro.cjs
module.exports = {
    root: true,
  
    // Ces dossiers/fichiers ne seront jamais lintés ici
    ignorePatterns: [
      'node_modules/',
      'sauvegarde/',
      'src/data/'
    ],
  
    // Utiliser le parser Astro pour les .astro
    parser: 'astro-eslint-parser',
    parserOptions: {
      parser: '@typescript-eslint/parser',
      extraFileExtensions: ['.astro'],
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  
    extends: [
      'plugin:astro/recommended',
      'prettier'
    ],
  
    plugins: ['astro'],
  
    rules: {
      // tu pourras ajuster ici, mais on part sur la config recommandée
    }
  };
  
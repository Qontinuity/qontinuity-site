// .eslintrc.cjs
module.exports = {
    root: true,
  
    // On n’essaie **jamais** de lintrer ces dossiers/fichiers
    ignorePatterns: [
      'node_modules/',
      'sauvegarde/',
      'src/data/'
    ],
  
    // Parser TypeScript par défaut pour tout ce qui n’est pas .astro
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      project: './tsconfig.json',
      tsconfigRootDir: __dirname,
    },
  
    plugins: ['@typescript-eslint'],
  
    extends: [
      // règles TS de base  
      'plugin:@typescript-eslint/recommended',
      // désactive les règles en conflit avec Prettier  
      'prettier'
    ],
  
    overrides: [
      {
        // **Uniquement** pour les fichiers .astro
        files: ['**/*.astro'],
        // on bascule sur le parser Astro
        parser: 'astro-eslint-parser',
        parserOptions: {
          // à l’intérieur des blocs frontmatter, on délègue TS  
          parser: '@typescript-eslint/parser',
          extraFileExtensions: ['.astro'],
          ecmaVersion: 2020,
          sourceType: 'module',
        },
        extends: [
          // prise en charge complète d’Astro  
          'plugin:astro/recommended'
        ],
      }
    ]
  };
  
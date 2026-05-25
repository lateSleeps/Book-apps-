/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // A new feature
        'fix',      // A bug fix
        'docs',     // Documentation only changes
        'style',    // Changes that don't affect code meaning (formatting, missing semicolons, etc)
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Code change that improves performance
        'test',     // Adding missing tests or correcting existing tests
        'chore',    // Changes to build process, dependencies, or tooling
        'ci',       // Changes to CI configuration files and scripts
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'customer',    // Customer booking app
        'owner',       // Owner dashboard app
        'types',       // @rara/types package
        'utils',       // @rara/utils package
        'mock-data',   // @rara/mock-data package
        'hooks',       // @rara/hooks package
        'config',      // @rara/config package
        'monorepo',    // Root monorepo changes
        'deps',        // Dependency changes
      ],
    ],
    'type-case': [2, 'always', 'lowercase'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lowercase'],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
};

module.exports = {
    extends: "eslint:recommended",
    parserOptions: {
      ecmaVersion: 6,
    },
    env: {
      node: true,
      mocha: true,
      amd: true
    },
    rules: {
      semi: [2, 'always'],
      'no-console': 'off'
    },
};

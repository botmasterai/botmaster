module.exports = {
  extends: 'airbnb',
  plugins: [
    'ava',
  ],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'no-underscore-dangle': 'off',
    semi: [2, 'always'],
    'no-param-reassign': 'off',
    'no-restricted-syntax': 'off',
    'strict': 'off',
  },
};

module.exports = {
  extends: 'airbnb',
  plugins: [
    'ava'
  ],
  rules: {
    'import/no-extraneous-dependencies': ['off'],
    'no-underscore-dangle': ["off"],
    semi: [2, 'always'],
  }
};
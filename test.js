const pluginTester = require('babel-plugin-tester')
const plugin = require('./')
const path = require('path')

pluginTester({
  plugin,
  snapshot: false,
  fixtures: path.join(__dirname, '__FIXTURES__'),
})

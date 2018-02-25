# babel-plugin-transform-styled-components-remove-prop-types

_Remove propTypes from styled-components in production_

## Installation:

`$ npm install -D babel-plugin-transform-styled-components-remove-prop-types`

```javascript
// .babelrc

{
  "plugins": ["transform-styled-components-remove-prop-types"]
}
```

## About

`babel-plugin-transform-styled-components-remove-prop-types` searches for components created by the default import of `styled-components` and components that are created using `.extend` and removes their `propTypes`.

## Contributors

* [Mark Chandler](https://github.com/lionize)

## License

MIT

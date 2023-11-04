## Pattern CSS

Lightening Fast, Reusable, Safe, In-editor CSS Optimization and Minification Tool. The perfect compliment to your site's theme.json. Safely add custom CSS to any WordPress block, including synced reusable blocks.

[![Twitter](https://img.shields.io/twitter/url/https/twitter.com/kevinbatdorf.svg?style=social&label=Follow%20%40kevinbatdorf)](https://twitter.com/kevinbatdorf)

### Features

- It's fast. CSS is minified and optimized in the browser
- It's safe. Invalid, non-spec CSS is never persisted (validated via webassembly sandbox)
- Scopes styles to the block, removing the need to manage class naming
- Supports reusable (synced or not-synced) patterns
- See changes on the page as you make them
- Combines adjacent rules (to decrease size)
- Minifies colors and math functions to simplify according to spec

### Tips

- Use `[block]` to target the current block directly instead of children
- Use `!important` to override some of your theme styles (use sparingly)

### Combines Rules
<!-- prettier-ignore -->
```css
[block] {
  color: red;
}
.bar {
  color: red;
}

/* output: */
.pcss-f903c5c0,.pcss-f903c5c0 .bar{color:red}
```

### Fixes redundant properties
<!-- prettier-ignore -->
```css
[block] {
  padding-top: 5px;
  padding-left: 50px;
  padding-bottom: 15px;
  padding-right: 5px;
}

/* output: */
.pcss-f903c5c0{padding:5px 5px 15px 50px}
```

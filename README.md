## Pattern CSS

Safely add custom CSS to any WordPress block, including synced reusable blocks.

[![Twitter](https://img.shields.io/twitter/url/https/twitter.com/kevinbatdorf.svg?style=social&label=Follow%20%40kevinbatdorf)](https://twitter.com/kevinbatdorf)

![alt text](.wordpress-org/screenshot-1.gif 'Example')

Demo showing some typo notification and live updating. This was added to a reusable pattern, which would load the css anywhere that pattern is used.

### Features
- It's fast. Likely faster than your development build tool
- It's safe - only persist if css is valid (compiled via webassembly sandbox)
- Scopes styles to the block, removing the need to manage class naming
- Supports reusable (synced or not-synced) patterns
- See changes on the page as you make them
- Combines adjacent rules (to decrease size)
- Minifies colors and math functions to simplify according to spec
- Coming soon: Use theme.json decorators.

### Tips
- Use `!important` to override some of your theme styles (Use sparingly)

### Combines Rules
```css
[block] {
  color: red;
}
.bar {
  color: red;
}
```

becomes:

```css
.pcss-3aa0f0fc,.pcss-3aa0f0fc .bar{color:red}
```

### Fixes redundant properties
```css
[block] {
  padding-top: 5px;
  padding-left: 50px;
  padding-bottom: 15px;
  padding-right: 5px;
}
```

becomes:

```css
.pcss-3aa0f0fc{padding:5px 5px 15px 50px}
```

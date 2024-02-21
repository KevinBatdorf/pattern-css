=== Pattern CSS - Sync styles to patterns and blocks ===
Contributors:      kbat82
Tags:              css, styles, inline, custom, blocks, pattern, design
Tested up to:      6.5
Stable tag:        1.2.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Add CSS styles to your blocks and synced patterns! Fast, optimized, and using modern best practices.

== Description ==

Add custom CSS to any block or pattern, including reusable patterns too. Your styles will be optimized, minified, and inlined directly into the page *only* where the block is used. If you set the block as synced, then the styles will be updated everywhere the block is used!

= How to =
- Every block will have a new "Additional CSS" settings panel.
- To target a block, you must use the `[block]` selector.
- To target any element *inside* the block, use the normal CSS selector.
- Use `!important` to override your theme styles (use sparingly)

= Features =
- Scopes styles to the block so that parent/sibling blocks are not affected
- It's fast. CSS is minified and optimized in the browser
- It's safe. Invalid, non-spec CSS is never persisted (validated via webassembly sandbox)
- Supports reusable (synced or not-synced) patterns
- See changes on the page as you make them
- Combines adjacent rules (to decrease size)
- Minifies colors and math functions to simplify according to spec
- Supports CSS nesting

Star it on [GitHub](https://github.com/KevinBatdorf/pattern-css)

= Basic Example =
`/* Target the block directly */
[block] {
  background: antiquewhite;
  padding: 2rem;
}
/* Target any inner elements */
a {
  text-decoration-color: burlywood;
  text-decoration-thickness: 2px;
  text-decoration-style: solid !important;
}
a:hover {
  text-decoration-color: darkgoldenrod;
}
/* Output: */
.pcss-a1b7b016{background:#faebd7;padding:2rem}.pcss-a1b7b016 a{text-decoration-color:#deb887;text-decoration-thickness:2px;text-decoration-style:solid!important}.pcss-a1b7b016 a:hover{text-decoration-color:#b8860b}`

= Supports Media Queries =
`@media (prefers-color-scheme: dark) {
  [block] {
    border-color: blue;
  }
}

/* Output: */
@media (prefers-color-scheme:dark){.pcss-cddaa023{border-color:#00f}}`

= Combines Rules =
`[block] {
  color: red;
}
.bar {
  color: red;
}

/* Output: */
.pcss-3aa0f0fc,.pcss-3aa0f0fc .bar{color:red}`

= Fixes redundant properties =
`[block] {
  padding-top: 5px;
  padding-left: 50px;
  padding-bottom: 15px;
  padding-right: 5px;
}

/* Output: */
.pcss-3aa0f0fc{padding:5px 5px 15px 50px}`

= Supports CSS nesting =
`[block] {
  padding: 1rem;
  a {
    color: red;
  }
  background: white;
  /* Including media queries */
  @media (prefers-color-scheme: dark) {
    background: black;
    color:white;
  }
}

/* Output: */
.pcss-f526bb2d{background:#fff;padding:1rem;& a{color:red}@media (prefers-color-scheme:dark){&{color:#fff;background:#000}}}`

Check browser support for [CSS nesting](https://caniuse.com/css-nesting)

== Installation ==

1. Activate the plugin through the 'Plugins' screen in WordPress

== Frequently Asked Questions ==

= Can I use something other than [block]? =

You can add a custom selector via a PHP constant. It requires setting a type (type, attribute, etc) and the name.

Here's an example for "foo { color: red }", where foo will be replaced with .pcss-h3Hso39bsK (or something similar):

Add this to functions.php:

`define('PATTERN_CSS_SELECTOR_OVERRIDE', ['name' => 'foo', 'type' => 'type']);`

== Screenshots ==

1. Add styles not available in the editor
2. Supports reusable and synced patterns too
3. Will warn you if your CSS is invalid

== Changelog ==

= 1.2.0 - 2024-02-20 =
- Feature: Adds support for CSS nesting
- Removes the code example on focus and adds it back on blur (if empty)
- Lets users define an additional block selector
- Adds a notice that the site logo isn't currently supported

= 1.1.0 - 2024-02-18 =
- Prevent adding classes to blocks unless CSS is added
- Force the settings area to the bottom (mainly for custom blocks)

= 1.0.1 - 2023-11-04 =
- Fixed a bug where the it would crash on the pattern manager page

= 1.0.0 - 2023-07-15 =
- Feature: Now supports reusable blocks/patterns
- Update: Removed the "per page" functionality to limit the scope of this plugin to blocks and reusable patterns only
- Performance: Added global loading strategy to prevent per block n+1 loading issues
- Improvement: Added the option to update the CSS selector used for scoping (useful for duplicating blocks)
- Improvement: Added some examples when no CSS is present
- Improvement: Removed the public className attribute requirement from the Additional Settings area
- Improvement: Instead of saving as meta on a post, it now pulls from the attribute directly during page load (via the pre_render_block filter).
- Fix: Now it will only show on post types with the public setting set to true

=== Pattern CSS ===
Contributors:      kbat82
Tags:              pattern, sync, css, styles, stylesheet, inline styles, custom css
Tested up to:      6.3
Stable tag:        1.0.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Add CSS to any block without worrying about style bleed or performance. Supports reusable, synced patterns.

== Description ==

Safely add custom CSS to any WordPress block, including synced reusable blocks. Unlike with similar tools, your css will be optimized, minified, and inlined directly into the head of the page only where the block is used.

= Features =
- It's fast. CSS is minified and optimized in the browser
- It's safe. Invalid, non-spec CSS is never persisted (validated via webassembly sandbox)
- Scopes styles to the block, removing the need to manage class naming
- Supports reusable (synced or not-synced) patterns
- See changes on the page as you make them
- Combines adjacent rules (to decrease size)
- Minifies colors and math functions to simplify according to spec
- Coming soon: Use theme.json decorators

= More Info =
- Follow [@kevinbatdorf](https://twitter.com/kevinbatdorf) on Twitter
- View on [GitHub](https://github.com/KevinBatdorf/pattern-css)

= Tips =
- Use `[block]` to target the current block directly instead of children
- Use `!important` to override some of your theme styles (Use sparingly)

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


== Installation ==

1. Activate the plugin through the 'Plugins' screen in WordPress

== Screenshots ==

1. An example showing the safety mechanism, and live editor updates.

== Changelog ==

= 1.0.0 - 2023-07-15 =
- Feature: Now supports reusable blocks/patterns
- Update: Removed the "per page" functionality to limit the scope of this plugin to blocks and reusable patterns only
- Performance: Added global loading strategy to prevent per block n+1 loading issues
- Improvement: Added the option to update the CSS selector used for scoping (useful for duplicating blocks)
- Improvement: Added some examples when no CSS is present
- Improvement: Removed the public className attribute requirement from the Additional Settings area
- Improvement: Instead of saving as meta on a post, it now pulls from the attribute directly during page load (via the pre_render_block filter).
- Fix: Now it will only show on post types with the public setting set to true

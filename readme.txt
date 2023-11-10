=== Pattern CSS - A Stylesheet For Blocks And Patterns ===
Contributors:      kbat82
Tags:              css, styles, stylesheet, custom, blocks, pattern, design
Tested up to:      6.4
Stable tag:        1.0.1
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Add CSS styles to any block or synced pattern! Automatically optimizes, minifies, and smart loads only where required. No bloat, all performance.

== Description ==

Add custom CSS to any block or pattern, including reusable patterns too. Your styles will be optimized, minified, and inlined directly into the page only where the block is used.

= Features =
- Scopes styles to the block so that parent/sibling blocks arent affected
- It's fast. CSS is minified and optimized in the browser
- It's safe. Invalid, non-spec CSS is never persisted (validated via webassembly sandbox)
- Supports reusable (synced or not-synced) patterns
- See changes on the page as you make them
- Combines adjacent rules (to decrease size)
- Minifies colors and math functions to simplify according to spec

Star it on [GitHub](https://github.com/KevinBatdorf/pattern-css)

= Tips =
- Use `[block]` to target the current block directly instead of children
- Create reusable patterns to make starting points for your blocks
- Use `!important` to override some of your theme styles (use sparingly)

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

1. Add styles not available in the editor
2. Supports reusable and synced patterns too
3. Will warn you if your CSS is invalid

== Changelog ==

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

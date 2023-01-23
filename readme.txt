=== Per Page CSS ===
Contributors:      kbat82
Tags:              css, styles, stylesheet, inline styles, custom css
Tested up to:      6.0
Stable tag:        0.1.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Lightening Fast, Safe, In-editor CSS Optimization and Minification Tool.

== Description ==

Add CSS styles to any page and have it load only on that page. Unlike with similar tools, your css will be optimized, minified, and inlined directly into the head of the page.

= Features =
- It's fast. Likely faster than your development build tool.
- See changes on the page as you make them
- Auto adds vendor prefixes as needed (removes redundant ones too)
- Combines adjacent rules (to decrease size)
- Minifies colors and math functions to simplify according to spec

= More features coming =
- Add CSS per page, per template, or site-wide
- Larger editor
- Snippet manager
- Pattern matching to load dynamically

= More Info =
- Follow [@kevinbatdorf](https://twitter.com/kevinbatdorf) on Twitter
- View on [GitHub](https://github.com/KevinBatdorf/per-page-css)

= Tips =
- Use `!important` to override some of your theme styles (Use sparingly)

= Includes Vendor Prefixes ===
`::placeholder {
  color: gray;
}`

becomes:

`::-webkit-input-placeholder{color:gray}::-ms-input-placeholder{color:gray}::placeholder{color:gray}`

= Combines Rules =
`.foo {
  color: red;
}
.bar {
  color: red;
}`

becomes:

`.foo,.bar{color:red}`

= Fixes redundant properties =
`.foo {
  padding-top: 1px;
  padding-left: 2px;
  padding-bottom: 3px;
  padding-right: 4px;
}`

becomes

`.foo{padding:1px 4px 3px 2px}`


== Installation ==

1. Activate the plugin through the 'Plugins' screen in WordPress

== Screenshots ==

1. An example showing the live updates.

== Changelog ==

= 0.1.0 - 2022-01-22
* Initial release

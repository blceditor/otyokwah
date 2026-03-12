# Keystatic Editor Tooltip Improvements

## Entry Toolbar (top-right of page editor)

| Icon | Current Tooltip | What It Actually Does | Recommended Tooltip |
|------|----------------|----------------------|---------------------|
| Undo arrow | `Reset changes` | Discards all unsaved edits in the editor. Reverts the form back to the last saved version. Does NOT affect the live site. | `Undo all unsaved changes` |
| Trash can | `Delete entry…` | **Permanently deletes this page from the site.** Commits the deletion to GitHub. Cannot be undone. | `Permanently delete this page` |
| Clipboard | `Copy entry` | Copies all page data (title, content, settings) to your clipboard so you can paste it into another page. | `Copy all page data to clipboard` |
| Paste | `Paste entry` | Pastes previously copied page data into this editor. Does not save automatically — you still need to click Save. | `Paste copied page data here` |
| Two pages | `Duplicate entry…` | Creates a brand new page pre-filled with this page's content. You'll choose a new URL slug before saving. | `Create a new page from this one` |

## Our Custom Header (KeystaticToolsHeader)

These currently have NO tooltips. Recommendations:

| Element | Label | Recommended Tooltip |
|---------|-------|---------------------|
| Content dropdown | `Content` | `Browse pages and settings` |
| Tools dropdown | `Tools` | `Media library, cache tools, and more` |
| Report Issue | `Report Issue` | `Report a bug or request a change` |
| View Live link | `View Live` | `See this page on the live site` |
| Theme toggle | `Dark` / `Light` | `Switch between light and dark mode` |
| Sparkry logo | *(icon)* | `Built by Sparkry AI` |

## Notes

- Keystatic's built-in tooltips come from Voussoir UI. We override them via a MutationObserver in `app/keystatic/layout.tsx`.
- Our header tooltips would be added directly in `components/keystatic/KeystaticToolsHeader.tsx` using `title` attributes or a custom tooltip component.
- The **Delete** tooltip is the most important to get right — a non-technical editor needs to understand this removes the page from the live site permanently.

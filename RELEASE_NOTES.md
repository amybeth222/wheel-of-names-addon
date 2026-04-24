# Release Notes

## Wheel of Names v1.0.2
Release date: 2026-04-24

Bug fix: center image now displays correctly in the pop-up window.

### Fixed
- Center image now properly displays in the pop-up wheel window
- Refactored image display logic for cleaner code and popup compatibility

## Wheel of Names v1.0.1
Release date: 2026-04-24

Maintenance update focused on Adobe Express panel behavior and layout reliability.

### Fixed
- Fixed horizontal scrolling issues in the Adobe Express add-on panel.
- Updated panel and wheel sizing to avoid overflow in narrow panel widths.
- Improved small-screen/panel responsiveness for more consistent interaction.

### Technical
- Updated package version to 1.0.1.
- Updated add-on manifest version to 1.0.1.

## Wheel of Names v1.0.0
Release date: 2026-04-24

Initial public release of the Wheel of Names Adobe Express add-on.

### New
- Added a Name Bucket for pasting and importing bulk participant names.
- Added wheel color palette presets: Vivid, Pastel, Neon, and Earth.
- Added support for a custom center graphic upload.
- Added spin animation with easing and confetti winner reveal.
- Added Adobe Express panel integration via manifest v2.

### Technical
- Built with @adobe/ccweb-add-on-scripts.
- Added build, start, clean, and package scripts for local development and packaging.

### Compatibility
- Adobe Express (API version 1).

### Known notes
- Local development runs over HTTPS on localhost (default: https://localhost:5241).
- You may need to trust the local certificate in your browser during development.

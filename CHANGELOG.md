# Changelog

All notable changes to **alike03's Subscription Info on Steam**.

## Version 3.0.2

- Added Firefox's required data collection disclosure (`websiteActivity`) for Mozilla's new policy; documents existing behavior

## Version 3.0.1

- Removed unnecessary permissions; now requests only `storage`
- Restricted host access to `sub.aligueler.com` only

## Version 3.0.0

- Complete rewrite from vanilla JavaScript to Svelte + Vite + TypeScript
- Rebuilt the on-page subscription info for Steam on a modern component base; the injected page elements stayed largely the same visually
- Reworked subscription badges: clearer upcoming / leaving / left states, per-platform labels and translated tooltips
- Added an in-page "Report inaccurate data" action so issues can be submitted directly from a game page
- Added game action buttons, including a "Buy on Instant Gaming" affiliate link (previously the affiliate link was served per-game from the backend)
- Rebuilt the entire popup from scratch as Svelte components (Header, Games, Options, Tabs, Support)
- Replaced the previously remote-generated popup markup with clean, dedicated APIs for faster, more predictable rendering
- Added a Carousel with tab navigation for browsing changes
- Moved the supporters list to the API (removed the bundled contributors file)
- Added multilingual support: German, English and Turkish so far
- Added caching for games, changes and supporters to cut redundant requests and reduce server load
- Launched a companion website (sub.aligueler.com) to search all games and see every platform in one place
- Added automated build, release and publishing workflows for Chrome, Firefox and Edge
- Removed the Sass dependency and simplified styling
- Fixed the Edge download link and various copy fixes

## Version 2.1.2

- Added support for SaleSectionContainer widgets
- Increased width to adapt to new Steam page widths
- Adjusted game card sizes and spacing
- Optimized popup layout for better visibility

## Version 2.1.1

- Fixed placement issue of Sub Info on the game details page

## Version 2.1.0

- Added support for the new Steam UI

## Version 2.0.2

- Fixed Wishlist page not displaying subscription information
- Added caching for pages with multiple games

## Version 2.0.1

- Migrated to Manifest V3
- Optimized for mobile
- Organized the codebase
- Added a popup variant for access outside Steam
- Moved requests to the background script to avoid CORS issues
- Added caching for menu requests

## Version 1.2.3.0

- Added a general subscription info observer for the entire Steam website (Sale, Categories, Genres, etc.)
- Optimized hover-effect text on upcoming changes

## Version 1.2.2.3

- Renamed (PC & Xbox) Game Pass according to the rebranding
- Added a direct Xbox App button to PC Game Pass on the game details page (next to the affiliate button)
- Improved appended element sanitation

## Version 1.2.2.0

- Fixed icon hovering on upcoming changes not showing the platform name
- Added platform external and affiliate links to game pages
- Fixed a bug where some platforms did not display if others were disabled

## Version 1.2.1.0

- Added a new icon type for tight spaces (e.g. search page)
- Improved icon placement to avoid wrong layouts
- Adapted to a Steam layout change
- Moved the Subscription Info menu button to a new location

## Version 1.2.0.0

- Replaced every innerHTML usage (security change)
- Improved load time for the Subscription Info menu
- Compressed every game poster to a proper size to save data
- Added an option to customize the age of subscription changes
- Added an option to change the toggle type for the subscriptions menu
- Added EA Play Pro subscriptions

## Version 1.1.1.0

- Added an options screen
- Added an option to disable subscriptions
- Fixed the search bar not having enough space in some languages

## Version 1.1.0.0

- Reworked the whole database to support additional subscription platforms
- Added Xbox Game Pass Console Edition subscriptions
- Added Ubisoft+ subscriptions
- Prepared EA Play subscriptions
- Repositioned every info badge to support multiple badges at once
- Renamed the plugin and created a new logo to reflect these enhancements

## Version 1.0.3.0

- Reformatted wording
- Added an Xbox Game Pass button granting access to information such as games that joined, left, will soon join or will soon leave, details about the addon, and further tabs to come

## Version 1.0.2.0

- Added status to the Start screen
- Added status to the Sale screen
- Added status to the Wishlist
- Added status to search results

## Version 1.0.1.0

- Added "coming soon" information where available
- Added "leaving soon" information where available
- Added info about games that left Xbox Game Pass
- Color-coded each bar differently for easier visual identification
- Added more date information (when a game enters or leaves the program) where available
- Added a report function for inaccurate data

# EPC App CHANGELOG

## v0.2.0
- Migrated the messy WordPress categories to the custom `Publications.ts` dictionary system, also allowing for article inclusion/exclusion in existing and custom issues
- Completed 'Explore' page design (TFP card featured articles left)
- Created 'TFP' and 'Fest Presses' flow
- Refined article viewer page, implemented article image gallery viewer and PDF viewer
- Better categorisation of searched articles by issue and date
- Made search bar font Lora
- Refinements to icons, rendered cards, and their positions
- Added placeholder image for articles lacking hero image
- Added grey layer behind blurred collapsed header, for proper blur on articles with transparent hero images
- UI/UX polish

## v0.3.0
- Built 'CF' section
- Implemented 'TFP/AEP/BEP/OEP/CF' search filtering and search history
- Built 'App Settings' page with clear cache button and OSS licenses
- Changes implemented from TODO:
    - Nav bar text labels position inconsistent if user using button navigations instead of gesture bar on Android
    - Allowing zooming in and implementing smoother animations for in-article image viewer gallery
- Enabled zooming in on images in image gallery and PDFs rendered in-app
- Fixed broken nav bar layout on tablets
- UI/UX polish

## v0.4.0
- Changes implemented from TODO:
    - Bug fixed: CF thumbnails break on tablets
- Made article image loading faster on all screens by loading required dimensions only from CDN
- Made article card loading faster on all screens by memoising the components
- Added auto-swiping animation on 'Fest Presses' card in 'Explore'
- UI/UX polish
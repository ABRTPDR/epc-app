# EPC App TODOs

## Bugs to Fix
- [  ] Nav bar text labels position inconsistent if user using button navigations instead of gesture bar on Android
- [  ] Spacings all over the place on different devices and platforms
- [  ] Handle broken image links in the image viewer gallery, glitches out currently
- [  ] In-article EPC map link logic needs to be improved (currently, clicking back navigates to home page)
- [  ] In-article image viewer gallery breaks for dead image URLs

## Structural & Architectural Changes
- [  ] Dynamic status bar colouring (dark/light) for article page
- [  ] Search filter: press, year, month published
- [  ] Use article ID or publication classification to provide 'next/previous article' options after article scrolled to end
- [  ] Allowing zooming in and implementing smoother animations for in-article image viewer gallery
- [  ] Smoother in-article PDF viewer that consistently allows zooming in and out
- [  ] Make 'expand' button on in-article PDF previews
- [  ] Make 'App Settings' page with clear cache, licenses, eventually with the `licenses.tsx` screen
- [  ] <u> Set up the MongoDB/FastAPI/etc backend for faster search queries </u>
- [  ] <u> Implement dynamic card ('from the archives') drawing from CF </u>
- [  ] Make 'Read full issue' button over digitised fest issue articles
- [  ] <u> Add games </u>

## Quality of Life & Polish
- [  ] Make article title move smoothly into collapsed header on scroll
- [  ] Ensure that voice-typing always an option for search input
- [  ] Clicking on carousel indicator dots takes you to that carousel card
- [  ] Change all '#FFFFFF' to slightly off-white to prevent eye strain, just as '#000000' was made '#191919'
- [  ] Add haptic feedback to some components

## Future Ideas
- [  ] Notification settings (New issues, campus events, review meet tweets, podcast episodes)
# EPC App TODOs

## Bugs to Fix
- [  ] Nav bar text labels shift upwards into icons if user using button navigations instead of gesture bar on Android
- [  ] Spacings all over the place on different devices and platforms
- [  ] Lora font not applied to search bar text, despite being coded, glitches out in Expo testing

## Structural & Architectural Changes
- [  ] Dynamic status bar colouring (dark\light) for article page
- [  ] Search filter: year, month published
- [  ] Rework search result card
- [  ] Bring date down from article header, and above text in article body
- [  ] Add share button to article screen
- [  ] <u> Migrate the messy WordPress categories to the `Publications.ts` dictionary system </u>
- [  ] Use publication classification to make a better designed eg. 'TFP/2019/Issue Two' tag in image header or above article text
- [  ] Use article ID or publication classification to provide 'next/previous article' options after article scrolled to end
- [  ] Rework home page carousel to optimise and make it reusable for other carousels
- [  ] Make 'App Settings' page with clear cache, licenses, eventually with the `licenses.tsx` screen
- [  ] <u> Add TFP, Fest Presses, CF screens and content </u>
- [  ] Make 'expand' button on item screen to open PDF for fest issues and CF archives in new page
- [  ] <u> Set up the FastAPI / MongoDB backend for faster search queries </u>
- [  ] <u> Implement dynamic card ('from the archives') drawing from CF </u>
- [  ] Make 'Read full issue' button over digitised fest issue articles
- [  ] <u> Add games </u>

## Quality of Life & Polish
- [  ] Increase spacing between card groups on 'More'
- [  ] Crop article image hero by 30px from top (done) and maybe 40px from bottom
- [  ] <u> Handle non-image articles </u>
- [  ] <u> Add grey layer behind blurred header image for articles with transparent hero images </u>
- [  ] Make article title move smoothly into collapsed header on scroll
- [  ] Check enabling voice-typing entry on searchbar
- [  ] <u> Reduce back button left margin </u>
- [  ] Implement PressableRipple on search bar that doesn't interfere with text entry (maybe make default stroke lighter and darken on hold)
- [  ] Clicking on carousel indicator dots takes you to that carousel card
- [  ] Change all '#FFFFFF' to slightly off-white to prevent eye strain, just as '#000000' was made '#191919'
- [  ] Add haptic feedback to some components

## Future Ideas
- [  ] Notification settings (New issues, campus events, review meet tweets, podcast episodes)
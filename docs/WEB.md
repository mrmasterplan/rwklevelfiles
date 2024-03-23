# Interaction with Web client

The web version of Robot wants Kitty is available at https://www.robotwantskitty.com/web/

External interaction with the internal storage of webpages is
an extreme security risk. However, that is exactly what
we want to do to extract levels from the game or to inject levels for play-testing and publishing.
That is why this guide involves some technical steps, and aldo why the old method, now deprecated,
was so complicated and broke in time.

## Requirements

1. Tiled Level Editor
2. rwk extension for Tiled, see [the Installation Guide](INSTALLATION.md)
3. any web browser

## Preparation

1. You need to enable Web Developer Tools in your browser.
   - [Firefox Instructions](https://firefox-source-docs.mozilla.org/devtools-user/) we will need the Web Console
   - [Chrome Instructions](https://developer.chrome.com/docs/devtools/open) we will need the Console
   - Other browsers have similar functionality.
2. We will need to paste code here, which is often dissllowed by default. Follow the instructions on screen when you encounter such errors.
3. If you have security concerns, please read and review the code that we paste. It is quite short.


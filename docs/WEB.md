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

## Usage

There are now two new file formats supported by the tiled extension:
- **.kitty.js** is an export-only file format used when injecting levels into the game.
- **.kitty.b64** is an import-only file format used to extract lecels from the web.

### .kitty.js
The idea here is that you have a level in tiled that you want to play-test on the 
web. How do you get the level into the web?

1. In tiled, export as **.kitty.js**
2. Open the new file in a text editor, and copy the entire file contents.
3. In the browser, go to https://robotwantskitty.com/web/
4. Open the "developer tools" and go to the javascript console.
5. paste the contents of the file into the console prompt.
6. Ignore all the warnings and press ENTER.
7. The page will reload and your "My Levels" now contains the new level!

### **.kitty.b64**
Say you want to pull another developer's level from the maker mall, to cheat, change 
or improve it. This is how to get it.

1. In the browser, go to https://robotwantskitty.com/web/ and start playing the level you want to extract.
2. Open the "developer tools" and go to the javascript console.
3. paste this scipt in the console:
```javascript
var dbRequest = indexedDB.open("/RAPTISOFT_SANDBOX", 21);

dbRequest.onsuccess = function(event) {
  var db = event.target.result;
  var transaction = db.transaction(["FILE_DATA"], "readonly");
  var objectStore = transaction.objectStore("FILE_DATA");
  var request = objectStore.get("/RAPTISOFT_SANDBOX/RWK/downloaded.kitty"); // Replace with your key

  request.onsuccess = function() {
    if (request.result) {
      console.log("Put this into a .kitty.b64:", uint8ArrayToBase64(request.result.
          contents));
    } else {
      console.log("No data found for the key");
    }
  };

  request.onerror = function(event) {
    console.error("Error retrieving Uint8Array data: ", event.target.error);
  };
};

dbRequest.onerror = function(event) {
  console.error("Error opening database: ", event.target.error);
};

function uint8ArrayToBase64(uint8Array) {
  var binaryString = new Uint8Array(uint8Array).reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  return btoa(binaryString);
}
```
4. Copy the resulting base64 string. Make sure you get all of it.
5. In an editor, create a text-file, paste the data, and save it as `MY FILE.kitty.b64` or similar.
6. Use tiled to open the file.
7. Start by saving as `.kitty`, then start editing.

Advanced details:
- notice the key "downloaded.kitty" in the script above. If you replace that with key that you find in a .kitty.js export file (see above), you can also extract levels from your "My Levels" area.

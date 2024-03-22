The injection and extraction libraries have long been broken.
I finally came up with a simple way to reciver this hacky functionality!

There are now two new file formats supported by the tiled extension:
- **.kitty.js** is an export-only file format
- **.kitty.b64** is an import-only file format.

### .kitty.js
The idea here is that you have a level in tiled that you want to play-test on the 
web. How do you get the level into the web.

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

1. In the browser, go to https://robotwantskitty.com/web/
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
5. In an editor, create a text-file, paste the data, and save it `MY FILE.kitty.b64`
6. Use tiled to open the file. 
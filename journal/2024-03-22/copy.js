var dbRequest = indexedDB.open("/RAPTISOFT_SANDBOX", 21);

dbRequest.onsuccess = function(event) {
  var db = event.target.result;
  var transaction = db.transaction(["FILE_DATA"], "readonly");
  var objectStore = transaction.objectStore("FILE_DATA");
  var request = objectStore.get("/RAPTISOFT_SANDBOX/RWK/downloaded.kitty"); // Replace with your key

  request.onsuccess = function() {
    if (request.result) {
      console.log("Base64 Encoded String:", uint8ArrayToBase64(request.result.contents));
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
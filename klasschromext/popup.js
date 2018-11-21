// event listener, gps sends msg to popup.js and this receives the msg (action)
chrome.runtime.onMessage.addListener(function(request, sender) {
  // check to make sure its the msg we want
    if (request.action == "getSource") {
      // innertext is the content it shows (request.source is the html)
      message.innerText = request.source;
    }
  });
  
  function onWindowLoad() {
  
    var message = document.querySelector('#message');
  
    chrome.tabs.executeScript(null, {
      // executing this in the tab we have open
      // injects this script into our tab basiccally at end of html
      file: "getPagesSource.js"
    }, function() {
      // If you try and inject into an extensions page or the webstore/NTP you'll get an error, error stuff
      if (chrome.runtime.lastError) {
        message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
      }
    });
  
  }
  // window.onload is what is executed when the popup is loaded, changing regular window onload function with ours
  window.onload = onWindowLoad;

  // look at dom type
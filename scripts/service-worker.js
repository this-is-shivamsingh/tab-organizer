let previousTabId = null;

const debounce = (func, delay) => {
  let timer;
  return function (params) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(params);
    }, delay);
  };
};

const saveToDB = (store) => {
  chrome.storage.local
    .set(store)
    .then(() => console.log("Value is set"))
    .catch((err) => console.log("Error while storing data: ", err));
};

const removeFromDB = (tabID) => {
  console.log(" tab ID remove ===> ", tabID);
  chrome.storage.local
    .remove(`${tabID}`)
    .then((res) => console.log("Tab ID", tabID, "is removed"))
    .catch((err) => console.log("Error while removing element from DB", err));
};

const captureCurrentTab = (tabID) => {
  console.log("Capturing Started....");
  chrome.tabs
    .captureVisibleTab({ format: "png" })
    .then((url) => {
      let obj = {};
      obj[tabID] = url;
      console.log(" TABID : ", obj);
      saveToDB(obj);
    })
    .catch((err) => console.log("Error => ", err));
  console.log("Capturing finished... ");
};

// If user visit a webpage >= 500ms then only images is caputured, it is done because page needs to get stable enough for
// chrome to capture the image.
const captureAndStoreImage = debounce(captureCurrentTab, 500);

// When user switch tabs
chrome.tabs.onActivated.addListener(function (activeInfo) {
  const newTabId = activeInfo.tabId;
  if (!newTabId) return;
  console.log(" ==> newTabID ", newTabId, previousTabId, activeInfo);
  // TODO: Currently we are takeing preview just as tab open, but later we wanted to preview
  // we user just switched to other tab.
  // because, may be user had changed the url of tab
  captureAndStoreImage(newTabId);
});

// Chrome listner when TAB is removed
chrome.tabs.onRemoved.addListener((tabID, removeTabInfo) => {
  // remove tab data from db
  console.log("removed TAB", removeTabInfo);
  removeFromDB(tabID);
});

// TODO
// Remove all the tabs that are not present in current list
// chrome.runtime.onMessage.addListener((req, send, sendResponse) => {
//   if (req.action === "removeTabs") {
//     // list of opened
//     const tabList = req.openedTabs;
//     console.log("tabs to remove ==> ", req?.openedTabs);
//   }
// });

// chrome.runtime.onMessage.addListener(async function (
//   request,
//   sender,
//   sendResponse
// ) {
//   if (request.action === "getTabPreviewImage") {
//     const _url = screenshotURLMap[request?.tabID];
//     fetchFromDB(request?.tabID, sendResponse)
//       .then((res) => {
//         console.log(" res <==> ", res);
//         sendResponse({ url: _url, res_url: res });
//       })
//       .catch((err) => console.log("Error: ", err));
//     sendResponse({ url: _url });
//   }
//   return true;
// });

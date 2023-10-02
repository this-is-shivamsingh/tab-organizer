let previousTabId = null;
let screenshotURLMap = {};

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

const getValue = (key) => {
  chrome.storage.local
    .get([key])
    .then((value) => value[key])
    .catch((err) => console.log("Error while getting data from D B", err));
};

const captureCurrentTab = (tabID) => {
  console.log("Capturing Started....")
  chrome.tabs
    .captureVisibleTab({ format: "png" })
    .then((url) => {
      console.log(" capture -> ", url);
      let obj = {};
      obj[tabID] = url;
      screenshotURLMap[tabID] = url || ''
      saveToDB(obj);
    })
    .catch((err) => console.log("Error => ", err));
  console.log(" ---> Capturing finished... ");
};

const captureAndStoreImage = debounce(captureCurrentTab, 500);
chrome.tabs.onActivated.addListener(function (activeInfo) {
  const newTabId = activeInfo.tabId;
  if (!newTabId) return;
  console.log(" ==> newTabID ", newTabId, previousTabId, activeInfo);
  // TODO: Currently we are takeing preview just as tab open, but later we wanted to preview
  // we user just switched to other tab.
  // because, may be user had changed the url of tab
  captureAndStoreImage(newTabId);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getTabPreviewImage") {
    console.log(
      " --> check 1",
      Object.keys(screenshotURLMap).length,
      request.tabID
    );
    // const value = getValue(request?.tabID);
    // console.log("db -> ", value);
    sendResponse({ url: screenshotURLMap[request?.tabID] });
  }
});

try {
  // Add all js imports here only and like this
  importScripts('../utils/logger.js');
  importScripts('../utils/caching.js')
} catch (e) {
  console.error(e);
}

let previousTabId = null;
const LOG_LEVEL=1
const CACH_LIMIT = 50
const logger = new Logger(LOG_LEVEL)
const lru = new LRU(CACH_LIMIT)

// Updating tabs Value in cache
chrome.tabs.query({}, (tabs) => {
  tabs.forEach((tab) => lru.write(tab.id, 'N/A'))
});

const debounce = (func, delay) => {
  let timer;
  return function (params) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(params);
    }, delay);
  };
};

const writeLRUCache = (key, value) => {
  const removedKey = lru.write(key, value)
  if (removedKey) {
    removeFromDB(removedKey);
  }
}

const readLRUCache = (key) => {
  const value = lru.read(key)
  if (!value) {
    // This key doesn't exist in cache. Add it
    writeLRUCache(key, 'N/A')
  }
}

const saveToDB = (tabId, store) => {
  chrome.storage.local
    .set(store)
    .then(() => writeLRUCache(tabId, 'N/A'))
    .catch((err) => logger.error(`Error while storing data: ${err}`));
};

const removeFromDB = (tabID) => {
  logger.debug(`tab ID remove: ${tabID}`);
  chrome.storage.local
    .remove(`${tabID}`)
    .then(() => {
      lru.removeKey(tabID)
      logger.debug(`Tab ID ${tabID}, is removed`)
    })
    .catch((err) => logger.error(`Error while removing element from DB: ${err}`));
};

const captureCurrentTab = (tabID) => {
  logger.debug("Capturing Started....");
  chrome.tabs
    .captureVisibleTab({ format: "png" })
    .then((url) => {
      let obj = {};
      obj[tabID] = url;
      saveToDB(tabID, obj);
    })
    .catch((err) => logger.error(`Error => ${err}`));
  logger.debug("Capturing finished... ");
  logger.debug(`Cach Length: ${lru.length()}`)
};

// If user visit a webpage >= 500ms then only images is caputured, it is done because page needs to get stable enough for
// chrome to capture the image.
const captureAndStoreImage = debounce(captureCurrentTab, 500);

const captureOnTabSwitch = (tabId) => {
  // This can be an async job, no need to wait for this job
  captureAndStoreImage(tabId)
  previousTabId = tabId
}

// When user switch tabs
chrome.tabs.onActivated.addListener(function (activeInfo) {
  const newTabId = activeInfo.tabId;
  if (!newTabId) return;
  logger.debug(`newTabID: ${newTabId}, prevoiusTabId: ${previousTabId}`);
  captureOnTabSwitch(newTabId)
});

// Detect URL changes within the same tab
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    logger.debug(`Tab URL is change with tabId: ${tabId}, to URL: ${changeInfo.url}`);
    captureOnTabSwitch(tabId)
  }
});

// Chrome listner when TAB is removed
chrome.tabs.onRemoved.addListener((tabID, removeTabInfo) => {
  // remove tab data from db
  logger.debug(`removed TAB, ${removeTabInfo}`);
  removeFromDB(tabID);
});

// The tabId will be the most recent read value, therefor there position
// in the linked list will be updated
// const updateCacheQueue = (tabId) => {
//   readLRUCache(tabId)  
// }

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   const { action, payload } = message
//   if (action === 'update-cache') {
//     logger.debug(`messsage ${JSON.stringify(message)}`)
//     const tabId = payload['tabId']
//     updateCacheQueue(tabId)
//     return;
//   }
// });

// TODO
// Remove all the tabs that are not present in current list
// chrome.runtime.onMessage.addListener((req, send, sendResponse) => {
//   if (req.action === "removeTabs") {
//     // list of opened
//     const tabList = req.openedTabs;
//     logger.debug("tabs to remove ==> ", req?.openedTabs);
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
//         logger.debug(" res <==> ", res);
//         sendResponse({ url: _url, res_url: res });
//       })
//       .catch((err) => logger.debug("Error: ", err));
//     sendResponse({ url: _url });
//   }
//   return true;
// });

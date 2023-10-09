import { limitURLWords } from "./helper.js";


document.addEventListener('DOMContentLoaded', function() {
  const clearLocalStorage = document.getElementById('clear-all-localstorage');
  clearLocalStorage.addEventListener('click', function() {
    // Send a message to the content script to start listening for clicks on element with ID 'abc'
    console.log(" clicked ... clear All ")
    chrome.storage.local.clear()
  });
});

chrome.tabs.query({}, (tabs) => {
  let tabList = document.getElementById("tabList-container");
  let tabByGroup = groupByURL(tabs);
  console.log("tab ", tabByGroup);
  Object.keys(tabByGroup)?.forEach((hostURL) => {
    let _openedTabList = tabByGroup[hostURL];
    _openedTabList?.forEach((tab) => {
      let div = document.createElement("div");
      div.className = "tab-subcontainer";
      div.id = tab.id;
      div.onclick = function () {
        updateActiveTab(tab.id);
      };
      div.onmouseover = function () {
        showTabPreview(tab.id);
        setTabTitle(tab.title)
      };

      // favicon container
      let favicon_contianer = document.createElement("div");
      favicon_contianer.setAttribute("class", "favicon-container");
      let image_tag = document.createElement("img");
      image_tag.setAttribute(
        "src",
        tab?.favIconUrl || "../assets/images/placeholder_600x400.png"
      );
      favicon_contianer.appendChild(image_tag);
      div.appendChild(favicon_contianer);

      // tab-infor
      let tabInfo = document.createElement("div");
      tabInfo.setAttribute("class", "tab-info");
      tabInfo.textContent = limitURLWords(tab.url);
      div.appendChild(tabInfo);

      tabList.appendChild(div);
    });
  });
});


function groupByURL(tabs) {
  let tabList = {};
  tabs.forEach((tab) => {
    let _baseURL = new URL(tab.url).hostname;
    if (!tabList[_baseURL] || tabList[_baseURL].length === 0) {
      tabList[_baseURL] = [];
    }

    tabList[_baseURL].push(tab);
  });
  return tabList;
}

function showTabPreview(tabID) {
  chrome.storage.local.get((result) => {
    // Warning...
    if(Object.keys(result).length >= 45) {
      window.alert("Too much space is used, Click <Clear All> to create some space...")
      return;
    }

    console.log(" GET TAB_ID: ", tabID, result, result[tabID])
    const _previewURL = result[tabID] || "";
    const ele = document.getElementById("preview-tab");
    const nodeList = ele.childNodes
    let imgNode;
    
    for(let i = 1; i < nodeList.length; i++){
      const node = nodeList[i]
      if(node?.tagName?.toLowerCase() === 'img') {
        imgNode = node;
      }
    }
    imgNode.setAttribute(
      "src",
      _previewURL || "../assets/images/placeholder_600x400.png"
    );
  });
}

function setTabTitle(title){
  document.getElementById('tab-title').innerHTML = title
}

function updateActiveTab(tabID) {
  chrome.tabs.update(tabID, { active: true });
}

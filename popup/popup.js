import { limitURLWords } from "./helper.js";

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
  chrome.runtime.sendMessage(
    { action: "getTabPreviewImage", tabID },
    (response) => {
      const _previewURL = response.url;
      const ele = document.getElementById("preview-tab");
      const imgNode = ele.childNodes[1];
      imgNode.setAttribute(
        "src",
        _previewURL || "../assets/images/placeholder_600x400.png"
      );
    }
  );
}

function updateActiveTab(tabID) {
  chrome.tabs.update(tabID, { active: true });
}

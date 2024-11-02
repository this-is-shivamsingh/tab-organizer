import { limitURLWords } from "./helper.js";

const clearAll = () => {
  chrome.storage.local.clear();
};

const selectedFaviconClassName = 'selected-favicon'

document.addEventListener("DOMContentLoaded", function () {
  const clearLocalStorage = document.getElementById("clear-all-localstorage");
  clearLocalStorage.addEventListener("click", function () {
    clearAll();
  });
});

chrome.tabs.query({}, (tabs) => {
  console.log("--> gojo")
  let tabList = document.getElementById("tabList-container");
  let tabByGroup = groupByURL(tabs);
  document.getElementById(
    "show-tab-opened"
  ).innerHTML = `Tab Opened: ${tabs.length}`;

  Object.keys(tabByGroup)?.forEach((hostURL) => {
    const uniqueFaviconImgList = {}
    let _openedTabList = tabByGroup[hostURL];
    _openedTabList?.forEach((tab) => {
      let div = document.createElement("div");
      div.className = "tab-subcontainer";
      div.id = tab.id;
      div.setAttribute('host', hostURL)
      div.onclick = function () {
        updateActiveTab(tab.id);
      };
      div.onmouseover = function () {
        showTabPreview(tab.id);
        setTabTitle(tab.title);
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
      uniqueFaviconImgList[hostURL] = image_tag.getAttribute('src')

      // // tab-info
      let tabInfo = document.createElement("div");
      tabInfo.setAttribute("class", "tab-info");
      tabInfo.textContent = limitURLWords(tab.url);
      div.appendChild(tabInfo);

      try {
        tabList.appendChild(div); 
      } catch (error) {
        console.log('[Errror] appending child tab failed with error:', error, `for host: ${hostURL}`)
      }
    });

    // Favicon filter
    Object.keys(uniqueFaviconImgList).forEach((hostURL) => {
      let faviconURL = uniqueFaviconImgList[hostURL]
      let span = document.createElement('span')
      let img = document.createElement('img')
      span.className = 'favicon-container'
      span.setAttribute('host', hostURL)
      img.setAttribute('src', faviconURL)

      span.onclick = function(){
        console.log(this)
        const alreadyActive = this.classList.contains(selectedFaviconClassName)
        
        if(alreadyActive) {
          this.classList.remove(selectedFaviconClassName)
        } else {
          this.classList.add(selectedFaviconClassName)
        }

        // Empty string is already selected, for toggling to work
        const _hostURL = alreadyActive ? '' : hostURL
        filterTabs(_hostURL, alreadyActive)
      }
      span.appendChild(img)
      document.getElementById('opend-tab-filter-container').appendChild(span)
    })
  });
});

function filterTabs(host, alreadyActive) {
  const childNodes = document.getElementById('tabList-container').childNodes
  const faviconfilterChildNodes = document.getElementById('opend-tab-filter-container').childNodes

  // Only show url how's host is selected using favicon
  for(let i = 0; i < childNodes.length; i++) {
    const element = childNodes[i]
    if (element.nodeName == '#text') continue
    const elementHost = element.getAttribute('host')
    element.style.display = ''
    if(!alreadyActive && elementHost && elementHost != host) {
      element.style.display = 'none'
    }
  }

  // Toggle selected favicon, selected-favicon adds specific style
  // to the currently selected host
  for(let i = 0; i < faviconfilterChildNodes.length; i++) {
    const element = faviconfilterChildNodes[i]
    
    if(element.nodeName == '#text') continue
    const elementHost = element.getAttribute('host')
    if(elementHost && elementHost != host && element.classList.contains(selectedFaviconClassName)) {
      element.classList.remove(selectedFaviconClassName)
    }
  }
}

chrome.storage.local.get((result) => {
  document.getElementById(
    "show-image-captured"
  ).innerHTML = `Total Image Captured: ${Object.keys(result).length}`;
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
    if (Object.keys(result).length >= 45) {
      window.alert(
        "Too much space is used, Click <Clear All> to create some space..."
      );
      clearAll();
      return;
    }

    // console.log("GET TAB_ID: ", tabID, result, result[tabID]);
    const _previewURL = result[tabID] || "";
    const ele = document.getElementById("preview-tab");
    const nodeList = ele.childNodes;
    let imgNode;

    for (let i = 1; i < nodeList.length; i++) {
      const node = nodeList[i];
      if (node?.tagName?.toLowerCase() === "img") {
        imgNode = node;
      }
    }
    imgNode.setAttribute(
      "src",
      _previewURL || "../assets/images/placeholder_600x400.png"
    );
  });
}

function setTabTitle(title) {
  document.getElementById("tab-title").innerHTML = title;
}

function updateActiveTab(tabID) {
  chrome.tabs.update(tabID, { active: true });
}

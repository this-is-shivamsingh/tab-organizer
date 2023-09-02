console.log(" popup.js")

chrome.tabs.query({}, tabs => {
  let tabList = document.getElementById('tabList-container');
  let tabByGroup = groupByURL(tabs)
  console.log('tab ', tabByGroup)
  Object.keys(tabByGroup)?.forEach(hostURL => {
    let _openedTabList = tabByGroup[hostURL]
    _openedTabList?.forEach(tab => {
      let div = document.createElement('div')
      div.textContent = tab.url
      div.className = 'tab-subcontainer'
      div.onclick = function(){
        updateActiveTab(tab.id)
      }
      tabList.appendChild(div)
    })
  })
});

function groupByURL(tabs){
  let tabList = {}
  tabs.forEach(tab => {
    let _baseURL = new URL(tab.url).hostname;
    if(!tabList[_baseURL] || tabList[_baseURL].length === 0){
      tabList[_baseURL] = []
    }

    tabList[_baseURL].push(tab)
  })
  return tabList
}

function updateActiveTab(tabID){
  console.log('tablist ==> ', tabID)
  chrome.tabs.update(tabID, { active: true })
}
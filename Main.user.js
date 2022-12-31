// ==UserScript==
// @name         Extra Outfits
// @version      2.0
// @description  Ability to bypass 50 outfits
// @author       Haydz6
// @match        https://www.roblox.com/my/avatar
// @icon         https://www.google.com/s2/favicons?sz=64&domain=roblox.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

let ROBLOSecurity = ""
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function WaitForClass(ClassName){
  let Element = null

  while (true) {
    Element = document.getElementsByClassName(ClassName)[0]
    if (Element != undefined) {
      break
    }

    await sleep(50)
  }

  return Element
}

async function WaitForId(Id){
  let Element = null

  while (true) {
    Element = document.getElementById(Id)
    if (Element != undefined) {
      break
    }

    await sleep(50)
  }

  return Element
}

const CostumesList = await WaitForId("costumes")

function IsCustomesListOpen(){
  return customElements.ClassName == "tab-pane ng-scope active" && document.getElementsByClassName("btn-secondary-xs btn-float-right ng-binding ng-scope")[0]
}

function CustomesOpened(){
  console.log("opened")
}

const observer = new MutationObserver(function(mutationList, observer){
  mutationList.forEach(function(mutation) {
    if (mutation.type === "attributes" && mutation.attributeName === "class") {
      if (IsCustomesListOpen()) CustomesOpened()
    }
  })
})

observer.observe(CostumesList, {attributes: true})
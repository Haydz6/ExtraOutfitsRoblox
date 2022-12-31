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
let IsCustomesOpen = false
let OutfitModalWindow

function IsCustomesListOpen(){
  return CostumesList.className == "tab-pane ng-scope active" && document.getElementsByClassName("btn-secondary-xs btn-float-right ng-binding ng-scope")[0]
}

function CreateOutfitModalWindow(){
  let OutfitDialog = document.createElement("div")
  OutfitDialog.className = "modal-dialog"

  let OutfitContent = document.createElement("div")
  OutfitContent.className = "modal-content"

  let OutfitContentScope = document.createElement("div")
  OutfitContentScope.className = "modal-content ng-scope"

  let OutfitHeader = document.createElement("div")
  OutfitHeader.className = "modal-header"

  let CloseButton = document.createElement("button")
  CloseButton.className = "close"
  CloseButton.type = "button"
  CloseButton.setAttribute("ng-click", "close()")

  let ButtonSpan = document.createElement("span")
  ButtonSpan.setAttribute("aria-hidden", true)

  let IconCloseSpan = document.createElement("span")
  IconCloseSpan.className = "icon-close"

  ButtonSpan.appendChild(IconCloseSpan)
  CloseButton.appendChild(ButtonSpan)

  let CloseButtonOddSpan = document.createElement("span")
  CloseButtonOddSpan.className = "sr-only ng-binding"
  CloseButtonOddSpan.innerText = "Close"

  CloseButton.appendChild(CloseButtonOddSpan)

  let HeadingText = document.createElement("h5")
  HeadingText.className = "ng-binding"
  HeadingText.innerText = "Create Extra Costume"

  OutfitHeader.appendChild(CloseButton)
  OutfitHeader.appendChild(HeadingText)

  let Form = document.createElement("form")
  Form.setAttribute("name", "nameForm")
  Form.className = "ng-pristine ng-invalid ng-invalid-required ng-valid-pattern"

  let FormBody = document.createElement("div")
  FormBody.className = "modal-body"

  let FormBodyDescription = document.createElement("p")
  FormBodyDescription.className = "font-caption-header text-description ng-binding"
  FormBodyDescription.innerText = "A costume will be created from your avatar's current appearance."

  let FormGroup = document.createElement("div")
  FormGroup.setAttribute("ng-class", "{'form-has-error': nameForm.outfitName.$invalid && !nameForm.outfitName.$pristine, 'form-has-feedback': nameForm.outfitName.$valid && !nameForm.outfitName.$pristine }")
  FormGroup.className = "form-group"

  let FormGroupInput = document.createElement("input")
  FormGroupInput.setAttribute("name", "outfitName")
  FormGroupInput.type = "text"
  FormGroupInput.setAttribute("focus-me", true)
  FormGroupInput.setAttribute("ng-model", "outfitName")
  FormGroupInput.setAttribute("ng-pattern", "/^[A-Z0-9 ]+$/i")
  FormGroupInput.className = "form-control input-field ng-pristine ng-isolate-scope ng-empty ng-invalid ng-invalid-required ng-valid-pattern ng-touched"
  FormGroupInput.setAttribute("required", "")
  FormGroupInput.setAttribute("placeholder", "Name your costume")
  FormGroupInput.setAttribute("autocomplete", "off")

  let InvisibleFormGroupInput = document.createElement("p")
  InvisibleFormGroupInput.setAttribute("ng-class", "{'invisible': !nameForm.outfitName.$invalid || nameForm.outfitName.$pristine }")
  InvisibleFormGroupInput.className = "form-control-label ng-binding invisible"
  InvisibleFormGroupInput.innerText = "Name can contain letters, numbers, and spaces."

  FormGroup.appendChild(FormGroupInput)
  FormGroup.appendChild(InvisibleFormGroupInput)

  FormBody.appendChild(FormBodyDescription)
  FormBody.appendChild(FormGroupInput)

  let ModalFooter = document.createElement("div")
  ModalFooter.className = "modal-footer"

  let CreateButton = document.createElement("button")
  CreateButton.setAttribute("ng-disabled", "nameForm.$invalid || nameForm.outfitName.$pristine")
  CreateButton.setAttribute("disabled", "disabled")
  CreateButton.id = "submit"
  CreateButton.className = "btn-secondary-md btn-min-width ng-binding"
  CreateButton.innerText = "Create"

  let CancelButton = document.createElement("button")
  //CancelButton.setAttribute("ng-click", "close()")
  CancelButton.className = "btn-control-md btn-min-width ng-binding"
  CancelButton.innerText = "Cancel"

  ModalFooter.appendChild(CreateButton)
  ModalFooter.appendChild(CancelButton)

  Form.appendChild(FormBody)
  Form.append(ModalFooter)

  OutfitContentScope.appendChild(OutfitHeader)
  OutfitContentScope.appendChild(Form)

  OutfitContent.appendChild(OutfitContentScope)
  OutfitDialog.appendChild(OutfitContent)

  OutfitModalWindow = document.createElement("div")
  OutfitModalWindow.setAttribute("uib-modal-window", "modal-window")
  OutfitModalWindow.setAttribute("role", "dialog")
  OutfitModalWindow.setAttribute("index", "0")
  OutfitModalWindow.setAttribute("tabindex", "-1")
  OutfitModalWindow.setAttribute("uib-modal-animation-class", "fade")
  OutfitModalWindow.setAttribute("modal-in-class", "in")
  OutfitModalWindow.setAttribute("animate", "animate")
  OutfitModalWindow.setAttribute("ng-style", "{'z-index': 1050 + $$topModalIndex*10, display: 'block'}")
  OutfitModalWindow.className = "modal ng-scope ng-isolate-scope in"
  OutfitModalWindow.style = "z-index: 1050; display: block;"

  OutfitModalWindow.appendChild(OutfitDialog)
  document.body.appendChild(OutfitModalWindow)

  return [OutfitModalWindow, CloseButton, CancelButton, CreateButton, FormGroupInput]
}

function RemoveOutfitModalWindow(){
  if (OutfitModalWindow){
    OutfitModalWindow.remove()
    OutfitModalWindow = null
  }
}

function CreateButton(){
  let Button = document.createElement("button")
  Button.setAttribute("ng-type", "button")
  Button.className = "btn-secondary-xs btn-float-right ng-binding ng-scope"
  Button.innerText = "Create Extra Outfit"
  Button.style = "margin-right:130px"

  CostumesList.getElementsByTagName("div")[0].appendChild(Button)

  return Button
}

async function RequestFunc(URL, Method, Headers, Body){
  let Response = await fetch(URL, {method: Method, headers: Headers, body: Body})

  return [Response.ok, await (Response).json()]
}

function IsInputValid(Input, Text){
  return Input.getAttribute("ng-pattern").test(Text)
}

async function GetCurrentOutfit(){
  return await RequestFunc("https://avatar.roblox.com/v1/avatar", "GET", {"Cookie": ".ROBLOSecurity" = ROBLOSecurity})
}

async function SaveCurrentOutfit(Name){
  [Success, CurrentOutfit] = GetCurrentOutfit()

  if (!Success) {
    return [Success, CurrentOutfit]
  }

  return await RequestFunc("https://haydz6.com/api/v4/outfits/save", "POST", {"Cookie": ".ROBLOSecurity" = ROBLOSecurity}, CurrentOutfit)
}

function CustomesOpened(){
  CreateButton().addEventListener("click", function(){
    [ModalWindow, CloseButton, CancelButton, CreateOutfitButton, Input] = CreateOutfitModalWindow()

    CloseButton.addEventListener("click", RemoveOutfitModalWindow)
    CancelButton.addEventListener("click", RemoveOutfitModalWindow)

    CreateOutfitButton.addEventListener("click", async function(){
      RemoveOutfitModalWindow()
      
      let Name = Input.value

      if (IsInputValid(Input, Name)) {
        SaveCurrentOutfit(Name)
      }
    })

    Input.addEventListener('input', function() {
      Input.setAttribute("disabled", IsInputValid(Input, Input.value) && "enabled" || "disabled")
    });
  })
}

const CustomesObserver = new MutationObserver(function(mutationList, observer){
  mutationList.forEach(function(mutation) {
    if ((mutation.type === "attributes" && mutation.attributeName === "class") || mutation.type === "childList") {
      let PreviousIsCustomesOpen = IsCustomesOpen
      IsCustomesOpen = IsCustomesListOpen()

      if (PreviousIsCustomesOpen === IsCustomesOpen) return

      if (IsCustomesOpen) CustomesOpened()
      else {
        RemoveOutfitModalWindow()
      }
    }
  })
})

CustomesObserver.observe(CostumesList, {attributes: true})
CustomesObserver.observe(CostumesList.getElementsByTagName("div")[0], {childList: true})

console.log("extra outfits ready")
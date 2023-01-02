let ROBLOSecurity = ""
let UserId = 0
let CSRFToken = ""

let FetchedAllExtraOutfits = false
let IsFetchingAllExtraOutfits = false
const sleep = ms => new Promise(r => setTimeout(r, ms));

const WebserverURL = "http://localhost:8192/api/v4/outfits/"

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

let CostumesList
let IsCustomesOpen = false

function IsCustomesListOpen(){
  return CostumesList.className == "tab-pane ng-scope active" && document.getElementsByClassName("btn-secondary-xs btn-float-right ng-binding ng-scope")[0]
}

async function RedrawCharacter(){
  RedrawButton = await WaitForClass("toggle-three-dee btn-control btn-control-small ng-binding")
  RedrawButton.click()
  RedrawButton.click()
}

async function RequestFunc(URL, Method, Headers, Body, CredientalsInclude){
  if (!Headers){
    Headers = {}
  }

  if (URL.search("roblox.com") > -1) {
    Headers["x-csrf-token"] = CSRFToken
  }

  try {
    let Response = await fetch(URL, {method: Method, headers: Headers, body: Body, credentials: CredientalsInclude && "include" || "omit"})
    const ResBody = await (Response).json()

    let NewCSRFToken = Response.headers.get("x-csrf-token")

    if (NewCSRFToken){
      CSRFToken = NewCSRFToken
    }

    if (!Response.ok && ResBody?.message == "Token Validation Failed"){
      console.log("sending with csrf token")
      return await RequestFunc(URL, Method, Headers, Body, CredientalsInclude)
    }

    return [Response.ok, ResBody]
  } catch (err) {
    console.log(err)
    return [false, {Success: false, Result: "???"}]
  }
}

function IsInputValid(Input, Text){
  return new RegExp(Input.getAttribute("ng-pattern"), "i").test(Text)
}

async function GetCurrentOutfit(){
  return await RequestFunc("https://avatar.roblox.com/v1/avatar", "GET", undefined, undefined, true)
}

async function GetAvatarImage(){
  const [Success, Images] = await RequestFunc(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${UserId}&size=150x150&format=Png&isCircular=false`, "GET")

  if (!Success){
    return [Success, Images]
  }

  return [true, Images.data[0].imageUrl]
}

async function SaveCurrentOutfit(Name){
  const [SuccessOutfit, CurrentOutfit] = await GetCurrentOutfit()

  if (!SuccessOutfit) {
    return [SuccessOutfit, CurrentOutfit]
  }

  const [SuccessImage, ImageUrl] = await GetAvatarImage()

  return await RequestFunc(WebserverURL+"save", "POST", {"ROBLOSECURITY": ROBLOSecurity, "Content-Type": "application/json"}, JSON.stringify({Name: Name, Outfit: CurrentOutfit, Image: SuccessImage && ImageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"}))
}

async function GetExtraOutfits(){
  const [Success, Outfits] = await RequestFunc(WebserverURL, "GET", {"ROBLOSECURITY": ROBLOSecurity})

  if (!Success) {
    return [false, Outfits]
  }

  return [true, Outfits]
}

async function WearExtraOutfit(Id){
  [Success, OutfitInfo] = await RequestFunc(WebserverURL+"wear/"+Id, "GET", {"ROBLOSECURITY": ROBLOSecurity})

  if (!Success) {
    return [false, OutfitInfo]
  }

  AllPromises = []

  AllPromises.push(RequestFunc("https://avatar.roblox.com/v1/avatar/set-body-colors", "POST", {"Content-Type": "application/json"}, JSON.stringify(OutfitInfo.bodyColors), true))
  AllPromises.push(RequestFunc("https://avatar.roblox.com/v1/avatar/set-player-avatar-type", "POST", {"Content-Type": "application/json"}, JSON.stringify({playerAvatarType: OutfitInfo.rigType}), true))
  AllPromises.push(RequestFunc("https://avatar.roblox.com/v1/avatar/set-scales", "POST", {"Content-Type": "application/json"}, JSON.stringify({playerAvatarType: OutfitInfo.scales}), true))
  AllPromises.push(RequestFunc("https://avatar.roblox.com/v1/avatar/set-wearing-assets", "POST", {"Content-Type": "application/json"}, JSON.stringify({assetIds: OutfitInfo.assets}), true))

  for (let i = 1; i <= 8; i++){
    EmoteId = OutfitInfo.emotes[i]

    if (!EmoteId) {
      AllPromises.push(RequestFunc("https://avatar.roblox.com/v1/emotes/"+i, "DELETE", {"Content-Type": "application/json"}, JSON.stringify({}), true))
    } else {
      AllPromises.push(RequestFunc(`https://avatar.roblox.com/v1/emotes/${EmoteId}/${i}`, "POST", {"Content-Type": "application/json"}, JSON.stringify({}), true))
    }
  }

  await Promise.all(AllPromises)

  RedrawCharacter()
}

function CreateExtraOutfitButton(ExtraOutfit){
  if (ExtraOutfit.Id == 0) {
    return
  }

  const [OutfitElement, UpdateButton, RenameButton, DeleteButton, CancelButton, ItemCardThumbContainer, SettingsButton, SettingsList, Thumbnail2DImage, ItemCardNameLinkTitle, IconSettingsButton] = CreateOutfitElement(ExtraOutfit.Name, ExtraOutfit.Image)

  let SettingsOpened = false

  function UpdateSettingsListVisibility(){
    SettingsList.className = `item-card-menu ng-scope ng-isolate-scope${SettingsOpened && " active" || ""}`
  }

  ItemCardThumbContainer.addEventListener("click", function(){
    WearExtraOutfit(ExtraOutfit.Id)
  })

  RenameButton.addEventListener("click", function(){
    const [ModalWindow, Backdrop, CloseButton, CancelButton, RenameButton, Input] = CreateOutfitModalWindow("Rename Costume", "Choose a new name for your costume.", "Name your costume", "Rename", "Cancel")

    CloseButton.addEventListener("click", function(){
      ModalWindow.remove()
      Backdrop.remove()
    })

    CancelButton.addEventListener("click", function(){
      ModalWindow.remove()
      Backdrop.remove()
    })

    RenameButton.addEventListener("click", async function(){
      SettingsOpened = false
      UpdateSettingsListVisibility()

      let Name = Input.value

      if (IsInputValid(Input, Name)) {
        ModalWindow.remove()
        Backdrop.remove()
        const [Success, Result] = await RequestFunc(WebserverURL+"rename", "PATCH", {"ROBLOSECURITY": ROBLOSecurity}, JSON.stringify({Id: ExtraOutfit.Id, Name: Name}))

        if (Success){
          ItemCardNameLinkTitle.innerText = Name
          ItemCardThumbContainer.setAttribute("data-item-name", OutfitName)
          IconSettingsButton.setAttribute("data-item-name", OutfitName)
        }
      }
    })

    Input.addEventListener('input', function() {
      let Bool = IsInputValid(Input, Input.value) && "enabled" || "disabled"
      let Status = Bool && "enabled" || "disabled"
      let OppositeStatus = !Bool && "enabled" || "disabled"

      RenameButton.setAttribute(Status, Status)
      RenameButton.removeAttribute(OppositeStatus)
    })
  })

  DeleteButton.addEventListener("click", async function(){
    SettingsOpened = false
    UpdateSettingsListVisibility()

    const [ModalWindow, Backdrop, CloseButton, CancelButton, DeleteButton, Input] = CreateOutfitModalWindow("Delete Costume", "Are you sure you want to delete this costume?", undefined, "Delete", "Cancel")

    DeleteButton.addEventListener("click", async function(){
      const [Success, Result] = await RequestFunc(WebserverURL+"delete/"+ExtraOutfit.Id, "DELETE", {"ROBLOSECURITY": ROBLOSecurity})

      if (Success){
        OutfitElement.remove()
      }
    })

    CancelButton.addEventListener("click", function(){
      ModalWindow.remove()
      Backdrop.remove()
    })

    CloseButton.addEventListener("click", function(){
      ModalWindow.remove()
      Backdrop.remove()
    })

    DeleteButton.setAttribute("enabled", "enabled")
    DeleteButton.removeAttribute("disabled")
  })

  UpdateButton.addEventListener("click", async function(){
    SettingsOpened = false
    UpdateSettingsListVisibility()

    const [ModalWindow, Backdrop, CloseButton, CancelButton, UpdateButton, Input] = CreateOutfitModalWindow("Update Costume", "Do you want to update this costume? This will overwrite the costume with your avatar's current appearance.", undefined, "Update", "Cancel")

    UpdateButton.addEventListener("click", async function(){
      ModalWindow.remove()
      Backdrop.remove()

      const [SuccessOutfit, CurrentOutfit] = await GetCurrentOutfit()

      if (!SuccessOutfit) {
        return [SuccessOutfit, CurrentOutfit]
      }
  
      const [SuccessImage, ImageUrl] = await GetAvatarImage()
  
      const [SaveSuccess, SaveResult] = await RequestFunc(WebserverURL+"update", "PUT", {"ROBLOSECURITY": ROBLOSecurity, "Content-Type": "application/json"}, JSON.stringify({Id: ExtraOutfit.Id, Name: ExtraOutfit.Name, Outfit: CurrentOutfit, Image: SuccessImage && ImageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"}))
    
      if (SaveSuccess){
        Thumbnail2DImage.setAttribute("ng-src", SuccessImage && ImageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png")
        Thumbnail2DImage.src = SuccessImage && ImageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
      }
    })

    CancelButton.addEventListener("click", function(){
      ModalWindow.remove()
      Backdrop.remove()
    })

    CloseButton.addEventListener("click", function(){
      ModalWindow.remove()
      Backdrop.remove()
    })

    UpdateButton.setAttribute("enabled", "enabled")
    UpdateButton.removeAttribute("disabled")
  })

  SettingsButton.addEventListener("click", function(){
    SettingsOpened = !SettingsOpened
    UpdateSettingsListVisibility()
  })

  CancelButton.addEventListener("click", function(){
    SettingsOpened = false
    UpdateSettingsListVisibility()
  })

  ItemCardsList.insertBefore(OutfitElement, ItemCardsList.firstChild)
}

async function CustomesOpened(){
  CreateButton().addEventListener("click", function(){
    [ModalWindow, Backdrop, CloseButton, CancelButton, CreateOutfitButton, Input] = CreateOutfitModalWindow("Create Extra Costume", "A costume will be created from your avatar's current appearance.", "Name your costume", "Create", "Cancel")

    function RemoveOutfitModalWindow(){
      ModalWindow.remove()
      Backdrop.remove()
    }

    CloseButton.addEventListener("click", RemoveOutfitModalWindow)
    CancelButton.addEventListener("click", RemoveOutfitModalWindow)

    CreateOutfitButton.addEventListener("click", async function(){
      RemoveOutfitModalWindow()
      
      let Name = Input.value

      if (IsInputValid(Input, Name)) {
        const [Success, Result] = await SaveCurrentOutfit(Name)

        if (Success){
          CreateExtraOutfitButton(Result)
        }
      }
    })

    Input.addEventListener('input', function() {
      let Bool = IsInputValid(Input, Input.value) && "enabled" || "disabled"
      let Status = Bool && "enabled" || "disabled"
      let OppositeStatus = !Bool && "enabled" || "disabled"

      CreateOutfitButton.setAttribute(Status, Status)
      CreateOutfitButton.removeAttribute(OppositeStatus)
    })
  })

  console.log("waiting for item-cards")
  ItemCardsList = CostumesList.getElementsByTagName("div")[1].getElementsByTagName("div")[0].getElementsByTagName("ul")[0]
  console.log("got")

  const [Success, ExtraOutfits] = await GetExtraOutfits()

  if (!Success){
    return
  }

  for (let i = 0; i < ExtraOutfits.length; i++){
    CreateExtraOutfitButton(ExtraOutfits[i])
  }
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

function GetRobloCookie(){
  chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.type === "roblosecurity"){
      ROBLOSecurity = request.value
    }
  })
}

async function RunMain(){
  CostumesList = await WaitForId("costumes")

  CustomesObserver.observe(CostumesList, {attributes: true})
  CustomesObserver.observe(CostumesList.getElementsByTagName("div")[0], {childList: true})

  GetRobloCookie()

  while (!document.head){
    await sleep(100)
  }

  UserId = document.head.querySelector("[name~=user-data][data-userid]").getAttribute("data-userid")

  console.log("extra outfits ready")
}

RunMain()
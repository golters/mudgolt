import React, { useEffect, useRef, useCallback, useState } from "react"
import "./Toolbar.css"
import { sendEvent } from "../network"
import {
  LOOK_EVENT,
  DOOR_UPDATE_EVENT,
  GO_EVENT,
  MAKE_POST_EVENT,
  TOOLBAR_UPDATE_EVENT,
  EVENT_EVENT,
  SERVER_LOG_EVENT,
  INVENTORY_UPDATE_EVENT,
  USE_ITEM_EVENT,
  DROP_ITEM_EVENT,
  SMELT_ITEM_EVENT,
  LOOK_AT_EVENT,
  DRAW_ICON_EVENT,
  INSIGHT_EVENT,
  ROOM_DESCRIBE_EVENT,
  ENCHANT_ITEM_EVENT,
  MAKE_EVENT,
  NPC_UPDATE_EVENT,
  DRAW_AVATAR_EVENT,
  SEND_EVENT,
  TAG_ITEM_EVENT,
  INBOX_UPDATE_EVENT,
  REPLY_EVENT,
  WHISPER_EVENT,
  CORRESPONDENTS_UPDATE_EVENT,
  MORE_INBOX_EVENT,
  WHISPER_POPUP_EVENT,
} from "../../../events"
import {
  store,
} from "../store"
import {
  Markdown, 
} from "./Markdown"
import {
  Door, Item, Npc, Chat,
} from "../../../@types"
import {
  networkEmitter, 
} from "../network/events"
import { ICON_WIDTH, ICON_HEIGHT, MESSAGE_MAX_LENGTH, AVATAR_HEIGHT, AVATAR_WIDTH, itemRarity,colors } from '../../../constants'
import{
  setBrush,
  setBrushType,
  setBrushBackCol,
  setBrushPrimeCol,
}from "./Header"
import { commandModules } from "../../src/commands"
import { colorUtil } from "../../src/utils"
import { Volume } from "src/commands/volume"
import {
  commandEmitter, 
} from "../commands/emitter"
import { pushToLog } from "./Terminal"
import { type } from "os"
import { Make } from "src/commands/make"
import { newCraftWindow, newMesageWindow, newReplyWindow, redrawAvatars } from "./windows"
import { news } from "./news"
import { Color } from "src/commands/color"
import { themes } from "../../src/utils/themes"

const rooms: (string)[] = []
let brushSymbols: (string)[] = ["█","▓","▒","░"]
let helpCommands: (string)[] = []
let command: string

const maxinvpageicon = 7
const maxinvpagename = 30

function look() {
  sendEvent(LOOK_EVENT, store.player?.roomId)
}
function go(door: string) {
  sendEvent(GO_EVENT, door)
}
function makeIcon(item: Item){
  sendEvent(DRAW_ICON_EVENT, [0,0,"x",item])
}

function drawIcon(item: Item, x: number, y: number, brush: string){
  sendEvent(DRAW_ICON_EVENT, [x,y,brush, item])
}


function useItem(item: Item) {
  sendEvent(USE_ITEM_EVENT, item.name)
}
function dropItem(item: Item){
  sendEvent(DROP_ITEM_EVENT, item.name)
}
function lookItem(item: Item){
  sendEvent(LOOK_AT_EVENT, item.name)
}
function smeltItem(item: Item){
  sendEvent(SMELT_ITEM_EVENT, item.name)
}
function insightItem(item: Item){
  sendEvent(INSIGHT_EVENT, item.name)
}

function getmoreinbox(page: number, contact:string | null){
  sendEvent(MORE_INBOX_EVENT, [page, contact])
}

function changeContact(contact: string){
  if(contact === ""){
  getmoreinbox(0, null)
  }else{
  getmoreinbox(0, contact)
  }
}

//equipitem


const symbols = [
  {id: "blocks", chars:["█","▓","▒","░"]},
  {id: "plants", chars:["🏶","🏵","✿","❀","❁","❃","❋","✾","❦","❧","☙","☘","♣","♧","♠","♤","⚕","⚘","⚚","⚵","↑","↟","⯭","↡","෴"]},
  {id: "bricks", chars:["☲","☵","𒐪","𝌐","𝌤"]},
  {id: "characters", chars:["⛇","ඞ","𓃰","𓀠","𓀡","𓀁","𓅃"]},
  {id: "props", chars:["⚱","⛑","⛏","⛸","⛓","⛾","⛿","⛱","⛷","⚔","♰","♕","♔","♚","♛","☠","☎","☏",
  "✀","✂","✉","✎","✏","✐","✞","◷"]},
  {id: "vehicles", chars:["⛟","⛴","✈"]},
  {id: "water", chars:["⛆","﹏","〰","﹌","𐩘","෴","𓆛","𓆜","𓆝","𓆞","𓆟"]},
  {id: "sky", chars:["☁","☀","★","☆","⛈","✦","✧","𓅛"]},
  {id: "bear", chars:["ﻌ","Ҁ","ҁ","⟟","⧪","ᴥ","ʔ","ʕ","ꮂ","㉨","ｴ","•","ᶘ","ᶅ","ܫ"]},
  {id: "music", chars:["👁","✈","✉","✐","-"]},
]

const commands = [
  {id: "chat", commands:["whisper","shout","reply","inbox","pay","roll","online"]},
  {id: "movement", commands:["go","teleport","look",]},
  {id: "room", commands:["look","makeroom","describe","makedoor","deletedoor"]},
  {id: "item", commands:["look","makeitem","describe","takeitem","use","enchant","send"]},
  {id: "user", commands:["username","describe","inventory","color"]},
  {id: "game", commands:["invite","game"]},
]

let Input: ReturnType<typeof React.memo> | null = null

let event: string = ""


export let brush = localStorage.brush || "+"
export let brushPrimeCol = localStorage.brushPrimeCol || ""
export let brushBackCol = localStorage.brushBackCol || ""

export const Toolbar: React.FC = () => { 
  const [volume, setVolume] = useState(localStorage.volume*10)
  const [doors, setDoors] = useState<Door[] | null>(null)
  const [inventory, setInv] = useState<Item[] | null>(null)
  const [inbox, setInbox] = useState<Chat[] | null>(null)
  const [correspondents, setCorrespondents] = useState<string[] | null>(null)
  let [roomMap, setRoomMap] = useState<(string)[]>(rooms)
  let [event, setEvent] = useState<(string)>()
  const [muted, setMuted] = useState(!!localStorage.getItem("muted") || false)
  const [eye, setEye] = useState(false)
  const [plane, setPlane] = useState(false)
  const [letter, setLetter] = useState(false)
  const [pen, setPen] = useState(false)
  const [sound, setSound] = useState(false)
  const [secret, setSecret] = useState(false)
  const [form, setForm] = useState(false)
  const [table, setTable] = useState(false)
  const [help, setHelp] = useState(false)
  const [settings, setSettings] = useState(false)
  const [textLength, setTextLength] = useState(0)
  const input = useRef<HTMLDivElement>(null)
  const [lefttab, setlefttab] = useState(!!localStorage.getItem("lefttab") || "doors")
  const [righttab, setrighttab] = useState(!!localStorage.getItem("righttab") || "inv")
  const [mini, setMini] = useState(!!localStorage.getItem("sidemini") || false)
  const [rightmini, setRightMini] = useState(!!localStorage.getItem("rightmini") || false)
  const [icons, setIcons] = useState(!!localStorage.getItem("icons") || false)
  const [itemTags, setItemTags] = useState(!!localStorage.getItem("itemtag") || "none")
  const [invpage, setinvpage] = useState(0)
  const [inboxpage, setinboxpage] = useState(0)
  const [contact, setcontact] = useState("")
  const [northdoor, setnorthdoor] = useState(false)
  const [southdoor, setsouthdoor] = useState(false)
  const [eastdoor, seteastdoor] = useState(false)
  const [westdoor, setwestdoor] = useState(false)
  const [npcs, setNpcs] = useState<Npc[] | null>(null)
  
  networkEmitter.on(NPC_UPDATE_EVENT, (npcs: Npc[]) => {
    setNpcs(npcs)
    redrawAvatars(npcs)
  })
  
  if (Math.random() * 100000 < 1) {
    setEye(true)
  }
  if (Math.random() * 100000 < 1) {
    setPlane(true)
  }
  if (Math.random() * 100000 < 1) {
    setLetter(true)
  }
  if (Math.random() * 100000 < 1) {
    setPen(true)
  }
  if (Math.random() * 100000 < 1) {
    setSound(true)
  }

  localStorage.volume = volume/10
  localStorage.event = ""
  if(!localStorage.getItem("lefttab") || lefttab === true){
    localStorage.setItem("lefttab","doors")
    setlefttab("doors")
  }

  if(!localStorage.getItem("righttab") || righttab === true){
    localStorage.setItem("righttab","inv")
    setrighttab("inv")
  }

  function post() {
    sendEvent(MAKE_POST_EVENT, input.current?.innerText)
    if (!input.current || input.current.innerText.trim() === "") return
    input.current.innerText = ""
    setTextLength(0)
    toggleForm()
  }
  roomMap = []  
  useEffect(() => {
  networkEmitter.on(DOOR_UPDATE_EVENT, (doors: Door[]) => {
    setnorthdoor(false)
    setsouthdoor(false)
    seteastdoor(false)
    setwestdoor(false)
    for(let d = 0; d < doors.length; d++){
      switch (doors[d].name){
        case "north":
          setnorthdoor(true)
          doors.splice(d,1)
        break;
        case "south":
          setsouthdoor(true)
          doors.splice(d,1)
        break;
        case "east":
          seteastdoor(true)
         doors.splice(d,1)
        break;
        case "west":
          setwestdoor(true)
          doors.splice(d,1)        
        break;
      }
    }
    doors = doors.sort((a,b) => a.name.localeCompare(b.name))
    setDoors(doors)
  })
  networkEmitter.on(INVENTORY_UPDATE_EVENT, (inventory: Item[]) => {
    setInv(inventory)
  })
  networkEmitter.on(INBOX_UPDATE_EVENT, (inbox: Chat[]) => {
    setInbox(inbox)
  })
  networkEmitter.on(CORRESPONDENTS_UPDATE_EVENT, (users: string[]) => {
    setCorrespondents(users)
  })
  networkEmitter.on(WHISPER_POPUP_EVENT, (args: string[]) => {
    newMesageWindow(args[1],args[0],npcs)
  })

  if(!mini){
    setMini(true);
  }
  if(!rightmini){
    setRightMini(true);
  }
  

  Input = React.memo(() => (
    <div
      contentEditable="true"
      spellCheck="false"
      ref={input}
  
      onInput={() => {
        //scrollToBottom()

        setTimeout(() => {
          let value = input.current?.innerText || ""

          if (value.charCodeAt(value.length - 1) === 10) {
            value = value.slice(0, value.length - 1)
          }

          setTextLength(value.length)
          if(value.length > 666){
            setSecret(true)
          }else{
            setSecret(false)
          }
        })
      }}
  
      // disable rich pastes
      onPaste={event => {
        event.preventDefault()

        const text = event.clipboardData.getData("text/plain")

        document.execCommand("insertHTML", false, text)
      }}
  
      onKeyDown={event => {
        switch (event.key) {
          case "Enter": {
            if (!event.shiftKey) {
              event.preventDefault()
    
              //submit()
            }
    
            break
          }
        }
      }}
    />
  ))
  

}, [])

setRightBar()

const toggleIcons = useCallback(() => {
setIcons(!icons)

if (icons) {
  localStorage.removeItem("icons")
} else {
  localStorage.setItem("icons", '1')
}
}, [icons])


const toggleMini = useCallback(() => {
  setMini(!mini)
  
  if (mini) {
    localStorage.removeItem("sidemini")
  } else {
    localStorage.setItem("sidemini", '1')
  }
}, [mini])

  const toggleRightMini = useCallback(() => {
    setRightMini(!rightmini)
    
    if (rightmini) {
      localStorage.removeItem("rightmini")
    } else {
      localStorage.setItem("rightmini", '1')
    }
  }, [rightmini])

const toggleMute = useCallback(() => {
  setMuted(!muted)

  if (muted) {
    localStorage.removeItem("muted")
  } else {
    localStorage.setItem("muted", '1')
  }
}, [muted])

const toggleForm = useCallback(() => {
  setForm(!form)

  if (form) {
  } else {
    setTable(false)
    setHelp(false)
  }
}, [form])

const toggleTable = useCallback(() => {
  setTable(!table)

  if (table) {
  } else {
    setForm(false)
    setHelp(false)
  }
}, [table])

const toggleHelp = useCallback(() => {
  setHelp(!help)

  if (help) {
  } else {
    setForm(false)
    setTable(false)
  }
}, [help])

const toggleSettings = useCallback(() => {
  setSettings(!settings)

  if (settings) {
  } else {
    setForm(false)
    setTable(false)
    setHelp(false)
  }
}, [settings])


function setPalette(palette: string) {
  brushSymbols = []
  const p = symbols.find(Element => Element.id === palette)?.chars
  if(p){
  brushSymbols = p
  }
  sendEvent(TOOLBAR_UPDATE_EVENT, store.player?.roomId)
}

function setHelpType(type: string) {
  helpCommands = []
  const h = commands.find(Element => Element.id === type)?.commands
  if(h){
    helpCommands = h
  }
  sendEvent(TOOLBAR_UPDATE_EVENT, store.player?.roomId)
}

function setCommand(type: string) {
  command = ""
  const c = commandModules.find(Element => Element.aliases?.includes(type) || Element.command === type)
  if(c?.bio){
    command = "/"+ c.command + "\n"
    command = command + c.bio + "\n"
    if(c.aliases){
    command = command + "you can also use: " + c.aliases
    }
  }
  sendEvent(TOOLBAR_UPDATE_EVENT, store.player?.roomId)
}

function changeleftTab(tab: string){
  setlefttab(tab)
  setMini(true)
  localStorage.removeItem("sidemini")
  localStorage.setItem("lefttab",tab)
}

function changerightTab(tab: string){
  setrighttab(tab)
  setRightMini(true)
  localStorage.removeItem("rightmini")
  localStorage.setItem("righttab",tab)
}

function changeTag(tag: string){
  setItemTags(tag)
  localStorage.setItem("itemtag",tag)
}
function moreinboxcontact(contact: string){
  setcontact(contact)
  changeContact(contact)
  setinboxpage(0)
}
function moreinbox(){
  if(contact === ""){
  getmoreinbox(inboxpage + 1, null)
  }else{    
  getmoreinbox(inboxpage + 1, contact)
  }
  setinboxpage(inboxpage + 1)
}

if(doors){
  doors.forEach(element => {
    roomMap.push(element.name)
  });
}

if(righttab === "inv" && inventory){
  drawicons(inventory)
}

if(righttab === "inbox" && inbox){
  drawInbox()
}
if(righttab === "make"){
  drawMake()
}
if(righttab === "event"){
  drawEvent()
}
if(righttab === "news"){
  drawNews()
}

function setRightBar(){
  let bar = document.getElementById('rightbar')
  if(bar)
  dragRightBar(bar)
}

function dragRightBar(bar: HTMLElement){
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (bar) {
    /* if present, the header is where you move the DIV from:*/
    bar.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e: MouseEvent) {
    if(rightmini && e.target === bar){
    e = e || window.event;
    e.preventDefault();
    bar.style.cursor = "grabbing"
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
    bar.style.transition = "0s"
    }    
  }

  function elementDrag(e: MouseEvent) {
    e = e || window.event;
    e.preventDefault();
    bar.style.cursor = "grabbing"
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos3 = e.clientX;
    // set the element's new position:
    if(bar.offsetWidth + pos1 > 150)
    bar.style.width = (bar.offsetWidth + pos1) + "px";
    if(inventory){
      drawicons(inventory)
    }
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
    let pos = Math.ceil((bar.offsetWidth - pos1 - 5) / 150) * 150
    if(pos < 150)
    pos = 150
    const right = pos
    bar.style.width = right + "px"
    bar.style.cursor = "auto"
    bar.style.transition = "1s"
  }

}

function getItemPages(inv: number){
  let p = document.getElementById('pages')
  if(p){
    p.innerHTML = ""
  }else{
    return
  }

  //tweak numbers is dodgy
  let invpagelimit = maxinvpageicon * (p.offsetWidth /150)
  if(!icons){
    invpagelimit = maxinvpagename
  }

  if(inv > invpagelimit){
    if(invpage - 10 > 0){
      const nextpage = document.createElement('span')
      nextpage.appendChild(document.createTextNode("<<10 "))
      nextpage.onclick = function () {setinvpage(invpage - 10)}
      p.appendChild(nextpage)
    }
    if(invpage > 0){
      const nextpage = document.createElement('span')
      nextpage.appendChild(document.createTextNode("<1 "))
      nextpage.onclick = function () {setinvpage(invpage - 1)}
      p.appendChild(nextpage)
    }
    const curpage = document.createElement('span')
    curpage.appendChild(document.createTextNode("("+invpage.toString()+")"))
    p.appendChild(curpage)
    if(invpage + 1 < inv / invpagelimit){
      const nextpage = document.createElement('span')
      nextpage.appendChild(document.createTextNode(" 1>"))
      nextpage.onclick = function () {setinvpage(invpage + 1)}
      p.appendChild(nextpage)
    }
    if(inv / invpagelimit < 10){
      const nextpage = document.createElement('span')
      nextpage.appendChild(document.createTextNode(" 10>>"))
      nextpage.onclick = function () {setinvpage(invpage + 10)}
      p.appendChild(nextpage)
    }

  }

}
function getTags(){
  let t = document.getElementById('tags')
  if(t){
    t.innerHTML = ""
  }else{
    return
  }
  
  //find unique tags/types
  if(!inventory || inventory?.length < 1){
    return
  }
  const tags = inventory.filter(i => i.tags)
  const alltags = [...new Set(tags.map(a => a.tags).toString().split(","))]

  if(alltags.length < 1 && itemTags === "none"){
    t.innerHTML = ""

    return
  }else{

  //make dropdown
  const dropdown = document.createElement('div')
  dropdown.classList.add('dropdown')
  const dropcontent = document.createElement('div')
  dropcontent.classList.add('dropdown-content')
  const tagName = localStorage.getItem("itemtag")?.toString()
  dropdown.innerHTML = "tags (" + tagName + ")"
  t?.appendChild(dropdown)  
  dropdown.appendChild(dropcontent)

  const none = document.createElement('div')
  none.appendChild(document.createTextNode('none'))
  dropcontent.appendChild(none)
  none.onclick = function () {changeTag("none")}

  for(let i = 0; i< alltags.length; i++){
    const tag = document.createElement('div')
    tag.appendChild(document.createTextNode(alltags[i]))
    dropcontent.appendChild(tag)
    tag.onclick = function () {changeTag(alltags[i])}
  }
}
}
function drawicons(items: Item[]){
  if(righttab != "inv")
  return
  let rightbar = document.getElementById('rightbarstuff')
  if(!rightbar){
    return
  }
  rightbar.innerHTML = ""
  const toggleicon = document.createElement('div')
  if(icons){
  toggleicon.appendChild(document.createTextNode("Icons"))
  }else{
    toggleicon.appendChild(document.createTextNode("Names"))
  }
  toggleicon.onclick = function () {toggleIcons()}
  const inv = document.createElement('div')
  inv.setAttribute('id',"inventory")
  const pagediv = document.createElement('div')
  pagediv.setAttribute('id',"pages")
  const tag = document.createElement('div')
  tag.setAttribute('id',"tags")
  rightbar.appendChild(inv)
  const controls = document.createElement('div')
  controls.appendChild(toggleicon)
  controls.appendChild(pagediv)
  controls.appendChild(tag)
  controls.appendChild(document.createTextNode("you have:"))
  inv.appendChild(controls)
  getTags()
  if(!items){
    inv.appendChild(document.createTextNode("nothing"))
    return
  }
  const tagName = localStorage.getItem("itemtag")?.toString()
  //filter tags
  let Finventory = items
  if(tagName && tagName != "none"){
    Finventory = items.filter(i => {
      if(i.tags != null)
      return i.tags.includes(tagName) 
      if(i.type != null)
      return i.type.includes(tagName)
    })
  }
  if(!Finventory || Finventory?.length < 1){
    inv.appendChild(document.createTextNode("nothing"))
    return
  }
  //sort Finventory
  Finventory = Finventory.sort((a,b) => a.name.localeCompare(b.name))
  getItemPages(Finventory.length)
  let invpagelimit = maxinvpageicon * (inv.offsetWidth /150)
  if(!icons){
    invpagelimit = maxinvpagename
  }
  let page = Math.floor(invpage * invpagelimit)
  if(page > Finventory.length){
    Math.floor(page = 0)
  }
    for(let i = page; i < Finventory?.length && i < page + invpagelimit; i++){  
      if(!Finventory[i]){
        inv?.appendChild(document.createTextNode("ERROR"))
        return
      }
      if(!Finventory[i].icon){
        makeIcon(Finventory[i])
      }  

    const dropdown = document.createElement('div')
    dropdown.classList.add('dropdown')
    const dropcontent = document.createElement('div')
    dropcontent.classList.add('dropdown-content')

    const use = document.createElement('div')
    use.appendChild(document.createTextNode('Use'))
    const look = document.createElement('div')
    look.appendChild(document.createTextNode('Look'))
    const drop = document.createElement('div')
    drop.appendChild(document.createTextNode('Drop'))
    const smelt = document.createElement('div')
    smelt.appendChild(document.createTextNode('Smelt'))
    const insight = document.createElement('div')
    insight.appendChild(document.createTextNode('Insight'))
    const describe = document.createElement('div')
    describe.appendChild(document.createTextNode('Describe'))
    const enchant = document.createElement('div')
    enchant.appendChild(document.createTextNode('Enchant'))
    const tag = document.createElement('div')
    tag.appendChild(document.createTextNode('Tag'))
    const send = document.createElement('div')
    send.appendChild(document.createTextNode('Send'))

    const itemblock = document.createElement('div')
    inv?.appendChild(itemblock)
    const item = document.createElement('div')

    let texcol = ""
    let baccol = ""
    if(Finventory[i].rarity){
      const rarity = itemRarity.find((r) => {
        return r.num.toString() === Finventory[i].rarity
      })
      if(rarity){
    itemblock.style.color = rarity.col
    texcol = rarity.col
    baccol = rarity.back
    itemblock.style.backgroundColor = rarity.back
    itemblock.style.textShadow = rarity.shadow
      }
    }
    if(icons && Finventory[i].icon){ 
    const iconbits = Finventory[i].icon.split("")
    for(let y = 0; y < ICON_HEIGHT; y++){
      const iconrow = document.createElement('span')
      for(let x = 0; x < ICON_WIDTH; x++){
        const char = document.createElement('span')
        //char.appendChild(document.createTextNode(iconbits[x+(ICON_WIDTH*y)]))
        char.innerHTML = `${iconbits[x+(ICON_WIDTH*y)]}`
        iconrow.appendChild(char)
        char.onmouseleave = function () {char.innerHTML = `${iconbits[x+(ICON_WIDTH*y)]}`}
        char.onmouseover = function () {char.innerHTML = `${localStorage.brush}`}
        char.onclick = function () {drawIcon(Finventory[i],x,y,localStorage.brush)}
        char.oncontextmenu = function () {setBrush(iconbits[x+(ICON_WIDTH*y)])}
        char.style.color = texcol
        char.style.backgroundColor = ""
      }
      item.appendChild(iconrow)
      item.style.backgroundColor = baccol
      iconrow.appendChild(document.createElement('br'))
    }
    itemblock.appendChild(item)
    item.classList.add('icon')
    }

    itemblock.appendChild(dropdown)
    dropdown.innerHTML = Finventory[i].name
    dropdown.appendChild(dropcontent)
    dropcontent.appendChild(use)
    use.onclick = function () {useItem(Finventory[i])}
    dropcontent.appendChild(look)
    look.onclick = function () {lookItem(Finventory[i])}
    dropcontent.appendChild(drop)
    drop.onclick = function () {dropItem(Finventory[i])}
    dropcontent.appendChild(smelt)
    smelt.onclick = function () {smeltItem(Finventory[i])}
    dropcontent.appendChild(insight)
    insight.onclick = function () {insightItem(Finventory[i])}
    dropcontent.appendChild(describe)
    describe.onclick = function () {newCraftWindow("Describe",Finventory[i],npcs)}
    dropcontent.appendChild(enchant)
    enchant.onclick = function () {newCraftWindow("Enchant",Finventory[i],npcs)}
    dropcontent.appendChild(tag)
    tag.onclick = function () {newCraftWindow("Tag",Finventory[i],npcs)}
    dropcontent.appendChild(send)
    send.onclick = function () {newCraftWindow("Send",Finventory[i],npcs)}
  }
  
  const columns = "auto ".repeat(inv.offsetWidth/150)
  if(inv)
  inv.style.gridTemplateColumns = columns
}
function drawEvent(){
  if(righttab != "event")
  return
  let rightbar = document.getElementById('rightbarstuff')
  if(!rightbar){
    return
  }
  rightbar.innerHTML = ""

}
function drawMake(){
  if(righttab != "make")
  return
  let rightbar = document.getElementById('rightbarstuff')
  if(!rightbar){
    return
  }
  rightbar.innerHTML = ""

}
function drawNews(){
  if(righttab != "news")
  return
  let rightbar = document.getElementById('rightbarstuff')
  if(!rightbar){
    return
  }
  rightbar.innerHTML = ""
  for (let n = 0; n < news.length; n++){
    const article = document.createElement('div')
    const headline = document.createElement('span')
    headline.appendChild(document.createTextNode(news[n].name))
    article.appendChild(headline)
    const date = document.createElement('span')
    date.appendChild(document.createTextNode(news[n].date))
    article.appendChild(date)
    const body = document.createElement('span')
    body.appendChild(document.createTextNode(news[n].text))
    article.appendChild(body)
    rightbar.appendChild(article)
  }

}
function drawInbox(){
  if(righttab != "inbox")
  return
  let rightbar = document.getElementById('rightbarstuff')
  if(!rightbar){
    return
  }
  rightbar.innerHTML = ""
  const inb = document.createElement('div')
  inb.setAttribute('id','inbox')
  rightbar.appendChild(inb)
  if(correspondents && correspondents.length > 0){
    //make dropdown
    const dropdown = document.createElement('div')
    dropdown.classList.add('dropdown')
    dropdown.appendChild(document.createTextNode("contacts"))
    const dropcontent = document.createElement('div')
    dropcontent.classList.add('dropdown-content')
    const all = document.createElement('div')
    all.appendChild(document.createTextNode("all"))
    dropcontent.appendChild(all)
    dropcontent.appendChild(document.createTextNode('br'))
    all.onclick = function () {moreinboxcontact("")}
    for(let c = 0; c < correspondents.length; c++){
      const cor = document.createElement('div')
      cor.appendChild(document.createTextNode(correspondents[c]))
      dropcontent.appendChild(cor)
      cor.onclick = function () {moreinboxcontact(correspondents[c])}
      dropcontent.appendChild(document.createTextNode('br'))
    }
    dropdown.appendChild(dropcontent)
    inb.appendChild(dropdown)
  }
  if(!inbox || inbox.length < 1){
    inb.appendChild(document.createTextNode("you have no messages"))
    return
  }
  const Finbox = inbox.sort((a,b) => b.date - a.date)
  for(let i = 0; i < Finbox.length; i++){  
  const formattedTimeParts = new Date(Finbox[i].date)
    .toLocaleString()
    .split(' ')
    .slice(1, 3)

  const [formattedDate] = new Date(Finbox[i].date)
    .toLocaleString()
    .split(',')
    .slice(0, 1)

    formattedTimeParts[0] = formattedTimeParts[0].split(':').slice(0, 2).join(":")
    
  const timestamp = Date.now() - Finbox[i].date < 86400000
    ? formattedTimeParts.join(" ")
    : `${formattedDate} ${formattedTimeParts.join(" ")}`

    
    const messageBox = document.createElement('span')
    messageBox.classList.add("message-box")
    const message = document.createElement('span')
    const date = document.createElement('span')
    date.classList.add("date")
    date.appendChild(document.createTextNode(timestamp))
    const usernames = document.createElement('span')
    usernames.classList.add("username")
    if(!(Finbox[i].player.username === store.player?.username)){
    usernames.appendChild(document.createTextNode(" ["+Finbox[i].player.username+"] "))
    }else{
      usernames.appendChild(document.createTextNode(" ["+Finbox[i].player.username+"]>["+Finbox[i].recipiant?.username+"]"))
    }
    inb.appendChild(messageBox)
    messageBox.appendChild(message)
    message.appendChild(date)
    message.appendChild(usernames)
    const messageText = document.createElement('span')
    messageText.appendChild(document.createTextNode(Finbox[i].message))
    message.appendChild(messageText)

    if(!(Finbox[i].player.username === store.player?.username)){
    const reply = document.createElement('div')
    reply.appendChild(document.createTextNode("[reply]"))
    reply.onclick = function () {newReplyWindow(Finbox[i],npcs)}
    messageBox.appendChild(reply)
    }else{      
    messageBox.className = "sent-message"
    }
    inb.appendChild(document.createElement('br'))
  }
  if(Finbox.length >= 20){
    const loadmore = document.createElement('div')
    loadmore.appendChild(document.createTextNode("[load more]"))
    inb.appendChild(loadmore)
    loadmore.onclick = function () {moreinbox()}
  }

}

sendEvent(EVENT_EVENT,"/event check")
getCount()
setInterval(getCount, 1000);

function getCount(){
  let eventName = localStorage.event.split(",")[0]
  let eventStart = localStorage.event.split(",")[1]
  let eventEnd = localStorage.event.split(",")[2]

  var now = Date.now();
  var countdown = eventStart - now;
  var countup = eventEnd - now;
  let cd = document.getElementById('countDown')
  let event = document.getElementById('eventName')
  if(countdown > 0){
      const days = Math.floor(countdown / 86400000)  
    let milliseconds = Math.floor((countdown % 1000) / 100),
      seconds = Math.floor((countdown / 1000) % 60),
      minutes = Math.floor((countdown / (1000 * 60)) % 60),
      hours = Math.floor((countdown / (1000 * 60 * 60)) % 24);  

  let timestamp = countdown > 86400000 ? `${days} days`: hours + ":" + minutes + ":" + seconds
  if(cd){
    cd.innerHTML = eventName + " " + timestamp + " to start";
  }
    return timestamp
  }else 
  if(countup > 0){
    if(localStorage.eventStart !== localStorage.event){
    localStorage.eventStart = localStorage.event
    switch (eventName){
      case "Fishing_Tournament":
        pushToLog(/* html */`The floor has flooded with water! use <code>/fish</code> to try catch something`)

        break
      case "Zombie_Invasion":
        pushToLog(/* html */`A green mist crawls across the floor. Tonight the dead will rise!`)

        break
      case "Bear_Week":
        pushToLog(/* html */`A Strange transformation has taken over you as you become a bear`)

        break
      case "Election_Day":
        pushToLog(/* html */`Use <code>/campaign [message]</code> to broadcast messages to all users. <code>/vote [user]</code> to pick your favourite candidate. <code>/poll</code> to check on who's winning`)

        break
    }
    }
    const days = Math.floor(countup / 86400000)  
  let milliseconds = Math.floor((countup % 1000) / 100),
    seconds = Math.floor((countup / 1000) % 60),
    minutes = Math.floor((countup / (1000 * 60)) % 60),
    hours = Math.floor((countup / (1000 * 60 * 60)) % 24);  

  let timestamp = countup > 86400000 ? `${days} days`: hours + ":" + minutes + ":" + seconds
  
  if(cd){
  cd.innerHTML = eventName + " " + timestamp + " to end";
  }
  }else
    if(cd){
      cd.innerHTML = "";
    }
    
  } 
 

  return (
    <main
    >
      <div id="toolbar">
          <div className="tooltip">
          <span id="button"
            onClick={look}
          >{eye ? "🕶" : "👁"}</span>
          <span className ="tooltiptext">Look</span>
        </div>

          <div className="dropdown">
          <div className="tooltip">
          <span id= "button"  onClick={() => changeleftTab("doors")}>
            {plane ? "⛴" : "✈"}</span>
          <span className ="tooltiptext">Go</span>
          </div>
        </div>
        
        <div className="popup">
          <div className="tooltip">
          <span id="button"
            onClick={() => changeleftTab("pallete")}
          >{pen ? "🗡" : "✐"}</span>
          <span className ="tooltiptext">Palette</span>
        </div>
        </div>

        <div className="popup">
          <div className="tooltip">
          <span id="button"
            onClick={() => changerightTab("inv")}
          >{"🖿"}</span>
          <span className ="tooltiptext">Inventory</span>
        </div>
        </div>        

        <div className="popup">
          <div className="tooltip">
          <span id="button"
            onClick={() => changerightTab("make")}
          >{"🛠"}</span>
          <span className ="tooltiptext">Make</span>
        </div>
        </div>        

          <div className="pop-up">
          <div className="tooltip">
          <span id="button"
            onClick={() => changerightTab("inbox")}
          >{letter ? "🗑" : "✉"}</span>
          <span className ="tooltiptext">Inbox</span>
        </div>
        </div>

          <div className="pop-up">
          <div className="tooltip">
          <span id="button"
            onClick={() => changerightTab("event")}
          >{"🕭"}</span>
          <span className ="tooltiptext">Event</span>
        </div>
        </div>
        
        <div className="pop-up">
          <div className="tooltip">
          <span id="button"
            onClick={() => changerightTab("news")}
          >{"🗞"}</span>
          <span className ="tooltiptext">News</span>
        </div>
        </div>
        
        <div className="pop-up">
          <div className="tooltip">
          <span id="button"
            onClick={() => changerightTab("game")}
          >{"♞"}</span>
          <span className ="tooltiptext">Games</span>
        </div>
        </div>
        
          <div className="tooltip">
          <span id="button"
            onClick={toggleMute}
          >{sound ? muted ? <s>🕬</s> : "🕬" : muted ? "x🕨" : "🕪"}</span>
          <span className ="tooltiptext">{muted ? "Unmute" : "Mute"}</span>
        </div>

        
        
      <div className ="title">
        <span id="title">MUDGOLT.COM</span>
      </div>   </div>
      <div className="secret">{secret ? "go back" : null}</div>
      <div id="windows"></div>
      {form ?
          <div className="post-box">
            <form>
              <span>Share your thoughts</span><br></br>
              <span id="tool-terminal-input-container">
        <span>&gt;</span> {Input ? <Input /> : null}<br></br>
      </span>
        <small className={`tool-char-limit ${textLength > MESSAGE_MAX_LENGTH ? 'invalid' : ''}`}>
          {String(textLength)}/{MESSAGE_MAX_LENGTH}
        </small>
            </form>
          <span id="publish-button"
            onClick={post}
          >{"Publish"}</span>
          </div> : null}
          
          <div>
            {mini? null :
          <span id="side-mini-button"
            onClick={toggleMini}
          >{"+"}</span>}
          </div>
    <div id="sidebar" style={mini? {width:150} : {width:0, padding:0, border:0}}>
          <span id="button"
            onClick={toggleMini}
          >{mini? "=" : null}</span>
          <br></br>
      {mini && lefttab === "doors"? 
      <span>{"The exits are:"}
      <div>{westdoor?<span className="sub-button" onClick={() => go ("west")}>{"west "}</span>:"_____"}↖↗
      {northdoor?<span className="sub-button" onClick={() => go ("north")}>{"north"}</span>:"_____"}</div>
      <div>{southdoor?<span className="sub-button" onClick={() => go ("south")}>{"south"}</span> :"_____"}↙↘
      {eastdoor?<span className="sub-button" onClick={() => go ("east")}>{"east "}</span>:"_____"}</div></span>
      : null}
      <br></br>
      {mini && lefttab === "doors"? 
      roomMap.map((log, key) => {
      return <span className= "sub-button" key={key} onClick={() => go(log)}> {log}<br></br></span>
      })
      : null}
        {mini && lefttab === "pallete"?
      <div className = "dropdown">
        <span id="button">
        Brush  
        </span>
        <div className = "dropdown-content">
          <span onClick={()=>setBrushType("draw")}>Draw</span>
          <span onClick={()=>setBrushType("color")}>Color</span>
        </div>  
        </div>
        :null}
        {mini && lefttab === "pallete" && (localStorage.brushType === "draw" || !localStorage.brushType)?
      <div className = "dropdown">
        <span id="button">
        pallete v</span>
        <div className = "dropdown-content">{
      symbols.map((symbol, key) => {
          return <span className= "sub-button" key={key} onClick={() => setPalette(symbol.id)}>{symbol.id}
          </span>
      })}
      </div>
      </div>: null}
      {mini && lefttab === "pallete"&& localStorage.brushType === "color"?
      <span> 
      <span onClick={()=>{setBrushPrimeCol(""),setBrushBackCol("")}}>Clear</span>   
      {colors.map((c) => {return <div style={{backgroundColor:c.color, color:c.color}}  
      onContextMenu={(event) => event.preventDefault()}
      className="colorPalette"
      onMouseDown={(event) => {
        if (event.buttons === 1) {
          setBrushPrimeCol(c.color)
        } else if (event.buttons === 2) {
          setBrushBackCol(c.color)
        }}}>X</div>})}</span>
      :null}

      <br></br>
          {
          mini && lefttab === "pallete"&& (localStorage.brushType === "draw" || !localStorage.brushType)?<span>{
          brushSymbols.map((symbol, key) => {
              return <span className= "palette" key={key} onClick={() => setBrush(symbol)}>{symbol}
              </span>
          })}
          </span>: null} 
        
          <div className="popup" style={{bottom:100, position:"fixed"}}>
            <div className="tooltip">
            <span id= "button"
            onClick={toggleSettings}>{"⚙"}</span>
            <span className ="tooltiptext">Settings</span>
            {settings? 
          <div className="popup-box">
            <div className="popup-content">
              Music Volume
            <input type="range" min="0" max="1000" value={volume} className="slider" id="myRange" onChange={event => {
              setVolume(event.target.valueAsNumber)
            }}></input>
            <span>
              Themes<br></br>
              <div className="themes">
            {themes.map((symbol, key) => {
                return <span className= "sub-button" property="background-color:red;" key={key} onClick={() => colorUtil.changeTheme(symbol.name)}>{symbol.name}</span>
            })}</div></span>
        </div>
            </div>: null
          }
            </div>
          </div>  <div className="popup" style={{bottom:120, position:"fixed"}}>
          <div className="tooltip">
          <span id="button"
            onClick={toggleHelp}
          >{"🛈"}</span>
          <span className ="tooltiptext">Help</span>
        </div>
          {help ?
          <div className="popup-box">
            <div className="popup-content">
          {commands.map((symbol, key) => {
              return <span className= "sub-button" key={key} onClick={() => setHelpType(symbol.id)}>{symbol.id}</span>
          })}</div>
          <div className="popup-content">
          {helpCommands.map((symbol, key) => {
              return <span className= "sub-button" key={key} onClick={() => setCommand(symbol)}>{symbol}</span>
          })}</div>
          <div className="popup-content">
          {command}
          </div>
          </div> : null}
        </div>
      </div>
      <div>
            {rightmini? null :
          <span id="right-mini-button"
            onClick={toggleRightMini}
          >{"+"}</span>}
          </div>
    <div id="rightbar" style={rightmini? {width:150} : {width:0, padding:0, border:0}}>
          <span id="button"
            onClick={toggleRightMini}
          >{rightmini? "=" : null}</span>
          <br></br>
          <div id="rightbarstuff">

          </div>
          
      {rightmini && righttab === "inv"? 
      <div>
      {inventory?
      null : "nothing"}
      </div>
      : null}
      {rightmini && righttab === "make"?
      <div>
      <div onClick={() => newCraftWindow("makeItem", null,npcs)}>make item</div>
      <div onClick={() => newCraftWindow("makeDoor", null,npcs)}>make door</div>
      <div onClick={() => newCraftWindow("makeRoom", null,npcs)}>make room</div>
      </div>         
    : null}
      {rightmini && righttab === "event"?
      <div>
    <div id="eventName">
    </div>      
    <div id="countDown">
    </div>   
    </div>      
      : null}
      </div>
    </main>
  )
}


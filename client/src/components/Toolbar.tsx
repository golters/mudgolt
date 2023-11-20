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
} from "../../../events"
import {
  store,
} from "../store"
import {
  Markdown, 
} from "./Markdown"
import {
  Door, Item, Npc, 
} from "../../../@types"
import {
  networkEmitter, 
} from "../network/events"
import { ICON_WIDTH, ICON_HEIGHT, MESSAGE_MAX_LENGTH, AVATAR_HEIGHT, AVATAR_WIDTH, itemRarity } from '../../../constants'
import{
  setBrush,
}from "./Header"
import { commandModules } from "../../src/commands"
import { colorUtil } from "../../src/utils"
import { VALID_COLOR_THEMES } from "../../src/utils/color"
import { Volume } from "src/commands/volume"
import {
  commandEmitter, 
} from "../commands/emitter"
import { pushToLog } from "./Terminal"
import { type } from "os"
import { Make } from "src/commands/make"

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

function drawAvatar(npc: Npc, x: number, y: number, brush: string){
  sendEvent(DRAW_AVATAR_EVENT, [x,y,brush, npc])
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
function describeItem(item: Item, description: String, window: HTMLElement){
  sendEvent(ROOM_DESCRIBE_EVENT, [item.name, description])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}
function enchantItem(item: Item, macro: String, window: HTMLElement){
  sendEvent(ENCHANT_ITEM_EVENT, [item.name, macro])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}
function makeItem(name: string, description: string, macro: string, window: HTMLElement){
  sendEvent(MAKE_EVENT, ["item",name,description,macro])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}
function makeRoom(name: string, description: string, window: HTMLElement){
  sendEvent(MAKE_EVENT, ["room",name,description])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}
function makeDoor(name: string, room: string, window: HTMLElement){
  sendEvent(MAKE_EVENT, ["door",name,room])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}

//tagitem
//senditem
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
  {id: "bear", chars:["ﻌ","Ҁ","ҁ","⟟","⧪","ᴥ","ʔ","ʕ","ꮂ","㉨","ｴ","•","ᶘ","ᶅ"]},
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

export const Toolbar: React.FC = () => { 
  const [volume, setVolume] = useState(localStorage.volume*10)
  const [doors, setDoors] = useState<Door[] | null>(null)
  const [inventory, setInv] = useState<Item[] | null>(null)
  const [npcs, setNpcs] = useState<Npc[] | null>(null)
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
    setDoors(doors)
  })
  networkEmitter.on(INVENTORY_UPDATE_EVENT, (inventory: Item[]) => {
    setInv(inventory)
    drawicons()
  })
  networkEmitter.on(NPC_UPDATE_EVENT, (npcs: Npc[]) => {
    console.log("got npc update")
    setNpcs(npcs)
    redrawAvatars(npcs)
  })
  
  

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
drawicons()

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
    drawicons()
    
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
  localStorage.setItem("sidemini", '1')
  localStorage.setItem("lefttab",tab)
}

function changerightTab(tab: string){
  setrighttab(tab)
  setMini(true)
  localStorage.setItem("sidemini", '1')
  localStorage.setItem("righttab",tab)
  drawicons()
}

function changeTag(tag: string){
  setItemTags(tag)
  localStorage.setItem("itemtag",tag)
  drawicons()
}

if(doors){
  doors.forEach(element => {
    roomMap.push(element.name)
  });
}

if(inventory){
  drawicons()
}

function redrawAvatars(boys: Npc[]){
  let windows = document.getElementById('windows')
  if(windows){
    const menus = windows.children
    for(let m = 0; m < menus.length;m++){
      const guy = menus[m].childNodes[2].childNodes[1] as HTMLElement
      const npc = menus[m].childNodes[2] as HTMLElement
      const face = boys?.find((n) => {
        if(npc)
        return  npc.innerHTML.toString().includes(n.name + " the " + n.job)
      })
      if(face){
      guy.innerHTML = ""
      const avatar = document.createElement('div')
      const iconbits = face?.icon.split("")
      if(iconbits)
      for(let y = 0; y < AVATAR_HEIGHT; y++){
        const iconrow = document.createElement('span')
        for(let x = 0; x < AVATAR_WIDTH; x++){
            const char = document.createElement('span')
            char.innerHTML = `${iconbits[x+(AVATAR_WIDTH*y)]}`
            iconrow.appendChild(char)
            char.onmouseleave = function () {char.innerHTML = `${iconbits[x+(AVATAR_WIDTH*y)]}`}
            char.onmouseover = function () {char.innerHTML = `${localStorage.brush}`}
            char.onclick = function () {drawAvatar(face,x,y,localStorage.brush)}
            char.oncontextmenu = function () {setBrush(iconbits[x+(AVATAR_WIDTH*y)])}
        }
          guy.appendChild(iconrow)
          iconrow.appendChild(document.createElement('br'))
      }
    }
    }
  }

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
    if(rightmini){
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
    const inv = document.getElementById("inventory")
    const columns = "auto ".repeat(bar.offsetWidth/150)
    if(inv)
    inv.style.gridTemplateColumns = columns
    drawicons()
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
    drawicons()
  }

}

function newWindow(Type: string | null, Item: Item | null){
  let windows = document.getElementById('windows')
  windows?.childNodes.forEach(element => {
    if((element as HTMLElement).style.width === "0.1px"){
    element.remove()
    }
  });
  if(windows){
    const head = document.createElement('div')
    head.appendChild(document.createTextNode('Drag Me...'))
    const window = document.createElement('div')
    head.setAttribute('id','windowheader')
    window.setAttribute('id','window')
    const x = document.createElement('div')
    x.appendChild(document.createTextNode('X'))
    x.setAttribute('id','close')
    windows.appendChild(window)
    window.appendChild(head)
    dragElement(window);
    //doesn't work when append to head???
    head.appendChild(x)
    x.onclick = function () {closeWindow(window)}    
    window.style.top = (windows?.childNodes.length * 10) + "px";
    window.style.left = (windows?.childNodes.length * 10) + "px";
    //get npc   
    let npc: Npc[] = []
    let job = "hobo"

    const menu = document.createElement('div')
    menu.setAttribute('id','menu')
    switch(Type) {
      case "Describe":
        if(Item === null){
           
          return
        }        
        menu.appendChild(document.createTextNode('describe'))
        const description = document.createElement('input')
        description.setAttribute('id','input')
        description.setAttribute('value',`${Item.description}`)
        menu.appendChild(description)
        const button1 = document.createElement('input')
        button1.setAttribute('type','submit')
        button1.onclick = function () {describeItem(Item,description.value.toString(),window)}
        menu.appendChild(button1)
        job = "scribe"

        break;
      case "Enchant":
        if(Item === null){
           
          return
        }
        menu.appendChild(document.createTextNode('Enchant'))
        const enchantment = document.createElement('input')
        enchantment.setAttribute('id','input')
        enchantment.setAttribute('value',`${Item.macro}`)
        menu.appendChild(enchantment)
        const button2 = document.createElement('input')
        button2.setAttribute('type','submit')
        button2.onclick = function () {enchantItem(Item,enchantment.value.toString(),window)}
        menu.appendChild(button2)
        job = "enchanter"

        break;
      case "makeItem":
        const itemName = document.createElement('input')
        itemName.setAttribute('id','input')
        itemName.setAttribute('value',"sword")
        menu.appendChild(document.createTextNode("name"))
        menu.appendChild(itemName)
        const itemDescription = document.createElement('input')
        itemDescription.setAttribute('id','input')
        itemDescription.setAttribute('value','a simple sword')
        menu.appendChild(document.createTextNode("Description"))
        menu.appendChild(itemDescription)
        const itemMacro = document.createElement('input')
        itemMacro.setAttribute('id','input')
        itemMacro.setAttribute('value','swings sword')
        menu.appendChild(document.createTextNode("Enchantment"))
        menu.appendChild(itemMacro)
        const button3 = document.createElement('input')
        button3.setAttribute('type','submit')
        button3.onclick = function () {makeItem(itemName.value.toString(),itemDescription.value.toString(),itemMacro.value.toString(),window)}
        menu.appendChild(button3)
        job = "blacksmith"

        break;
      case "makeRoom":
        const roomName = document.createElement('input')
        roomName.setAttribute('id','input')
        roomName.setAttribute('value',"room...")
        menu.appendChild(document.createTextNode("name"))
        menu.appendChild(roomName)
        const roomDescription = document.createElement('input')
        roomDescription.setAttribute('id','input')
        roomDescription.setAttribute('value','a room...')
        menu.appendChild(document.createTextNode("Description"))
        menu.appendChild(roomDescription)
        const button4 = document.createElement('input')
        button4.setAttribute('type','submit')
        button4.onclick = function () {makeRoom(roomName.value.toString(),roomDescription.value.toString(),window)}
        menu.appendChild(button4)
        job = "builder"

        break;
      case "makeDoor":
        const doorName = document.createElement('input')
        doorName.setAttribute('id','input')
        doorName.setAttribute('value',"door...")
        menu.appendChild(document.createTextNode("name"))
        menu.appendChild(doorName)
        const destination = document.createElement('input')
        destination.setAttribute('id','input')
        destination.setAttribute('value',"destination...")
        menu.appendChild(document.createTextNode("destination"))
        menu.appendChild(destination)
        const button5 = document.createElement('input')
        button5.setAttribute('type','submit')
        button5.onclick = function () {makeDoor(doorName.value.toString(),destination.value.toString(),window)}
        menu.appendChild(button5)
        job = "carpenter"

        break;
      case "Tag":

        job = "librarian"
        break;
      case "Send":  
  
        job = "courier"
        break;
      default:
        menu.appendChild(document.createTextNode('nothing'))
        //put something funny here

        break;
    }
    window.appendChild(menu)
    if(npcs){   
       npc = npcs.filter(npc => {
        return npc.job === job
      })      
    }
    const guy = document.createElement('div')
    guy.setAttribute('id','menu')
    guy.appendChild(document.createTextNode(npc[0].name + " the " + npc[0].job))
    window.appendChild(guy)
    const avatar = document.createElement('div')
    guy.appendChild(avatar)
    const iconbits = npc[0].icon.split("")
    for(let y = 0; y < AVATAR_HEIGHT; y++){
      const iconrow = document.createElement('span')
      for(let x = 0; x < AVATAR_WIDTH; x++){
          const char = document.createElement('span')
          //char.appendChild(document.createTextNode(iconbits[x+(ICON_WIDTH*y)]))
          char.innerHTML = `${iconbits[x+(AVATAR_WIDTH*y)]}`
          iconrow.appendChild(char)
          char.onmouseleave = function () {char.innerHTML = `${iconbits[x+(AVATAR_WIDTH*y)]}`}
          char.onmouseover = function () {char.innerHTML = `${localStorage.brush}`}
          char.onclick = function () {drawAvatar(npc[0],x,y,localStorage.brush)}
          char.oncontextmenu = function () {setBrush(iconbits[x+(AVATAR_WIDTH*y)])}
      }
        avatar.appendChild(iconrow)
        iconrow.appendChild(document.createElement('br'))
    }
    const phrase = document.createElement('div')
    phrase.appendChild(document.createTextNode("["+npc[0].name+"] "+npc[0].phrases[Math.floor(Math.random() * (npc[0].phrases.length))]))
    guy.appendChild(phrase)
    window.appendChild(guy)
    avatar.classList.add('icon')
  }
}
function closeWindow(window: HTMLElement) {
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}
function dragElement(elmnt: HTMLElement) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  //const header = document.getElementById(elmnt.id + "header")
  const header = elmnt.firstElementChild as HTMLElement
  const windows = elmnt.parentElement
  if (header) {
    /* if present, the header is where you move the DIV from:*/
    header.onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e: MouseEvent) {
    e = e || window.event;
    e.preventDefault();
    windows?.appendChild(elmnt)
    elmnt.style.cursor = "grabbing"
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
    elmnt.style.transition = "0s"
    
  }

  function elementDrag(e: MouseEvent) {
    if(Math.random() * 1000 < 1){
      header.innerText = "put me down!!!"
    }
    e = e || window.event;
    e.preventDefault();
    elmnt.style.cursor = "grabbing"
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    if(header.innerText === "put me down!!!"){
      header.innerText = "thank you..."
    }
    document.onmouseup = null;
    document.onmousemove = null;
    const top = Math.ceil((elmnt.offsetTop - pos2 - 5) / 10) * 10
    const left = Math.ceil((elmnt.offsetLeft - pos1 - 5) / 10) * 10
    elmnt.style.top = top + "px"
    elmnt.style.left = left + "px"
    elmnt.style.cursor = "auto"
    elmnt.style.transition = "1s"
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
    if(inv > invpagelimit * invpage + 2){
      const nextpage = document.createElement('span')
      nextpage.appendChild(document.createTextNode(" 1>"))
      nextpage.onclick = function () {setinvpage(invpage + 1)}
      p.appendChild(nextpage)
    }
    if(inv > invpagelimit * invpage * 10){
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
  const types = inventory.filter(i => i.type)
  const alltageditems = tags.concat(types)
  const alltags = [...new Set(alltageditems.map(a => a.tags).toString().split(","))]

  if(alltageditems.length < 1 && itemTags === "none"){
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
function drawicons(){
  getTags()
  let inv = document.getElementById('inventory')
  if(inv){
    inv.innerHTML = ""
  }else{
    return
  }
  if(!inventory || inventory?.length < 1){
    inv.appendChild(document.createTextNode("nothing"))
    return
  }
  const tagName = localStorage.getItem("itemtag")?.toString()
  //filter tags
  let Finventory = inventory
  if(tagName && tagName != "none"){
    Finventory = inventory.filter(i => {
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
  let page = (invpage * invpagelimit)
  if(invpage * invpagelimit > Finventory.length){
    page = 0
  }
    for(let i = page; i < Finventory?.length && i < page + invpagelimit; i++){  
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

    if(icons){ 
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
      }
      item.appendChild(iconrow)
      iconrow.appendChild(document.createElement('br'))
    }
    itemblock.appendChild(item)
    item.classList.add('icon')
    }

    itemblock.appendChild(dropdown)
    dropdown.innerHTML = Finventory[i].name
    if(Finventory[i].rarity){
      const rarity = itemRarity.find((r) => {
        return r.num.toString() === Finventory[i].rarity
      })
      if(rarity){
    dropdown.style.color = rarity.col
    dropdown.style.backgroundColor = rarity.back
      }
    }
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
    describe.onclick = function () {newWindow("Describe",Finventory[i])}
    dropcontent.appendChild(enchant)
    enchant.onclick = function () {newWindow("Enchant",Finventory[i])}
    dropcontent.appendChild(tag)
    tag.onclick = function () {newWindow("Tag",Finventory[i])}
    dropcontent.appendChild(send)
    send.onclick = function () {newWindow("Send",Finventory[i])}
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

          <div className="pop-up">
          <div className="tooltip">
          <span id="button"
            onClick={toggleForm}
          >{letter ? "🗑" : "✉"}</span>
          <span className ="tooltiptext">Post</span>
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
          
    <div id="sidebar" style={mini? {width:150} : {width:0}}>
          <span id="button"
            onClick={toggleMini}
          >{mini? "=" : "+"}</span>
          <br></br>
      {mini && lefttab === "doors"? 
      <span>{"The exits are:"}</span>
      : null}
      <br></br>
      {mini && lefttab === "doors"? 
      roomMap.map((log, key) => {
      return <span className= "sub-button" key={key} onClick={() => go(log)}> {log}<br></br></span>
      })
      : null}
      <div className = "dropdown">
        {mini && lefttab === "pallete"?
        <span id="button">
        pallete v</span>
        : null}
        <div className = "dropdown-content">
      {mini && lefttab === "pallete"?
      symbols.map((symbol, key) => {
          return <span className= "sub-button" key={key} onClick={() => setPalette(symbol.id)}>{symbol.id}
          </span>
      }): null}</div>

      </div>  
      <br></br>
          {
          mini && lefttab === "pallete"?
          brushSymbols.map((symbol, key) => {
              return <span className= "palette" key={key} onClick={() => setBrush(symbol)}>{symbol}
              </span>
          }): null} 
        
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
            {VALID_COLOR_THEMES.map((symbol, key) => {
                return <span className= "sub-button" property="background-color:red;" key={key} onClick={() => colorUtil.changeTheme(symbol)}>{symbol}</span>
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
    <div id="rightbar" style={rightmini? {width:150} : {width:20}}>
          <span id="button"
            onClick={toggleRightMini}
          >{rightmini? "=" : "+"}</span>
          <br></br>
      {rightmini?
      righttab === "inv" && rightmini? 
      <div>
      <span>
      <div id="tags">
        {}        
      </div>
      <div id="pages">
        {}        
      </div>
      <div onClick={() => toggleIcons()}>{icons? "icons" : "names"}</div>
        {     
        "you have:"
        }</span>
      <br></br>
      <div id="inventory">
        {}        
      </div>
      {inventory?
      null : "nothing"}
      </div>
      : <div>
      <div onClick={() => newWindow("makeItem", null)}>make item</div>
      <div onClick={() => newWindow("makeDoor", null)}>make door</div>
      <div onClick={() => newWindow("makeRoom", null)}>make room</div>
      </div> : null}
      </div>
    </main>
  )
}


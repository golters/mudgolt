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
} from "../../../events"
import {
  store,
} from "../store"
import {
  Markdown, 
} from "./Markdown"
import {
  Door, Item, 
} from "../../../@types"
import {
  networkEmitter, 
} from "../network/events"
import { ICON_WIDTH, ICON_HEIGHT, MESSAGE_MAX_LENGTH } from '../../../constants'
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

const rooms: (string)[] = []
let brushSymbols: (string)[] = ["█","▓","▒","░"]
let helpCommands: (string)[] = []
let command: string

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

//senditem
//equipitem
//describeitem
//enchantitem
//test

const symbols = [
  {id: "blocks", chars:["█","▓","▒","░"]},
  {id: "plants", chars:["🏶","🏵","✿","❀","❁","❃","❋","✾","❦","❧","☙","☘","♣","♧","♠","♤","⚕","⚘","⚚","⚵","↑","↟","⯭","↡","෴"]},
  {id: "bricks", chars:["☲","☵","𒐪"]},
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
  const [doortab, setDoorTab] = useState(true)
  const [palletetab, setPalleteTab] = useState(false)
  const [mini, setMini] = useState(!!localStorage.getItem("sidemini") || false)
  const [rightmini, setRightMini] = useState(!!localStorage.getItem("rightmini") || false)
  const [icons, setIcons] = useState(!!localStorage.getItem("icons" || false))
  
 
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
  if(!localStorage.getItem("tab")){
    localStorage.setItem("tab","doors")
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

function changeTab(tab: string){
  switch (tab){
    case "doors":
      setDoorTab(true)
      setPalleteTab(false)
      setMini(true)
      localStorage.setItem("sidemini", '1')
    localStorage.setItem("tab","doors")

    break;
    case "pallete":
      setDoorTab(false)
      setPalleteTab(true)
      setMini(true)
      localStorage.setItem("sidemini", '1')
      localStorage.setItem("tab","pallete")

    break;
    deafault:
      setDoorTab(true)
      setPalleteTab(false)
      setMini(true)
      localStorage.setItem("sidemini", '1')

    break;
  }
}

if(doors){
  doors.forEach(element => {
    roomMap.push(element.name)
  });
}

if(inventory){
  drawicons()
}

function newWindow(){
  let windows = document.getElementById('windows')
  if(windows){
    const head = document.createElement('div')
    head.appendChild(document.createTextNode('Drag Me...'))
    const window = document.createElement('div')
    head.setAttribute('id','windowheader')
    window.setAttribute('id','window')
    const x = document.createElement('div')
    x.appendChild(document.createTextNode('X'))
    x.setAttribute('id','x')
    windows.appendChild(window)
    window.appendChild(head)
    window.appendChild(document.createTextNode('window'))
    dragElement(window);
    head.appendChild(x)
    x.onclick = function () {closeWindow(window)}
  }
}
function closeWindow(elmnt: HTMLElement) {
  elmnt.remove()
  elmnt.style.width = "1px"
  elmnt.style.height = "1px"
  elmnt.innerHTML = "close"
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
  }

  function elementDrag(e: MouseEvent) {
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
    document.onmouseup = null;
    document.onmousemove = null;
    elmnt.style.cursor = "auto"
  }
}
function drawicons(){
  let inv = document.getElementById('inventory')
  if(inv){
    inv.innerHTML = ""
  }else{
    return
  }
  if(!inventory){
    inv.innerHTML = "nothing"
    return
  }
    for(let i = 0; i < inventory?.length; i++){  
      if(!inventory[i].icon){
        makeIcon(inventory[i])
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

    const item = document.createElement('div')

    if(icons){ 
    const iconbits = inventory[i].icon.split("")
    for(let y = 0; y < ICON_HEIGHT; y++){
      const iconrow = document.createElement('span')
      for(let x = 0; x < ICON_WIDTH; x++){
        const char = document.createElement('span')
        //char.appendChild(document.createTextNode(iconbits[x+(ICON_WIDTH*y)]))
        char.innerHTML = `${iconbits[x+(ICON_WIDTH*y)]}`
        iconrow.appendChild(char)
        char.onmouseleave = function () {char.innerHTML = `${iconbits[x+(ICON_WIDTH*y)]}`}
        char.onmouseover = function () {char.innerHTML = `${localStorage.brush}`}
        char.onclick = function () {drawIcon(inventory[i],x,y,localStorage.brush)}
        char.oncontextmenu = function () {setBrush(iconbits[x+(ICON_WIDTH*y)])}
      }
      item.appendChild(iconrow)
      iconrow.appendChild(document.createElement('br'))
    }
    inv?.appendChild(item)
    item.classList.add('icon')
    }

    inv?.appendChild(dropdown)  
    dropdown.innerHTML = inventory[i].name
    dropdown.appendChild(dropcontent)
    dropcontent.appendChild(use)
    use.onclick = function () {useItem(inventory[i])}
    dropcontent.appendChild(look)
    look.onclick = function () {lookItem(inventory[i])}
    dropcontent.appendChild(drop)
    drop.onclick = function () {dropItem(inventory[i])}
    dropcontent.appendChild(smelt)
    smelt.onclick = function () {smeltItem(inventory[i])}
    dropcontent.appendChild(insight)
    insight.onclick = function () {insightItem(inventory[i])}
    dropcontent.appendChild(describe)
    describe.onclick = function () {newWindow()}
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
          <span id= "button"  onClick={() => changeTab("doors")}>
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
            onClick={() => changeTab("pallete")}
          >{pen ? "🗡" : "✐"}</span>
          <span className ="tooltiptext">Palette</span>
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
      {mini && doortab? 
      <span>{"The exits are:"}</span>
      : null}
      <br></br>
      {mini && doortab? 
      roomMap.map((log, key) => {
      return <span className= "sub-button" key={key} onClick={() => go(log)}> {log}<br></br></span>
      })
      : null}
      <div className = "dropdown">
        {mini && palletetab?
        <span id="button">
        pallete v</span>
        : null}
        <div className = "dropdown-content">
      {mini && palletetab?
      symbols.map((symbol, key) => {
          return <span className= "sub-button" key={key} onClick={() => setPalette(symbol.id)}>{symbol.id}
          </span>
      }): null}</div>

      </div>  
      <br></br>
          {
          mini && palletetab?
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
    <div id="rightbar" style={mini? {width:150} : {width:0}}>
          <span id="button"
            onClick={toggleRightMini}
          >{mini? "=" : "+"}</span>
          <br></br>
      {mini? 
      <span>
      <div onClick={() => toggleIcons()}>{icons? "icons" : "names"}</div>
        <br></br>{     
        "you have:"
        }</span>
      : null}
      <br></br>
      <div id="inventory">
        {}        
      </div>
      {mini? inventory? 
      null : "nothing" : null}</div>
    </main>
  )
}


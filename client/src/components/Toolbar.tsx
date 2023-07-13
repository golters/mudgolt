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
} from "../../../events"
import {
  store,
} from "../store"
import {
  Markdown, 
} from "./Markdown"
import {
  Door, 
} from "../../../@types"
import {
  networkEmitter, 
} from "../network/events"
import { MESSAGE_MAX_LENGTH } from '../../../constants'
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
  {id: "music", chars:["👁","✈","✉","✐","∙"]},
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



export const Toolbar: React.FC = () => { 
  const [volume, setVolume] = useState(localStorage.volume*10)
  const [doors, setDoors] = useState<Door[] | null>(null)
  let [roomMap, setRoomMap] = useState<(string)[]>(rooms)
  let [event, setEvent] = useState<(string)>()
  const [muted, setMuted] = useState(!!localStorage.getItem("muted") || false)
  const [eye, setEye] = useState(false)
  const [plane, setPlane] = useState(false)
  const [letter, setLetter] = useState(false)
  const [pen, setPen] = useState(false)
  const [sound, setSound] = useState(false)
  const [glyphs, setGlyphs] = useState(false)
  const [alchemy, setAlchemy] = useState(false)
  const [secret, setSecret] = useState(false)
  const [form, setForm] = useState(false)
  const [table, setTable] = useState(false)
  const [help, setHelp] = useState(false)
  const [textLength, setTextLength] = useState(0)
  const input = useRef<HTMLDivElement>(null)

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
  if (Math.random() * 100000 < 1) {
    setAlchemy(false)
    setGlyphs(true)
  }
  if (Math.random() * 100000 < 1) {
    setGlyphs(false)
    setAlchemy(true)
  }

  localStorage.volume = volume/10
  localStorage.event = ""


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
            setAlchemy(true)
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

if(doors){
  doors.forEach(element => {
    roomMap.push(element.name)
  });
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
          >{alchemy ? "🜏" : glyphs ? "𓂀" : eye ? "🕶" : "👁"}</span>
          <span className ="tooltiptext">Look</span>
        </div>

          <div className="dropdown">
          <div className="tooltip">
          <span id= "button">{alchemy ? "🜟" : glyphs ? "𓊝" : plane ? "⛴" : "✈"}</span>
          <span className ="tooltiptext">Go</span>
          <div className="dropdown-content">
      {roomMap.map((log, key) => {
          return <span className= "sub-button" key={key} onClick={() => go(log)}>{log}</span>
      })}
      </div>
          </div>
        </div>

          <div className="pop-up">
          <div className="tooltip">
          <span id="button"
            onClick={toggleForm}
          >{alchemy ? "🝮" : glyphs ? "𓅃" : letter ? "🗑" : "✉"}</span>
          <span className ="tooltiptext">Post</span>
        </div>
        </div>
        
        <div className="popup">
          <div className="tooltip">
          <span id="button"
            onClick={toggleTable}
          >{alchemy ? "🜲" : glyphs ? "𓆄" : pen ? "🗡" : "✐"}</span>
          <span className ="tooltiptext">Palette</span>
        </div>
          {table ?
          <span className="popup-box">
          <div className="popup-content">
          {symbols.map((symbol, key) => {
              return <span className= "sub-button" key={key} onClick={() => setPalette(symbol.id)}>{symbol.id}</span>
          })}
          </div>
          <div className="popup-content">
          <br></br>
          {brushSymbols.map((symbol, key) => {
              return <span className= "palette" key={key} onClick={() => setBrush(symbol)}>{symbol}</span>
          })}
          </div></span> : ""}
        </div>


        <div className="popup">
          <div className="tooltip">
          <span id="button"
            onClick={toggleHelp}
          >{alchemy ? "🜌" : glyphs ? "𓁟" : "🛈"}</span>
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
          </div> : ""}
        </div>
        
          <div className="tooltip">
          <span id="button"
            onClick={toggleMute}
          >{alchemy ? "🜪" : glyphs ? muted ? <s>𓏢</s> : "𓏢" : sound ? muted ? <s>🕬</s> : "🕬" : muted ? <s>🎜</s> : "🎜"}</span>
          <span className ="tooltiptext">{muted ? "Unmute" : "Mute"}</span>
        </div>
        
        <div className="dropdown">
          <div className="tooltip">
          <span id= "button">{alchemy ? "🜾" : glyphs ? "𓁶" : "⚙"}</span>
          <span className ="tooltiptext">Settings</span>
          <div className="dropdown-content">
            Music Volume
  <input type="range" min="0" max="10" value={volume} className="slider" id="myRange" onChange={event => {
            setVolume(event.target.valueAsNumber)
          }}></input>
          <span>
            Themes<br></br>
            <div className="themes">
          {VALID_COLOR_THEMES.map((symbol, key) => {
              return <span className= "sub-button" property="background-color:red;" key={key} onClick={() => colorUtil.changeTheme(symbol)}>{symbol}</span>
          })}</div></span>
      </div>
          </div>
        </div>  
        <span id = "button"><p id = "countDown"></p></span>

        
        
      <div className ="title">
        <span id="title">MUDGOLT.COM</span>
      </div>   </div>
      <div className="secret">{secret ? "ᚴᚭ ᛓᛆᚴᚴ" : ""}</div>
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
          </div> : ""}   
    </main>
  )
}

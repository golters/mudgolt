import React, { useEffect, useRef, useCallback, useState } from "react"
import "./Toolbar.css"
import { sendEvent } from "../network"
import {
  LOOK_EVENT,
  DOOR_UPDATE_EVENT,
  GO_EVENT,
  MAKE_POST_EVENT,
  TOOLBAR_UPDATE_EVENT,
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
  {id: "plants", chars:["✿","❀","❁","❃","❋","✾","❦","❧","☙","☘","♣","♧","♠","♤","⚕","⚘","⚚","⚵","↑","↟","⯭","↡","෴"]},
  {id: "bricks", chars:["☲","☵","𒐪"]},
  {id: "characters", chars:["⛇","ඞ","𓃰","𓀠","𓀡","𓀁","𓅃"]},
  {id: "props", chars:["⚱","⛑","⛏","⛸","⛓","⛾","⛿","⛱","⛷","⚔","♰","♕","♔","♚","♛","☠","☎","☏",
  "✀","✂","✉","✎","✏","✐","✞","◷"]},
  {id: "vehicles", chars:["⛟","⛴","✈"]},
  {id: "water", chars:["⛆","﹏","〰","﹌","෴","𓆛","𓆜","𓆝","𓆞","𓆟"]},
  {id: "sky", chars:["☁","☀","★","☆","⛈","✦","✧","𓅛"]},
  {id: "bear", chars:["ﻌ","Ҁ","ҁ","⟟","⧪","ᴥ","ʔ","ʕ","ꮂ","㉨","ｴ","•","ᶘ","ᶅ"]},
  {id: "music", chars:["█","▓","▒","░","◆","◇","◈","◐","◑","◒","◓","★","☆","☀","☁","♠","♡","♣","♢"]},
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

export const Toolbar: React.FC = () => { 
  const [volume, setVolume] = useState(localStorage.volume*10)
  const [doors, setDoors] = useState<Door[] | null>(null)
  let [roomMap, setRoomMap] = useState<(string)[]>(rooms)
  const [muted, setMuted] = useState(!!localStorage.getItem("muted") || false)
  const [form, setForm] = useState(false)
  const [table, setTable] = useState(false)
  const [help, setHelp] = useState(false)
  const [textLength, setTextLength] = useState(0)
  const input = useRef<HTMLDivElement>(null)


  localStorage.volume = volume/10

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
    command = c.command + "\n"
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

  return (
    <main
      id="toolbar"
    >
          <div className="tooltip">
          <span id="button"
            onClick={look}
          >{"👁"}</span>
          <span className ="tooltiptext">Look</span>
        </div>

          <div className="dropdown">
          <div className="tooltip">
          <span id= "button">{"✈"}</span>
          <span className ="tooltiptext">Go</span>
          <div className="dropdown-content">
      {roomMap.map((log, key) => {
          return <span className= "sub-button" key={key} onClick={() => go(log)}>{log}<br></br></span>
      })}
      </div>
          </div>
        </div>
          <div className="popup">
          <div className="tooltip">
          <span id="button"
            onClick={toggleForm}
          >{"✉"}</span>
          <span className ="tooltiptext">Post</span>
        </div>
          {form ?
          <div className="popup-content">
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
        </div>
        
        <div className="popup">
          <div className="tooltip">
          <span id="button"
            onClick={toggleTable}
          >{"🖌"}</span>
          <span className ="tooltiptext">Palette</span>
        </div>
          {table ?
          <div className="popup-content">
          {symbols.map((symbol, key) => {
              return <span className= "sub-button" key={key} onClick={() => setPalette(symbol.id)}>{symbol.id}</span>
          })}
          <br></br>
          {brushSymbols.map((symbol, key) => {
              return <span className= "palette" key={key} onClick={() => setBrush(symbol)}>{symbol}</span>
          })}
          </div> : ""}
        </div>


        <div className="popup">
          <div className="tooltip">
          <span id="button"
            onClick={toggleHelp}
          >{"🛈"}</span>
          <span className ="tooltiptext">Help</span>
        </div>
          {help ?
          <div className="popup-content">
            <span className="wrap">
          {commands.map((symbol, key) => {
              return <span className= "sub-button" key={key} onClick={() => setHelpType(symbol.id)}>{symbol.id}</span>
          })}</span>
          <br></br>
          <span className="wrap">
          {helpCommands.map((symbol, key) => {
              return <span className= "sub-button" key={key} onClick={() => setCommand(symbol)}>{symbol}</span>
          })}</span>
          <br></br>
          <span className="wrap">
          {command}
          </span>
          </div> : ""}
        </div>
        
          <div className="tooltip">
          <span id="button"
            onClick={toggleMute}
          >{muted ? <s>𝅘𝅥𝅮</s> : "𝅘𝅥𝅮"}</span>
          <span className ="tooltiptext">{muted ? "Unmute" : "Mute"}</span>
        </div>
        
        <div className="dropdown">
          <div className="tooltip">
          <span id= "button">{"⚙"}</span>
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
        
      <div className ="title">
        <span id="title">MUDGOLT.COM</span>
      </div>      
    </main>
  )
}

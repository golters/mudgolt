import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  CHAT_EVENT,
  GO_EVENT,
  LOOK_AT_EVENT,
  LOOK_LOG_EVENT,
  TAKE_ITEM_EVENT,
} from "../../../../events"
import {
  Chat,
  Player, 
  Look,
  Item,
  Door,
} from "../../../../@types"
import {
  Markdown, 
} from "../../components/Markdown"
import { pushToLog } from "../../components/Terminal"
import React, { useEffect, useRef, useCallback, useState } from "react"
import { sendEvent } from "../../network"
import {
  newWhisperWindow
} from "../../components/windows"
import Username from "src/commands/username"
import { Color } from "src/commands/color"
import { colorUtil } from "src/utils"
import { itemRarity } from "../../../../constants"

//make new function to lookat item.id in future
function lookAt(player: string |undefined){
  sendEvent(LOOK_AT_EVENT, player)
}

function takeItem(item: Item){
  sendEvent(TAKE_ITEM_EVENT,item.name)
}

function goDoor(door: Door){
  sendEvent(GO_EVENT,door.name)
}

const handler: NetworkEventHandler = ({ bio, users, items, doors, event}: Look) => {

  pushToLog(
    <span className="look-message">
      {bio}
      <br></br>
      You see:
      <br></br>
      {users.map(username => 
      <span className="username"><div className = "chatdropdown">[{username}], <div className="chatdropdown-content">
      {<div onClick={() => lookAt(username)}>Look </div>} 
      {<div onClick={() => newWhisperWindow(username,null)}>Whisper</div>}</div></div></span>)}
      <br></br>
      {items.length > 0? 
      <span>on the floor is:
      <br></br>
      {items.map(item => 
      <span className="itemlook"><div className = "chatdropdown" id="test" 
      style={{color:itemRarity.find(R => R.num.toString() === item.rarity)?.col,
      backgroundColor:itemRarity.find(R => R.num.toString() === item.rarity)?.back,
      textShadow:itemRarity.find(R => R.num.toString() === item.rarity)?.shadow}}
      >{item.name}, <div className="chatdropdown-content">
      {<div onClick={() => lookAt(item.name)}>Look </div>}
      {<div onClick={() => takeItem(item)}>Take</div>} 
      </div></div></span>)}
      <br></br>
      </span>: <span>the floor is bare<br></br></span>
      }
      {doors.length > 0?
      <span>
      the exits are:
      <br></br>
      {doors.map(door => 
      <span className="doorlook"><div className = "chatdropdown" onClick={() => goDoor(door)}>{door.name}, <div className="chatdropdown-content">
      {<div onClick={() => goDoor(door)}>Go</div>} 
      </div></div></span>)}
      </span>:<span>there are no exits</span>}
      <br></br>
      {event}
    </span>
  )
}

networkEmitter.on(LOOK_LOG_EVENT, handler)

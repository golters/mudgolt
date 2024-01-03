import "./index.css"

import {
  cryptoTask, 
} from "./crypto"
import {
  pushToLog,
  Terminal, 
} from "./components/Terminal"
import {
  networkTask, sendEvent, 
} from "./network"
import {
  Header, 
} from "./components/Header"
import {
  Toolbar,
} from "./components/Toolbar"
import {
  Welcome,
} from "./components/Welcome"
import "./commands"

import React from "react"
import ReactDOM from "react-dom"
import { EVENT_EVENT } from "../../events"
navigator.storage.persist().catch(console.error)
ReactDOM.render(
  <>
    
    <Toolbar />
    <Header />
    <Terminal />
  </>, 
  document.body
)

const startMessages: string[] = [
  "Leave your shoes at the door.",
  "Mudgolt stands for Multi User Dungeon... The other four letters represent a secret blend of herbs and spices for legal reasons I am unable to share.",
  "Mudgolt was invented in 1972 in an attempt to communicate with multi dimensional beings. But it turned out to be the ultimate tool for humans to communicate too!",
  "This version of Mudgolt was discovered on a floppy disk in a yard sale in 1986. It was later uploaded to the internet in the 2020s.",
  "Somebody loves you.",
  "This is the real metaverse"
]

const init = async () => {
  await cryptoTask()
  await networkTask()
  
  console.log("Client started")

  const randomMessage = startMessages[Math.floor(Math.random() * startMessages.length)]
  pushToLog(/* html */`Welcome to MUDGOLT! <small>${randomMessage}</small>`)
  // pushToLog(/* html */`Want to contribute? https://github.com/golters/mudgolt`)
  pushToLog(/* html */`Type <code>/help</code> for a list of commands.`)
  sendEvent(EVENT_EVENT,"/event check")
  
}

init().catch(console.error)

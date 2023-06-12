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

ReactDOM.render(
  <>
    <Welcome />
    <Toolbar />
    <Header />
    <Terminal />
  </>, 
  document.body
)

const init = async () => {
  await cryptoTask()
  await networkTask()
  
  console.log("Client started")

  pushToLog(/* html */`Welcome to MUDGOLT! <small>Leave your shoes at the door.</small>`)
  // pushToLog(/* html */`Want to contribute? https://github.com/golters/mudgolt`)
  pushToLog(/* html */`Type <code>/help</code> for a list of commands.`)
  sendEvent(EVENT_EVENT,"/event check")
  
}

init().catch(console.error)

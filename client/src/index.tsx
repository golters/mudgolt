import "./index.css"

import {
  cryptoTask, 
} from "./crypto"
import {
  pushToLog,
  Terminal, 
} from "./components/Terminal"
import {
  networkTask, 
} from "./network"
import {
  Header, 
} from "./components/Header"
import "./commands"

import React from "react"
import ReactDOM from "react-dom"

ReactDOM.render(
  <>
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
}

init().catch(console.error)

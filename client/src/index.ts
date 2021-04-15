import "./index.css"

import { cryptoTask } from "./crypto"
import { Terminal } from "./components/Terminal"
import { commandEmitter } from "./commands"
import { LOG_EVENT } from "../../events"
import { networkTask } from './network'
import { Header } from "./components/Header"

const welcome = `
----- Welcome to MUDGOLT -----

 leave your shoes at the door

------------------------------
`

const init = async () => {
  document.body.appendChild(Header())

  await cryptoTask()
  await networkTask()
  
  console.log("Client started")

  document.body.appendChild(Terminal())

  commandEmitter.emit(LOG_EVENT, welcome.trim() + '\n')
}

init()

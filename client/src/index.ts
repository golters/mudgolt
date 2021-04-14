import "./index.css"

import { cryptoTask } from "./crypto"
import { Terminal } from "./components/Terminal"
import { commandEmitter } from "./commands"
import { LOG_EVENT } from "../../events"
import { networkTask } from './network'

const welcome = `
----- Welcome to MUDGOLT -----
   never gonna give you up
   never gonna let you down
------------------------------
`

const init = async () => {
  await cryptoTask()
  await networkTask()
  
  console.log("Client started")

  document.body.appendChild(Terminal())

  commandEmitter.emit(LOG_EVENT, welcome.trim() + '\n\n')
}

init()

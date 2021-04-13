import "./index.css"

import { cryptoTask } from "./crypto"
import { Terminal } from "./components/Terminal"
import { commandEmitter } from "./commands"
import { LOG_EVENT } from "../../events"

const welcome = `
----- Welcome to MUDGOLT -----
   never gonna give you up
   never gonna let you down
------------------------------
`

cryptoTask.then(async () => {
  await import('./network')
  
  console.log("Client started")

  document.body.appendChild(Terminal())

  commandEmitter.emit(LOG_EVENT, welcome.trim() + '\n\n')
})

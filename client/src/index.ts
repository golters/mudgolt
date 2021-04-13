import "./index.css"

import { cryptoTask } from "./crypto"
import { Terminal } from "./components/Terminal"

cryptoTask.then(async () => {
  await import('./network')
  
  const { log } = await import('./logs')

  log("Client started")

  document.body.appendChild(Terminal())
})

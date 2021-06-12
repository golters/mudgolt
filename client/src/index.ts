import "./index.css"

import {
  cryptoTask, 
} from "./crypto"
import {
  logSimple,
  Terminal, 
} from "./components/Terminal"
import {
  networkTask, 
} from "./network"
import {
  Header, 
} from "./components/Header"

const init = async () => {
  document.body.appendChild(Header())

  await cryptoTask()
  await networkTask()
  
  console.log("Client started")

  document.body.appendChild(Terminal())

  logSimple("Welcome to MUDGOLT! <small>Leave your shoes at the door.</small>")
  logSimple("Want to contribute? https://github.com/golters/mudgolt")
  logSimple("Type <code>help</code> for a list of commands.")
}

init()

import { sendEvent } from "../network"
import { CHAT_EVENT, INPUT_EVENT } from "../../../events"
import { commandEmitter } from "./emitter"
import Roll from './roll';

const commandModules = [
  Roll
]

commandEmitter.on(INPUT_EVENT, (input) => {
  const [command, ...args] = input.split(" ")

  for (const module of commandModules) {
    if (module.command === command) {

      module.callback({ args, input })

      return
    }
  }
  
  sendEvent(CHAT_EVENT, input)
})

export * from "./emitter"

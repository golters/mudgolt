import {
  sendEvent, 
} from "../network"
import {
  CHAT_EVENT, INPUT_EVENT, 
} from "../../../events"
import {
  commandEmitter, 
} from "./emitter"
import Roll from './roll';
import {
  MakeRoom, 
} from "./makeRoom"

const commandModules = [
  Roll,
  MakeRoom,
]

commandEmitter.on(INPUT_EVENT, (input) => {
  for (const module of commandModules) {
    if (new RegExp(module.command, "i").test(input)) {
      const args = input.replace(new RegExp(module.command + '\\s?', "i"), '').split(" ")

      module.callback({
        args,
        input, 
      })

      return
    }
  }
  
  sendEvent(CHAT_EVENT, input)
})

export * from "./emitter"

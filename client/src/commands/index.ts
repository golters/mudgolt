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
import {
  Go,
} from "./go"

const commandModules = [
  Roll,
  MakeRoom,
  Go,
]

commandEmitter.on(INPUT_EVENT, (input) => {
  for (const module of commandModules) {
    if (new RegExp(`\\b${module.command}\\b\\s?`, "i").test(input)) {
      const args = input.replace(new RegExp(`\\b${module.command}\\b\\s?`, "i"), '').split(" ")

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

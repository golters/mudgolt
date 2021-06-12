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
    const commandRegex = new RegExp(`^${module.command}\\b\\s?`, "i")

    if (commandRegex.test(input)) {
      const args = input.replace(commandRegex, '').split(" ")

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

import {
  sendEvent, 
} from "../network"
import {
  CHAT_EVENT, 
  INPUT_EVENT, 
  LOG_EVENT,
} from "../../../events"
import {
  commandEmitter, 
} from "./emitter"
import Roll from './roll'
import {
  MakeRoom, 
} from "./makeRoom"
import {
  Go,
} from "./go"
import {
  MESSAGE_MAX_LENGTH, 
} from "../../../constants"
import {
  LogItem,
} from "../components/Terminal"
import {
  Help, 
} from "./help"

export const commandModules = [
  Roll,
  MakeRoom,
  Go,
  Help,
]

commandEmitter.on(INPUT_EVENT, (input) => {
  if (input.length > MESSAGE_MAX_LENGTH) {
    const errorItem = LogItem(`Message must not be longer than ${MESSAGE_MAX_LENGTH} characters.`)
    errorItem.classList.toggle("error-message")

    commandEmitter.emit(LOG_EVENT, errorItem)
  }

  for (const module of commandModules) {
    const commandRegex = new RegExp(`^${module.command}(\\b\\s?|$)`, "i")

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

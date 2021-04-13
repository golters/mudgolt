import { sendEvent } from "./network"
import { CHAT_EVENT, INPUT_EVENT, LOG_EVENT } from "../../events"

import Emitter from "events"
import { ErrorMessage } from "./components/terminal"

export const commandEmitter = new Emitter()

commandEmitter.on(INPUT_EVENT, (input) => {
  const [command, ...args] = input.split(" ")

  if (false) {
  } else {
    sendEvent(CHAT_EVENT, input)
  }
})

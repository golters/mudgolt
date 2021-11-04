import {
  USERNAME_CHANGE_EVENT,
} from "../../../events"
import { pushErrorToLog } from "../components/Terminal"
import {
  sendEvent,
} from "../network"
import {
  CommandModule,
} from "./emitter"

const Username: CommandModule = {
  command: "username",
  syntax: "username [new username]",
  aliases: ["name", "nick", "nickname"],

  callback({ args }) {
    const [nickname] = args

    if (!nickname) {
      pushErrorToLog(`Syntax: ${Username.syntax}`)

      return
    }

    sendEvent(USERNAME_CHANGE_EVENT, nickname.trim())
  },
}

export default Username

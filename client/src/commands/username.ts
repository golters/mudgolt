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
  cost: "1 per changed character",
  bio: "change your username. If the name is already taken you can claim it after a week, this will cause the old account to drop all it's items in the last room it was in",

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

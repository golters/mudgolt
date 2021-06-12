import {
  sendEvent,
} from "../network"
import {
  CHAT_EVENT, INPUT_EVENT, LOG_EVENT,
} from "../../../events"
import {
  commandEmitter,
} from "./emitter"
import Roll from "./roll"
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
import Nick from "./username"

export const commandModules = [
  Roll,
  MakeRoom,
  Go,
  Help,
  Nick,
]

function findCommand(nameOrAlias: string) {
  return commandModules.find(
    (cmd) =>
      cmd.command.toLowerCase() === nameOrAlias.toLowerCase() ||
      cmd.aliases?.map((alias) => alias.toLowerCase()).includes(nameOrAlias),
  )
}

function parseArgs(command: string, input: string) {
  return input
    .replace(command, "")
    .trim()
    .split(" ")
    .map((arg) => arg.trim())
    .filter((arg) => arg !== "")
}

commandEmitter.on(INPUT_EVENT, (input) => {
  if (input.length > MESSAGE_MAX_LENGTH) {
    const errorItem = LogItem(
      `Message must not be longer than ${MESSAGE_MAX_LENGTH} characters.`,
    )
    errorItem.classList.toggle("error-message")

    commandEmitter.emit(LOG_EVENT, errorItem)
  }

  const commandName = input.trim().split(" ")[0]
  const command = findCommand(commandName)
  const args = parseArgs(commandName, input)

  if (command) {
    return command.callback({
      args,
      input,
    })
  }

  sendEvent(CHAT_EVENT, input)
})

export * from "./emitter"

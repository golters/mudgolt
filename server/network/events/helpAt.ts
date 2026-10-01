import {
  type NetworkEventHandler,
  networkEmitter,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
import {
  HELP_AT_EVENT,
  LOG_EVENT,
  ERROR_EVENT,
} from "../../../events.ts"
import type {
  CommandModule, 
} from "../../../client/src/commands/emitter.ts"
import{
  GOLT,
  DOOR_COST,
  DOOR_MULTIPLIER,
}from "../../../constants.ts"
import{
  getDoorByRoom,
} from "../../services/door.ts"


const handler: NetworkEventHandler = async (socket, command: CommandModule) => {
  try {
    let message = command.command 
    if(command.cost){
      message = message + " " + GOLT + command.cost
    }
    message = message + "\n"
    message = message + command.bio + "\n"
    if(command.aliases){
      message = message + "you can also use: " + command.aliases
    }
    sendEvent<string>(socket, LOG_EVENT, message)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(HELP_AT_EVENT, handler)

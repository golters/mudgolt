import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  HELP_AT_EVENT,
  LOG_EVENT,
  ERROR_EVENT,
} from "../../../events"
import {
  CommandModule, 
} from "../../../client/src/commands/emitter"
import{
  GOLT,
  DOOR_COST,
  DOOR_MULTIPLIER,
}from "../../../constants"
import{
  getDoorByRoom,
} from "../../services/door"


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
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(HELP_AT_EVENT, handler)

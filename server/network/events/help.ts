import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  HELP_EVENT,
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


const handler: NetworkEventHandler = async (socket, commands: CommandModule[], player) => {
  try {
    let list = "<u>Command list</u>\n"
    for (let c = 0; c < commands.length; c++){
      list = list + "/" + commands[c].syntax
      if(commands[c].command === "makedoor"){
        const doors = await getDoorByRoom(player.roomId)
        const cost = DOOR_COST + (DOOR_COST * DOOR_MULTIPLIER * doors.length) 
        list = list + " " + GOLT + cost + " +" + GOLT + "1 per character"
      }else
      if(commands[c].cost){
        list = list + " " + GOLT + commands[c].cost
      }
      list = list + "\n"
    }
    sendEvent<string>(socket, LOG_EVENT, list)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(HELP_EVENT, handler)

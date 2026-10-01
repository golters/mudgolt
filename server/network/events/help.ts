import {
  type NetworkEventHandler,
  networkEmitter,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
import {
  HELP_EVENT,
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
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(HELP_EVENT, handler)

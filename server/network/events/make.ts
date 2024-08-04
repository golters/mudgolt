import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  MAKE_EVENT,
  SERVER_LOG_EVENT,
  INVENTORY_UPDATE_EVENT,
} from "../../../events"
import {
  broadcastToRoom,
  sendEvent,
} from "../../network"
import {
  createDoor,
  getDoorByRoom,
} from "../../services/door"
import {
  getRoomByName, makeFullRoom,
} from "../../services/room"
import {
  takePlayerGolts,
  getInvByPlayer,
} from "../../services/player"
import {
  DOOR_COST,
  DOOR_MULTIPLIER,
  GOLT,
  DOOR_MAX_NAME,
  ITEM_COST,
  ROOM_COST,
  ITEM_MAX_NAME,
  ROOM_MAX_NAME,
} from "../../../constants"
import {
  getCurrentEvent,
  getBearName,
} from "../../services/event"
import {
  Item,
} from "../../../@types"
import { makeFullItem } from "../../services/item"

const handler: NetworkEventHandler = async (socket, args: string[], player) => {
  try { 
    const [type, nameInput, description, macro] = args
    sendEvent<string>(socket, SERVER_LOG_EVENT, `type ${type} name ${nameInput} desc ${description} macro ${macro}`)
    const name = nameInput.replace(/\s/g, "_")
    let cost = 1
    let username = player.username
    const event = await getCurrentEvent(Date.now())   
    if(event){
      switch (event.type){
        case "Bear_Week":
          const bearname = await getBearName(event.id, player.id)
          if(bearname){
            username = bearname
          }

          break;
      }
    }
    switch(type){
      case "item":      
        cost = name.length + ITEM_COST
        let desc = description
        if(!description){
          desc = `a ${name}`
        }else{          
          cost = cost + description.length
        }
        let mac = macro
        if(!macro){
          mac = ""
        }else{
          cost = cost + macro.length
        }
        if (name.length > ITEM_MAX_NAME) throw new Error(`Room name must not be greater than ${ITEM_MAX_NAME} characters`)
        if (player.golts <= cost) throw new Error(`you need ${GOLT}${cost}`)
        await makeFullItem(player.id, name, desc, mac) 
        await takePlayerGolts(player.id, cost)
        sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
        sendEvent<string>(socket, SERVER_LOG_EVENT, `you created a ${name}`)
        const inv = await getInvByPlayer(player.id)
        sendEvent<Item[]>(socket, INVENTORY_UPDATE_EVENT, inv)

        break;
      case "room":
        cost = name.length + ROOM_COST
        let roomdesc = description
        if(!description){
          roomdesc = `a ${name}`
        }else{          
          cost = cost + description.length
        }
        if (name.length > ROOM_MAX_NAME) throw new Error(`Room name must not be greater than ${ROOM_MAX_NAME} characters`)
        if (player.golts <= cost) throw new Error(`you need ${GOLT}${cost}`)
        await makeFullRoom(name, roomdesc)
        await takePlayerGolts(player.id, cost)
        sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
        sendEvent<string>(socket, SERVER_LOG_EVENT, `Created room ${name}`)
      case "door":
        const roomID = player.roomId
        const doors = await getDoorByRoom(roomID)
        cost = DOOR_COST + (DOOR_COST * DOOR_MULTIPLIER * doors.length) + name.length
        if (name.length > DOOR_MAX_NAME) throw new Error(`Room name must not be greater than ${DOOR_MAX_NAME} characters`)
        if (player.golts <= cost) throw new Error(`you need ${GOLT}${cost}`)
        const targetRoom = await getRoomByName(description)
        const targetID = targetRoom.id
        await createDoor(roomID, targetID, name)
        await takePlayerGolts(player.id, cost)
        sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)     
        broadcastToRoom<string>(SERVER_LOG_EVENT, `${username} Created door ${name} to ${description}`, player.roomId)
        //update banner
        break;
      case "lockeddoor":

        break;
      case "hiddendoor":

        break;
      case "key":

        break;
      default:
        sendEvent<string>(socket, ERROR_EVENT, "you try, but you can't make one of those")
        
        return;
    } 
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}


networkEmitter.on(MAKE_EVENT, handler)

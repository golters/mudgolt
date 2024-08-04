import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  broadcastToRoom, sendEvent, 
} from ".."
import {
  USERNAME_CHANGE_EVENT, SERVER_LOG_EVENT, ERROR_EVENT, 
} from "../../../events"
import {
  Player, 
} from "../../../@types"
import {
  USERNAME_MAX_LENGTH, 
  GOLT,
} from "../../../constants"
import {
  setPlayerUsername, 
  takePlayerGolts,
} from "../../services/player"
import {
  countCharacters, 
} from "../../services/chat"
import {
  getBearName,
  getCurrentEvent,
} from "../../services/event"

const handler: NetworkEventHandler = async (
  socket,
  username: string,
  player: Player,
) => {
  try {
    const oldUsername = player.username
    const event = await getCurrentEvent(Date.now())

    if (username.length > USERNAME_MAX_LENGTH) {
      throw new Error(`Username must not be greater than ${USERNAME_MAX_LENGTH} characters`)
    }

    const newUsername = username.replace(/\s/g, "_")
    const cost = await countCharacters(newUsername, oldUsername, USERNAME_MAX_LENGTH)

    if (cost >= player.golts) {
      throw new Error(`you need ${GOLT}${cost}`)
    }

    await takePlayerGolts(player.id, cost)
    sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)

    if(event?.type === "Bear_Week"){
      sendEvent<string>(socket, SERVER_LOG_EVENT, "you are stuck as a bear and cannot change")        
    }else{
      broadcastToRoom<string>(
        SERVER_LOG_EVENT,
        `${oldUsername} is now known as ${newUsername}`, 
        player.roomId,
      )
      await setPlayerUsername(player.id, newUsername)
    }

  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(USERNAME_CHANGE_EVENT, handler)

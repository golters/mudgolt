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
} from "../../../constants"
import {
  setPlayerUsername, 
} from "../../services/player"

const handler: NetworkEventHandler = (
  socket,
  username: string,
  player: Player,
) => {
  try {
    const oldUsername = player.username

    if (username.length > USERNAME_MAX_LENGTH) {
      throw new Error(
        `Username must not be greater than ${USERNAME_MAX_LENGTH} characters`,
      )
    }

    username = username.replace(/\s/g, "_")

    setPlayerUsername(player.id, username)

    broadcastToRoom<string>(
      SERVER_LOG_EVENT,
      `${oldUsername} is now known as ${username}`,
      player.roomId,
    )
  } catch (error) {
    sendEvent(socket, ERROR_EVENT, error.message)
  }
}

networkEmitter.on(USERNAME_CHANGE_EVENT, handler)

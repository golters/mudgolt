import { networkEmitter, NetworkEventHandler } from "./emitter"
import { broadcastToRoom } from "../"
import { RANDOM_EVENT, SERVER_LOG_EVENT } from "../../../events"

const handler: NetworkEventHandler = (socket, max: number, player) => {
  const result = Math.floor(Math.random() * max)

  broadcastToRoom(SERVER_LOG_EVENT, `${player.username} rolled ${result}`, player.room)
}

networkEmitter.on(RANDOM_EVENT, handler)

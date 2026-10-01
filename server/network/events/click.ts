import {
  type NetworkEventHandler,
  networkEmitter,
} from "./emitter.ts"
import {
  sendEvent,
  broadcastToUser,
} from "../index.ts"
import {
  CLICK_EVENT,
  ERROR_EVENT,
  SERVER_LOG_EVENT,
  NOTIFICATION_EVENT,
} from "../../../events.ts"
import {
  findGameByPlayer,
  chessClick,
} from "../../services/game.ts"
import {
  BANNER_WIDTH, 
} from "../../../constants.ts"

const handler: NetworkEventHandler = async (socket, point: [number, number], player) => {
  try {
    const [x, y] = point
    const game = await findGameByPlayer(player.id)
    if(game.type === "chess"){
      await chessClick(x,y, player, game)
    }
    broadcastToUser<string>(NOTIFICATION_EVENT, "pop", player.username);
  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(CLICK_EVENT, handler)

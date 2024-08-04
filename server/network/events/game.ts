import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  broadcastToUser,
  sendEvent,
  online,
} from ".."
import {
  GAME_EVENT,
  SERVER_LOG_EVENT,
  ERROR_EVENT,
  LOG_EVENT,
  NOTIFICATION_EVENT,
  GAME_UPDATE_EVENT,
  BANNER_UPDATE_EVENT,
  ROOM_UPDATE_EVENT,
} from "../../../events"
import {
  Player,
  Room,
} from "../../../@types"
import {
  getPlayerById,
  getPlayerByUsername,
} from "../../services/player"
import {
  insertWhisper,
} from "../../services/chat"
import {
  endGame,
  findGameByPlayer,
} from "../../services/game"
import {
  getRoomById,
} from "../../services/room"

const handler: NetworkEventHandler = async (
  socket,
  input: string[],
  player: Player,
) => {
  try {   
    const game = await findGameByPlayer(player.id)

    switch(input[0]){
      case "game":
        const p1 = await getPlayerById(player.id)
        if(p1){
          broadcastToUser(GAME_UPDATE_EVENT, game, p1?.username)
          broadcastToUser<string>(BANNER_UPDATE_EVENT, "game", p1.username); 
          const room = await getRoomById(p1.roomId)
          broadcastToUser<Room>(ROOM_UPDATE_EVENT, room, p1.username)
        }

        return;

      case "leave":
        if(game.player1){
          const p1 = await getPlayerById(game.player1)
          if(p1){
            broadcastToUser(GAME_UPDATE_EVENT, null, p1?.username)
            const message = player.username + " left the game"
            await insertWhisper(p1?.id, player.id, message, Date.now())
            broadcastToUser<string>(SERVER_LOG_EVENT, message, p1.username); 
            broadcastToUser<string>(NOTIFICATION_EVENT, "doorExit", p1.username); 
            broadcastToUser<string>(BANNER_UPDATE_EVENT, "art", p1.username); 
            const room = await getRoomById(p1.roomId)
            broadcastToUser<Room>(ROOM_UPDATE_EVENT, room, p1.username)
          }
        }
        if(game.player2){
          const p2 = await getPlayerById(game.player2)
          if(p2){
            broadcastToUser(GAME_UPDATE_EVENT, null, p2?.username)
            const message = player.username + " left the game"
            await insertWhisper(p2?.id, player.id, message, Date.now())
            broadcastToUser<string>(SERVER_LOG_EVENT, message, p2.username); 
            broadcastToUser<string>(NOTIFICATION_EVENT, "doorExit", p2.username); 
            broadcastToUser<string>(BANNER_UPDATE_EVENT, "art", p2.username); 
            const room = await getRoomById(p2.roomId)
            broadcastToUser<Room>(ROOM_UPDATE_EVENT, room, p2.username)
          }
        }
        if(game.player3){
          const p3 = await getPlayerById(game.player3)
          if(p3){
            broadcastToUser(GAME_UPDATE_EVENT, null, p3?.username)
            const message = player.username + " left the game"
            await insertWhisper(p3?.id, player.id, message, Date.now())
            broadcastToUser<string>(SERVER_LOG_EVENT, message, p3.username); 
            broadcastToUser<string>(NOTIFICATION_EVENT, "doorExit", p3.username); 
            broadcastToUser<string>(BANNER_UPDATE_EVENT, "art", p3.username); 
            const room = await getRoomById(p3.roomId)
            broadcastToUser<Room>(ROOM_UPDATE_EVENT, room, p3.username)
          }
        }
        if(game.player4){
          const p4 = await getPlayerById(game.player4)
          if(p4){
            broadcastToUser(GAME_UPDATE_EVENT, null, p4?.username)
            const message = player.username + " left the game"
            await insertWhisper(p4?.id, player.id, message, Date.now())
            broadcastToUser<string>(SERVER_LOG_EVENT, message, p4.username); 
            broadcastToUser<string>(NOTIFICATION_EVENT, "doorExit", p4.username); 
            broadcastToUser<string>(BANNER_UPDATE_EVENT, "art", p4.username); 
            const room = await getRoomById(p4.roomId)
            broadcastToUser<Room>(ROOM_UPDATE_EVENT, room, p4.username)
          }
        }
        await endGame(game.id)      

        return;
      default:
        broadcastToUser<string>(SERVER_LOG_EVENT,"Game [leave]", player.username); 

        return;
    }
    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(GAME_EVENT, handler)

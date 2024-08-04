import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  broadcastToUser,
  sendEvent,
  online,
} from ".."
import {
  INVITE_EVENT,
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
  getInvByPlayer,
  getPlayerById,
  getPlayerByUsername,
} from "../../services/player"
import {
  insertWhisper,
} from "../../services/chat"
import {
  sendInvite,
  acceptInvite,
  closeInvite,
  findInviteByPlayer,
  findOpenInvites,
} from "../../services/invite"
import {
  getGameByInvite,
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
    let type = input[0]
    if(input.length > 1){
      let name = input[1]
      let game = input[2]
      if(type !== "accept" && type !== "decline" && type !== "send" && type !== "check"){
        type = "send"
        name = input[0]
        game = input[1]
      }
      const user = await getPlayerByUsername(name)
      if (!user) {
        sendEvent<string>(socket, ERROR_EVENT, "User does not exist")
  
        return
      }
      if(user.username === player.username){      
        sendEvent<string>(socket, SERVER_LOG_EVENT, "Don't play with yourself, you'll go blind")
  
        return
      }
      if (type !== "accept" && type !== "decline") {
        if(game !== "chess"){
          sendEvent<string>(socket, SERVER_LOG_EVENT, "unknown game type")
  
          return
        }
        if(!game){
          sendEvent<string>(socket, SERVER_LOG_EVENT, "game unspecified")
  
          return
        }
      }
      let onlinecheck = false
      let invite = await findInviteByPlayer(user.id, player.id)
      let player1 = await getPlayerById(player.id)
      let player2 = await getPlayerById(player.id)
      if(type !== "send"){
        if(!invite) {
          if(type === "decline"){
            invite = await findInviteByPlayer(player.id, user.id)
          }
          if(!invite){
            sendEvent<string>(socket, ERROR_EVENT, "could not find invite")
      
            return
          }
        }
        player1 = await getPlayerById(invite.player1)
        player2 = await getPlayerById(invite.player2)
        
      }

      switch(type){
        case "send":
          online.forEach(element => {      
            if(element.player.username === user.username){
              sendEvent<string>(socket, SERVER_LOG_EVENT, "you invited '" + name + "' to " + game)
              broadcastToUser<string>(SERVER_LOG_EVENT, player.username + " invited you to " + game, name); 
              broadcastToUser<string>(NOTIFICATION_EVENT, "whisper", name); 
              onlinecheck = true
      
              return     
            }
          });
             
          if(onlinecheck === false){
            sendEvent<string>(socket, SERVER_LOG_EVENT, name + " is not online but you invited them to " + game)
          }
          const message = "invitation to play " + game
      
          await insertWhisper(user.id, player.id, message, Date.now())
          await sendInvite(player.id, user.id, game)
  
          return;
        case "accept":
          if(player2 && player1){
            let other = player1.username
            if(other === player.username){
              other = player2.username
            }
            broadcastToUser<string>(SERVER_LOG_EVENT, player.username + " accepted to play " + invite.type, other); 
            broadcastToUser<string>(SERVER_LOG_EVENT, "you accepted to play " + invite.type + " with " + other, player.username); 
          }
          await acceptInvite(invite)
          const newGame = await getGameByInvite(invite)

          if(newGame.player1){
            const p1 = await getPlayerById(newGame.player1)
            if(p1){
              broadcastToUser(GAME_UPDATE_EVENT, newGame, p1?.username)
              broadcastToUser<string>(NOTIFICATION_EVENT, "doorEnter", p1.username); 
              broadcastToUser<string>(BANNER_UPDATE_EVENT, "game", p1.username); 
              const room = await getRoomById(p1.roomId)
              broadcastToUser<Room>(ROOM_UPDATE_EVENT, room, p1.username)
            }
          }
          if(newGame.player2){
            const p2 = await getPlayerById(newGame.player2)
            if(p2){
              broadcastToUser(GAME_UPDATE_EVENT, newGame, p2?.username)
              broadcastToUser<string>(NOTIFICATION_EVENT, "doorEnter", p2.username); 
              broadcastToUser<string>(BANNER_UPDATE_EVENT, "game", p2.username); 
              const room = await getRoomById(p2.roomId)
              broadcastToUser<Room>(ROOM_UPDATE_EVENT, room, p2.username)
            }
          }
  
          return;
        case "decline":
          await closeInvite(invite)
          if(player2 && player1){
            let other = player1.username
            if(other === player.username){
              other = player2.username
            }
            broadcastToUser<string>(SERVER_LOG_EVENT, player.username + " declined to play " + invite.type, other); 
            broadcastToUser<string>(SERVER_LOG_EVENT, "you declined to play " + invite.type + " with " + other, player.username); 
          }

          return;
        default:          
          sendEvent<string>(socket, ERROR_EVENT, "Invite [send/accept/check] [user] [game]")
          
          return;
      }
    }else if (input[0] === "check"){
      const invites = await findOpenInvites(player.id)
      let invs = ""
      for (let i = 0; i < invites.length; i++) {
        if(invites[i].player1 === player.id){
          const other = await getPlayerById(invites[i].player2)
          invs = invs + "you invited " + other?.username + " to play " + invites[i].type
        }else{
          const other = await getPlayerById(invites[i].player1)
          invs = invs + other?.username + " invited you to play " + invites[i].type
        }
        if(i < invites.length - 1){
          invs = invs + ", "
        }
      }
      broadcastToUser<string>(SERVER_LOG_EVENT, invs, player.username); 
    }else{
      sendEvent<string>(socket, ERROR_EVENT, "Invite [send/accept/check] [user] [game]")
    }
    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(INVITE_EVENT, handler)

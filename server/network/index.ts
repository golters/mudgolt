import WebSocket from "ws"
import {
  networkEmitter, 
} from "./events"
import querystring from "querystring"
import {
  getRoomById,
} from "../services/room"
import {
  findOrCreatePlayer,
} from "../services/player"
import {
  insertRoomCommand,
} from "../services/chat"
import {
  Player, Room, 
} from "../../@types"
import {
  AUTH_EVENT, ERROR_EVENT, PLAYER_EVENT, ROOM_UPDATE_EVENT, SERVER_LOG_EVENT, NOTIFICATION_EVENT,
} from "../../events"
import {
  createVerify, createPublicKey, 
} from "crypto"

const PORT = Number(process.env.PORT) || 1234

export const server = new WebSocket.Server({
  port: PORT,
})

export const broadcast = <TPayload> (code: string, payload: TPayload) => {
  online.forEach(({ socket }) => {
    sendEvent(socket, code, payload)
  })

  console.log(`[${code}]`, payload)
}

export const broadcastToRoom = <TPayload> (code: string, payload: TPayload, roomId: number) => {
  online.forEach(({ socket, player }) => {
    if (player.roomId !== roomId) return

    sendEvent(socket, code, payload)
  })

  console.log(`[${code}]`, `[ROOM: ${roomId}]`, payload)
}

export const broadcastToUser = <TPayload> (code:string, payload: TPayload, playerName: string) => {
  online.forEach(({ socket, player }) => {
    if (player.username !== playerName) return

    sendEvent(socket, code, payload)
  })

  console.log(`[${code}]`, `[PLAYER: ${playerName}]`, payload)
}

export const sendEvent = <TPayload> (socket: WebSocket, code: string, payload: TPayload) => {
  socket.send(JSON.stringify({
    code,
    payload,
  }))
}

export const online: {
  socket: WebSocket
  player: Player
}[] = []

export const recentOnline: {
  player: Player
  lastPinged: number
}[] = []


server.on("connection", (socket, request) => {
  console.log("Socket connected to server")

  const publicKey = decodeURIComponent(querystring.parse(request.url!)["/ws?public-key"] as string)
  let player: Player
  let authenticated = false
  const challenge = String(Math.random())

  socket.on("message", async (data: string) => {
    try {
      const { code, payload } = JSON.parse(data) as {
        code: string
        payload: unknown
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[${code}]`, payload)
      }
  
      if (code === AUTH_EVENT) {
        const verify = createVerify("SHA256")
        verify.update(challenge)
        verify.end()
  
        const signature = payload as string
  
        const pem = createPublicKey(`-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`)
  
        if (verify.verify(pem, signature, "base64")) {
          
          authenticated = true
  
          player = await findOrCreatePlayer(publicKey)

          const room = await getRoomById(player.roomId) as Room

          const lastPinged = Date.now()

          sendEvent(socket, PLAYER_EVENT, player)
          sendEvent(socket, ROOM_UPDATE_EVENT, room)

          let onlinecheck = false
          online.forEach(element => {      
            if(element.player.publicKey === player.publicKey){
              onlinecheck = true
            }        
          });
          if(onlinecheck === false){
            online.push({
              socket,
              player,
            })       
            let recentcheck = false
            recentOnline.forEach(element => {      
              if(element.player.publicKey === player.publicKey){
                recentcheck = true
              }        
            });
            if(recentcheck === false){
              recentOnline.push({
                player,
                lastPinged,
              })
              const room = await getRoomById(player.roomId)
              broadcastToRoom(SERVER_LOG_EVENT, `${player.username} is now online`, player.roomId)
              broadcastToRoom(NOTIFICATION_EVENT, "online", player.roomId); 
              broadcastToRoom(SERVER_LOG_EVENT, `${player.username} has joined ${room.name}`, player.roomId)
            }
          }
        } else {
          sendEvent(socket, ERROR_EVENT, "Invalid signature")
        }
      }
  
      if (authenticated) {
        networkEmitter.emit(code as unknown as string, socket, payload, player)
      }
    } catch (error) {
      console.error(error)
    }
  })

  sendEvent(socket, AUTH_EVENT, challenge)

  socket.on("close", () => {
    console.log("Socket disconnected from server")
    socket.close()
    //VVV this line crashes the server when refresh on firefox
    //broadcastToUser(SERVER_LOG_EVENT, "you went offline", player.username)
    online.splice(online.findIndex(({ player }) => player.publicKey === publicKey), 1)

    socket.terminate()
  })
})

setInterval((publicKey) => {
  recentOnline.forEach(p => {
    if(p.player.publicKey === publicKey){
      online.forEach(c => {
        if(c.player === p.player){
          p.lastPinged = Date.now()
        }
        if(Date.now() > p.lastPinged + 45001){
          broadcastToRoom(SERVER_LOG_EVENT, `${p.player.username} went offline`, p.player.roomId)
          broadcastToRoom(NOTIFICATION_EVENT, "offline", p.player.roomId); 
          broadcastToUser(SERVER_LOG_EVENT, "you went very offline", p.player.username)
          recentOnline.splice(recentOnline.findIndex(({ player }) => player.publicKey === publicKey), 1)
        }
      })
    }
  });
}, 15 * 1000)


console.log(`WebSocket server started on port ${PORT}`)

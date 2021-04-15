import WebSocket from 'ws'
import { emitter } from './events'
import querystring from "querystring"
import { findOrCreatePlayer, getPlayerRoom } from "../services/player"
import { Player } from '../../@types'
import { AUTH_EVENT, ERROR_EVENT, PLAYER_EVENT, ROOM_UPDATE_EVENT, SERVER_LOG_EVENT } from '../../events'
import { createVerify, createPublicKey } from "crypto"

export const server = new WebSocket.Server({
  port: 1234
})

export const broadcast = (code: string, payload: any) => {
  online.forEach(({ socket }) => {
    sendEvent(socket, code, payload)
  })

  console.log(`[${code}]`, payload)
}

export const sendEvent = (socket: WebSocket, code: string, payload: any) => {
  socket.send(JSON.stringify({
    code,
    payload,
  }))
}

export const online: {
  socket: WebSocket
  player: Player
}[] = []

server.on('connection', (socket, request) => {
  console.log('Socket connected to server')

  const publicKey = decodeURIComponent(querystring.parse(request.url!)['/?public-key'] as string)
  let player: Player
  let authenticated = false
  const challenge = String(Math.random())

  socket.on('message', (data: string) => {
    try {
      const { code, payload } = JSON.parse(data) as {
        code: string
        payload: any
      }
  
      if (code === AUTH_EVENT) {
        const verify = createVerify("SHA256")
        verify.update(challenge)
        verify.end()
  
        const signature: string = payload
  
        const pem = createPublicKey(`-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`)
  
        if (verify.verify(pem, signature, "base64")) {
          authenticated = true
  
          player = findOrCreatePlayer(publicKey)

          sendEvent(socket, PLAYER_EVENT, player)
          sendEvent(socket, ROOM_UPDATE_EVENT, getPlayerRoom(player))

          online.push({
            socket,
            player,
          })

          broadcast(SERVER_LOG_EVENT, `${player.username} is now online`)
        } else {
          sendEvent(socket, ERROR_EVENT, "Invalid signature")
        }
      }
  
      if (authenticated) {
        emitter.emit(code as unknown as string, socket, payload, player)
      }
    } catch (error) {
      console.error(error)
    }
  })

  sendEvent(socket, AUTH_EVENT, challenge)

  socket.on("close", () => {
    console.log('Socket disconnected from server')

    if (!authenticated) return

    online.splice(online.findIndex(({ player }) => player.publicKey === publicKey), 1)

    broadcast(SERVER_LOG_EVENT, `${player.username} went offline`)
  })
})

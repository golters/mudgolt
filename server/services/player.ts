import {
  Player, 
} from "../../@types"
import {
  saveStore, store, 
} from "../store"
import crypto from "crypto"

export const findOrCreatePlayer = (publicKey: string) => {
  const existingPlayer = store.players.find(
    (player) => player.publicKey === publicKey,
  )

  if (existingPlayer) return existingPlayer

  const hash = crypto.createHash("md5")
  hash.update(publicKey)

  const player: Player = {
    id: store.players.length,
    publicKey,
    username: `1_${hash.digest("hex").slice(0, 6)}`,
    room: 0,
    inventory: [],
    golts: 500,
  }

  store.players.push(player)

  saveStore()

  return player
}

export const getPlayerRoom = (player: Player) => {
  return store.rooms[player.room]
}

export const setPlayerRoom = (player: Player, roomName: string) => {
  const roomIndex = store.rooms.findIndex(({ name }) => name === roomName)

  if (roomIndex === -1) {
    throw new Error(`Room doesn't exist`)
  }

  const dbPlayer = store.players.find(({ id }) => {
    return player.id === id
  })

  if (dbPlayer) {
    dbPlayer.room = roomIndex
  } else {
    throw new Error(`Player doesn't exist`)
  }

  saveStore()
}

export const setPlayerUsername = (playerId: number, username: string) => {
  const player = store.players.find(({ id }) => playerId === id)

  if (player) {
    player.username = username
  } else {
    throw new Error(`Player doesn't exist`)
  }

  saveStore()
}

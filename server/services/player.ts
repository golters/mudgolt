import {
  Player, Room, 
} from "../../@types"
import {
  db, 
} from "../store"
import crypto from "crypto"
import { getRoomByName } from "./room"
import { online } from "../network"

export const updateOnlinePlayerById = (playerId: number, newPlayer: Partial<Player>) => {
  online.find(({ player }) => {
    if (player.id === playerId) {
      Object.assign(player, newPlayer)

      return true
    }
  })
}

export const findOrCreatePlayer = async (publicKey: string): Promise<Player> => {
  const existingPlayer = await getPlayerByPublicKey(publicKey)

  if (existingPlayer) return existingPlayer

  const hash = crypto.createHash("md5")
  hash.update(publicKey)

  await db.get(/*sql*/`
    INSERT INTO players ("publicKey", "username", "roomId", "golts")
      VALUES ($1, $2, $3, $4);
  `, [
    publicKey, 
    `1_${hash.digest("hex").slice(0, 6)}`, 
    1,
    500,
  ])

  const player = await getPlayerByPublicKey(publicKey) as Player

  return player
}

export const getPlayerByPublicKey = async (publicKey: string): Promise<Player | undefined> => {
  const player = await db.get<Player>(/*sql*/`
    SELECT * FROM players WHERE "publicKey" = $1
  `, [publicKey])

  return player
}

export const getPlayerById = async (id: number): Promise<Player | undefined> => {
  const player = await db.get<Player>(/*sql*/`
    SELECT * FROM players WHERE "id" = $1
  `, [id])

  return player
}

export const getPlayerByUsername = async (username: string): Promise<Player | undefined> => {
  const player = await db.get<Player>(/*sql*/`
    SELECT * FROM players WHERE "username" = $1
  `, [username])

  return player
}

export const setPlayerRoomByName = async (playerId: number, roomName: string): Promise<Room> => {
  const room = await getRoomByName(roomName)

  if (!room) {
    throw new Error("Room doesn't exist")
  }

  const player = await getPlayerById(playerId)
  
  if (!player) {
    throw new Error("Player doesn't exist")
  }

  await db.run(/*sql*/`
    UPDATE players
      SET roomId = $1
      WHERE id = $2;
  `, [room.id, playerId])

  const newPlayer = await getPlayerById(playerId) as Player

  updateOnlinePlayerById(playerId, newPlayer)

  return room
}

export const setPlayerUsername = async (playerId: number, username: string): Promise<Player> => {
  const existingPlayer = await getPlayerByUsername(username)

  if (existingPlayer) {
    throw new Error("Username in use")
  }

  const player = await getPlayerById(playerId)
  
  if (!player) {
    throw new Error("Player doesn't exist")
  }

  await db.run(/*sql*/`
    UPDATE players
      SET username = $1
      WHERE id = $2;
  `, [username, playerId])

  const newPlayer = await getPlayerById(playerId) as Player

  updateOnlinePlayerById(playerId, newPlayer)

  return newPlayer
}

import {
  Item,
  Player, 
  Room, 
  ChatHistory,
} from "../../@types"
import {
  db, 
} from "../store"
import crypto from "crypto"
import { getRoomByName } from "./room"
import { online } from "../network"
import { PAY_RATE, PAY_TIME } from "../../constants"

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
  const lastPaid = Date.now();

  await db.get(/*sql*/`
    INSERT INTO players ("publicKey", "username", "roomId", "golts", "description","lastPaid")
      VALUES ($1, $2, $3, $4, $5, $6);
  `, [
    publicKey, 
    `1_1${hash.digest("hex").slice(0, 5)}`, 
    1,
    20,
    "a ninja clad in grey",
    lastPaid,
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

export const getPlayerByRoom = async (roomId: number): Promise<Player[]> => {
  const players = await db.all<Player[]>(/*sql*/`
    SELECT * FROM players WHERE roomId = $1;
  `, [roomId])

  return players
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

export const setPlayerBio = async (playerId: number, bio: string): Promise<Player> => {

  const player = await getPlayerById(playerId)
  
  if (!player) {
    throw new Error("Player doesn't exist")
  }

  await db.run(/*sql*/`
    UPDATE players
      SET description = $1
      WHERE id = $2;
  `, [bio, playerId])

  const newPlayer = await getPlayerById(playerId) as Player

  updateOnlinePlayerById(playerId, newPlayer)

  return newPlayer
}


export const getInvByPlayer = async (playerId: number): Promise<Item[]> => {
  const items = await db.all<Item[]>(/*sql*/`
    SELECT * FROM items WHERE holderId = $1 AND holderType = "player";
  `, [playerId])

  return items
}

export const addPlayerGolts = async (playerId: number, golts: number): Promise<Player> => {

  const player = await getPlayerById(playerId)
  
  if (!player) {
    throw new Error("Player doesn't exist")
  }

  const newgolts = player.golts + golts;
  const lastPaid = Date.now();

  await db.run(/*sql*/`
    UPDATE players
      SET golts = $1,
      lastPaid = $2
      WHERE id = $3;
  `, [newgolts, lastPaid, playerId])

  const newPlayer = await getPlayerById(playerId) as Player

  updateOnlinePlayerById(playerId, newPlayer)

  return newPlayer
}

export const takePlayerGolts = async (playerId: number, golts: number): Promise<Player> => {

  const player = await getPlayerById(playerId)
  
  if (!player) {
    throw new Error("Player doesn't exist")
  }

  const newgolts = player.golts - golts;
  const lastPaid = Date.now();

  await db.run(/*sql*/`
    UPDATE players
      SET golts = $1,
      lastPaid = $2
      WHERE id = $3;
  `, [newgolts, lastPaid, playerId])

  const newPlayer = await getPlayerById(playerId) as Player

  updateOnlinePlayerById(playerId, newPlayer)

  return newPlayer
}

export const payPlayer = async (playerId: number): Promise<Player> => {

  const player = await getPlayerById(playerId)
  
  if (!player) {
    throw new Error("Player doesn't exist")
  }
  const latestMessage = await db.get<ChatHistory>(/*sql*/`
  SELECT * FROM chats WHERE fromPlayerId = $1 AND roomId = $2 AND date > $3 ORDER BY date DESC LIMIT 1;
`, [playerId, player.roomId, player.lastPaid])
  if(!latestMessage){
    return player
  }

  const lastMessage = await db.get<ChatHistory>(/*sql*/`
  SELECT * FROM chats WHERE roomId = $1 AND date < $2 AND date >= $3 AND fromPlayerId != $4 ORDER BY date DESC LIMIT 1;
  `, [player.roomId, latestMessage.date, player.lastPaid, playerId])
  if(!lastMessage){
    return player
  }

  console.log(latestMessage.fromPlayerId)
  console.log(lastMessage.fromPlayerId)
  if(latestMessage.fromPlayerId === lastMessage.fromPlayerId){
    return player
  }

  const newgolts = player.golts + PAY_RATE;
  const lastPaid = Date.now();

  if(lastPaid >= player.lastPaid + PAY_TIME){
    await db.run(/*sql*/`
    UPDATE players
      SET golts = $1,
      lastPaid = $2
      WHERE id = $3;
  `, [newgolts, lastPaid, playerId])
  }

  const newPlayer = await getPlayerById(playerId) as Player

  updateOnlinePlayerById(playerId, newPlayer)

  return newPlayer
}

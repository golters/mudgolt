import { broadcast } from "server/network"
import { Chat, ChatHistory, Player, Event } from "../../@types"
import {
  db, 
} from "../store"
import { getBearName, getCurrentEvent } from "./event"
import { getPlayerById, getPlayerByUsername } from "./player"

export const insertRoomChat = async (roomId: number, fromPlayerId: number, message: string, date: number) => {
  await db.run(/*sql*/`
    INSERT INTO chats ("roomId", "fromPlayerId", "message", "date", "type")
      VALUES ($1, $2, $3, $4, $5)
  `, [roomId, fromPlayerId, message, date, "chat"])
}

export const insertWhisper = async (toPlayerId: number, fromPlayerId: number, message: string, date: number) => {
  await db.run(/*sql*/`
    INSERT INTO chats ("toPlayerId", "fromPlayerId", "message", "date", "type")
      VALUES ($1, $2, $3, $4, $5)
  `, [toPlayerId, fromPlayerId, message, date, "whisper"])
}

export const insertCampaign = async (eventId: number, fromPlayerId: number, message: string, date: number) => {
  await db.run(/*sql*/`
    INSERT INTO chats ("roomId", "fromPlayerId", "message", "date", "type")
      VALUES ($1, $2, $3, $4, $5)
  `, [eventId, fromPlayerId, message, date, "campaign"])

}

export const insertRoomCommand = async (roomId: number, fromPlayerId: number, message: string, date: number, type: string) => {
  await db.run(/*sql*/`
    INSERT INTO chats ("roomId", "fromPlayerId",  "message", "date", "type")
      VALUES ($1, $2, $3, $4, $5)
  `, [roomId, fromPlayerId, message, date, type])
}

export const fetchRoomChats = async (roomId: number, limit = 500): Promise<Chat[]> => {
  const chatHistories = await db.all<ChatHistory[]>(/*sql*/`
    SELECT * FROM (
      SELECT * FROM chats
      WHERE roomId = $1
      ORDER BY date DESC
      LIMIT ${limit}
    ) ORDER BY date ASC
  `, [roomId])

  const playerIds: number[] = []
  

  chatHistories.forEach(chatHistory => {
    if (playerIds.indexOf(chatHistory.fromPlayerId) === -1) {
      playerIds.push(chatHistory.fromPlayerId)
    }
  })

  // TODO: make safePlayer(Player) util, also needed in network/events/chat.ts
  const players = await db.all<Player[]>(/*sql*/`
    SELECT id, username FROM players
  `)

  const event = await getCurrentEvent(Date.now())

  const chats: Chat[] = chatHistories.map(({
    fromPlayerId,
    date,
    message,
    type,
  }) => {
    const chat: Chat = {
      player: {
        username: players.find(({ id }) => id === fromPlayerId)!.username,
      },
      message,
      date,
      recipiant: null,
      type,
      roomId,
      roomName: null,
    }

    return chat
  })
  
  if(event?.type === "Bear_Week"){ 
    for(let i = 0; i < chats.length; i++){
      const bearname = await getBearName(event.id, 
        chatHistories[i].fromPlayerId)
      chats[i].player.username = bearname
    }
  }
  
  return chats
}
export const fetchCorrespondent = async (playerId: number): Promise<string[]> => {
  const matchplayers = await db.all<Player[]>(/*sql*/`
      SELECT * FROM players
      WHERE id IN (SELECT toPlayerId FROM chats
      WHERE toPlayerId IS NOT NULL
      AND fromPlayerId = $1 )
  `, [playerId])
  const matchrecipiants = await db.all<Player[]>(/*sql*/`
      SELECT * FROM players
      WHERE id IN (SELECT fromPlayerId FROM chats
      WHERE toPlayerId IS NOT NULL
      AND toPlayerId = $1 )
  `, [playerId])

  const matchnames = [...new Set([...matchplayers.map((c) => c.username),...matchrecipiants.map((c) => c.username)])]

  return matchnames
}

export const fetchInbox = async (playerId: number, limit: number, Player2name: string | null): Promise<Chat[]> => {
  let chatHistories: ChatHistory[] = []
  if(Player2name){
    const player2 = await getPlayerByUsername(Player2name)
    chatHistories = await db.all<ChatHistory[]>(/*sql*/`
    SELECT * FROM (
      SELECT * FROM chats
      WHERE toPlayerId IS NOT NULL
      AND ((fromPlayerId = $1 AND toPlayerId = $2)
      OR (toPlayerId = $1 AND fromPlayerId = $2))
      ORDER BY date DESC
      LIMIT ${limit}
    ) ORDER BY date ASC
  `, [playerId, player2?.id])
  }else{
    chatHistories = await db.all<ChatHistory[]>(/*sql*/`
    SELECT * FROM (
      SELECT * FROM chats
      WHERE toPlayerId IS NOT NULL
      AND (fromPlayerId = $1 
      OR toPlayerId = $1)
      ORDER BY date DESC
      LIMIT ${limit}
    ) ORDER BY date ASC
  `, [playerId])

  }
  const playerIds: number[] = []


  chatHistories.forEach(chatHistory => {
    if (playerIds.indexOf(chatHistory.fromPlayerId) === -1) {
      playerIds.push(chatHistory.fromPlayerId)
    }
  })

  // TODO: make safePlayer(Player) util, also needed in network/events/chat.ts
  const players = await db.all<Player[]>(/*sql*/`
    SELECT id, username FROM players
  `)

  const chats: Chat[] = chatHistories.map(({
    fromPlayerId,
    date,
    message,
    toPlayerId,
    type,
  }) => {
    const chat: Chat = {
      player: {
        username: players.find(({ id }) => id === fromPlayerId)!.username,
      },
      
      message,
      date,
      recipiant: {
        username: players.find(({ id }) => id === toPlayerId)!.username,        
      },
      type,
      roomId: null,
      roomName: null,
    }

    return chat
  })
  
  return chats
}

export const countCharacters = async (firstString: string, secondString: string, maxString: number): Promise<number> => {
  
  const checked = new Array<number>()

  for (let i = 0; i < firstString.length; i++) {
    for (let b = 0; b < secondString?.length; b++) {
      if (!checked.includes(b)) {
        if (i <= secondString?.length && i <= firstString.length) {
          if (firstString.charAt(i) === secondString.charAt(b)) {
            checked.push(b)
            console.log(secondString.charAt(b) + " " + b)
            break
          }
        }
      }
    }
  }

  const remainder = firstString.length > secondString?.length 
    ? (maxString - secondString?.length) - (maxString - firstString?.length)
    : 0

  const cost = (secondString?.length - checked.length) + remainder

  return cost
}

import { Chat, ChatHistory, Player } from "../../@types"
import {
  db, 
} from "../store"

export const insertRoomChat = async (roomId: number, fromPlayerId: number, message: string, date: number) => {
  await db.run(/*sql*/`
    INSERT INTO chats ("roomId", "fromPlayerId", "message", "date")
      VALUES ($1, $2, $3, $4)
  `, [roomId, fromPlayerId, message, date])
}

export const insertWhisper = async (toPlayerId: number, fromPlayerId: number, message: string, date: number) => {
  await db.run(/*sql*/`
    INSERT INTO chats ("toPlayerId", "fromPlayerId", "message", "date")
      VALUES ($1, $2, $3, $4)
  `, [toPlayerId, fromPlayerId, message, date])
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

  const chats: Chat[] = chatHistories.map(({
    fromPlayerId,
    date,
    message,
  }) => {
    const chat: Chat = {
      player: {
        username: players.find(({ id }) => id === fromPlayerId)!.username,
      },
      
      message,
      date,
      recipiant: null,
    }

    return chat
  })
  
  return chats
}

export const fetchInbox = async (playerId: number, limit = 500): Promise<Chat[]> => {
  const chatHistories = await db.all<ChatHistory[]>(/*sql*/`
    SELECT * FROM (
      SELECT * FROM chats
      WHERE toPlayerId IS NOT NULL
      AND (fromPlayerId = $1 
      OR toPlayerId = $1)
      ORDER BY date DESC
      LIMIT ${limit}
    ) ORDER BY date ASC
  `, [playerId])

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

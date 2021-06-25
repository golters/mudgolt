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
    }

    return chat
  })
  
  return chats
}

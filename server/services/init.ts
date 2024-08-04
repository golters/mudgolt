import { db } from "../store"
import {
  createRoom,
} from "./room"

export const initStore = async () => {
  await db.exec(/*sql*/`
    CREATE TABLE IF NOT EXISTS rooms (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "banner" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "isProtected" BOOLEAN NOT NULL,
      "primeColor" TEXT,
      "backColor" TEXT
    );

    CREATE TABLE IF NOT EXISTS players (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "publicKey" TEXT NOT NULL,
      "username" TEXT NOT NULL,
      "roomId" INTEGER NOT NULL,
      "golts" INTEGER NOT NULL,
	    "description"	TEXT NOT NULL,
      "lastPaid" INTEGER NOT NULL,

      FOREIGN KEY("roomId") REFERENCES rooms("id")
    );

    CREATE TABLE IF NOT EXISTS items (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
	    "name"	TEXT NOT NULL,
	    "description"	TEXT NOT NULL,
	    "macro"	TEXT NOT NULL,
	    "holderId"	INTEGER NOT NULL,
	    "holderType"	TEXT NOT NULL,
      "rarity" TEXT,
      "type" TEXT,
      "tags" TEXT,
      "date" INTEGER,
      "creator" INTEGER,
      "password" TEXT,
      "stats" TEXT,
      "icon" TEXT
    );
    

    CREATE TABLE IF NOT EXISTS inventories (
      "itemId" INTEGER NOT NULL,
      "playerId" INTEGER NOT NULL,
      "quantity" INTEGER NOT NULL,

      FOREIGN KEY("itemId") REFERENCES items("id"),
      FOREIGN KEY("playerId") REFERENCES players("id")
    );

    CREATE TABLE IF NOT EXISTS chats (
      "roomId" INTEGER,
      "fromPlayerId" INTEGER NOT NULL,
      "toPlayerId" INTEGER,
      "message" TEXT,
      "date" INTEGER,
      "type" TEXT,

      FOREIGN KEY("roomId") REFERENCES rooms("id"),
      FOREIGN KEY("fromPlayerId") REFERENCES players("id"),
      FOREIGN KEY("toPlayerId") REFERENCES players("id")
    );

    CREATE TABLE IF NOT EXISTS doors (
      "room_id" INTEGER,
      "target_room_id" INTEGER,
      "name" TEXT NOT NULL,

      PRIMARY KEY("room_id", "target_room_id"),
      FOREIGN KEY("room_id") REFERENCES rooms("id"),
      FOREIGN KEY("target_room_id") REFERENCES rooms("id")
    );

    CREATE TABLE IF NOT EXISTS music (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "room_id" INTEGER,
      "banner" TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS games (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "type" TEXT NOT NULL,
      "banner" TEXT NOT NULL,
      "game_info" TEXT,
      "player1" INTEGER NOT NULL,
      "p1_score" INTEGER,
      "p1_pieces" TEXT,
      "player2" INTEGER,
      "p2_score" INTEGER,
      "p2_pieces" TEXT,
      "player3" INTEGER,
      "p3_score" INTEGER,
      "p3_pieces" TEXT,
      "player4" INTEGER,
      "p4_score" INTEGER,
      "p4_pieces" TEXT,

      FOREIGN KEY("player1") REFERENCES players("id"),
      FOREIGN KEY("player2") REFERENCES players("id"),
      FOREIGN KEY("player3") REFERENCES players("id"),
      FOREIGN KEY("player4") REFERENCES players("id")
    );

    CREATE TABLE IF NOT EXISTS invites (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "type" TEXT NOT NULL,
      "player1" INTEGER NOT NULL,
      "player2" INTEGER,
      "player3" INTEGER,
      "player4" INTEGER,

      FOREIGN KEY("player1") REFERENCES players("id"),
      FOREIGN KEY("player2") REFERENCES players("id"),
      FOREIGN KEY("player3") REFERENCES players("id"),
      FOREIGN KEY("player4") REFERENCES players("id")
    );

    CREATE TABLE IF NOT EXISTS eventTags (
      "id" INTEGER,
      "type" TEXT NOT NULL,
      "info" TEXT,
      "eventId" INTEGER
    );

    CREATE TABLE IF NOT EXISTS events (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "type" TEXT NOT NULL,
      "start" INTEGER NOT NULL,
      "end" INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS NPCS (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "name" TEXT,
      "icon" TEXT,
      "health" INTEGER,
      "job" TEXT,
      "personality" TEXT,
      "phrases" TEXT,
      "birth" INTEGER,
      "death" INTEGER
    );

  `)

  const rooms = await db.all(/*sql*/`
    SELECT id FROM rooms
  `)

  if (rooms.length === 0) {
    await createRoom("golt-hq", {
      isProtected: true,
      description: "The headquarters of the Friends of the Golt.",
    })
  }
}

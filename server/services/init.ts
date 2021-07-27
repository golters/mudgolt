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
      "isProtected" BOOLEAN NOT NULL
    );

    CREATE TABLE IF NOT EXISTS players (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "publicKey" TEXT NOT NULL,
      "username" TEXT NOT NULL,
      "roomId" INTEGER NOT NULL,
      "golts" INTEGER NOT NULL,

      FOREIGN KEY("roomId") REFERENCES rooms("id")
    );

    CREATE TABLE IF NOT EXISTS items (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL
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

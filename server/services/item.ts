/* eslint-disable camelcase */
import { SMELT_COST, ICON_WIDTH, ICON_HEIGHT, BANNER_FILL } from "../../constants"
import {
  Item, Player,
} from "../../@types"
import {
  db,
} from "../store"
import {
  insertWhisper,
} from "./chat"
import { addPlayerGolts, getInvByPlayer, getPlayerById } from "./player"
import { broadcastToUser } from "../../server/network"
import { INVENTORY_UPDATE_EVENT } from "../../events"

export const createItem = async (playerID: number, name: string): Promise<Item> => {
  const icon = await generateIcon()
  await db.get(/*sql*/`
  INSERT INTO items ("name", "description", "macro", "holderId", "holderType","icon","creator","date")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
`, [    
    name,
    `a ${name}`,
    "",
    playerID,
    "player",
    icon,
    playerID,
    Date.now(),
  ])

  const inventory = await getItemByPlayer(playerID)
  const max = inventory.reduce(function(prev, current) {
    return (prev.id > current.id) ? prev : current
  })
  const item = await getItemById(max.id) as Item

  return item
}

export const createFloorItem = async (roomID: number, name: string): Promise<Item> => {
  const icon = await generateIcon()
  const time = Date.now
  await db.get(/*sql*/`
  INSERT INTO items ("name", "description", "macro", "holderId", "holderType", "icon", "date")
    VALUES ($1, $2, $3, $4, $5, $6, $7);
`, [    
    name,
    `a ${name}`,
    "",
    roomID,
    "room",
    icon,
    time,
  ])

  //get newest item
  const inventory = await getItemByRoom(roomID)
  const max = inventory.reduce(function(prev, current) {
    return (prev.id > current.id) ? prev : current
  })
  const item = await getItemById(max.id) as Item


  return item
}

export const createPost = async (playerID: number, bio: string): Promise<Item> => {
  const user = await getPlayerById(playerID)
  await db.get(/*sql*/`
  INSERT INTO items ("name", "description", "macro", "holderId", "holderType")
    VALUES ($1, $2, $3, $4, $5);
`, [    
    `${user?.username}_post${Math.floor(Math.random()*(999-100+1)+100)}`,
    `${bio} -${user?.username} ${new Date()}`,
    "",
    user?.roomId,
    "room",
  ])

  const item = await getItemById(1) as Item

  return item
}

export const getItemById = async (itemID: number): Promise<Item | undefined> => {
  const item = await db.get<Item>(/*sql*/`
    SELECT * FROM items WHERE "id" = $1
  `, [itemID])

  return item
}

export const getItemByRoom = async (roomId: number): Promise<Item[]> => {
  const items = await db.all<Item[]>(/*sql*/`
    SELECT * FROM items WHERE holderId = $1 AND holderType = "room";
  `, [roomId])

  return items
}

export const getItemByPlayer = async (playerId: number): Promise<Item[]> => {
  const items = await db.all<Item[]>(/*sql*/`
    SELECT * FROM items WHERE holderId = $1 AND holderType = "player";
  `, [playerId])

  return items
}

export const dropItem = async (player: Player, itemName: string): Promise<Item[]> => {
  const items = await db.all<Item[]>(/*sql*/`
    SELECT * FROM items WHERE "name" = $1 AND "holderId" = $2 AND "holderType" = "player"
  `, [itemName,player.id])
  if(items.length <= 0){
    throw new Error(`you don't have a ${itemName}`)
  }
  const item = items[0]
  
  await db.run(/*sql*/`
    UPDATE items
      SET holderId = $1,
      holderType = "room"
      WHERE id = $2;
  `, [player.roomId, item.id])

  return items
}

export const takeItem = async (player: Player, itemName: string): Promise<Item[]> => {
  const items = await db.all<Item[]>(/*sql*/`
    SELECT * FROM items WHERE "name" = $1 AND "holderId" = $2 AND "holderType" = "room"
  `, [itemName,player.roomId])
  if(items.length <= 0){
    throw new Error(`there are no ${itemName}s`)
  }
  const item = items[0]
  
  await db.run(/*sql*/`
    UPDATE items
      SET holderId = $1,
      holderType = "player"
      WHERE id = $2;
  `, [player.id, item.id])

  return items
}

export const sendItem = async (player:Player, args: string[]) => {
  const itemName = args[0]

  const items = await db.all<Item[]>(/*sql*/`
  SELECT * FROM items WHERE "name" = $1 AND "holderId" = $2 AND "holderType" = "player"
`, [itemName,player.id])
  if(items.length <= 0){
    throw new Error(`you have no ${itemName}s`)
  }
  const item = items[0]
  const Recipiant = await db.get<Player>(/*sql*/`
  SELECT * FROM players WHERE "username" = $1
`, [args[1]])
  if(!Recipiant){
    throw new Error(`could not find ${args[1]}s`)

    return
  }

  await db.run(/*sql*/`
    UPDATE items
      SET holderId = $1,
      holderType = "player"
      WHERE id = $2;
  `, [Recipiant.id, item.id])
  await insertWhisper(Recipiant.id, player.id, `sent ${item.name}`, Date.now())

  return item
}

export const setItemBio = async (itemId: number, bio: string): Promise<Item> => {

  const item = await getItemById(itemId)
  
  if (!item) {
    throw new Error("Item doesn't exist")
  }

  await db.run(/*sql*/`
    UPDATE items
      SET description = $1
      WHERE id = $2;
  `, [bio, itemId])

  return item
}

export const setItemMacro = async (itemId: number, bio: string): Promise<Item> => {

  const item = await getItemById(itemId)
  
  if (!item) {
    throw new Error("Item doesn't exist")
  }

  await db.run(/*sql*/`
    UPDATE items
      SET macro = $1
      WHERE id = $2;
  `, [bio, itemId])

  return item
}

export const smeltItem = async (player: Player, material: string): Promise<number> => {
  const itemName = material

  const items = await db.all<Item[]>(/*sql*/`
  SELECT * FROM items WHERE "name" = $1 AND "holderId" = $2 AND "holderType" = "player"
`, [itemName,player.id])
  if(items.length <= 0){
    throw new Error(`you have no ${itemName}s`)
  }
  const item = items[0]

  const ingot = ((item.name.length + item.description.length + item.macro.length) / 2) - SMELT_COST
  
  await db.run(/*sql*/`
    DELETE FROM items WHERE "id" = $1;
  `, [
    item.id,
  ])
  
  await addPlayerGolts(player.id, ingot)

  return ingot
}
export const generateIcon = () => {
  return new Array(ICON_WIDTH * ICON_HEIGHT)
    .fill(BANNER_FILL)
    .join("")
}

export const editIcon = async (x: number, y: number, character: string, item: Item): Promise<Item> => {
  const pos = x + (y * ICON_WIDTH)

  if(!item.icon){
    item.icon = await generateIcon()
  }
  const banner = Array.from(item.icon);

  banner[pos] = character

  item.icon = banner.join("")

  await db.run(/*sql*/`
    UPDATE items
      SET icon = $1
      WHERE id = $2;
  `, [item.icon, item.id])

  const player = await getPlayerById(item.holderId)
  if(player){
    const inv = await getInvByPlayer(player.id)
    broadcastToUser(INVENTORY_UPDATE_EVENT, inv, player?.username)
  }

  return item
}

/* eslint-disable camelcase */
import { error } from "console"
import {
  Door,
  Event, EventTag, Room, Player, Chat, ChatHistory,
} from "../../@types"
import {
  db,
} from "../store"
import {
  broadcast,
  broadcastToUser,
  broadcastToRoom,
  online,
} from "../network"
import {
  CAMPAIGN_LOG_EVENT,
  ERROR_EVENT,
  LOG_EVENT,
  NOTIFICATION_EVENT,
  SERVER_LOG_EVENT,
} from "../../events"
import { getPlayerById, getPlayerByRoom, getPlayerByUsername, getRecentlyOnline, takePlayerGolts } from "./player"
import { createItem,setItemBio,createFloorItem, createPocketItem } from "./item"
import { getDoorsIntoRoom } from "./door"
import { start } from "repl"
import { insertCampaign, insertRoomCommand } from "./chat"
import { getAllRooms } from "./room"
import {
  GOLT,
} from "../../constants"

export const events = [
  "Zombie_Invasion",
  "Fishing_Tournament",
  "Election_Day",
  "Doppelganger",
  "Dungeon_Raid",
  "Summoning_Ritual",
  "Dimensional_Rift",
  "Nuclear_Fallout",
  "Cryptid_Hunt",
  "Monopoly",
  "The_Big_Heist",
  "Freak_Storm",
]
//add murder mystery/cluedo, treasure hunt, circus
//add events for every major holiday
//add quest events e.g. draw banners, describe rooms etc

export interface bearface {
  leftear: string
  lefteye: string
  nose: string
  righteye: string
  rightear: string
}

export const newspapers = [
  "gazette",
  "bugle",
  "post",
  "mail",
  "times",
  "chronicle",
  "telegraph",
  "globe",
  "herald",
  "journal",
  "tribune",
  "paper",
]

const bearbits: bearface[] = [
  {
    leftear: "ʕ",
    lefteye: "•",
    nose: "ᴥ",
    righteye: "•",
    rightear: "ʔ",
  },{
    leftear: "ᶘ",
    lefteye: "ᵒ",
    nose: "㉨",
    righteye: "ᵒ",
    rightear: "ᶅ",
  },{
    leftear: "ʕ",
    lefteye: "ಠ",
    nose: "(ｴ)",
    righteye: "ಠ",
    rightear: "ʔ",
  },{
    leftear: "⸮",
    lefteye: " ͡°",
    nose: "Ꮂ",
    righteye: " ͡°",
    rightear: "?",
  },{
    leftear: "ʕ",
    lefteye: "👁",
    nose: "ﻌ",
    righteye: "👁",
    rightear: "ʔ",
  },{
    leftear: "ᕦʕ",
    lefteye: "ꆤ",
    nose: "⟟",
    righteye: "ꆤ",
    rightear: "ʔᕤ",
  },{
    leftear: "ʕ",
    lefteye: "ꈍ",
    nose: "⧪",
    righteye: "ꈍ",
    rightear: "ʔ",
  },{
    leftear: "ʕ;",
    lefteye: "￫",
    nose: "ꮂ",
    righteye: "￩",
    rightear: "ʔ",
  },{
    leftear: "૮",
    lefteye: "✪",
    nose: "ω",
    righteye: "✪",
    rightear: "ა",
  },{
    leftear: "ʕ",
    lefteye: "ಥ",
    nose: "ꈊ",
    righteye: "ಥ",
    rightear: "ʔ",
  },{
    leftear: "ʕ",
    lefteye: "ㆆ",
    nose: "ჲ",
    righteye: "ㆆ",
    rightear: "ʔ",
  },{
    leftear: "ʕ",
    lefteye: "✧",
    nose: "ᴥ",
    righteye: "✧",
    rightear: "ʔ",
  },{
    leftear: "ʕ",
    lefteye: "☆",
    nose: "ᴥ",
    righteye: "☆",
    rightear: "ʔ",
  },{
    leftear: "ʕ",
    lefteye: "◕",
    nose: "ᴥ",
    righteye: "◕",
    rightear: "ʔ",
  },{
    leftear: "ʕ╯",
    lefteye: "❛",
    nose: "ᴥ",
    righteye: "❛",
    rightear: "ʔ╯ ┻━━┻",
  },{
    leftear: "ʕ",
    lefteye: "❤",
    nose: "з",
    righteye: "❤",
    rightear: "ʔ",
  },{
    leftear: "ʕ",
    lefteye: "눈",
    nose: "ᆺ",
    righteye: "눈",
    rightear: "ʔ",
  },{
    leftear: "⊂(",
    lefteye: "⇀",
    nose: "❥",
    righteye: "↼",
    rightear: ")⊃",
  },{
    leftear: "ᘳ",
    lefteye: "×",
    nose: "ᴥ",
    righteye: "×",
    rightear: "ᘰ",
  },{
    leftear: "∠ʕ",
    lefteye: "⌐■",
    nose: "ᴥ",
    righteye: "■",
    rightear: "」∠)_",
  },
]

export const createEvent = async (type: string, start: number, end: number): Promise<void> => {
  const overlapStart = await db.get<Event>(/*sql*/`
  SELECT * FROM events WHERE "start" <= $1 AND "end" >= $1;
`, [start])
  const overlapEnd = await db.get<Event>(/*sql*/`
  SELECT * FROM events WHERE "start" <= $1 AND "end" >= $1;
`, [end])

  if(overlapStart || overlapEnd){
    //check if not overlapping check is working?
    //throw new Error("Event overlaps with another")

    return
  }else{
    await db.get(/*sql*/`
      INSERT INTO events ("type", "start", "end")
        VALUES ($1, $2, $3);
    `, [
      type,
      start,
      end,
    ])
  }

  return
}

export const createEventTag = async (id: number, type: string, info: string, event: number): Promise<void> => {
  await db.get(/*sql*/`
    INSERT INTO eventTags ("id", "type", "info", "eventId")
      VALUES ($1, $2, $3, $4);
  `, [
    id,
    type,
    info,
    event,
  ])

  return
}

export const givePoints = async (id: number, info: string, event: number): Promise<void> => {
  const playerTag = await db.all<EventTag[]>(/*sql*/`
    SELECT * FROM eventTags 
    WHERE id = $1 
    AND type = "player" 
    AND eventId = $2;
  `, [id, event])

  if(playerTag.length < 1){
    await createEventTag(id,"player",info,event)

    return
  }

  const newPoints = playerTag[0].info + "," + info 
  
  await db.run(/*sql*/`
  UPDATE eventTags
    SET info = $1
    WHERE id = $2 
    AND type = ('player')
    AND eventId = $3;
`, [newPoints, id, event])

  return
}

export const getEventByType = async (type: string): Promise<Event> => {
  const event = await db.get<Event>(/*sql*/`
    SELECT * FROM events WHERE "type" = $1;
  `, [type])

  if (event === undefined) {
    throw new Error("event does not exist")		
  }
  
  return event
}

export const getCurrentEvent = async (time: number): Promise<Event | undefined> => {
  const event = await db.get<Event>(/*sql*/`
    SELECT * FROM events WHERE "start" <= $1 AND "end" >= $1;
  `, [time])

  return event
}

export const getEventTag = async (id:number, type: string, event:number): Promise<EventTag|undefined> => {
  const eventTag = await db.get<EventTag>(/*sql*/`
    SELECT * FROM eventTags WHERE id = $1 AND type = $2 AND eventId = $3;
  `, [id, type, event])

  return eventTag
}

export const getUpcomingEvents = async (time: number): Promise<Event[]> => {
  const events = await db.all<Event[]>(/*sql*/`
    SELECT * FROM events 
    WHERE "start" > $1
  `, [time])

  return events
}

//spamming offline/afk users with backloged event ending messages
export const clearOldEvents = async (time: number): Promise<void> => {
  const oldEvents = await db.all<Event[]>(/*sql*/`
    SELECT * FROM events 
    WHERE "end" < $1 
  `, [time])	

  for(let i = 0; i < oldEvents.length; i++){
    const eventId = oldEvents[i].id

    
    const score = await db.all<EventTag[]>(/*sql*/`
    SELECT * FROM eventTags 
    WHERE eventId = $1
    AND type = ('player')
  `, [oldEvents[i].id])	

    switch (oldEvents[i].type){
      case "Fishing_Tournament":

        await fishWinner(score)

        await db.run(/*sql*/`
          DELETE FROM eventTags 
          WHERE "eventId" = $1;
        `, [eventId])	
    
        await db.run(/*sql*/`
        DELETE FROM events 
        WHERE "id" = $1; 
      `, [eventId])	

        break
      case "Zombie_Invasion":

        const infected = score.map(x => x.id)
        online.forEach(user => {
          if(!infected.includes(user.player.id)){
            broadcastToUser<string>(SERVER_LOG_EVENT, "You survived the zombie invasion", user?.player.username)      
          }else{
            broadcastToUser<string>(SERVER_LOG_EVENT, "Your immune system has fought off the zombie infection", user?.player.username) 
          }
        
        });
        broadcast<string>(LOG_EVENT, "The zombies burrow back into the dirt")

        await db.run(/*sql*/`
          DELETE FROM eventTags 
          WHERE "eventId" = $1;
        `, [eventId])	
    
        await db.run(/*sql*/`
        DELETE FROM events 
        WHERE "id" = $1; 
      `, [eventId])	
        break
      case "Bear_Week":
        broadcast<string>(LOG_EVENT, "You transform back from being a bear")

        await db.run(/*sql*/`
          DELETE FROM eventTags 
          WHERE "eventId" = $1;
        `, [eventId])	
    
        await db.run(/*sql*/`
        DELETE FROM events 
        WHERE "id" = $1; 
      `, [eventId])	
        
        break
      case "Election_Day":
        await electionWinner(eventId)

        await db.run(/*sql*/`
          DELETE FROM eventTags 
          WHERE "eventId" = $1;
        `, [eventId])	
    
        await db.run(/*sql*/`
        DELETE FROM events 
        WHERE "id" = $1; 
      `, [eventId])	

        break
      default:
        await db.run(/*sql*/`
          DELETE FROM eventTags 
          WHERE "eventId" = $1;
        `, [eventId])	
    
        await db.run(/*sql*/`
        DELETE FROM events 
        WHERE "id" = $1; 
      `, [eventId])	

        break
    }
  }

  //old tags clearup
  await db.run(/*sql*/`
      DELETE FROM eventTags 
      WHERE "eventId" NOT IN (SELECT id FROM events)
    `)	


  return
}

export const clearAllEvents = async() => {
  await db.all(/*sql*/`
      DELETE FROM events
    `)	

  return
}


export const fishWinner = async (score: EventTag[]): Promise<void> => {
  const scoreBoard = score.sort((a, b) => Number(b.info.split(",").reduce(function(prev, current){
    return ((Number(prev) + Number(current)).toString())
  }))-Number(b.info.split(",").reduce(function(prev, current){
    return ((Number(prev) + Number(current)).toString())
  })))

  for(let i = 0; i < scoreBoard.length; i++){
    const points = scoreBoard[i].info.split(",").reduce(function(prev, current){
      return ((Number(prev) + Number(current)).toString())
    })
    scoreBoard[i].info = points
    const user = await getPlayerById(scoreBoard[i].id)
    if(!user){

      return
    }
    if(i > 3){
      broadcastToUser<string>(LOG_EVENT, "you came in " + (i+1) +  " in the fishing tournament! with " + points + " points", user?.username)
    }else {    
      const [formattedDate] = new Date(Date.now())
        .toLocaleString()
        .split(",")
        .slice(0, 1)
      const timestamp = `${formattedDate}`
      switch(i){
        case 0:
          const goldtrophy = await createPocketItem(user.id, "gold_fishing_trophy", null, "2", "trophy,golt","trophy")
          await setItemBio(goldtrophy.id, "A 1st place fishing tournament trophy won by " + user.username + " on " + timestamp)
          broadcast<string>(LOG_EVENT, user.username + " won the fishing tournament! with " + points + " points")
          broadcastToUser<string>(SERVER_LOG_EVENT, "you got a gold trophy", user?.username)
          broadcastToUser<string>(NOTIFICATION_EVENT, "gotmail", user?.username); 

          break;
        case 1:
          broadcastToUser<string>(LOG_EVENT, "you came 2nd in the fishing tournament! with " + points + " points", user?.username)
          broadcastToUser<string>(SERVER_LOG_EVENT, "you got a silver trophy", user?.username)
          const silvertrophy = await createPocketItem(user.id, "silver_fishing_trophy", null, "1", "trophy,silver","trophy")
          await setItemBio(silvertrophy.id, "A 2nd place fishing tournament trophy won by " + user.username + " on " + timestamp)
          broadcastToUser<string>(NOTIFICATION_EVENT, "gotmail", user?.username); 

          break;
        case 2:
          broadcastToUser<string>(LOG_EVENT, "you came 3rd in the fishing tournament! with " + points + " points", user?.username)
          broadcastToUser<string>(SERVER_LOG_EVENT, "you got a bronze trophy", user?.username)
          const bronzetrophy = await createPocketItem(user.id, "bronze_fishing_trophy", null, "0", "trophy,bronze","trophy")
          await setItemBio(bronzetrophy.id, "A 3rd place fishing tournament trophy won by " + user.username + " on " + timestamp)
          broadcastToUser<string>(NOTIFICATION_EVENT, "gotmail", user?.username); 

          break;
      }      
    }
  }

  return
}

export const getZombieRooms = async (event: number): Promise<Room[]> => {
  const zombieRooms = await db.all<Room[]>(/*sql*/`
  SELECT * FROM rooms WHERE id IN (SELECT id FROM eventTags WHERE type = $1
  AND eventId = $2);
  `, ["room", event])

  return zombieRooms
}

export const getZombieDoors = async (room: number, event: number): Promise<Door[]> => {
  const zombiedoors = await db.all<Door[]>(/*sql*/`
  SELECT * FROM doors WHERE target_room_id IN (SELECT id FROM rooms WHERE id IN (SELECT id FROM eventTags WHERE type = $1
  AND eventId = $2)) 
  AND room_id = $3;
`, ["room", event, room])

  return zombiedoors
}

export const moveZombies = async (event: number): Promise<void> => {
  const infectedRooms = await db.all<Room[]>(/*sql*/`
  SELECT id FROM eventTags WHERE type = $1
  AND eventId = $2 AND info = "infected";
`, ["room", event])
  
  const infectedRooms2 = await db.all<EventTag[]>(/*sql*/`
SELECT * FROM eventTags WHERE type = $1
AND eventId = $2;
`, ["room", event])

  if(infectedRooms2.length < 1){
    //infect random room
    const rooms = await db.all<Room[]>(/*sql*/`
    SELECT * FROM rooms;
  `)
    if(!rooms){
      return
    }
    const roomid = Math.random() * rooms.length
    const timer = Date.now() + (Math.random() * 1 * 60000)
    await createEventTag(roomid, "room", timer.toString(), event)
    broadcastToRoom<string>(SERVER_LOG_EVENT, "a hoard of zombies burst into the room. leave quickly!", roomid); 
    const zdoors = await getDoorsIntoRoom(roomid)
    zdoors.forEach(door => {            
      broadcastToRoom<string>(SERVER_LOG_EVENT, "zombies are trying to get in through " + door.name, door.room_id); 
    });

    return
  }
  for(let i = 0; i < infectedRooms2.length; i++){
    if(!Number.isNaN(infectedRooms2[i].info) && Number(infectedRooms2[i].info) < Date.now()){
      await db.run(/*sql*/`
  UPDATE eventTags
    SET info = "infected"
    WHERE info = $1;
`, [infectedRooms2[i].info])
    }
  }


  //for each room
  for(let i = 0; i < infectedRooms.length; i++){
    const zombiedoors = await db.all<Door[]>(/*sql*/`
    SELECT * FROM doors WHERE target_room_id = $1;
  `, [infectedRooms[i].id])
  
    if(zombiedoors.length > 0){
      for(let z = 0; z < zombiedoors.length; z++){
        const roomcheck = await getZombieRooms(event)

        const zcheck = roomcheck.map(x => x.id);
        if(!zcheck.includes(zombiedoors[z].room_id)){
          const timer = Date.now() + (Math.random() * 5 * 60000)
          await createEventTag(zombiedoors[z].room_id, "room", timer.toString(), event)
          broadcastToRoom<string>(SERVER_LOG_EVENT, "a hoard of zombies burst into the room. leave quickly!", zombiedoors[z].room_id); 
          broadcastToRoom<string>(NOTIFICATION_EVENT, "zombie", zombiedoors[z].room_id)
          const zdoors = await getDoorsIntoRoom(zombiedoors[z].room_id)
          zdoors.forEach(door => {            
            broadcastToRoom<string>(SERVER_LOG_EVENT, "zombies are trying to get in through " + door.name, door.room_id); 
            broadcastToRoom<string>(NOTIFICATION_EVENT, "zombie", zombiedoors[z].room_id)
          });
        }
      }
    }

  }
  await infectPlayer(event)


  return
}

export const infectPlayer = async(event: number): Promise<void> => {
  //get infected rooms
  const zrooms = await db.all<Room[]>(/*sql*/`
  SELECT * FROM rooms WHERE id IN (SELECT id FROM eventTags WHERE type = $1
  AND eventId = $2 AND info = "infected");
  `, ["room", event])
  //get player by room  
  const infectedPlayers = await db.all<EventTag[]>(/*sql*/`
      SELECT * FROM eventTags WHERE type = $1
      AND eventId = $2;
      `, ["player", event])
  const infectedPlayerMap = infectedPlayers.map(x => x.id)
  
  for(let z = 0; z < zrooms.length; z++){
    const zplayers = await getPlayerByRoom(zrooms[z].id)
    for(let p = 0; p < zplayers.length; p++){
      if(Math.random() > 0.5){
        if(!zplayers[p]){
          return
        }
        if(!infectedPlayerMap.includes(zplayers[p].id)){
          await createEventTag(zplayers[p].id, "player", "infected", event)
          broadcastToUser<string>(SERVER_LOG_EVENT, "you have been bitten by a zombie. use /Bite [user] to spread the infection", zplayers[p].username)
          broadcastToUser<string>(NOTIFICATION_EVENT, "zombie", zplayers[p].username)
        }
      }
    }
  }

  return
}

export const bitePlayer = async(event: number, player:string, zombie:number): Promise<void> => {
  const bitee = await getPlayerByUsername(player)
  const biter = await getPlayerById(zombie)
  if(!bitee){
    throw new Error("There is no brain with that name")
  }
  if(!biter){
    
    return
  }
  if(bitee?.roomId === biter?.roomId){
    const infectedPlayers = await db.all<EventTag[]>(/*sql*/`
        SELECT * FROM eventTags WHERE type = $1
        AND eventId = $2;
        `, ["player", event])
    const infectedPlayerMap = infectedPlayers.map(x => x.id)
    if(!infectedPlayerMap.includes(bitee.id)){
      await createEventTag(bitee.id, "player", "infected", event)
      broadcastToUser<string>(SERVER_LOG_EVENT, "you have been bitten by a zombie. use /Bite [user] to spread the infection", bitee.username)
      broadcastToUser<string>(NOTIFICATION_EVENT, "zombie", bitee.username)      
      await insertRoomCommand(biter.roomId, biter.id, " has bitten " + bitee.username, Date.now(), "me")
    }
    broadcastToRoom<string>(SERVER_LOG_EVENT, biter.username + " has bitten " + bitee.username, bitee.roomId)
  }else{    
    throw new Error("They are out of range of your teeth and also in another room")
  }

  return
}

export const getBearName = async(event: number, player:number): Promise<string | undefined> => {
  const bearTag = await db.get<EventTag>(/*sql*/`
    SELECT * FROM eventTags WHERE type = "player"
    AND eventId = $1 AND id = $2;  
  `,[event, player])
  
  let bear = "ʕ •ᴥ•ʔ"
  if(!bearTag){
    bear = await createBearName(event, player)
  }else{
    bear = bearTag.info
  }

  return bear
}
export const getAllBearNames = async(event: number): Promise<string[]> => {
  const bearTags = await db.all<EventTag[]>(/*sql*/`
    SELECT * FROM eventTags WHERE type = "player"
    AND eventId = $1; 
  `,[event])
  const bearname = bearTags.map(x => x.info)

  return bearname
}

export const getAllBears = async(event: number): Promise<EventTag[]> => {
  const bearTags = await db.all<EventTag[]>(/*sql*/`
    SELECT * FROM eventTags WHERE type = "player"
    AND eventId = $1; 
  `,[event])

  return bearTags
}

export const createBearName = async(event: number, player:number): Promise<string> => {

  let bearear = bearbits[Math.floor(Math.random()*bearbits.length)]
  let bearnose = bearbits[Math.floor(Math.random()*bearbits.length)]
  let beareyes = bearbits[Math.floor(Math.random()*bearbits.length)]
  //lazy solution, bear bits was sometimes undefined
  if(bearear === undefined){
    bearear = bearbits[0]
  }
  if(bearnose === undefined){
    bearnose = bearbits[0]
  }
  if(beareyes === undefined){
    beareyes = bearbits[0]
  }
  const newbearname = bearear.leftear + beareyes.lefteye + bearnose.nose + beareyes.righteye + bearear.rightear

  const newBear = await db.run(/*sql*/`
  INSERT INTO eventTags("id", "type", "info", "eventId")
    VALUES ($1, $2, $3, $4);
`, [    
    player,
    "player",
    newbearname,
    event,
  ])
  let bear = await getBearName(event, player)

  if(!bear){
    bear = "ʕ •ᴥ•ʔ"
  }

  return bear
}

export const endEvent = async (): Promise<void> => {  
  await db.run(/*sql*/`
  DELETE FROM events;
`, [])	

  return
}

export const createRandomEvent = async (time: number): Promise<void> => {
  checkSeasonalEvents()
  const upcomingEvents = getUpcomingEvents(time)
  if ((await upcomingEvents).length < 1){
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + Math.floor(Math.random() * 6) + 1)
    targetDate.setHours(12)
    targetDate.setMinutes(0)
    targetDate.setSeconds(0)
    const start = targetDate.getTime() - new Date().getTime()
    const length = 4.32e+7
    const type = Math.random() * 3
    createEvent(events[Math.floor(type)],time + start, time + start + length)
  }

  return
}

export const checkSeasonalEvents = async (): Promise<void> => {
  if(Number(new Date().getMonth) < 7 || (Number(new Date().getMonth) === 7 && Number(new Date().getDate) < 11)){
    const targetDate = new Date()
    targetDate.setFullYear(new Date().getFullYear(),7,11)
    targetDate.setHours(0)
    targetDate.setMinutes(0)
    targetDate.setSeconds(0)
    const start = targetDate.getTime()
    const end = start + 8.64e+7 * 7
    const bearWeek = await db.get<Event>(/*sql*/`
      SELECT * FROM events WHERE "start" = $1 AND "end" = $2 AND type = $3;
    `, [start,end,"Bear_Week"])
  
    if(!bearWeek){
      createEvent("Bear_Week",start,end)
    }
  
  }


  return
}

export const getDateString = async (time: number): Promise<string> => {
  const formattedTimeParts = new Date(time)
    .toLocaleString()
    .split(" ")
    .slice(1, 3)

  const [formattedDate] = new Date(time)
    .toLocaleString()
    .split(",")
    .slice(0, 1)

  formattedTimeParts[0] = formattedTimeParts[0].split(":").slice(0, 2)
    .join(":")
    
  const timestamp = Date.now() - time < 86400000
    ? formattedTimeParts.join(" ")
    : `${formattedDate} ${formattedTimeParts.join(" ")}`

  return timestamp
}

export const getCountdown = async (time: number): Promise<string> => {
  const countdown = time - Date.now()
  const days = Math.floor(countdown / 86400000)
  const hours = Math.floor((countdown - (days * 1.15741e-8)) / 3.6e+6)
  const minutes = Math.floor((countdown - (days * 1.15741e-8) - (hours * 3.6e+6)) / 60000)
    
  const timestamp = countdown > 86400000
    ? `${days} days ${hours} hours ${minutes} minutes`
    : countdown < 3.6e+6 ? `${minutes} minutes` : `${hours} hours ${minutes} minutes`

  return timestamp
}

export const campaign = async (event: Event, time:number, player:number, message: string[]) => {
  const cost = message.join(" ").length * 2
  const lastMessageid = await db.get<EventTag>(/*sql*/`
  SELECT * FROM eventTags WHERE type = $1 AND eventId = $3;
`, ["campaign", event.id])

  const lastmessage = await db.get<ChatHistory>(/*sql*/`
  SELECT * FROM chats WHERE type = $1 AND fromPlayerId = $2
      ORDER BY date DESC
      LIMIT 1;
`, ["campaign", lastMessageid?.id])

  const fullplayer = await getPlayerById(player)
  if(!fullplayer){
    
    return
  }
  if(fullplayer.golts <= cost){
    broadcastToUser<string>(SERVER_LOG_EVENT, `you need ${GOLT}${cost}`, fullplayer?.username)

    return
  }
  const playername = await getPlayerById(player)
  delete message[0]
  const newmessage = "["+playername?.username+"]" + message.join(" ")
  if(!lastmessage){
    broadcast<string>(CAMPAIGN_LOG_EVENT, newmessage)
    broadcast<string>(NOTIFICATION_EVENT, "horn")
    await createEventTag(player, "campaign", newmessage, event.id)
    await insertCampaign(event.id, player, newmessage, Date.now())

  }else
  if(lastmessage?.date < Date.now() - 30000){
    if(lastmessage.fromPlayerId === player){
      if(lastmessage.date < Date.now() - 60000){
        broadcast<string>(CAMPAIGN_LOG_EVENT, newmessage)
        broadcast<string>(NOTIFICATION_EVENT, "horn")
        await createEventTag(player, "campaign", newmessage, event.id)
        await insertCampaign(event.id, player, newmessage, Date.now())

      }else{        
        broadcastToUser<string>(SERVER_LOG_EVENT, "you can't campaign again yet", fullplayer?.username)

        return
      }
    }else{
      broadcast<string>(CAMPAIGN_LOG_EVENT, newmessage)
      broadcast<string>(NOTIFICATION_EVENT, "horn")
      await createEventTag(player, "campaign", newmessage, event.id)
      await insertCampaign(event.id, player, newmessage, Date.now())

    }
  }else{
    broadcastToUser<string>(SERVER_LOG_EVENT, "you can't campaign yet", fullplayer?.username)

    return
  }
  await takePlayerGolts(player, cost)
  broadcastToUser<string>(SERVER_LOG_EVENT, `-${GOLT}${cost}`, fullplayer?.username)


  return
}

export const castVote = async (event: Event, player: number, candidate: string): Promise<void> => {
  const votetag = await db.get<EventTag>(/*sql*/`
  SELECT * FROM eventTags 
  WHERE type = ('vote')
  AND eventId = $1 
  AND id = $2;  
`,[event.id, player])  

  const fullplayer = await getPlayerById(player)
  if(!fullplayer){
  
    return
  }
  const candidateId = await getPlayerByUsername(candidate)
  if(!candidateId){
    broadcastToUser<string>(ERROR_EVENT, "candidate does not exist", fullplayer?.username)
    
    return
  }
  console.log(votetag)

  if(votetag){
    broadcastToUser<string>(SERVER_LOG_EVENT, "you changed your vote to " + candidate, fullplayer?.username)
    await db.run(/*sql*/`
    UPDATE eventTags
      SET info = $1
      WHERE id = $2 
      AND type = ('vote')
      AND eventId = $3;
  `, [candidateId.id, player, event.id])

  }else{
    if(candidateId.id === player){
      broadcastToUser<string>(SERVER_LOG_EVENT, "wow, you voted for yourself", fullplayer?.username)
    }else{
      broadcastToUser<string>(SERVER_LOG_EVENT, "you voted for " + candidate, fullplayer?.username)
    }
    await createEventTag(player, "vote", candidateId.id.toString(), event.id)

  }

  return
}

export const pollResults = async (Event: Event): Promise<string> => {
  let poll = "No one has voted. Democracy is dead"

  const votes = await db.all<EventTag[]>(/*sql*/`
  SELECT * FROM eventTags 
  WHERE type = ('vote')
  AND eventId = $1; 
`,[Event.id]) 
  //make a list of all unique entries
  const candidates = []
  for(let i = 0; i < votes.length; i++){
    if(candidates.length < 1){
      candidates.push(Number(votes[i].info))
    }
    if(!candidates.includes(Number(votes[i].info))){
      candidates.push(Number(votes[i].info))
    }
  }

  //make array of arrays of numbers
  const count: number[][] = []

  for(let c = 0; c < candidates.length; c++){
    let candidatevotes = 0
    for(let v = 0; v < votes.length; v++){
      if(Number(votes[v].info) === candidates[c]){
        candidatevotes = candidatevotes + 1
      }
    }
    count.push([candidates[c],candidatevotes])
  }

  let message = ""

  for(let i = 0; i < count.length; i++){
    if(i != 0){
      message = message + ","
    }
    const name = await getPlayerById(count[i][0])
    const percent = (count[i][1] / votes.length) * 100
    message = message + name?.username + ":"
    message = message + percent + "%"
  }

  if(message !== ""){
    poll = message
  }

  return poll
}

export const electionWinner = async (event: number): Promise<void> => {

  const votes = await db.all<EventTag[]>(/*sql*/`
  SELECT * FROM eventTags 
  WHERE type = ('vote')
  AND eventId = $1; 
`,[event]) 

  //make a list of all unique entries
  const candidates = []
  for(let i = 0; i < votes.length; i++){
    if(candidates.length < 1){
      candidates.push(Number(votes[i].info))
    }
    if(!candidates.includes(Number(votes[i].info))){
      candidates.push(Number(votes[i].info))
    }
  }

  //make array of arrays of numbers
  const count: number[][] = []

  for(let c = 0; c < candidates.length; c++){
    let candidatevotes = 0
    for(let v = 0; v < votes.length; v++){
      if(Number(votes[v].info) === candidates[c]){
        candidatevotes = candidatevotes + 1
      }
    }
    count.push([candidates[c],candidatevotes])
  }
  

  const scoreBoard = count.sort((a,b) => a[1] - b[1])
  const [formattedDate] = new Date(Date.now())
    .toLocaleString()
    .split(",")
    .slice(0, 1)
  const timestamp = `${formattedDate}`

  let message = ""
  if(scoreBoard.length < 1){
    message = "Nobody has been elected. Anarchy wins"
    for(let o = 0; o < online.length; o++){
      const sash = await createPocketItem(online[o].player.id, "anarchy_sash", "∙∙╱∙∙∙╱∙AN╱∙∙∙╱∙∙∙", "1","sash,anarchy", "sash")
      await setItemBio(sash.id, "A sash awarded to everyone who didn't vote during an election day where nobody won on " + timestamp)
      broadcastToUser<string>(SERVER_LOG_EVENT, "you got an Anarchy_Sash", online[o].player.username)
      broadcastToUser<string>(NOTIFICATION_EVENT, "gotmail", online[o].player.username); 
    }
  }else if (scoreBoard.length === 1){
    const winner = await getPlayerById(scoreBoard[0][0])
    if(!winner){

      return
    }
    message = winner?.username + " has won the election!"
    const sash = await createPocketItem(scoreBoard[0][0], "election_sash", "∙∙╱∙∙∙╱∙EL╱∙∙∙╱∙∙∙", "1","sash,election", "sash")
    await setItemBio(sash.id, "A sash awarded to " + winner?.username + " for winning the " + timestamp + " election")
    broadcastToUser<string>(SERVER_LOG_EVENT, "you got an Election_Sash", winner?.username)
    broadcastToUser<string>(NOTIFICATION_EVENT, "gotmail", winner?.username)
  }else
  if(scoreBoard[0][1] === scoreBoard[1][1]){
    message = "A coalition has been elected of "
    for(let c = 0; c < scoreBoard.length; c++){
      if(scoreBoard[0][1] === scoreBoard[c][1]){
        if(c > 0){
          message = message + " and "
        }
        const winner = await getPlayerById(scoreBoard[c][0])
        if(!winner){
    
          return
        }
        message = message + winner?.username
        const sash = await createPocketItem(scoreBoard[c][0], "coalition_sash", "∙∙╱∙∙∙╱∙CO╱∙∙∙╱∙∙∙", "1","sash,coalition", "sash")
        await setItemBio(sash.id, "A sash awarded to " + winner?.username + " for joint winning the " + timestamp + " election")
        broadcastToUser<string>(SERVER_LOG_EVENT, "you got a Coalition_Sash", winner?.username)
        broadcastToUser<string>(NOTIFICATION_EVENT, "gotmail", winner?.username); 
      }  
    }
  }
  const rooms = await getAllRooms()
  for (let r = 0; r < rooms.length; r++){
    if(Math.random() > 0.8){
      let areaNameNum = 0
      const roomarray = rooms[r].name.split(/(?:-|_| )+/)
      if(roomarray.length > 1){
        for(let i = 0; i < roomarray.length; i++){
          if(Number.isNaN(roomarray[i])){
            delete roomarray[i]
          }
          if(roomarray[i].length === 1){
            delete roomarray[i]
          }
          if(roomarray[i] === "left" || roomarray[i] === "right"
          || roomarray[i] === "north"|| roomarray[i] === "east"|| roomarray[i] === "south"|| roomarray[i] === "west"){
            delete roomarray[i]
          }
        }
        
        areaNameNum = Math.floor(Math.random() * (roomarray.length-1))
      }
      const areaName = roomarray[areaNameNum]
      const papertype = newspapers[Math.floor(Math.random() * (newspapers.length-1))]
      const newspaper = "the_" + areaName + "_" + papertype
      const paper = await createFloorItem(rooms[r].id, newspaper, null, "","newspaper","newspaper")
      await setItemBio(paper.id, message + " " + timestamp)
        
    }
  }
  
  broadcast(SERVER_LOG_EVENT, message)
  
  return 
}

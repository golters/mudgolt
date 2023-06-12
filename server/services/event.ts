/* eslint-disable camelcase */
import { error } from "console"
import {
  Event, EventTag,
} from "../../@types"
import {
  db,
} from "../store"
import {
  broadcast,
  broadcastToUser,
} from "../network"
import {
  LOG_EVENT,
} from "../../events"
import { getPlayerById } from "./player"
import { createItem,setItemBio } from "./item"

export const events = [
  "Zombie_Invasion",
  "Fishing_Tournament",
  "Election_Day",
  "Doppelganger",
  "Dungeon_Raid",
  "Summoning_Ritual",
  "Dimensional_Rift",
  "Nuclear_Fallout",
]
//add murder mystery/cluedo event
//add monopoly event
//add bear week event that only triggers august 11th for 7 days
//add events for every major holiday
//add quest events e.g. draw banners, describe rooms etc

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
  }
  await db.get(/*sql*/`
    INSERT INTO events ("type", "start", "end")
      VALUES ($1, $2, $3);
  `, [
    type,
    start,
    end,
  ])

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

export const getCurrentEvent = async (time: number): Promise<Event | null> => {
  const event = await db.get<Event>(/*sql*/`
    SELECT * FROM events WHERE "start" <= $1 AND "end" >= $1;
  `, [time])

  if (!event) {
    const oops = null

    return oops
  }
  
  return event
}

export const getUpcomingEvents = async (time: number): Promise<Event[]> => {
  const events = await db.all<Event[]>(/*sql*/`
    SELECT * FROM events 
    WHERE "start" > $1 
  `, [time])

  return events
}

export const clearOldEvents = async (time: number): Promise<void> => {
  const oldEvents = await db.all<Event[]>(/*sql*/`
    SELECT * FROM events 
    WHERE "end" < $1 
  `, [time])	
  

  for(let i = 0; i < oldEvents.length; i++){
    const eventId = oldEvents[i].id

    if(oldEvents[i].type === "Fishing_Tournament"){
      await fishWinner(eventId)
    }

    await db.run(/*sql*/`
      DELETE FROM eventTags 
      WHERE "eventId" = $1;
    `, [eventId])	

    await db.run(/*sql*/`
    DELETE FROM events 
    WHERE "id" = $1; 
  `, [eventId])	
  }

  //old tags clearup
  const allEvents = await db.all<number[]>(/*sql*/`
    SELECT id FROM events 
  `)	
  await db.run(/*sql*/`
      DELETE FROM eventTags 
      WHERE "eventId" IN ($1)
    `, [allEvents])	


  return
}

export const fishWinner = async (event: number): Promise<void> => {
  const score = await db.all<EventTag[]>(/*sql*/`
  SELECT * FROM eventTags 
  WHERE eventId = $1
  AND type = ('player')
`, [event])	

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
    }else{    
      const [formattedDate] = new Date(Date.now())
        .toLocaleString()
        .split(",")
        .slice(0, 1)
      const timestamp = `${formattedDate}`
      switch(i){
        case 0:
          const goldtrophy = await createItem(user.id, "Gold_Fishing_Trophy")
          await setItemBio(goldtrophy.id, "A 1st place fishing tournament trophy won by " + user.username + " on " + timestamp)
          broadcast<string>(LOG_EVENT, user.username + " won the fishing tournament! with " + points + " points")

          break;
        case 1:
          broadcastToUser<string>(LOG_EVENT, "you came 2nd in the fishing tournament! with " + points + " points", user?.username)
          const silvertrophy = await createItem(user.id, "Silver_Fishing_Trophy")
          await setItemBio(silvertrophy.id, "A 2nd place fishing tournament trophy won by " + user.username + " on " + timestamp)

          break;
        case 2:
          broadcastToUser<string>(LOG_EVENT, "you came 3rd in the fishing tournament! with " + points + " points", user?.username)
          const bronzetrophy = await createItem(user.id, "Bronze_Fishing_Trophy")
          await setItemBio(bronzetrophy.id, "A 3rd place fishing tournament trophy won by " + user.username + " on " + timestamp)

          break;
      }
    }
  }
  
  await db.run(/*sql*/`
  DELETE FROM eventTags 
  WHERE "eventId" = $1;
`, [event])	

  return
}

export const createRandomEvent = async (time: number): Promise<void> => {
  const upcomingEvents = getUpcomingEvents(time)
  if ((await upcomingEvents).length < 3){
    const start = Math.random() * 10 * 60000
    const length = Math.random() * 10 * 60000
    const type = Math.random() * (await events).length
    //createEvent(events[Math.round(type)],time + start, time + start + length)
    createEvent(events[1],time + start, time + start + length)
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
  const minutes = Math.round((countdown - (days * 1.15741e-8) - (hours * 3.6e+6)) / 60000)
    
  const timestamp = countdown > 86400000
    ? `${days} days ${hours} hours ${minutes} minutes`
    : countdown < 3.6e+6 ? `${minutes} minutes` : `${hours} hours ${minutes} minutes`

  return timestamp
}

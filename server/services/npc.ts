import{
  Npc,  
} from "../../@types"
import{
  AVATAR_WIDTH,
  AVATAR_HEIGHT,
  NPC_HEALTH,
} from "../../constants"
import {
  db,
} from "../store"
import { createFloorItem, getAllItems, setItemBio } from "./item"
import { getRecentlyOnline } from "./player"
import { getAllRooms } from "./room"

const nameBits = [
  "bug",
  "bo",
  "bough",
  "fa",
  "fu",
  "glob",
  "blob",
  "schme",
  "goo",
  "mi",
  "er",
  "cheal",
  "ette",
  "ver",
  "min",
  "ad",
  "am",
  "gil",
  "el",
  "ell",
  "ab",
  "ca",
  "in",
  "rian",
  "dyn",
  "aai",
  "iyah",
  "anda",
  "ani",
  "riel",
  "salom",
  "abb",
  "gale",
  "don",
  "atha",
  "biezer",
  "biel",
  "ijah",
  "ihu",
  "ene",
  "abra",
  "ham",
  "ril",
  "acius",
  "azia",
  "chim",
  "aiah",
  "ev",
  "eliza",
  "esth",
  "ra",
  "nao",
  "ecca",
  "leb",
  "mon",
  "zach",
  "arius",
  "dru",
  "silla",
  "scor",
  "pio",
  "riah",
  "ene",
  "rho",
  "da",
  "tri",
  "zah",
  "mo",
  "phin",
  "ehas",
  "go",
  "cal",
  "nec",
  
]

const jobs = [
  "blacksmith",
  "carpenter",
  "builder",
  "scribe",
  "enchanter",
  "locksmith",
  "thief",
  "librarian",
  "courier",
  "hobo",
]

const personalities = [
  "jolly",
  "grumpy",
]
//sleepy
//quirky
//mean
//romantic
//zombie
//alien

export interface phrase {
  tags:string
  phrases:string[]
  npcphrases:string[]
  roomphrases:string[]
  itemphrases:string[]
  userphrases:string[]
}

const phrases: phrase[] = [
  {
    tags:"blacksmith",
    phrases:["What can I forge for you today?","Welcome to the forge","*Bangs anvil*"],
    npcphrases:["If you see [builder] tell them I've finished making those nails"],
    roomphrases:["Oops, I left my hammer in [room]"],
    itemphrases:["Have you seen my [item] anywhere?"],
    userphrases:[],
  },{
    tags:"jolly",
    phrases:["Leave me alone","Don't even talk to me until i've had my potion","I'm not grumpy, you're grumpy"],
    npcphrases:["[grumpy] needs cheering up"],
    roomphrases:[],
    itemphrases:[],
    userphrases:["Have you spoken to [user] recently?"],
  },{
    tags:"grumpy",
    phrases:["Leave me alone","Don't even talk to me until i've had my potion","I'm not grumpy, you're grumpy"],
    npcphrases:["[jolly] is so annoying"],
    roomphrases:[],
    itemphrases:[],
    userphrases:[],
  },
]

export const generateAvatar = () => {
  const avatarbits =[
    "∙∙∙_____∙∙∙∙/∙∙∙∙∙\\∙∙∙|o__o∙|∙∙∙\\_____/∙∙∙∙/∙∙∙\\∙∙",
  ]
  const avatar = avatarbits.toString()

  return avatar
}

export const generateName= () => {
  let name = ""
  const length = Math.floor(Math.random() * 2)+2
  for (let i = 0; i < length; i++){
    name = name + nameBits[Math.floor(Math.random() * (nameBits.length))]
  }
  
  return name
}

export const generatePhrases = async(job: string, personality: string):Promise<string> => {
  //build array of phrases
  let lines: string[] = []
  //get phrases of job and personality
  for(let i = 0; i < phrases.length; i++){
    if(phrases[i].tags === job || phrases[i].tags === personality || phrases[i].tags === job + " " + personality){
      lines = lines.concat(phrases[i].phrases, phrases[i].npcphrases, phrases[i].roomphrases, phrases[i].itemphrases, phrases[i].userphrases)
    }
  }
  if(lines.length === 0){

    return "hello"
  }
  //causes never ending loop!!!
  //const npcs = await getLivingNpcs()
  const npcs = await db.all<Npc[]>(/*sql*/`
    SELECT * FROM NPCS WHERE death IS NULL;
  `)
  const rooms = await getAllRooms()
  const users = await getRecentlyOnline()
  const items = await getAllItems()
  //replace [] words
  for(let l = 0; l < lines.length; l++){
    const regex = lines[l].match(/\[(.*?)\]/g)
    if(regex){
      for(let r = 0; r < regex.length; r++){
        const ege = regex[r].substring(1, regex[r].length-1);
        if(jobs.includes(ege)){
          const job = npcs.find(n => n.job === ege)
          if(job)
            lines[l] = lines[l].replace(regex[r], job?.name)
          else{ lines[l] = "Hello" }
        }
        if(personalities.includes(ege)){
          const person = npcs.find(n => n.personality === ege)
          if(person)
            lines[l] = lines[l].replace(regex[r], person?.name)
          else{ lines[l] = "Hello" }
        }
        switch(regex[r].toString()){
          case "[item]":
            if(items){
              lines[l] = lines[l].replace(regex[r], items[Math.floor(Math.random()*items.length)].name)
            }else{ lines[l] = "Hello" }
            break;
          case "[room]":
            if(rooms){
              lines[l] = lines[l].replace(regex[r], rooms[Math.floor(Math.random()*rooms.length)].name)
            }else{ lines[l] = "Hello" }
            break;
          case "[user]":
            if(users){
              lines[l] = lines[l].replace(regex[r], users[Math.floor(Math.random()*users.length)].username)
            }else{ lines[l] = "Hello" }
            break;
        }
      }
    }
  }
  console.log(lines.join("&"))
  
  return lines.join("&")
}

export const getLivingNpcs = async():Promise<Npc[]> => {
  const allNpcs = await db.all<Npc[]>(/*sql*/`
    SELECT * FROM NPCS WHERE death IS NULL;
  `)

  const npcs: Npc[] = []
  //get 1 of each
  for(let j = 0; j < jobs.length; j++){
    //get npc with that job
    const npc = allNpcs.filter(npc => {
      return npc.job === jobs[j]
    })
    //if none creatnpc
    if(!npc[0] || npc[0] === undefined){
      const newnpc = await createNpc(jobs[j])
      npcs.push(newnpc)
    }else{
      //fix phrases array
      const temphrase = npc[0].phrases.toString()
      npc[0].phrases = temphrase.split("&")
      npcs.push(npc[0])
    }

  }

  return allNpcs
}

export const createNpc = async(job: string): Promise<Npc> => {
  const avatar = await generateAvatar()  
  const name = await generateName()
  const birth = Date.now()
  const personality = personalities[Math.floor(Math.random()*personalities.length)]
  const lines = await generatePhrases(job, personality)

  await db.get(/*sql*/`
  INSERT INTO NPCS ("name", "icon","health","job","personality","phrases","birth")
    VALUES ($1, $2, $3, $4, $5, $6, $7);
`, [    
    name,
    avatar,
    NPC_HEALTH,
    job,
    personality,
    lines,
    birth,
  ])
  
  const npc = await db.get<Npc>(/*sql*/`
  SELECT * FROM NPCS WHERE "birth" = $1 AND "job" = $2
`, [birth, job])

  if(!npc){
    throw new Error("Npc doesn't exist")
  }
  
  return npc
}

export const editAvatar = async (x: number, y: number, character: string, npc: Npc): Promise<Npc> => {
  const realNpc = await db.get<Npc>(/*sql*/`
    SELECT * FROM NPCS WHERE id = $1;
  `,[npc.id])
  if(!realNpc){

    throw new Error("no npc")
  }
  if(realNpc?.death !== null){

    throw new Error(npc.name + " has died")
  }

  const pos = x + (y * AVATAR_WIDTH)

  if(!npc.icon){
    throw new Error("this npc has no face")
  }
  const banner = Array.from(npc.icon);

  banner[pos] = character

  npc.health = npc.health - 1
  npc.icon = banner.join("")

  await db.run(/*sql*/`
    UPDATE NPCS
      SET icon = $1
      WHERE id = $2;
  `, [npc.icon, npc.id])

  if(npc.health < 1 && npc.death === null){
    await db.run(/*sql*/`
    UPDATE NPCS
    SET death = $1
    WHERE id = $2;
  `, [Date.now(), npc.id])

    //create tombstone
    const rooms = await getAllRooms()
    const grave = await createFloorItem(Math.floor(Math.random() * rooms.length),"grave","123456123456123456","","grave","grave")
    const birth = new Date(npc.birth)
    const death = new Date(Date.now())
    const byyyy = birth.getFullYear();
    const bmm = birth.getMonth() + 1; // Months start at 0!
    const bdd = birth.getDate(); 
    const dyyyy = death.getFullYear();
    const dmm = death.getMonth() + 1; // Months start at 0!
    const ddd = death.getDate(); 

    const formattedBirth = bdd + "/" + bmm + "/" + byyyy;
    const formattedDeath = ddd + "/" + dmm + "/" + dyyyy;
    await setItemBio(grave.id, npc.name + " the " + npc.job + " " + formattedBirth + " - " + formattedDeath)
  }

  await db.run(/*sql*/`
  UPDATE NPCS
  SET health = $1
  WHERE id = $2;
`, [npc.health, npc.id])

  return npc
}

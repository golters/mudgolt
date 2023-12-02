import {
  Room, 
  Music,
  Game,
} from "../../../@types"
import {
  DRAW_EVENT,
  ROOM_UPDATE_EVENT, 
  ERROR_EVENT,
  CHANGE_MUSIC_EVENT,
  COMPOSE_EVENT,
  CLICK_EVENT,
  CHANGE_BANNER_EVENT,
  GAME_EVENT,
  TOOLBAR_UPDATE_EVENT,
} from "../../../events"
import {
  networkEmitter, 
} from "../network/events"
import {
  BANNER_WIDTH, 
  GOLT,
} from "../../../constants"
import "./Header.css"
import React, { useCallback, useEffect, useState } from "react"
import { sendEvent } from "../network"
import {
  store,
} from "../store"

const BANNER_MINIMIZE_STORAGE_KEY = 'headerBannerMinimized'

export let brush = localStorage.brush || "+"
export let bannerT = localStorage.bannerT || "art"
let R = store.player?.roomId

export const setBrush = (newBrush: string) => {
  localStorage.brush = newBrush
  brush = newBrush
}

export const changeBanner = (newBanner: string) => {
  switch(newBanner){
    case "art":
      bannerT = "art"
      localStorage.bannerT = "art"
      break;
    case "music":
      bannerT = "music"
      localStorage.bannerT = "music"
      break;
    case "game":
      bannerT = "game"
      localStorage.bannerT = "game"
      break;
    default:
      sendEvent(ERROR_EVENT, "invalid banner type")
      break;
  }
}



export const Header: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null)
  const [arttab, setarttab] = useState(true)
  const [music, setMusic] = useState<Music | null>(null)
  const [musictab, setmusictab] = useState(false)
  const [game, setGame] = useState<Game | null>(null)
  const [gametab, setgametab] = useState(false)
  const [minimized, setMinimized] = useState(!!localStorage.getItem(BANNER_MINIMIZE_STORAGE_KEY) || false)
  const [inGame, setInGame] = useState(!!localStorage.getItem("inGame") || false)
  R = room?.id

  function bannerArt() {
    bannerT = "art"
    localStorage.bannerT = "art"  
    sendEvent(CHANGE_BANNER_EVENT, R)
    setarttab(true)
    setmusictab(false)
    setgametab(false)
  }
  function bannerMusic() {
    bannerT = "music"
    localStorage.bannerT = "music"  
    sendEvent(CHANGE_BANNER_EVENT, R)
    setarttab(false)
    setmusictab(true)
    setgametab(false)
  }
  function bannerGame() {
    const args = []
    args.push("game")
    sendEvent(GAME_EVENT,args)
    bannerT = "game"
    localStorage.bannerT = "game" 
    sendEvent(CHANGE_BANNER_EVENT, R) 
    setarttab(false)
    setmusictab(false)
    setgametab(true)
  }

  useEffect(() => {
    networkEmitter.on(ROOM_UPDATE_EVENT, (room: Room) => {
      sendEvent(CHANGE_MUSIC_EVENT, room.id) 
      sendEvent(ERROR_EVENT, "room update")
      setRoom(room)
      setMusic(music)
      setGame(game)
      sendEvent(TOOLBAR_UPDATE_EVENT, room.id)
    })
  }, [])

  const toggleBanner = useCallback(() => {
    setMinimized(!minimized)

    if (minimized) {
      localStorage.removeItem(BANNER_MINIMIZE_STORAGE_KEY)
    } else {
      localStorage.setItem(BANNER_MINIMIZE_STORAGE_KEY, '1')
    }
  }, [minimized])
  
  const Banner: React.FC<{ room: Room }> = ({ room }) => {
    const bannerParts: string[] = [] 

    const music = store.music
    const game = store.game
    let Mbanner = ""
    if(music === undefined){
      Mbanner = room.banner
      bannerT = "art"
      localStorage.bannerT = "art"
    }else{
      Mbanner = music.banner
    } 
    let Gbanner = ""
    if(bannerT === "game"){
    if(!game){
      bannerT = "art"
      localStorage.bannerT = "art"
      setInGame(false)
    }else{
      Gbanner = game?.banner
      setInGame(true)
    }
  }
  
  
    for (let i = 0; i < room.banner.length / BANNER_WIDTH; i++) {    
      switch(bannerT){
        case "art":
          const artFrom = Array.from(room.banner);
          bannerParts.push(artFrom.slice(i * BANNER_WIDTH, (i * BANNER_WIDTH) + BANNER_WIDTH).join(""))
          
          break;
        case "music":   
        const musicFrom = Array.from(Mbanner);
          bannerParts.push(musicFrom.slice(i * BANNER_WIDTH, (i * BANNER_WIDTH) + BANNER_WIDTH).join(""))

          break;
        case "game":   
        const gameFrom = Array.from(Gbanner);
          bannerParts.push(gameFrom.slice(i * BANNER_WIDTH, (i * BANNER_WIDTH) + BANNER_WIDTH).join(""))

          break;
      }
    }



    const parts = bannerParts.map((part, y) => {
      const usingArrayFrom = Array.from(part);
      
      return <>{
        usingArrayFrom
          .map((character, x) => {
            const [currentCharacter, setCurrentCharacter] = useState(character)
            return <span
              onMouseOver={() => setCurrentCharacter(brush)}
              onMouseLeave={() => setCurrentCharacter(character)}
              onContextMenu={(event) => event.preventDefault()}
              
              onMouseDown={(event) => {
                if (event.buttons === 1) {
                  switch(bannerT){
                    case "art":
                      sendEvent(DRAW_EVENT, [x, y, brush])
                      break;
                    case "music":   
                      sendEvent(COMPOSE_EVENT, [x, y, brush])
                      break;
                    case "game":   
                      sendEvent(CLICK_EVENT, [x, y])
                      break;
                  }
                } else if (event.buttons === 2) {
                  setBrush(character)
                  setCurrentCharacter(brush)
                }
              }}
            >{minimized? null : currentCharacter}</span>
          })
      }<br /></> 
    })
  
    return <div id="banner">{parts}</div>
  }

  return (
    <header id="header">
      <div id="header-wrapper" style={minimized? {maxHeight:30} : {maxHeight:400}}>
        <div className="banner">
    <h3 id="room-name">{room?.name}</h3>
    <span>{minimized ? "" : <span>
        <span id="banner-type" onClick={bannerArt}>{arttab ? <mark>Art</mark> : "Art"}</span>
        <span id="banner-type" onClick={bannerMusic}>{musictab ? <mark>Music</mark> : "Music"}</span>
        <span id="banner-type" onClick={bannerGame}>{inGame ? gametab ? <mark>Game</mark> : "Game" : "..."}</span>
        </span> }
        </span>
        </div>
        <div className="controls">
          <span id="mini_button"
            title={`${minimized ? 'Expand' : 'Minimize'} banner`} 
            className="minimize" 
            onClick={toggleBanner}
          >{minimized ? "+" : "-"}</span>
        </div>        
        {(!minimized && room) && <Banner room={room} />}
      </div>
    </header>
  )
}

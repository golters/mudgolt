import {
  Room, 
  Music,
} from "../../../@types"
import {
  DRAW_EVENT,
  ROOM_UPDATE_EVENT, 
  ERROR_EVENT,
  CHANGE_MUSIC_EVENT,
  COMPOSE_EVENT,
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
import { Banner } from "src/commands/banner"
import {
  store,
} from "../store"

const BANNER_MINIMIZE_STORAGE_KEY = 'headerBannerMinimized'

export let brush = localStorage.brush || "+"
export let bannerT = localStorage.bannerT || "art"

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
    default:
      sendEvent(ERROR_EVENT, "invalid banner type")
      break;
  }
}

export const Header: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null)
  const [music, setMusic] = useState<Music | null>(null)
  const [minimized, setMinimized] = useState(!!localStorage.getItem(BANNER_MINIMIZE_STORAGE_KEY) || false)
  const [muted, setMuted] = useState(!!localStorage.getItem("muted") || false)
  
  useEffect(() => {
    networkEmitter.on(ROOM_UPDATE_EVENT, (room: Room) => {
      sendEvent(CHANGE_MUSIC_EVENT, room.id) 
      sendEvent(ERROR_EVENT, "room update")
      setRoom(room)
      setMusic(music)
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
  
  const toggleMute = useCallback(() => {
    setMuted(!muted)

    if (muted) {
      localStorage.removeItem("muted")
    } else {
      localStorage.setItem("muted", '1')
    }
  }, [muted])

  const Banner: React.FC<{ room: Room }> = ({ room }) => {
    const bannerParts: string[] = [] 

    const music = store.music
    let Mbanner = ""
    if(music === undefined){
      Mbanner = room.banner
      bannerT = "art"
      localStorage.bannerT = "art"
    }else{
      Mbanner = music.banner
    }
  
    for (let i = 0; i < room.banner.length / BANNER_WIDTH; i++) {
      switch(bannerT){
        case "art":
          bannerParts.push(room.banner.substr(i * BANNER_WIDTH, BANNER_WIDTH))
          break;
        case "music":   
          bannerParts.push(Mbanner.substr(i * BANNER_WIDTH, BANNER_WIDTH))
          break;
      }
    }
  
    const parts = bannerParts.map((part, y) => {
      return <>{
        part
          .split("")
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
                  }
                } else if (event.buttons === 2) {
                  setBrush(character)
                  setCurrentCharacter(brush)
                }
              }}
            >{currentCharacter}</span>
          })
      }<br /></> 
    })
  
    return <div id="banner">{parts}</div>
  }

  return (
    <header id="header">
      <div id="header-wrapper">
        <div className="controls">
          <span
            title={`${muted ? 'Unmute' : 'Mute'}`} 
            className="mute" 
            onClick={toggleMute}
          >{muted ? <s>♫</s> : "♫"}</span>
           </div>
        <div className="controls">
          <span
            title={`${minimized ? 'Expand' : 'Minimize'} banner`} 
            className="minimize" 
            onClick={toggleBanner}
          >{minimized ? "+" : "-"}</span>
        </div>

        <h3 id="room-name">{room?.name}</h3>

        {(!minimized && room) && <Banner room={room} />}
      </div>
    </header>
  )
}

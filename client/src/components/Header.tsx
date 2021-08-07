import {
  Room, 
} from "../../../@types"
import {
  DRAW_EVENT,
  ROOM_UPDATE_EVENT, 
} from "../../../events"
import {
  networkEmitter, 
} from "../network/events"
import {
  BANNER_WIDTH, 
} from "../../../constants"
import "./Header.css"
import React, { useCallback, useEffect, useState } from "react"
import { sendEvent } from "../network"

const BANNER_MINIMIZE_STORAGE_KEY = 'headerBannerMinimized'

export let brush = localStorage.brush || "+"

export const setBrush = (newBrush: string) => {
  localStorage.brush = newBrush
  brush = newBrush
}

export const Header: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null)
  const [minimized, setMinimized] = useState(!!localStorage.getItem(BANNER_MINIMIZE_STORAGE_KEY) || false)

  useEffect(() => {
    networkEmitter.on(ROOM_UPDATE_EVENT, (room: Room) => {
      setRoom(room)
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
  
    for (let i = 0; i < room.banner.length / BANNER_WIDTH; i++) {
      bannerParts.push(room.banner.substr(i * BANNER_WIDTH, BANNER_WIDTH))
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
                  sendEvent(DRAW_EVENT, [x, y, brush])
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

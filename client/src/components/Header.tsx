import {
  Room, 
} from "../../../@types"
import {
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

const BANNER_MINIMIZE_STORAGE_KEY = 'headerBannerMinimized'

export const Header: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null)
  const [minimized, setMinimized] = useState(!!localStorage.getItem(BANNER_MINIMIZE_STORAGE_KEY) || false)
  
  const bannerParts: string[] = []

  if (room) {
    for (let i = 0; i < room.banner.length / BANNER_WIDTH; i++) {
      bannerParts.push(room.banner.substr(i * BANNER_WIDTH, BANNER_WIDTH))
    }
  }

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

  return (
    <header id="header">
      <div id="header-wrapper">
        <div className="controls">
          <span title={`${minimized ? 'Expand' : 'Minimize'} banner`} className="minimize" onClick={toggleBanner}>
            -
          </span>
        </div>
        <h3 id="room-name">{room?.name}</h3>
        <p id="room-description">{room?.description}</p>
        {!minimized &&
          <div id="banner">{bannerParts.map((part, key) => <div key={key}>{part}</div>)}</div>
        }
      </div>
    </header>
  )
}

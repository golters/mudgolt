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
import React, { useEffect, useState } from "react"

export const Header: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null)
  
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

  return (
    <header id="header">
      <div id="header-wrapper">
        <h3 id="room-name">{room?.name}</h3>
        <p id="room-description">{room?.description}</p>
        <div id="banner">{bannerParts.map((part, key) => <div key={key}>{part}</div>)}</div>
      </div>
    </header>
  )
}

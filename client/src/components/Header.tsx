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
  DRAW_COLOR_EVENT,
  DRAW_BACK_COLOR_EVENT,
  LOG_EVENT,
} from "../../../events"
import {
  networkEmitter,
} from "../network/events"
import {
  BANNER_FILL,
  BANNER_HEIGHT,
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

import {
  brush, brushType, brushPrimeCol, brushBackCol, bannerT,
  setBrush, setBrushPrimeCol, setBrushBackCol, changeBanner,
} from "../store/banner"

const BannerCell: React.FC<{
  character: string,
  color: string,
  backColor: string,
  onMouseDown: React.MouseEventHandler<HTMLSpanElement>,
}> = ({ character, color, backColor, onMouseDown }) => {
  const [hovered, setHovered] = useState(false)
  return <span
    onMouseOver={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    onContextMenu={event => event.preventDefault()}
    onMouseDown={onMouseDown}
    style={{
      color: hovered ? (brushType === "color" ? brushPrimeCol : "") : color,
      backgroundColor: hovered ? (brushType === "color" ? brushBackCol : "") : backColor,
    }}
  >{hovered ? (brushType === "draw" ? brush : "+") : character}</span>
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
  const R = room?.id

  function bannerArt() {
    changeBanner("art")
    sendEvent(CHANGE_BANNER_EVENT, R)
    setarttab(true)
    setmusictab(false)
    setgametab(false)
  }
  function bannerMusic() {
    changeBanner("music")
    sendEvent(CHANGE_BANNER_EVENT, R)
    setarttab(false)
    setmusictab(true)
    setgametab(false)
  }
  function bannerGame() {
    const args = []
    args.push("game")
    sendEvent(GAME_EVENT,args)
    changeBanner("game")
    sendEvent(CHANGE_BANNER_EVENT, R)
    setarttab(false)
    setmusictab(false)
    setgametab(true)
  }

  useEffect(() => {
    const updateRoom = (room: Room) => {
      sendEvent(CHANGE_MUSIC_EVENT, room.id)
      setRoom(room)
      setMusic(music)
      setGame(game)
      setInGame(Boolean(store.game))
      sendEvent(TOOLBAR_UPDATE_EVENT, room.id)
    }
    networkEmitter.on(ROOM_UPDATE_EVENT, updateRoom)
    return () => { networkEmitter.off(ROOM_UPDATE_EVENT, updateRoom) }
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
    let colorParts: string[] = []
    let backColorParts: string[] = []

    const music = store.music
    const game = store.game
    let Mbanner = ""
    if(music === undefined){
      Mbanner = room.banner
      changeBanner("art")
    }else{
      Mbanner = music.banner
    }
    let Gbanner = ""
    if(bannerT === "game"){
    if(!game){
      changeBanner("art")
    }else{
      Gbanner = game?.banner
    }
  }

    for (let i = 0; i < room.banner.length / BANNER_WIDTH && i < BANNER_HEIGHT; i++) {
      switch(bannerT){
        case "art":
          const artFrom = Array.from(room.banner);
          bannerParts.push(artFrom.slice(i * BANNER_WIDTH, (i * BANNER_WIDTH) + BANNER_WIDTH).join(""))
          if(room.primeColor)
          colorParts.push(room.primeColor.split(",").slice(i * BANNER_WIDTH, (i * BANNER_WIDTH) + BANNER_WIDTH).reverse().join(","))
          if(room.backColor)
          backColorParts.push(room.backColor.split(",").slice(i * BANNER_WIDTH, (i * BANNER_WIDTH) + BANNER_WIDTH).reverse().join(","))

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

    if(colorParts.length > 0)
    colorParts = colorParts.join(",").split(",")
    if(backColorParts.length > 0)
    backColorParts = backColorParts.join(",").split(",")


    const parts = bannerParts.map((part, y) => {
      const usingArrayFrom = Array.from(part);

      return <React.Fragment key={y}>{
        usingArrayFrom.reverse()
          .map((character, x) => {
            let currentColor = ""
            let currentBackColor = ""
            if(bannerT === "art"){
            if(colorParts.length > 0 && colorParts[x + (y * BANNER_WIDTH)] != BANNER_FILL)
            currentColor = colorParts[x + (y * BANNER_WIDTH)]
            if(backColorParts.length > 0 && backColorParts[x + (y * BANNER_WIDTH)] != BANNER_FILL)
            currentBackColor = backColorParts[x + (y * BANNER_WIDTH)]
            }
            return <BannerCell
              key={x}
              character={character}
              color={currentColor}
              backColor={currentBackColor}
              onMouseDown={(event) => {
                if (event.buttons === 1) {
                  switch(bannerT){
                    case "art":
                      if(brushType === "draw")
                      sendEvent(DRAW_EVENT, [(usingArrayFrom.length - x - 1), y, brush])
                      if(brushType === "color"){
                      sendEvent(DRAW_COLOR_EVENT, [(usingArrayFrom.length - x - 1),y,brushPrimeCol,brushBackCol])
                      }
                      break;
                    case "music":
                      sendEvent(COMPOSE_EVENT, [(usingArrayFrom.length - x - 1), y, brush])
                      break;
                    case "game":
                      sendEvent(CLICK_EVENT, [(usingArrayFrom.length - x - 1), y])
                      break;
                  }
                } else if (event.buttons === 2) {
                  if(brushType === "draw" || bannerT != "art")
                  setBrush(character)
                  if(brushType === "color" && bannerT === "art"){
                  setBrushPrimeCol(currentColor)
                  setBrushBackCol(currentBackColor)
                  }
                }
              }}
            />
          })
      }<br /></React.Fragment>
    })

    return <div id="banner">{parts}</div>
  }

  return (
    <header id="header">
      <div id="header-wrapper" style={minimized? {maxHeight:30} : {maxHeight:400}}>
        <div className="banner">
    <h3 id="room-name">{room?.name}
        <div className="controls">
          <span id="mini_button"
            title={`${minimized ? 'Expand' : 'Minimize'} banner`}
            className="minimize"
            onClick={toggleBanner}
          >{minimized ? "+" : "-"}</span>
        </div>  </h3>
    <span>{minimized ? "" : <span>
        <span id="banner-type" onClick={bannerArt}>{arttab ? <mark>Art</mark> : "Art"}</span>
        <span id="banner-type" onClick={bannerMusic}>{musictab ? <mark>Music</mark> : "Music"}</span>
        <span id="banner-type" onClick={bannerGame}>{inGame ? gametab ? <mark>Game</mark> : "Game" : "..."}</span>
        </span> }
        </span>
        </div>
        {(!minimized && room) && <Banner room={room} />}
      </div>
    </header>
  )
}

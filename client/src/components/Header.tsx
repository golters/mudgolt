import {
  Room,
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
import React, { useCallback, useEffect, useRef, useState } from "react"
import { sendEvent } from "../network"
import {
  store,
} from "../store"

const BANNER_MINIMIZE_STORAGE_KEY = 'headerBannerMinimized'

import {
  brush, brushType, brushPrimeCol, brushBackCol, bannerT,
  setBrush, setBrushPrimeCol, setBrushBackCol, changeBanner,
} from "../store/banner"

interface BannerProps {
  banner: string
  primeColor?: string
  backColor?: string
  mode: string
  rows: number
}

interface BannerCellState {
  character: string
  color: string
  backColor: string
  sourceX: number
  y: number
  className: string
}

interface NativeBannerState {
  cells: HTMLSpanElement[]
  cellStates: WeakMap<HTMLSpanElement, BannerCellState>
  colorClasses: Map<string, string>
  mode: string
  styleElement: HTMLStyleElement
}

const nativeBannerStates = new WeakMap<HTMLDivElement, NativeBannerState>()

const getBannerCell = (element: HTMLDivElement, target: EventTarget | null) => {
  if (!(target instanceof HTMLSpanElement) || target.parentElement !== element) return
  return nativeBannerStates.get(element)?.cellStates.get(target)
}

const createBanner = () => {
  const element = document.createElement("div")
  element.id = "banner"
  const styleElement = document.createElement("style")
  document.head.append(styleElement)
  nativeBannerStates.set(element, {
    cells: [],
    cellStates: new WeakMap(),
    colorClasses: new Map(),
    mode: "art",
    styleElement,
  })
  element.addEventListener("contextmenu", event => event.preventDefault())

  element.addEventListener("mousedown", event => {
    const cell = getBannerCell(element, event.target)
    const state = nativeBannerStates.get(element)
    if (!cell || !state) return

    if (event.buttons === 1) {
      if (state.mode === "art") {
        if (brushType === "draw") sendEvent(DRAW_EVENT, [cell.sourceX, cell.y, brush])
        if (brushType === "color") sendEvent(DRAW_COLOR_EVENT, [cell.sourceX, cell.y, brushPrimeCol, brushBackCol])
      } else if (state.mode === "music") {
        sendEvent(COMPOSE_EVENT, [cell.sourceX, cell.y, brush])
      } else if (state.mode === "game") {
        sendEvent(CLICK_EVENT, [cell.sourceX, cell.y])
      }
    } else if (event.buttons === 2) {
      if (brushType === "draw" || state.mode !== "art") setBrush(cell.character)
      if (brushType === "color" && state.mode === "art") {
        setBrushPrimeCol(cell.color)
        setBrushBackCol(cell.backColor)
      }
    }
  })

  element.addEventListener("mouseover", event => {
    const target = event.target
    if (!getBannerCell(element, target) || !(target instanceof HTMLSpanElement)) return
    target.textContent = brushType === "draw" ? brush : "+"
    target.style.color = brushType === "color" ? brushPrimeCol : "var(--color-banner-cursor)"
    target.style.backgroundColor = brushType === "color" ? brushBackCol : "var(--color-banner-cursor-back)"
  })

  element.addEventListener("mouseout", event => {
    const target = event.target
    const cell = getBannerCell(element, target)
    if (!cell || !(target instanceof HTMLSpanElement)) return
    target.textContent = cell.character
    target.style.color = ""
    target.style.backgroundColor = ""
  })

  return element
}

const updateBanner = (element: HTMLDivElement, { banner, primeColor, backColor, mode, rows }: BannerProps) => {
  const state = nativeBannerStates.get(element)
  if (!state) return
  const characters = Array.from(banner)
  const colors = mode === "art" ? primeColor?.split(",") : undefined
  const backgroundColors = mode === "art" ? backColor?.split(",") : undefined
  const cellCount = rows * BANNER_WIDTH

  state.mode = mode
  if (state.cells.length !== cellCount) {
    const fragment = document.createDocumentFragment()
    state.cells = []
    state.cellStates = new WeakMap()
    for (let y = 0; y < rows; y += 1) {
      const rowLength = Math.min(BANNER_WIDTH, Math.max(0, characters.length - y * BANNER_WIDTH))
      for (let x = 0; x < BANNER_WIDTH; x += 1) {
        const cell = document.createElement("span")
        state.cells.push(cell)
        state.cellStates.set(cell, {
          character: " ",
          color: "",
          backColor: "",
          sourceX: rowLength - x - 1,
          y,
          className: "",
        })
        fragment.append(cell)
      }
      fragment.append(document.createElement("br"))
    }
    element.replaceChildren(fragment)
  }

  for (let position = 0; position < cellCount; position += 1) {
    const x = position % BANNER_WIDTH
    const y = Math.floor(position / BANNER_WIDTH)
    const index = y * BANNER_WIDTH + BANNER_WIDTH - x - 1
    const cell = state.cells[position]
    const cellState = state.cellStates.get(cell)!
    const character = characters[index] || " "
    const color = colors?.[index] !== BANNER_FILL ? colors?.[index] || "" : ""
    const background = backgroundColors?.[index] !== BANNER_FILL ? backgroundColors?.[index] || "" : ""

    if (cellState.character !== character) {
      cell.textContent = character
      cellState.character = character
    }
    if (cellState.color !== color || cellState.backColor !== background) {
      cellState.color = color
      cellState.backColor = background
      const colorKey = `${color}\u0000${background}`
      let className = state.colorClasses.get(colorKey)
      if (!className) {
        className = `banner-cell-color-${state.colorClasses.size}`
        const sheet = state.styleElement.sheet as CSSStyleSheet
        const ruleIndex = sheet.insertRule(`#banner .${className}{}`, sheet.cssRules.length)
        const rule = sheet.cssRules[ruleIndex] as CSSStyleRule
        rule.style.color = color
        rule.style.backgroundColor = background
        state.colorClasses.set(colorKey, className)
      }
      if (cellState.className !== className) {
        cell.className = className
        cellState.className = className
      }
    }
  }
}



export const Header: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null)
  const [arttab, setarttab] = useState(true)
  const [musictab, setmusictab] = useState(false)
  const [gametab, setgametab] = useState(false)
  const [minimized, setMinimized] = useState(!!localStorage.getItem(BANNER_MINIMIZE_STORAGE_KEY) || false)
  const [inGame, setInGame] = useState(!!localStorage.getItem("inGame") || false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement | null>(null)
  const R = room?.id
  const banner = bannerT === "music" ? store.music?.banner || room?.banner : bannerT === "game" ? store.game?.banner || "" : room?.banner
  const bannerRows = room ? Math.min(Math.floor(room.banner.length / BANNER_WIDTH), BANNER_HEIGHT) : 0

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

  useEffect(() => {
    if (!room || minimized) {
      bannerRef.current?.remove()
      return
    }

    const element = bannerRef.current || createBanner()
    bannerRef.current = element
    if (!element.isConnected) wrapperRef.current?.append(element)
    updateBanner(element, {
      banner: banner || "",
      primeColor: room.primeColor,
      backColor: room.backColor,
      mode: bannerT,
      rows: bannerRows,
    })
  }, [banner, bannerRows, bannerT, minimized, room, room?.backColor, room?.primeColor])

  useEffect(() => () => {
    const element = bannerRef.current
    element?.remove()
    nativeBannerStates.get(element!)?.styleElement.remove()
  }, [])

  return (
    <header id="header">
      <div id="header-wrapper" ref={wrapperRef} style={minimized? {maxHeight:30} : {maxHeight:400}}>
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
      </div>
    </header>
  )
}

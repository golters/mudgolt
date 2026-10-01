import { TOOLBAR_UPDATE_EVENT, ERROR_EVENT } from "../../../events"
import { sendEvent } from "../network"
import { store } from "./index"

export let brush = localStorage.brush || "+"
export let brushType = localStorage.brushType || "draw"
export let brushPrimeCol = localStorage.brushPrimeCol || ""
export let brushBackCol = localStorage.brushBackCol || ""
export let bannerT = localStorage.bannerT || "art"

export const setBrushType = (newBrushType: string) => {
  localStorage.brushType = newBrushType
  brushType = newBrushType
  sendEvent(TOOLBAR_UPDATE_EVENT, store.player?.roomId)
}

export const setBrush = (newBrush: string) => {
  localStorage.brush = newBrush
  brush = newBrush
}

export const setBrushPrimeCol = (newCol: string) => {
  localStorage.brushPrimeCol = newCol
  brushPrimeCol = newCol
}

export const setBrushBackCol = (newCol: string) => {
  localStorage.brushBackCol = newCol
  brushBackCol = newCol
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

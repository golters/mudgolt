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

export const Header = () => {
  const container = document.createElement("header")
  container.id = "header"

  const details = document.createElement("div")
  details.id = "room-details"
  container.appendChild(details)

  const banner = document.createElement("div")
  banner.id = "banner"
  container.appendChild(banner)

  const resizeHeader = () => {
    container.style.fontSize = `${window.innerWidth / 1920}em`
  }

  resizeHeader()

  window.addEventListener('resize', resizeHeader)

  networkEmitter.on(ROOM_UPDATE_EVENT, (room: Room) => {
    const bannerParts: Node[] = []

    for (let i = 0; i < room.banner.length / BANNER_WIDTH; i++) {
      const partContainer = document.createElement("div")
      partContainer.innerText = room.banner.substr(i * BANNER_WIDTH, BANNER_WIDTH)
      bannerParts.push(partContainer)
    }

    while (banner.firstChild) {
      banner.removeChild(banner.lastChild);
    }

    banner.append(...bannerParts)

    details.textContent = `${room.name}\n\n${room.description}`
  })

  return container
}

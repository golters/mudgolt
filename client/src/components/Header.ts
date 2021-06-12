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

  const wrapper = document.createElement("div")
  wrapper.id = "header-wrapper"
  container.appendChild(wrapper)

  const name = document.createElement("h3")
  name.id = "room-name"
  wrapper.appendChild(name)

  const description = document.createElement("p")
  description.id = "room-description"
  wrapper.appendChild(description)

  const banner = document.createElement("div")
  banner.id = "banner"
  wrapper.appendChild(banner)

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

    name.textContent = room.name
    description.textContent = room.description
  })

  return container
}

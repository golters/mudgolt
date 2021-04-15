import { Room } from "../../../@types"
import { ROOM_UPDATE_EVENT } from "../../../events"
import { emitter } from "../network/events"
import { BANNER_WIDTH } from "../../../constants"
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

  emitter.on(ROOM_UPDATE_EVENT, (room: Room) => {
    console.log(room)

    const bannerParts: string[] = []

    for (let i = 0; i < room.banner.length / BANNER_WIDTH; i++) {
      console.log(i * BANNER_WIDTH, BANNER_WIDTH, room.banner.substr(i * BANNER_WIDTH, BANNER_WIDTH))
      bannerParts.push(room.banner.substr(i * BANNER_WIDTH, BANNER_WIDTH))
    }

    banner.textContent = bannerParts.join("\n")

    details.textContent = `${room.name}\n\n${room.description}`
  })

  return container
}

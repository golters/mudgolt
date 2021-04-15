import { networkEmitter, NetworkEventHandler } from "./emitter"
import { CHAT_EVENT, LOG_EVENT } from "../../../../events"
import { commandEmitter } from "../../commands/emitter"
import { Player } from "../../../../@types"
import { Markdown } from "../../components/Markdown"

const handler: NetworkEventHandler = (payload) => {
  const {
    player,
    message,
  } = payload as {
    player: Player
    message: string
  }

  const messageContainer = Markdown(`[${player.username}] ${message}`)
  messageContainer.classList.toggle("chat-message")

  const embeds: Node[] = []

  const matches = message.match(/\b(https?:\/\/\S*?\.(?:png|jpe?g|gif)(?:\?(?:(?:(?:[\w_-]+=[\w_-]+)(?:&[\w_-]+=[\w_-]+)*)|(?:[\w_-]+)))?)\b/)

  if (matches) matches.slice(1).forEach(url => {
    const imageElement = document.createElement("img")

    imageElement.src = url

    embeds.push(imageElement)
  })

  commandEmitter.emit(LOG_EVENT, messageContainer, ...embeds)
}

networkEmitter.on(CHAT_EVENT, handler)

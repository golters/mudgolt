import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  CHAT_EVENT, LOG_EVENT, 
} from "../../../../events"
import {
  commandEmitter, 
} from "../../commands/emitter"
import {
  Player, 
} from "../../../../@types"
import {
  Markdown, 
} from "../../components/Markdown"

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

  const matches = message.matchAll(/\b(https?:\/\/\S*?\.(?:png|jpe?g|gif)(?:\?(?:(?:(?:[\w_-]+=[\w_-]+)(?:&[\w_-]+=[\w_-]+)*)|(?:[\w_-]+)))?)\b/g)

  if (matches) [...matches].forEach(match => {
    const url = match[1]

    console.log(url)

    const imageElement = document.createElement("img")

    imageElement.src = url

    embeds.push(imageElement)
  })

  commandEmitter.emit(LOG_EVENT, messageContainer, ...embeds)
}

networkEmitter.on(CHAT_EVENT, handler)

import {
  INPUT_EVENT, LOG_EVENT, 
} from "../../../events"
import {
  commandEmitter, 
} from "../commands/emitter"
import {
  Markdown, 
} from "./Markdown"
import "./Terminal.css"

export const LogItem = (...children: (string | Node)[]) => {
  const message = document.createElement("span")

  message.append(...children)

  return message
}

/**
 * WARNING: this isn't sanitized
 */
export const logError = (message: string) => {
  const errorItem = LogItem(Markdown(message, { sanitize: false }))
  errorItem.classList.toggle("error-message")

  commandEmitter.emit(LOG_EVENT, errorItem)
}

/**
 * WARNING: this isn't sanitized
 */
export const logSimple = (message: string) => {
  const errorItem = LogItem(Markdown(message, { sanitize: false }))

  commandEmitter.emit(LOG_EVENT, errorItem)
}

export const UserBadge = () => ">"

export const Terminal = () => {
  let hasScrolled = false

  const container = document.createElement("main")
  container.id = "terminal"

  const scrollToBottom = () => {
    container.scrollTo(0, container.scrollHeight)
  }

  const scrollToBottomIfActive = () => {
    if (!hasScrolled) {
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    }
  }

  const arrow = document.createElement("span")
  arrow.innerText = UserBadge() + " "

  const input = document.createElement("div")
  input.contentEditable = "true"
  input.spellcheck = false

  const inputContainer = LogItem(arrow, input)
  inputContainer.id = "terminal-input-container"
  container.appendChild(inputContainer)

  const submit = () => {
    if (input.innerText.trim() === "") return

    container.insertBefore(
      LogItem(UserBadge(), ` ${input.innerText}`),
      inputContainer,
    )
    
    commandEmitter.emit(INPUT_EVENT, input.innerText)

    input.innerText = ""

    requestAnimationFrame(() => {
      scrollToBottom()
    })
  }
  

  // disable rich pastes
  input.addEventListener("paste", event => {
    event.preventDefault()
    const text = event.clipboardData.getData("text/plain")
    document.execCommand("insertHTML", false, text)
  })

  input.addEventListener("keydown", event => {
    switch (event.key) {
    case "Enter": {
      if (!event.shiftKey) {
        event.preventDefault()

        submit()
      }

      break
    }
    }
  })

  input.addEventListener("input", () => {
    scrollToBottom()
  })

  const onApplicationFocused = (event: MouseEvent | TouchEvent) => {
    window.addEventListener("click", event => {
      if (
        ["HTML", "BODY"].includes((event.target as HTMLElement).nodeName) || 
        (event.target as HTMLElement).id === container.id
      ) {
        input.focus()
      }
    }
  }

  window.addEventListener("click", onApplicationFocused)
  window.addEventListener("touchstart", onApplicationFocused)

  commandEmitter.on(LOG_EVENT, (...log: (string | Node)[]) => {
    container.insertBefore(
      LogItem(...log),
      inputContainer,
    )

    scrollToBottomIfActive()
  })

  window.addEventListener("resize", () => {
    scrollToBottomIfActive()
  })

  container.addEventListener("scroll", () => {
    const { height } = container.getBoundingClientRect()

    hasScrolled = container.scrollTop + 10 < container.scrollHeight - height
  })

  requestAnimationFrame(() => {
    input.focus()
  })

  return container
}
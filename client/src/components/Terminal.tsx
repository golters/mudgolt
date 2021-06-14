import React, { useEffect, useRef, useState } from "react"
import { MESSAGE_MAX_LENGTH } from '../../../constants'
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

const logs: (JSX.Element | string)[] = []

export const pushToLog = (...elements: (JSX.Element | string)[]) => {
  logs.push(...elements)

  commandEmitter.emit(LOG_EVENT)
}

export const pushErrorToLog = (...elements: (JSX.Element | string)[]) => {
  logs.push(...elements.map(error => <span className="error-message">{error}</span>))

  commandEmitter.emit(LOG_EVENT)
}

let hasScrolled = false

let Input: ReturnType<typeof React.memo> | null = null

export const Terminal: React.FC = () => {
  const container = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLDivElement>(null)

  const [logsState, setLogsState] = useState<(JSX.Element | string)[]>(logs)
  const [textLength, setTextLength] = useState(0)

  const scrollToBottom = () => {
    container.current?.scrollTo(0, container.current.scrollHeight)
  }

  const scrollToBottomIfActive = () => {
    if (!hasScrolled) {
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    }
  }

  const submit = () => {
    if (!input.current || input.current.innerText.trim() === "") return

    commandEmitter.emit(INPUT_EVENT, input.current.innerText)

    input.current.innerText = ""
    setTextLength(0)

    requestAnimationFrame(() => {
      scrollToBottom()
    })
  }

  useEffect(() => {
    /**
     * Never rerender component with memo
     */
    Input = React.memo(() => (
      <div
        contentEditable="true"
        spellCheck="false"
        ref={input}
    
        onInput={() => {
          scrollToBottom()

          setTimeout(() => {
            let value = input.current?.innerText || ""

            if (value.charCodeAt(value.length - 1) === 10) {
              value = value.slice(0, value.length - 1)
            }

            setTextLength(value.length)
          })
        }}
    
        // disable rich pastes
        onPaste={event => {
          event.preventDefault()

          const text = event.clipboardData.getData("text/plain")

          document.execCommand("insertHTML", false, text)
        }}
    
        onKeyDown={event => {
          switch (event.key) {
            case "Enter": {
              if (!event.shiftKey) {
                event.preventDefault()
      
                submit()
              }
      
              break
            }
          }
        }}
      />
    ))

    commandEmitter.on(LOG_EVENT, () => {
      setLogsState([...logs])
  
      scrollToBottomIfActive()
    })

    const onApplicationFocused = (event: MouseEvent | TouchEvent) => {
      if (
        ["HTML", "BODY"].includes((event.target as HTMLElement).nodeName) || 
        (event.target as HTMLElement).id === container.current?.id
      ) {
        input.current?.focus()
      }
    }

    window.addEventListener("resize", scrollToBottomIfActive)
    window.addEventListener("click", onApplicationFocused)
    window.addEventListener("touchstart", onApplicationFocused)
  }, [])

  useEffect(() => {
    input.current?.focus()
  }, [input])

  return (
    <main
      id="terminal"
      ref={container}

      onScroll={() => {
        const { height } = container.current!.getBoundingClientRect()
    
        hasScrolled = container.current!.scrollTop + 10 < container.current!.scrollHeight - height;
      }}
    >
      {logsState.map((log, key) => {
        if (typeof log === "string") {
          return <Markdown key={key} string={log} options={{ sanitize: false }} />
        } else {
          return <span key={key}>{log}</span>
        }
      })}

      <span id="terminal-input-container">
        <span className={`char-limit ${textLength > MESSAGE_MAX_LENGTH ? 'invalid' : ''}`}>
          {String(textLength)}/{MESSAGE_MAX_LENGTH}
        </span>
        <span>&gt;</span> {Input ? <Input /> : null}
      </span>
    </main>
  )
}

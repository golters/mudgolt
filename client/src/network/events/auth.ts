import { emitter, EventHandler } from "./emitter"
import { AUTH_EVENT } from "../../../../events"
import { ab2str, ALGORITHM_IDENTIFIER, keys, str2ab } from "../../crypto"
import { sendEvent } from ".."

const encoder = new TextEncoder()

const handler: EventHandler = async (challenge: string) => {
  const signature = btoa(ab2str(await crypto.subtle.sign(
    ALGORITHM_IDENTIFIER,
    keys.privateKey,
    encoder.encode(challenge),
  )))

  sendEvent(AUTH_EVENT, signature)
}

emitter.on(AUTH_EVENT, handler)

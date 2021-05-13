import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  AUTH_EVENT, 
} from "../../../../events"
import {
  ab2str, ALGORITHM_IDENTIFIER, keys,
} from "../../crypto"
import {
  sendEvent, 
} from ".."

const encoder = new TextEncoder()

const handler: NetworkEventHandler = async (challenge: string) => {
  const signature = btoa(ab2str(await crypto.subtle.sign(
    ALGORITHM_IDENTIFIER,
    keys.privateKey,
    encoder.encode(challenge),
  )))

  sendEvent(AUTH_EVENT, signature)
}

networkEmitter.on(AUTH_EVENT, handler)

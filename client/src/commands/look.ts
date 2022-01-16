import {
  LOOK_EVENT,
  LOOK_AT_EVENT,
} from "../../../events"
import {
  sendEvent, 
} from "../network"
import {
  CommandModule, 
} from "./emitter"
import {
  store,
} from "../store"

export const Look: CommandModule = {
  command: "look",
  syntax: "look or look [user/item]",
  aliases: ["examin","exam","read","check"],

  callback({ args }) {
    if(args.length <= 0){
      sendEvent(LOOK_EVENT, store.player?.roomId)
    }else{
      sendEvent(LOOK_AT_EVENT, args)
    }
  },
}

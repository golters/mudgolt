import {
  INVITE_EVENT,
} from "../../../events"
import {
  pushErrorToLog,
} from "../components/Terminal"
import {
  sendEvent, 
} from "../network"
import {
  CommandModule, 
} from "./emitter"

export const Invite: CommandModule = {
  command: "invite",
  syntax: "invite [send/accept/check/decline] [user] [chess]",
  aliases: ["play"],
  bio: "invite [user] [game] to invite someone, invite [check] to see pending invites, invite [accept] [user] to begin game, invite [decline] [user] to delete invite",

  //check correct amount of args
  callback({ args }) {
    if(!args){      
      pushErrorToLog(`Syntax: ${Invite.syntax}`)

      return
    }
    
    sendEvent(INVITE_EVENT, args)
  },
}

import {
  LOOK_EVENT,
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

export const Look: CommandModule = {
	command: "look",
	syntax: "look",


	callback() {
		sendEvent(LOOK_EVENT, null)
	},
}
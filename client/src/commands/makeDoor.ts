import {
	MAKE_DOOR_EVENT,
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

export const MakeDoor: CommandModule = {
	command: "makedoor",
	syntax: "makedoor [door name] [destination room]",

	callback({ args }) {
		let [name,room] = args

		name = name?.trim()

		if (!name) {
			pushErrorToLog(`Syntax: ${MakeDoor.syntax}`)

			return
		}

		sendEvent(MAKE_DOOR_EVENT, args)
	},
}

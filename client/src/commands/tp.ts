import {
	TP_EVENT,
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

export const Tp: CommandModule = {
	command: "tp",
	syntax: "tp [room name]",

	callback({ args }) {
		let [roomName] = args

		roomName = roomName?.trim()

		if (!roomName) {
			pushErrorToLog(`Syntax: ${Tp.syntax}`)

			return
		}

		sendEvent(TP_EVENT, roomName)
	},
}
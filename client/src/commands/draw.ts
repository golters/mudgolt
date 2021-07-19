import {
	DRAW_EVENT,
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


export const Draw: CommandModule = {
	command: "draw",
	syntax: "draw [x] [y] [character]",

	callback({ args }) {
		let [x, y, char] = args

		if (!x || !y || !char) {
			pushErrorToLog(this.syntax)
			return
		}
		if (isNaN(Number(x)) || isNaN(Number(y))){
			pushErrorToLog(`Argument must be a number`)
			return
		}
		if (parseInt(x) > 96 || parseInt(y) > 16 || parseInt(x) == 0 || parseInt(y) == 0) {
			pushErrorToLog(`[1-96] [1-16] [character]`)
			return
		}
		if (char.length > 1) {
			pushErrorToLog(`Single character required`)
			return
		}

		sendEvent(DRAW_EVENT, args)
	},

}

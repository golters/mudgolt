import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  SERVER_LOG_EVENT, 
} from "../../../../events"
import {
  pushToLog, 
} from "../../components/Terminal"
import React from "react"
import { Glyph } from "../../../../@types"
import { stringToGlyphs } from "../../components/Header"

const handler: NetworkEventHandler = (message: string) => {
const matches = message.matchAll(
  /\b(https?:\/\/\S*?\.(?:png|jpe?g|gif)(?:\?(?:(?:(?:[\w_-]+=[\w_-]+)(?:&[\w_-]+=[\w_-]+)*)|(?:[\w_-]+)))?)\b/g
);

const imageGlyphs: Glyph[] = [...matches].map(match => ({
  char: "🖼",           // placeholder symbol for image
  effect: `image:${match[1]}`, // custom effect so renderer knows it’s an image
}));

// Make all text italic + semi-transparent
const textGlyphs: Glyph[] = stringToGlyphs(message).map(g => ({
  ...g,
  effect: "italic",
  color: "rgba(255,255,255,0.7)",
}));

pushToLog([
  ...textGlyphs,
  ...imageGlyphs,
]);

}

networkEmitter.on(SERVER_LOG_EVENT, handler)

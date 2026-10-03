import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  CHAT_EVENT,
  GO_EVENT,
  LOOK_AT_EVENT,
  LOOK_LOG_EVENT,
  TAKE_ITEM_EVENT,
} from "../../../../events"
import {
  Chat,
  Player, 
  Look,
  Item,
  Door,
} from "../../../../@types"
import {
  Markdown, 
} from "../../components/Markdown"
import { pushToLog } from "../../components/Terminal"
import React, { useEffect, useRef, useCallback, useState } from "react"
import { sendEvent } from "../../network"
import {
  newWhisperWindow
} from "../../components/windows"
import { itemRarity } from "../../../../constants"
import { Glyph } from "../../../../@types"
import { stringToGlyphs } from "../../components/Header"

//make new function to lookat item.id in future
function lookAt(player: string |undefined){
  sendEvent(LOOK_AT_EVENT, player)
}

function takeItem(item: Item){
  sendEvent(TAKE_ITEM_EVENT,item.name)
}

function goDoor(door: Door){
  sendEvent(GO_EVENT,door.name)
}

const handler: NetworkEventHandler = ({ bio, users, items, doors, event}: Look) => {

pushToLog(
  stringToGlyphs(bio),
  stringToGlyphs("\nYou see:\n"),

  // Users
  users.flatMap((username, i, list) => {
    const glyphs: Glyph[] = [];

    // open bracket
    glyphs.push({ char: "[" });

    // username glyphs
    glyphs.push(...stringToGlyphs(username));

    // close bracket
    glyphs.push({ char: "]" });

    // comma if not last
    if (i + 1 !== list.length) {
      glyphs.push({ char: "," });
    }

    return glyphs;
  }),

  stringToGlyphs("\n"),

  // Items
  items.length > 0
    ? [
        ...stringToGlyphs("on the floor is:\n"),
        ...items.flatMap((item, i, list) => {
          const color = itemRarity.find(
            R => R.num.toString() === item.rarity
          );

          const glyphs: Glyph[] = stringToGlyphs(item.name).map(g => ({
            ...g,
            color: color?.col,
            backColor: color?.back,
            effect: color?.shadow, // if you mapped shadow to effect
          }));

          if (i + 1 !== list.length) {
            glyphs.push({ char: "," });
          }

          return glyphs;
        }),
        { char: "\n" },
      ]
    : stringToGlyphs("the floor is bare\n"),

  // Doors
  doors.length > 0
    ? [
        ...stringToGlyphs("the exits are:\n"),
        ...doors.flatMap((door, i, list) => {
          const glyphs: Glyph[] = stringToGlyphs(door.name);
          if (i + 1 !== list.length) {
            glyphs.push({ char: "," });
          }
          return glyphs;
        }),
        { char: "\n" },
      ]
    : stringToGlyphs("there are no exits\n"),

  // Event
  stringToGlyphs(event)
);

}

networkEmitter.on(LOOK_LOG_EVENT, handler)

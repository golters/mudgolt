import * as THREE from "three";
import { updateTextRow, stringToGlyphs, typing } from "./Header";
import { networkEmitter } from "../network/events"; // ✅ import the event system
import { CHAT_HISTORY_EVENT, LOG_EVENT, INPUT_EVENT } from "../../../events";       // as needed
import type { Chat } from "../../../@types";
import { BANNER_HEIGHT,BANNER_WIDTH } from "../../../constants";
import { commandEmitter } from "../commands/emitter"
import { Glyph } from "../../../@types";

type ChatState = {
  inputLine: string
  chatBuffer: Glyph[][]
};

const interactiveRows = BANNER_HEIGHT;

function formatChatLine(
  playerName: number | undefined,
  message: string,
  timestamp: number,
): Glyph[] {
  const name = playerName || "???";
  const time = new Date(timestamp).toLocaleTimeString([], { hour: "2-digit",
    minute: "2-digit" });
  
  return stringToGlyphs(`[${time}] ${name}: ${message}`);
}
const logs: Glyph[][] = [];


export const pushToLog = (...elements: (string | Glyph | Glyph[])[]) => {
  const glyphLines: Glyph[][] = [];

  for (const el of elements) {
    if (typeof el === "string") {
      const glyphs = stringToGlyphs(el);
      for (let i = 0; i < glyphs.length; i += BANNER_WIDTH) {
        glyphLines.push(glyphs.slice(i, i + BANNER_WIDTH));
      }
    } else if (Array.isArray(el)) {
      for (let i = 0; i < el.length; i += BANNER_WIDTH) {
        glyphLines.push(el.slice(i, i + BANNER_WIDTH));
      }
    } else if (el && typeof el === "object") { // single Glyph
      glyphLines.push([el]);
    } else {
      console.warn("Unknown element type in pushToLog:", el);
    }
  }

  logs.push(...glyphLines);
  commandEmitter.emit(LOG_EVENT);
};


export const pushErrorToLog = (...elements: (string | Glyph[])[]) => {
  const glyphLines: Glyph[][] = [];

  for (const el of elements) {
    if (typeof el === "string") {
      const text = `[ERROR] ${el}`;
      const glyphs = text.split("").map(char => ({ char }));
      for (let i = 0; i < glyphs.length; i += BANNER_WIDTH) {
        glyphLines.push(glyphs.slice(i, i + BANNER_WIDTH));
      }
    } else if (Array.isArray(el)) {
      const prefix = "[ERROR] ".split("").map(char => ({ char }));
      const combined = [...prefix, ...el];
      for (let i = 0; i < combined.length; i += BANNER_WIDTH) {
        glyphLines.push(combined.slice(i, i + BANNER_WIDTH));
      }
    } else {
      const fallback = "[ERROR] Unknown error".split("").map(char => ({ char }));
      for (let i = 0; i < fallback.length; i += BANNER_WIDTH) {
        glyphLines.push(fallback.slice(i, i + BANNER_WIDTH));
      }
    }
  }

  logs.push(...glyphLines);
  commandEmitter.emit(LOG_EVENT);
};


export function createChatManager(gridMesh: THREE.Mesh[][]) {
  const state: ChatState = {
    inputLine: "",
    chatBuffer: logs,
  };

  networkEmitter.on(CHAT_HISTORY_EVENT, (chats: Chat[]) => {
    console.log("chat history event");
    const chatRows = gridMesh.length - interactiveRows - 1;

    for (let i = chats.length - chatRows; i < chats.length; i++) {
      console.log("chat", i, chats[i]);
      const playerName = chats[i].player?.id;
      const line = formatChatLine(playerName, chats[i].message, chats[i].date);

      // Split the line into chunks of BANNER_WIDTH
      for (let j = 0; j < line.length; j += BANNER_WIDTH) {
        state.chatBuffer.push(line.slice(j, j + BANNER_WIDTH));

        // Keep buffer within visible rows
        if (state.chatBuffer.length > chatRows) {
          state.chatBuffer.shift();
        }
      }
    }

    updateChatDisplay();
  });


  commandEmitter.on(LOG_EVENT, () => {
    updateChatDisplay();
  });


  function updateInputRow(typing) {
    console.log("typing",typing)
    if(typing == null){
      updateTextRow(gridMesh[gridMesh.length - 1], state.inputLine, "#0ff", "#111");
    }else{
      //update window
      
    }
  }

  function updateChatDisplay() {
    const totalRows = gridMesh.length;
    const chatRows = totalRows - interactiveRows - 1; // chat log height

    // Get the last chatRows messages (or empty if fewer)
    const rowsToShow = state.chatBuffer.slice(-chatRows);

    for (let i = 0; i < chatRows; i++) {
      // Calculate which message to show for this row, bottom up
      // Bottom row (i = chatRows -1) shows the last message (index rowsToShow.length-1)
      // Row 0 (top chat row) shows the earliest visible message (index rowsToShow.length - chatRows)
      const msgIndex = i - (chatRows - rowsToShow.length);

      const text = msgIndex >= 0 ? rowsToShow[msgIndex] : stringToGlyphs("");
      // Row in gridMesh to draw on, counting from interactiveRows upward
      const rowIndex = interactiveRows + i;
      
      updateTextRow(
        gridMesh[rowIndex],
        text,
        "#fff",
        "#222",
      );
      
    }
  }


  async function handleKey(e: KeyboardEvent) {
    if (e.key === "Enter") {
      if (!state.inputLine.trim()) return;

      commandEmitter.emit(INPUT_EVENT, state.inputLine.trim());
      state.inputLine = "";
    } else if (e.key === "Backspace") {
      state.inputLine = state.inputLine.slice(0, -1);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
    // Handle paste
      try {
        const text = await navigator.clipboard.readText();
        state.inputLine += text;
      } catch (err) {
        console.error("Failed to read clipboard: ", err);
      }
    } else if (e.key.length === 1) {
      state.inputLine += e.key;
    }

    updateInputRow(typing);
  }


  return {
    handleKey,
    updateChatDisplay,
    updateInputRow,
  };
}

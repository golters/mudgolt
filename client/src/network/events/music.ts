import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  MUSIC_EVENT, 
} from "../../../../events"
import {
  iconUtil,
} from "../../utils/icon"
import {
  store,
} from "../../store"
import {
  pushToLog,
} from "../../components/Terminal"
import {
  Music,
} from "../../../../@types"
import {
  BANNER_FILL,
  BANNER_WIDTH,
} from "../../../../constants"

const notes = {
  0: 261.6,
  1: 277.2,
  2: 293.7,
  3: 311.1,
  4: 329.6,
  5: 349.2,
  6: 370.0,
  7: 392.0,
  8: 415.3,
  9: 440.0,
  10: 466.2,
  11: 493.9,
  12: 523.3,
  13: 587.3,
  14: 659.3,
  15: 698.5,
  16: 784.0,
}

export interface instrument {
  id: string
  type: OscillatorType
  time: number
  detune: number
}

const instruments: instrument[] = [
  { id: "█", 
    type: "sawtooth",
    time: 5,
    detune: 0 },
  { id: "▓", 
    type: "square",
    time: 5,
    detune: 0 },
  { id: "▒", 
    type: "sine",
    time: 5, 
    detune: 0 },
  { id: "░", 
    type: "triangle",
    time: 5, 
    detune: 0 },
  { id: "◆", 
    type: "triangle",
    time: 10, 
    detune: 10 },
  { id: "◇", 
    type: "sine",
    time: 10, 
    detune: 10 },
  { id: "◈", 
    type: "square",
    time: 10, 
    detune: 10 },
  { id: "◐", 
    type: "square",
    time: 1, 
    detune: 0 },
  { id: "◑", 
    type: "sine",
    time: 1, 
    detune: 0 },
  { id: "◒", 
    type: "triangle",
    time: 1, 
    detune: 0 },
  { id: "◓", 
    type: "sawtooth",
    time: 1, 
    detune: 0 },
  { id: "★", 
    type: "sine",
    time: 5, 
    detune: 100 },
  { id: "☆", 
    type: "square",
    time: 5, 
    detune: 100 },
  { id: "☀", 
    type: "sawtooth",
    time: 5, 
    detune: 100 },
  { id: "☁", 
    type: "triangle",
    time: 5, 
    detune: 100 },
  { id: "♠", 
    type: "sine",
    time: 1, 
    detune: -100 },
  { id: "♡", 
    type: "square",
    time: 1, 
    detune: -100 },
  { id: "♣", 
    type: "sawtooth",
    time: 1, 
    detune: -100 },
  { id: "♢", 
    type: "triangle",
    time: 1, 
    detune: -100 },
];

const handler: NetworkEventHandler = (context: AudioContext) => {
  const music = store.music
  if(music === undefined){
    return
  }
  if(localStorage.Mstep === undefined){
    localStorage.Mstep = 0
  }
  if(localStorage.volume === undefined){
    localStorage.volume = 0.2
  }
  if(Number(localStorage.Mstep) < 0 || Number(localStorage.Mstep) >= 96){
    localStorage.Mstep = 0
  }
  for (let i = 0; i < 16; i++) {
    if(music.banner.charAt(Number(localStorage.Mstep) + (i * BANNER_WIDTH)) !== BANNER_FILL){
      const o = context.createOscillator()
      const  g = context.createGain()
      const frequency = notes[i as keyof typeof notes]
      const ins = instruments.find((inst) => {
        return inst.id === music.banner.charAt(Number(localStorage.Mstep) + (i * BANNER_WIDTH));
      });
      let type = ins?.type
      if(type === undefined){
        type = "sawtooth"
      }
      let time = ins?.time
      if(time === undefined){
        time = 5
      }
      o.type = type
      o.detune.value = 0
      o.frequency.value = frequency
      g.gain.exponentialRampToValueAtTime(localStorage.volume, context.currentTime)
      g.gain.exponentialRampToValueAtTime(0.000001, context.currentTime + time)
      o.connect(g)
      g.connect(context.destination)
      o.start(context.currentTime)
      o.stop(context.currentTime + time);
    }
  }
  if(Number(localStorage.Mstep) <= 96){
    localStorage.Mstep = Number(localStorage.Mstep) + 1
  }else{
    localStorage.Mstep = 0
  }
}

networkEmitter.on(MUSIC_EVENT, handler)

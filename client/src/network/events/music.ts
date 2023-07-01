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

const BluesMinor = {
  0: 783.99,
  1: 739.99,
  2: 698.46,
  3: 622.25,
  4: 523.25,
  5: 466.16,
  6: 392.00,
  7: 369.99,
  8: 349.23,
  9: 311.13,
  10: 261.63,
  11: 233.08,
  12: 196.00,
  13: 185.00,
  14: 174.61,
  15: 155.56,
  16: 130.81,
}

//evil move down an octave
const Locrian = {
  0: 622.25,
  1: 554.37,
  2: 523.25,
  3: 466.16,
  4: 415.30,
  5: 369.99,
  6: 349.23,
  7: 311.13,
  8: 277.18,
  9: 261.63,
  10: 233.08,
  11: 207.65,
  12: 185.00,
  13: 174.61,
  14: 155.56,
  15: 138.59,
  16: 130.81,
}

//sad
const Aeolian = {
  0: 1244.51,
  1: 1174.66,
  2: 1046.50,
  3: 932.33,
  4: 830.61,
  5: 783.99,
  6: 698.46,
  7: 622.25,
  8: 587.33,
  9: 523.25,
  10: 466.16,
  11: 415.30,
  12: 392.00,
  13: 349.23,
  14: 311.13,
  15: 293.66,
  16: 261.63,
}

//happy but serious
const Mixolydian = {
  0: 1318.51,
  1: 1174.66,
  2: 1046.50,
  3: 932.33,
  4: 880.00,
  5: 783.99,
  6: 698.46,
  7: 659.25,
  8: 587.33,
  9: 523.25,
  10: 466.16,
  11: 440.00,
  12: 392.00,
  13: 349.23,
  14: 329.63,
  15: 293.66,
  16: 261.63,
}

//quirky
const Lydian = {
  0: 1318.51,
  1: 1174.66,
  2: 1046.50,
  3: 987.77,
  4: 880.00,
  5: 783.99,
  6: 739.99,
  7: 659.25,
  8: 587.33,
  9: 523.25,
  10: 493.88,
  11: 440.00,
  12: 392.00,
  13: 369.99,
  14: 329.63,
  15: 293.66,
  16: 261.63,
}

//sad but hopeful
const Dorian = {
  0: 1244.51,
  1: 1174.66,
  2: 1046.50,
  3: 932.33,
  4: 880.00,
  5: 783.99,
  6: 698.46,
  7: 622.25,
  8: 587.33,
  9: 523.25,
  10: 466.16,
  11: 440.00,
  12: 392.00,
  13: 349.23,
  14: 311.13,
  15: 293.66,
  16: 261.63,
}

//dark
const Phrygian = {
  0: 622.25,
  1: 554.37,
  2: 523.25,
  3: 466.16,
  4: 415.30,
  5: 392.00,
  6: 349.23,
  7: 311.13,
  8: 277.18,
  9: 261.63,
  10: 233.08,
  11: 207.65,
  12: 196.00,
  13: 174.61,
  14: 155.56,
  15: 138.59,
  16: 130.81,
}

//happy
const Cmajor= {
  16: 261.63,
  15: 293.66,
  14: 329.63,
  13: 349.23,
  12: 392.00,
  11: 440.00,
  10: 493.88,
  9: 523.25,
  8: 587.33,
  7: 659.25,
  6: 698.46,
  5: 783.99,
  4: 880.00,
  3: 987.77,
  2: 1046.50,
  1: 1174.66,
  0: 1318.51,
}

//default
const Bminor = {
  16: 246.94,
  15: 277.18,
  14: 293.66,
  13: 329.63,
  12: 369.99,
  11: 392.00,
  10: 440.00,
  9: 493.88,
  8: 554.37,
  7: 587.33,
  6: 659.25,
  5: 739.99,
  4: 783.99,
  3: 880.00,
  2: 987.77,
  1: 1108.73,
  0: 1174.66,
}

export interface instrument {
  id: string
  type: OscillatorType
  time: number
  detune: number
}

const instruments: instrument[] = [
  { id: "👁", 
    type: "sine",
    time: 5,
    detune: 1000 },
  { id: "✈", 
    type: "sine",
    time: 10,
    detune: -1000 },
  { id: "✉", 
    type: "sine",
    time: 1, 
    detune: -1000 },
  { id: "✐", 
    type: "sine",
    time: 1, 
    detune: 1000 },
]

const handler: NetworkEventHandler = (context: AudioContext) => {
  const music = store.music
  if(music === undefined){
    return
  }
  if(localStorage.Mstep === undefined){
    localStorage.Mstep = 0
  }
  if(localStorage.volume === undefined){
    localStorage.volume = 0
  }
  if(Number(localStorage.Mstep) < 0 || Number(localStorage.Mstep) >= 96){
    localStorage.Mstep = 0
  }
  for (let i = 0; i < 16; i++) {
    if(music.banner.charAt(Number(localStorage.Mstep) + (i * BANNER_WIDTH)) !== BANNER_FILL){
      const o = context.createOscillator()
      const  g = context.createGain()
      let scale = Bminor
      const eventName = localStorage.event.split(",")[0]
      const eventStart = localStorage.event.split(",")[1]
      const eventEnd = localStorage.event.split(",")[2]
      if(Number(eventStart) < Date.now() && Number(eventEnd) > Date.now()){
        switch(eventName){
          case "Zombie_Invasion":
            scale = Phrygian
            break
          case "Fishing_Tournament":
            scale = Cmajor
            break
          case "Bear_Week":
            scale = Lydian
            break
        }
      }
      const frequency = scale[i as keyof typeof scale]
      const ins = instruments.find((inst) => {
        return inst.id === music.banner.charAt(Number(localStorage.Mstep) + (i * BANNER_WIDTH));
      });
      let type = ins?.type
      if(type === undefined){
        type = "sine"
      }
      let time = ins?.time
      if(time === undefined){
        time = 5
      }
      let detune = ins?.detune
      if(detune === undefined){
        detune = 0
      }
      o.type = type
      o.detune.value = detune
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

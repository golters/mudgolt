/* eslint-disable camelcase */
import {
  Game,
  Invite,
  Player,
  Room,
} from "../../@types"
import {
  db,
} from "../store"
import {
  BANNER_WIDTH, BANNER_HEIGHT, BANNER_FILL, 
} from "../../constants"
import {
  broadcastToUser,
} from "../network"
import {
  GAME_UPDATE_EVENT,
  ROOM_UPDATE_EVENT,
  LOG_EVENT,
} from "../../events"
import { getRoomById } from "./room"
import { getPlayerById } from "./player"

export const generateBanner = () => {
  return new Array(BANNER_WIDTH * BANNER_HEIGHT)
    .fill("▓")
    .join("")
}

const chessPieces ={  
  whitePieces: ["♖", "♘", "♗", "♕", "♔","♙"],
  blackPieces: ["♜", "♞", "♝", "♛", "♚","♟"],
}

const chessPoints ={
  "♟": 1,
  "♙": 1,
  "♞": 3,
  "♘": 3,
  "♝": 3,
  "♗": 3,
  "♜": 5,
  "♖": 5,
  "♛": 9,
  "♕": 9,
}

const chessMoves = (piece: string, game: Game, pos: number) => {
  let places: number[];
  let nw = false
  let ne = false
  let sw = false
  let se = false
  let n = false
  let w = false
  let s = false
  let e = false
  switch(piece) {
    case "♟":
      places = [pos + BANNER_WIDTH]
      if(chessPieces.whitePieces.includes(game.banner[pos + BANNER_WIDTH]) || 
      chessPieces.blackPieces.includes(game.banner[pos + BANNER_WIDTH])){
        places = []
      }else
      if(pos > BANNER_WIDTH * 5 && pos <= BANNER_WIDTH * 6){
        places.push(pos + (BANNER_WIDTH * 2))
      }
      if(chessPieces.whitePieces.includes(game.banner[pos+2 + BANNER_WIDTH])){
        places.push(pos+2 + BANNER_WIDTH)
      }
      if(chessPieces.whitePieces.includes(game.banner[pos-2 + BANNER_WIDTH])){
        places.push(pos-2 + BANNER_WIDTH)
      }
      
      return places
    case "♙":
      places = [pos - BANNER_WIDTH]
      if(chessPieces.whitePieces.includes(game.banner[pos - BANNER_WIDTH]) || 
      chessPieces.blackPieces.includes(game.banner[pos - BANNER_WIDTH])){
        places = []
      }else
      if(pos > BANNER_WIDTH * 10 && pos <= BANNER_WIDTH * 11){
        places.push(pos - (BANNER_WIDTH * 2))
      }
      if(chessPieces.blackPieces.includes(game.banner[pos+2 - BANNER_WIDTH])){
        places.push(pos+2 - BANNER_WIDTH)
      }
      if(chessPieces.blackPieces.includes(game.banner[pos-2 - BANNER_WIDTH])){
        places.push(pos-2 - BANNER_WIDTH)
      }
  
      return places
    case "♞":
      places = [pos + (BANNER_WIDTH * 2) + 2 , pos + (BANNER_WIDTH * 2) - 2, 
        pos - (BANNER_WIDTH * 2) + 2, pos - (BANNER_WIDTH * 2) - 2, 
        pos + 4 + BANNER_WIDTH, pos - 4 + BANNER_WIDTH, pos + 4 - BANNER_WIDTH, pos - 4 - BANNER_WIDTH]
      
      return places
    case "♘":
      places = [pos + (BANNER_WIDTH * 2) + 2 , pos + (BANNER_WIDTH * 2) - 2, 
        pos - (BANNER_WIDTH * 2) + 2, pos - (BANNER_WIDTH * 2) - 2, 
        pos + 4 + BANNER_WIDTH, pos - 4 + BANNER_WIDTH, pos + 4 - BANNER_WIDTH, pos - 4 - BANNER_WIDTH]
    
      return places
    case "♝":
      places = []

      for (let i = 1; i < 8; i++) {
        const place = i*2
        if(!chessPieces.whitePieces.includes(game.banner[pos + place + (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + place + (BANNER_WIDTH * i)]) && !ne){
          places.push(pos + place + (BANNER_WIDTH * i))
        }else{
          if(!ne){
            places.push(pos + place + (BANNER_WIDTH * i))
          }
          ne = true
        }
     
        if(!chessPieces.whitePieces.includes(game.banner[pos - place + (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - place + (BANNER_WIDTH * i)]) && !nw){
          places.push(pos - place + (BANNER_WIDTH * i))
        }else{
          if(!nw){
            places.push(pos - place + (BANNER_WIDTH * i))
          }
          nw = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos + place - (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + place - (BANNER_WIDTH * i)]) && !se){
          places.push(pos + place - (BANNER_WIDTH * i))
        }else{   
          if(!se){
            places.push(pos + place - (BANNER_WIDTH * i))
          }      
          se = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos - place - (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - place - (BANNER_WIDTH * i)]) && !sw){
          places.push(pos - place - (BANNER_WIDTH * i))
        }else{
          if(!sw){
            places.push(pos - place - (BANNER_WIDTH * i))
          }
          sw = true
        }      
      }
      
      return places
    case "♗":
      places = []

      for (let i = 1; i < 8; i++) {
        const place = i*2
        if(!chessPieces.whitePieces.includes(game.banner[pos + place + (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + place + (BANNER_WIDTH * i)]) && !ne){
          places.push(pos + place + (BANNER_WIDTH * i))
        }else{
          if(!ne){
            places.push(pos + place + (BANNER_WIDTH * i))
          }
          ne = true
        }
     
        if(!chessPieces.whitePieces.includes(game.banner[pos - place + (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - place + (BANNER_WIDTH * i)]) && !nw){
          places.push(pos - place + (BANNER_WIDTH * i))
        }else{
          if(!nw){
            places.push(pos - place + (BANNER_WIDTH * i))
          }
          nw = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos + place - (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + place - (BANNER_WIDTH * i)]) && !se){
          places.push(pos + place - (BANNER_WIDTH * i))
        }else{   
          if(!se){
            places.push(pos + place - (BANNER_WIDTH * i))
          }      
          se = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos - place - (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - place - (BANNER_WIDTH * i)]) && !sw){
          places.push(pos - place - (BANNER_WIDTH * i))
        }else{
          if(!sw){
            places.push(pos - place - (BANNER_WIDTH * i))
          }
          sw = true
        }      
      }
      
      return places
    case "♜":
      places = []

      for (let i = 1; i < 8; i++) {
        const place = i*2
        if(!chessPieces.whitePieces.includes(game.banner[pos - (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - (BANNER_WIDTH * i)]) && !n){
          places.push(pos - (BANNER_WIDTH * i))
        }else{
          if(!n){
            places.push(pos - (BANNER_WIDTH * i))
          }
          n = true
        }
     
        if(!chessPieces.whitePieces.includes(game.banner[pos + (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + (BANNER_WIDTH * i)]) && !s){
          places.push(pos + (BANNER_WIDTH * i))
        }else{
          if(!s){
            places.push(pos + (BANNER_WIDTH * i))
          }
          s = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos + place]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + place]) && !w){
          places.push(pos + place)
        }else{   
          if(!w){
            places.push(pos + place)
          }      
          w = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos - place]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - place]) && !e){
          places.push(pos - place)
        }else{
          if(!e){
            places.push(pos - place)
          }
          e = true
        }      
      }
      
      return places
    case "♖":
      places = []

      for (let i = 1; i < 8; i++) {
        const place = i*2
        if(!chessPieces.whitePieces.includes(game.banner[pos - (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - (BANNER_WIDTH * i)]) && !n){
          places.push(pos - (BANNER_WIDTH * i))
        }else{
          if(!n){
            places.push(pos - (BANNER_WIDTH * i))
          }
          n = true
        }
     
        if(!chessPieces.whitePieces.includes(game.banner[pos + (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + (BANNER_WIDTH * i)]) && !s){
          places.push(pos + (BANNER_WIDTH * i))
        }else{
          if(!s){
            places.push(pos + (BANNER_WIDTH * i))
          }
          s = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos + place]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + place]) && !w){
          places.push(pos + place)
        }else{   
          if(!w){
            places.push(pos + place)
          }      
          w = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos - place]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - place]) && !e){
          places.push(pos - place)
        }else{
          if(!e){
            places.push(pos - place)
          }
          e = true
        }      
      }
      
      return places
    case "♛":
      places = []

      for (let i = 1; i < 8; i++) {
        const place = i*2
        if(!chessPieces.whitePieces.includes(game.banner[pos + place + (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + place + (BANNER_WIDTH * i)]) && !ne){
          places.push(pos + place + (BANNER_WIDTH * i))
        }else{
          if(!ne){
            places.push(pos + place + (BANNER_WIDTH * i))
          }
          ne = true
        }
     
        if(!chessPieces.whitePieces.includes(game.banner[pos - place + (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - place + (BANNER_WIDTH * i)]) && !nw){
          places.push(pos - place + (BANNER_WIDTH * i))
        }else{
          if(!nw){
            places.push(pos - place + (BANNER_WIDTH * i))
          }
          nw = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos + place - (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + place - (BANNER_WIDTH * i)]) && !se){
          places.push(pos + place - (BANNER_WIDTH * i))
        }else{   
          if(!se){
            places.push(pos + place - (BANNER_WIDTH * i))
          }      
          se = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos - place - (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - place - (BANNER_WIDTH * i)]) && !sw){
          places.push(pos - place - (BANNER_WIDTH * i))
        }else{
          if(!sw){
            places.push(pos - place - (BANNER_WIDTH * i))
          }
          sw = true
        }      
        if(!chessPieces.whitePieces.includes(game.banner[pos - (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - (BANNER_WIDTH * i)]) && !n){
          places.push(pos - (BANNER_WIDTH * i))
        }else{
          if(!n){
            places.push(pos - (BANNER_WIDTH * i))
          }
          n = true
        }
     
        if(!chessPieces.whitePieces.includes(game.banner[pos + (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + (BANNER_WIDTH * i)]) && !s){
          places.push(pos + (BANNER_WIDTH * i))
        }else{
          if(!s){
            places.push(pos + (BANNER_WIDTH * i))
          }
          s = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos + place]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + place]) && !w){
          places.push(pos + place)
        }else{   
          if(!w){
            places.push(pos + place)
          }      
          w = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos - place]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - place]) && !e){
          places.push(pos - place)
        }else{
          if(!e){
            places.push(pos - place)
          }
          e = true
        }      
      }
      
      return places
    case "♕":
      places = []

      for (let i = 1; i < 8; i++) {
        const place = i*2
        if(!chessPieces.whitePieces.includes(game.banner[pos + place + (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + place + (BANNER_WIDTH * i)]) && !ne){
          places.push(pos + place + (BANNER_WIDTH * i))
        }else{
          if(!ne){
            places.push(pos + place + (BANNER_WIDTH * i))
          }
          ne = true
        }
     
        if(!chessPieces.whitePieces.includes(game.banner[pos - place + (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - place + (BANNER_WIDTH * i)]) && !nw){
          places.push(pos - place + (BANNER_WIDTH * i))
        }else{
          if(!nw){
            places.push(pos - place + (BANNER_WIDTH * i))
          }
          nw = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos + place - (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + place - (BANNER_WIDTH * i)]) && !se){
          places.push(pos + place - (BANNER_WIDTH * i))
        }else{   
          if(!se){
            places.push(pos + place - (BANNER_WIDTH * i))
          }      
          se = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos - place - (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - place - (BANNER_WIDTH * i)]) && !sw){
          places.push(pos - place - (BANNER_WIDTH * i))
        }else{
          if(!sw){
            places.push(pos - place - (BANNER_WIDTH * i))
          }
          sw = true
        }      
        if(!chessPieces.whitePieces.includes(game.banner[pos - (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - (BANNER_WIDTH * i)]) && !n){
          places.push(pos - (BANNER_WIDTH * i))
        }else{
          if(!n){
            places.push(pos - (BANNER_WIDTH * i))
          }
          n = true
        }
     
        if(!chessPieces.whitePieces.includes(game.banner[pos + (BANNER_WIDTH * i)]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + (BANNER_WIDTH * i)]) && !s){
          places.push(pos + (BANNER_WIDTH * i))
        }else{
          if(!s){
            places.push(pos + (BANNER_WIDTH * i))
          }
          s = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos + place]) && 
        !chessPieces.blackPieces.includes(game.banner[pos + place]) && !w){
          places.push(pos + place)
        }else{   
          if(!w){
            places.push(pos + place)
          }      
          w = true
        }

        if(!chessPieces.whitePieces.includes(game.banner[pos - place]) && 
        !chessPieces.blackPieces.includes(game.banner[pos - place]) && !e){
          places.push(pos - place)
        }else{
          if(!e){
            places.push(pos - place)
          }
          e = true
        }      
      }
      
      return places
    case "♚":
      places = []
      if(!chessPieces.whitePieces.includes(game.banner[pos + 2 + (BANNER_WIDTH)]) && 
      !chessPieces.blackPieces.includes(game.banner[pos + 2 + (BANNER_WIDTH)]) && !ne){
        places.push(pos + 2 + (BANNER_WIDTH))
      }else{
        if(!ne){
          places.push(pos + 2 + (BANNER_WIDTH))
        }
        ne = true
      }
   
      if(!chessPieces.whitePieces.includes(game.banner[pos - 2 + (BANNER_WIDTH)]) && 
      !chessPieces.blackPieces.includes(game.banner[pos - 2 + (BANNER_WIDTH)]) && !nw){
        places.push(pos - 2 + (BANNER_WIDTH))
      }else{
        if(!nw){
          places.push(pos - 2 + (BANNER_WIDTH))
        }
        nw = true
      }

      if(!chessPieces.whitePieces.includes(game.banner[pos + 2 - (BANNER_WIDTH)]) && 
      !chessPieces.blackPieces.includes(game.banner[pos + 2 - (BANNER_WIDTH)]) && !se){
        places.push(pos + 2 - (BANNER_WIDTH))
      }else{   
        if(!se){
          places.push(pos + 2 - (BANNER_WIDTH))
        }      
        se = true
      }

      if(!chessPieces.whitePieces.includes(game.banner[pos - 2 - (BANNER_WIDTH)]) && 
      !chessPieces.blackPieces.includes(game.banner[pos - 2 - (BANNER_WIDTH)]) && !sw){
        places.push(pos - 2 - (BANNER_WIDTH))
      }else{
        if(!sw){
          places.push(pos - 2 - (BANNER_WIDTH))
        }
        sw = true
      }      
      if(!chessPieces.whitePieces.includes(game.banner[pos - (BANNER_WIDTH)]) && 
      !chessPieces.blackPieces.includes(game.banner[pos - (BANNER_WIDTH)]) && !n){
        places.push(pos - (BANNER_WIDTH))
      }else{
        if(!n){
          places.push(pos - (BANNER_WIDTH))
        }
        n = true
      }
   
      if(!chessPieces.whitePieces.includes(game.banner[pos + (BANNER_WIDTH)]) && 
      !chessPieces.blackPieces.includes(game.banner[pos + (BANNER_WIDTH)]) && !s){
        places.push(pos + (BANNER_WIDTH))
      }else{
        if(!s){
          places.push(pos + (BANNER_WIDTH))
        }
        s = true
      }

      if(!chessPieces.whitePieces.includes(game.banner[pos + 2]) && 
      !chessPieces.blackPieces.includes(game.banner[pos + 2]) && !w){
        places.push(pos + 2)
      }else{   
        if(!w){
          places.push(pos + 2)
        }      
        w = true
      }

      if(!chessPieces.whitePieces.includes(game.banner[pos - 2]) && 
      !chessPieces.blackPieces.includes(game.banner[pos - 2]) && !e){
        places.push(pos - 2)
      }else{
        if(!e){
          places.push(pos - 2)
        }
        e = true
      }      
      
      return places
    case "♔":
      places = []
      if(!chessPieces.whitePieces.includes(game.banner[pos + 2 + (BANNER_WIDTH)]) && 
      !chessPieces.blackPieces.includes(game.banner[pos + 2 + (BANNER_WIDTH)]) && !ne){
        places.push(pos + 2 + (BANNER_WIDTH))
      }else{
        if(!ne){
          places.push(pos + 2 + (BANNER_WIDTH))
        }
        ne = true
      }
   
      if(!chessPieces.whitePieces.includes(game.banner[pos - 2 + (BANNER_WIDTH)]) && 
      !chessPieces.blackPieces.includes(game.banner[pos - 2 + (BANNER_WIDTH)]) && !nw){
        places.push(pos - 2 + (BANNER_WIDTH))
      }else{
        if(!nw){
          places.push(pos - 2 + (BANNER_WIDTH))
        }
        nw = true
      }

      if(!chessPieces.whitePieces.includes(game.banner[pos + 2 - (BANNER_WIDTH)]) && 
      !chessPieces.blackPieces.includes(game.banner[pos + 2 - (BANNER_WIDTH)]) && !se){
        places.push(pos + 2 - (BANNER_WIDTH))
      }else{   
        if(!se){
          places.push(pos + 2 - (BANNER_WIDTH))
        }      
        se = true
      }

      if(!chessPieces.whitePieces.includes(game.banner[pos - 2 - (BANNER_WIDTH)]) && 
      !chessPieces.blackPieces.includes(game.banner[pos - 2 - (BANNER_WIDTH)]) && !sw){
        places.push(pos - 2 - (BANNER_WIDTH))
      }else{
        if(!sw){
          places.push(pos - 2 - (BANNER_WIDTH))
        }
        sw = true
      }      
      if(!chessPieces.whitePieces.includes(game.banner[pos - (BANNER_WIDTH)]) && 
      !chessPieces.blackPieces.includes(game.banner[pos - (BANNER_WIDTH)]) && !n){
        places.push(pos - (BANNER_WIDTH))
      }else{
        if(!n){
          places.push(pos - (BANNER_WIDTH))
        }
        n = true
      }
   
      if(!chessPieces.whitePieces.includes(game.banner[pos + (BANNER_WIDTH)]) && 
      !chessPieces.blackPieces.includes(game.banner[pos + (BANNER_WIDTH)]) && !s){
        places.push(pos + (BANNER_WIDTH))
      }else{
        if(!s){
          places.push(pos + (BANNER_WIDTH))
        }
        s = true
      }

      if(!chessPieces.whitePieces.includes(game.banner[pos + 2]) && 
      !chessPieces.blackPieces.includes(game.banner[pos + 2]) && !w){
        places.push(pos + 2)
      }else{   
        if(!w){
          places.push(pos + 2)
        }      
        w = true
      }

      if(!chessPieces.whitePieces.includes(game.banner[pos - 2]) && 
      !chessPieces.blackPieces.includes(game.banner[pos - 2]) && !e){
        places.push(pos - 2)
      }else{
        if(!e){
          places.push(pos - 2)
        }
        e = true
      }      
      
      return places
  }
}

const chessCheck = (piece:string, banner: string) => {
  let check = ""
  const ban = banner.split("")
  const pos = ban.indexOf(piece)
  let nw = false
  let ne = false
  let sw = false
  let se = false
  let n = false
  let w = false
  let s = false
  let e = false
  if(piece === "♚"){
    if(ban[pos + 2] === "♔" || ban[pos - 2] === "♔" || ban[pos + BANNER_WIDTH] === "♔" || ban[pos - BANNER_WIDTH] === "♔" ||
    ban[pos + 2 + BANNER_WIDTH] === "♔" || ban[pos - 2 + BANNER_WIDTH] === "♔" || ban[pos + 2 -BANNER_WIDTH] === "♔" || ban[pos - 2 - BANNER_WIDTH] === "♔"){
      check = "check"
    }
    if(ban[pos + BANNER_WIDTH - 2] === "♙"){
      check = "check"
    }
    if(ban[pos + BANNER_WIDTH + 2] === "♙"){
      check = "check"
    }    
    if(ban[pos + (BANNER_WIDTH * 2) + 2] === "♘" || ban[pos + (BANNER_WIDTH * 2) - 2] === "♘" ||
      ban[pos - (BANNER_WIDTH * 2) + 2] === "♘" || ban[pos - (BANNER_WIDTH * 2) - 2] === "♘" || 
      ban[pos + 4 + BANNER_WIDTH] === "♘" || ban[pos - 4 + BANNER_WIDTH] === "♘" || ban[pos + 4 - BANNER_WIDTH] === "♘" ||
      ban[pos - 4 - BANNER_WIDTH] === "♘"){
      check = "check"
    }
    for (let i = 1; i < 8; i++) {
      const place = i*2
      if(!chessPieces.whitePieces.includes(ban[pos + place + (BANNER_WIDTH * i)]) && 
      !chessPieces.blackPieces.includes(ban[pos + place + (BANNER_WIDTH * i)]) && !ne){        
      }else{
        if(!ne){
          if(ban[pos + place + (BANNER_WIDTH * i)] === "♗" || ban[pos + place + (BANNER_WIDTH * i)] === "♕"){
            check = "check"
          }else{
            ne = true
          }
        }
      }
   
      if(!chessPieces.whitePieces.includes(ban[pos - place + (BANNER_WIDTH * i)]) && 
      !chessPieces.blackPieces.includes(ban[pos - place + (BANNER_WIDTH * i)]) && !nw){
      }else{
        if(!nw){
          if(ban[pos - place + (BANNER_WIDTH * i)] === "♗" || ban[pos - place + (BANNER_WIDTH * i)] === "♕"){
            check = "check"
          }else{
            nw = true
          }
        }
      }

      if(!chessPieces.whitePieces.includes(ban[pos + place - (BANNER_WIDTH * i)]) && 
      !chessPieces.blackPieces.includes(ban[pos + place - (BANNER_WIDTH * i)]) && !se){
      }else{   
        if(!se){
          if(ban[pos + place - (BANNER_WIDTH * i)] === "♗" || ban[pos + place - (BANNER_WIDTH * i)] === "♕"){
            check = "check"
          }else{            
            se = true
          }
        }      
      }

      if(!chessPieces.whitePieces.includes(ban[pos - place - (BANNER_WIDTH * i)]) && 
      !chessPieces.blackPieces.includes(ban[pos - place - (BANNER_WIDTH * i)]) && !sw){
      }else{
        if(!sw){
          if(ban[pos - place - (BANNER_WIDTH * i)] === "♗" || ban[pos - place - (BANNER_WIDTH * i)] === "♕"){
            check = "check"
          }else{            
            sw = true
          }
        }
      }      
      if(!chessPieces.whitePieces.includes(ban[pos - (BANNER_WIDTH * i)]) && 
      !chessPieces.blackPieces.includes(ban[pos - (BANNER_WIDTH * i)]) && !n){
      }else{
        if(!n){
          if(ban[pos - (BANNER_WIDTH * i)] === "♖" || ban[pos - (BANNER_WIDTH * i)] === "♕"){
            check = "check"
          }else{
            n = true
          }
        }
      }
   
      if(!chessPieces.whitePieces.includes(ban[pos + (BANNER_WIDTH * i)]) && 
      !chessPieces.blackPieces.includes(ban[pos + (BANNER_WIDTH * i)]) && !s){
      }else{
        if(!s){
          if(ban[pos + (BANNER_WIDTH * i)] === "♖" || ban[pos + (BANNER_WIDTH * i)] === "♕"){
            check = "check"
          }else{
            s = true
          }
        }
      }

      if(!chessPieces.whitePieces.includes(ban[pos + place]) && 
      !chessPieces.blackPieces.includes(ban[pos + place]) && !w){
      }else{   
        if(!w){
          if(ban[pos + place] === "♖" || ban[pos + place] === "♕"){
            check = "check"
          }else{
            w = true
          }
        }      
      }

      if(!chessPieces.whitePieces.includes(ban[pos - place]) && 
      !chessPieces.blackPieces.includes(ban[pos - place]) && !e){
      }else{
        if(!e){
          if(ban[pos - place] === "♖" || ban[pos - place] === "♕"){
            check = "check"
          }else{
            e = true
          }
        }
      }      
    }

  }
  if(piece === "♔"){
    if(ban[pos + 2] === "♚" || ban[pos - 2] === "♚" || ban[pos + BANNER_WIDTH] === "♚" || ban[pos - BANNER_WIDTH] === "♚" ||
    ban[pos + 2 + BANNER_WIDTH] === "♚" || ban[pos - 2 + BANNER_WIDTH] === "♚" || ban[pos + 2 -BANNER_WIDTH] === "♚" || ban[pos - 2 - BANNER_WIDTH] === "♚"){
      check = "check"
    }
    if(ban[pos - BANNER_WIDTH - 2] === "♟"){
      check = "check"
    }
    if(ban[pos - BANNER_WIDTH + 2] === "♟"){
      check = "check"
    }    
    if(ban[pos + (BANNER_WIDTH * 2) + 2] === "♞" || ban[pos + (BANNER_WIDTH * 2) - 2] === "♞" ||
      ban[pos - (BANNER_WIDTH * 2) + 2] === "♞" || ban[pos - (BANNER_WIDTH * 2) - 2] === "♞" || 
      ban[pos + 4 + BANNER_WIDTH] === "♞" || ban[pos - 4 + BANNER_WIDTH] === "♞" || ban[pos + 4 - BANNER_WIDTH] === "♞" ||
      ban[pos - 4 - BANNER_WIDTH] === "♞"){
      check = "check"
    }
    for (let i = 1; i < 8; i++) {
      const place = i*2
      if(!chessPieces.whitePieces.includes(ban[pos + place + (BANNER_WIDTH * i)]) && 
      !chessPieces.blackPieces.includes(ban[pos + place + (BANNER_WIDTH * i)]) && !ne){        
      }else{
        if(!ne){
          if(ban[pos + place + (BANNER_WIDTH * i)] === "♝" || ban[pos + place + (BANNER_WIDTH * i)] === "♛"){
            check = "check"
          }else{
            ne = true
          }
        }
      }
   
      if(!chessPieces.whitePieces.includes(ban[pos - place + (BANNER_WIDTH * i)]) && 
      !chessPieces.blackPieces.includes(ban[pos - place + (BANNER_WIDTH * i)]) && !nw){
      }else{
        if(!nw){
          if(ban[pos - place + (BANNER_WIDTH * i)] === "♝" || ban[pos - place + (BANNER_WIDTH * i)] === "♛"){
            check = "check"
          }else{
            nw = true
          }
        }
      }

      if(!chessPieces.whitePieces.includes(ban[pos + place - (BANNER_WIDTH * i)]) && 
      !chessPieces.blackPieces.includes(ban[pos + place - (BANNER_WIDTH * i)]) && !se){
      }else{   
        if(!se){
          if(ban[pos + place - (BANNER_WIDTH * i)] === "♝" || ban[pos + place - (BANNER_WIDTH * i)] === "♛"){
            check = "check"
          }else{            
            se = true
          }
        }      
      }

      if(!chessPieces.whitePieces.includes(ban[pos - place - (BANNER_WIDTH * i)]) && 
      !chessPieces.blackPieces.includes(ban[pos - place - (BANNER_WIDTH * i)]) && !sw){
      }else{
        if(!sw){
          if(ban[pos - place - (BANNER_WIDTH * i)] === "♝" || ban[pos - place - (BANNER_WIDTH * i)] === "♛"){
            check = "check"
          }else{            
            sw = true
          }
        }
      }      
      if(!chessPieces.whitePieces.includes(ban[pos - (BANNER_WIDTH * i)]) && 
      !chessPieces.blackPieces.includes(ban[pos - (BANNER_WIDTH * i)]) && !n){
      }else{
        if(!n){
          if(ban[pos - (BANNER_WIDTH * i)] === "♜" || ban[pos - (BANNER_WIDTH * i)] === "♛"){
            check = "check"
          }else{
            n = true
          }
        }
      }
   
      if(!chessPieces.whitePieces.includes(ban[pos + (BANNER_WIDTH * i)]) && 
      !chessPieces.blackPieces.includes(ban[pos + (BANNER_WIDTH * i)]) && !s){
      }else{
        if(!s){
          if(ban[pos + (BANNER_WIDTH * i)] === "♜" || ban[pos + (BANNER_WIDTH * i)] === "♛"){
            check = "check"
          }else{
            s = true
          }
        }
      }

      if(!chessPieces.whitePieces.includes(ban[pos + place]) && 
      !chessPieces.blackPieces.includes(ban[pos + place]) && !w){
      }else{   
        if(!w){
          if(ban[pos + place] === "♜" || ban[pos + place] === "♛"){
            check = "check"
          }else{
            w = true
          }
        }      
      }

      if(!chessPieces.whitePieces.includes(ban[pos - place]) && 
      !chessPieces.blackPieces.includes(ban[pos - place]) && !e){
      }else{
        if(!e){
          if(ban[pos - place] === "♜" || ban[pos - place] === "♛"){
            check = "check"
          }else{
            e = true
          }
        }
      }      
    }

  }


  return check
}

export const chessBoard = () => {
  const topBoarder = new Array(BANNER_WIDTH * 4)
    .fill("▒")
    .join("")
  const sideBoarder = new Array(40)
    .fill("▒")
    .join("")
  const board = topBoarder + 
  sideBoarder + "♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜ " + sideBoarder +
  sideBoarder + "♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ " + sideBoarder +
  sideBoarder + "▓▓  ▓▓  ▓▓  ▓▓  " + sideBoarder +
  sideBoarder + "  ▓▓  ▓▓  ▓▓  ▓▓" + sideBoarder +
  sideBoarder + "▓▓  ▓▓  ▓▓  ▓▓  " + sideBoarder +
  sideBoarder + "  ▓▓  ▓▓  ▓▓  ▓▓" + sideBoarder +
  sideBoarder + "♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙ " + sideBoarder +
  sideBoarder + "♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖ " + sideBoarder +
  topBoarder

  return board  
}

export const createGame = async (player1Id: number, player2Id: number | undefined, type: string): Promise<Game> => {
  const existingGame = await db.get<Game>(/*sql*/`
    SELECT * FROM games
    WHERE "player1" = $1 
    OR "player2" = $1
    OR "player3" = $1
    OR "player4" = $1
  `, [player1Id])

  if (existingGame) {
    throw new Error("You are already in a game")
  }

  const game = await db.get(/*sql*/`
    INSERT INTO games ("player1", "player2", "type", "banner")
      VALUES ($1, $2, $3, $4);
  `, [
    player1Id,
    player2Id,
    type,
    chessBoard(),
  ])

  return game
}

export const endGame = async (game_id: number): Promise<void> => {
  await db.run(/*sql*/`
    DELETE FROM games WHERE "id" = $1;
  `, [
    game_id,
  ])
}

//join game

export const getGameByInvite = async (inv: Invite): Promise<Game> => {
  const game = await db.get<Game>(/*sql*/`
    SELECT * FROM games 
    WHERE "player1" = $1 
    AND "player2" = $2
  `, [inv.player1,inv.player2])

  if (game === undefined) {
    throw new Error("game does not exist")		
  }
  
  return game
}

export const findGameByPlayer = async (player1: number): Promise<Game> => {
  const game = await db.get<Game>(/*sql*/`
    SELECT * FROM games 
    WHERE "player1" = $1 
    OR "player2" = $1
  `, [player1])

  if (game === undefined) {
    throw new Error("game does not exist")		
  }

  return game
}

export const getGameById = async (game_id: number): Promise<Game> => {
  const game = await db.get<Game>(/*sql*/`
    SELECT * FROM games WHERE "id" = $1;
  `, [game_id])

  if (game === undefined) {
    throw new Error("game does not exist")		
  }
  
  return game
}

export const chessClick = async (x: number, y: number, player: Player, game: Game): Promise<Game> => {
  
  const gameinfo = game.game_info.split(",")
  let currentMove = "player1"
  if(game.player2 === player.id){
    currentMove = "player2"
  }
  if(gameinfo[0] !== currentMove){
    throw new Error("it's not your turn")
  }
  const pos = x + (y * BANNER_WIDTH)
  const banner = game.banner.split("") 
  const oldBanner = game.banner 
  if (typeof x !== "number" || typeof y !== "number") {
    throw new Error("invalid payload")
  }
  let place = pos
  if(x % 2 != 0){
    place = pos - 1
  }   
  if(!game.player1 || !game.player2) {
    throw new Error("player missing")
  }
  const p1 = await getPlayerById(game.player1)
  const p2 = await getPlayerById(game.player2)
  if(!p1 || !p2){
    throw new Error("player missing")
  }
  let other = "player1"
  if(p1.id === player.id){
    other = "player2"
  }
  let newgameinfo = ""
  if(gameinfo[1] === "select"){
    if(banner[pos] === "▒"){
      throw new Error("click on the board")
    }
    if(other === "player2"){
      if(!chessPieces.whitePieces.includes(banner[place])){
        throw new Error("you are playing white")
      }
    }
    if(other === "player1"){
      if(!chessPieces.blackPieces.includes(banner[place])){
        throw new Error("you are playing black")
      }
    }
    newgameinfo = gameinfo[0] + ",place," + place
    banner[place + 1] = "<"
    game.banner = banner.join("")
    await 
    db.run(/*sql*/`
    UPDATE games
      SET banner = $1
      WHERE id = $2;
  `, [game.banner, game.id])
  
  }else{
    if(banner[place] === "▒"){
      newgameinfo = gameinfo[0] + ",select"
      banner[Number(gameinfo[2])+1] = " "
      game.banner = banner.join("")
      await 
      db.run(/*sql*/`
      UPDATE games
        SET banner = $1
        WHERE id = $2;
    `, [game.banner, game.id])
    }else{
      newgameinfo = other + ",select"
      if(other === "player2"){
        if(chessPieces.whitePieces.includes(banner[place])){
          throw new Error("you can't take your own piece")
        }
        if(chessPieces.blackPieces.includes(banner[place])){
          broadcastToUser<string>(LOG_EVENT, "white took " + banner[place], p1.username)
          broadcastToUser<string>(LOG_EVENT, "white took " + banner[place], p2.username)
        }        
      }
      if(other === "player1"){
        if(chessPieces.blackPieces.includes(banner[place])){
          throw new Error("you can't take your own piece")
        }
        if(chessPieces.whitePieces.includes(banner[place])){
          broadcastToUser<string>(LOG_EVENT, "black took " + banner[place], p1.username)
          broadcastToUser<string>(LOG_EVENT, "black took " + banner[place], p2.username)
        }
      }
      const moves = await chessMoves(banner[Number(gameinfo[2])],game,Number(gameinfo[2]))
      if(!moves?.includes(place)){
        throw new Error(banner[Number(gameinfo[2])] + " doesn't move like that")
      }
      let boardColor = " "
      for (let i = 0; i < BANNER_HEIGHT; i++) {
        if(Number(gameinfo[2]) > i * BANNER_WIDTH && Number(gameinfo[2]) < (i + 1) * BANNER_WIDTH){
          if(i % 2 != 0){
            if(Number(gameinfo[2]) % 4 != 0){
              boardColor = "▓"
            }
          }else {
            if(Number(gameinfo[2]) % 4 == 0){
              boardColor = "▓"
            }
          }
        }
      }
      banner[place] = banner[Number(gameinfo[2])]
      banner[place + 1] = " "
      banner[Number(gameinfo[2])] = boardColor
      banner[Number(gameinfo[2]) + 1] = boardColor
      game.banner = banner.join("")
      let checkcheck = await chessCheck("", game.banner)
      if(other === "player1"){
        checkcheck = await chessCheck("♚", game.banner)
      }else{
        checkcheck = await chessCheck("♔", game.banner)
      }
      if(checkcheck === "check"){
        throw new Error("that will put you in check")
      }
      await 
      db.run(/*sql*/`
      UPDATE games
        SET banner = $1
        WHERE id = $2;
    `, [game.banner, game.id])
    }
    game.game_info = newgameinfo
  }
  await 
  db.run(/*sql*/`
  UPDATE games
  SET game_info = $1
  WHERE id = $2;
  `, [newgameinfo, game.id])
  const room = await getRoomById(player.roomId)
  broadcastToUser<Game>(GAME_UPDATE_EVENT, game, p1.username)
  broadcastToUser<Room>(ROOM_UPDATE_EVENT, room, p1.username)
  broadcastToUser<Game>(GAME_UPDATE_EVENT, game, p2.username)
  broadcastToUser<Room>(ROOM_UPDATE_EVENT, room, p2.username)

  return game
}

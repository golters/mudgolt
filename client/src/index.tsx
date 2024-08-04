import {
  cryptoTask, 
} from "./crypto"
import {
  pushToLog,
  Terminal, 
} from "./components/Terminal"
import {
  networkTask, sendEvent, 
} from "./network"
import {
  Header, 
} from "./components/Header"
import {
  Explore,
} from "./components/explore"
import {
  Home,
} from "./components/home"
import "./commands"
import { SoundProvider } from './components/SoundContext';


import React from "react"
import ReactDOM from "react-dom"
import { EVENT_EVENT } from "../../events"
navigator.storage.persist().catch(console.error)


const init = async () => {
  await cryptoTask();
  await networkTask();

};

const loadComponents = () => {
  ReactDOM.render(
    <>
      <Explore />
    </>, 
    document.body
  )
}

const loadHome = () => {
  ReactDOM.render(
    <>
      <SoundProvider>
      <Home/>
      </SoundProvider>
    </>, 
    document.body
  )

}

const url = new URL(window.location.href)

  init().catch(console.error);

if (url.pathname.startsWith('/explore')) {
  loadComponents()
} else {
  loadHome()
}

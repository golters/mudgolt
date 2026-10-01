import React from "react"
import ReactDOM from "react-dom"
import { networkTask } from "./network"
import { Explore } from "./components/explore"
import { Home } from "./components/home"
import { SoundProvider } from "./components/SoundContext"
import "./commands"

navigator.storage?.persist().catch(console.error)

const root = document.getElementById("root")!
const exploring = new URL(window.location.href).pathname.startsWith("/explore")

ReactDOM.render(
  exploring ? <Explore /> : <SoundProvider><Home /></SoundProvider>,
  root,
)

networkTask().catch(console.error)

import React, { useEffect, useRef, useCallback, useState } from "react"
import "./Welcome.css"


export const Welcome: React.FC = () => {  
  const [welcome, setWelcome] = useState(true)
  return (
    <main
    >{welcome ? <span>
      <div className="welcome">
        <div className="welcome-toolbar">
          Welcome
          <div id="welcome-close" onClick={() => setWelcome(false)}>
            X
          </div>
        </div>
        <div className="welcome-content">
          <span id="welcome-text">{"What is mudgolt.com?"}</span>
          <br></br>
          <span id="welcome-text">{"It's your favourite community as a place! Linking rooms together to create an online landscape of discussion."}</span>
          <br></br>
          <br></br>
          <span id="welcome-text">{"How to start using mudgolt.com:"}</span>
          <br></br>
          <span id="welcome-text">{"The first thing you'll want to do is pick out a unique username by typing the command /username [name] into the chat below."}</span>
          <br></br>
          <br></br>
          <span id="welcome-text">{"To navigate the site you can use the /go [door] command to move to other chatrooms through the doors listed in the /look command. Or you can simply click the movement(✈) icon in the toolbar above."}</span>
          <br></br>
          <br></br>
          <span id="welcome-text">{"Earn Golts(✪) by interacting with other users to spend on making your own rooms/doors/items and by drawing onto the banners in every room."}</span>
        </div>
      </div>
        </span> : " "}
    </main>
  )
}

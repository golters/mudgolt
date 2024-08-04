import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from "react-dom"
import './home.css'; // Import CSS for styling
import { imageToAsciiArray, generateBackdrop, createColorCombinations, adjustColorByTime, findClosestColorCombination} from './home_art';
import {
    networkEmitter, NetworkEventHandler
} from "../network/events"
import {
    CHAT_ALL_EVENT, ACTIVE_UPDATE_EVENT,
    HOME_UPDATE_EVENT,
    RANDOM_ROOM_EVENT,
} from "../../../events"
import {
    Chat, Room,
} from "../../../@types"
import { networkTask, sendEvent } from "../network";
import {
  store,
} from "../store"
import { colorUtil } from "../../src/utils"
import { themes } from "../../src/utils/themes"
import { useSoundContext,SoundProvider } from './SoundContext';
import { Volume } from "src/commands/volume"

export interface imageData {
    image: AsciiTile[][]; // Update to use AsciiTile
    width: number;
    height: number;
    startX: number;
    startY: number;
}

interface AsciiTile {
    character: string;
    avgColor: string;
    backColor: string;
}

//font size offset
const offsetY = 1;
const offsetX = 1;

const charLimit = 7500;
const notificationDisplayTime = 5000; // Time in milliseconds to display the notification
const maxNotifications = 5;
const notificationCharLimit = 100; //add character limit to notifications before ...

// Generate a unique ID for notifications
let notificationId = 0;
const getNextNotificationId = () => ++notificationId;


let activeRooms: Room[] = [];
let randomRooms: Room[] = [];

const handler = ({ player, message, roomName }: Chat) => {
    return (
        <div>
            <p>{"[" + roomName + "] "}
            {"[" + player.username + "] "}
            {message}</p>
        </div>
    );
}



export function getClouds(): number {
    const now = new Date();
    const month = now.getMonth(); // getMonth() returns 0 for January, so we add 1
    const hour = now.getHours();

    // Ensure the month and hour are valid
    if (month < 1 || month > 12) {
        throw new Error("Invalid month. Month should be between 1 and 12.");
    }
    if (hour < 0 || hour > 23) {
        throw new Error("Invalid hour. Hour should be between 0 and 23.");
    }

    // Normalize the month to a range from 0 to 1 (0 for January, 1 for December)
    const normalizedMonth = month / 11;

    // Normalize the hour to a range from 0 to 1 (0 for 12 AM, 1 for 11 PM)
    const normalizedHour = hour / 23;

    // Simple formula combining month and hour to calculate likelihood
    const likelihood = normalizedMonth * 5 + normalizedHour * 4;

    // Round to the nearest integer and ensure it's within 0 to 9
    const roundedLikelihood = Math.round(likelihood);
    return Math.min(9, Math.max(0, roundedLikelihood));
}
  
export const Home: React.FC = () => {
    const [asciiArt, setAsciiArt] = useState<JSX.Element[]>([]);
    const [notifications, setNotifications] = useState<JSX.Element[]>([]);
    const eventListenerRef = useRef<null | (() => void)>(null);
    const [muted, setMuted] = useState(!!localStorage.getItem("muted") || false)
    const [volume, setVolume] = useState(localStorage.volume*10)
    const [randomEvent] = useState(Math.floor(Math.random() * 10)); // Consistent value across renders
    

    const cloudStrength = getClouds();//1 to 9
    let frame = 1;
    
    const { playRain, playTorch, stopTorch, playGnome, playCrow, playOwl, playChest, setHomeVolume } = useSoundContext();

    useEffect(() => {
        if(localStorage.volume != volume/10){
        setHomeVolume(volume/1000);
        localStorage.volume = volume/10
        }
    },[volume, setHomeVolume])
    //will not trigger on start because they match so it doesn't set

    useEffect(() => {
        if (cloudStrength >= 6) {
            playRain();
        }
    }, [cloudStrength, playRain]);

    useEffect(() => {
        if (!(new Date().getHours() < 22 && new Date().getHours() > 5)) {
            playTorch();
        } else {
            stopTorch();
        }
    }, [playTorch, stopTorch]);

    useEffect(() => {
        switch (randomEvent){
        case 0:
            playGnome();
            break;
        case 1:
            playCrow();
            break;
        case 3:
            playOwl();
            break;
        case 4:
            playChest();
            break;
        }
    }, [randomEvent, playGnome,playCrow,playOwl,playChest,frame]);

    if(activeRooms.length === 0)sendEvent(HOME_UPDATE_EVENT, store.player?.roomId)
    const eventHandler = (event: string, data: any) => {
        switch (event) {
            case CHAT_ALL_EVENT:
                    const message = handler(data);
                    const id = getNextNotificationId(); // Generate unique ID
                    if (notifications.length >= maxNotifications) {
                        setNotifications(prevNotifications => prevNotifications.slice(1)); // Remove oldest notification if at max limit
                    }
                    setNotifications(prevNotifications => [
                        ...prevNotifications,
                        <div key={id}>
                            {message}
                        </div>
                    ]);
                    setTimeout(() => setNotifications(prevNotifications => prevNotifications.slice(1)), notificationDisplayTime); // Remove the oldest notification after a set time
                break;
            case ACTIVE_UPDATE_EVENT:
                activeRooms = data
            break;
            case RANDOM_ROOM_EVENT:
                randomRooms = data
            break;
        }

    }


    const addEventListeners = () => {
        const listener = (event: string, data: any) => eventHandler(event, data);
        networkEmitter.on(CHAT_ALL_EVENT, data => listener(CHAT_ALL_EVENT, data));
        networkEmitter.on(ACTIVE_UPDATE_EVENT, data => listener(ACTIVE_UPDATE_EVENT, data));
        networkEmitter.on(RANDOM_ROOM_EVENT, data => listener(RANDOM_ROOM_EVENT, data));
        eventListenerRef.current = () => {
            networkEmitter.off(CHAT_ALL_EVENT, data => listener(CHAT_ALL_EVENT, data));
            networkEmitter.off(ACTIVE_UPDATE_EVENT, data => listener(ACTIVE_UPDATE_EVENT, data));
            networkEmitter.off(RANDOM_ROOM_EVENT, data => listener(RANDOM_ROOM_EVENT, data));
        };
    };

    useEffect(() => {
        if (!eventListenerRef.current) {
            addEventListeners();
        }

        return () => {
            if (eventListenerRef.current) {
                eventListenerRef.current();
                eventListenerRef.current = null;
            }
        };
    }, []);
      
    // Async function to generate ASCII art
    const generateAsciiArt = async () => {
        // Initial calculation for width and height / characters
        let width = Math.floor(window.innerWidth / offsetX);
        let height = Math.floor(window.innerHeight / offsetY);
        
        // Calculate rescaling factor
        const rescale = Math.sqrt(charLimit / (width * height));
        
        // Adjust width and height based on rescale factor
        width = Math.max(1, Math.round(width * rescale));
        height = Math.max(1, Math.round(height * rescale));
        
        // Set CSS variables for adjusted font size and line height
        document.documentElement.style.setProperty('--vh', `${(window.innerHeight / height /2.1)*2}px`);
        document.documentElement.style.setProperty('--vw', `${(window.innerWidth / width)*2}px`);


        try {
            const centerY = Math.floor(height / 2);
            const centerX = Math.floor(width / 2);
            let DoorNum = 0;
            let torchNum = -1;
            let gnomeNum = -1;

            let images: imageData[] = []



            /*
            images[0] = {} as imageData;
            const Wall = await imageToAsciiArray("/gradient.png", width, height);
            images[0].image = Wall;
            images[0].width = Wall[0].length;
            images[0].height = Wall.length;
            images[0].startX = centerX - Math.floor(images[0].width / 2);
            images[0].startY = centerY - Math.floor(images[0].height / 2);
            */
            if(frame < 5){
                frame++;
            }else{
                frame = 1;
            }
            const Steps = await imageToAsciiArray("/steps.svg", width, height);
            const backTree = await imageToAsciiArray("/backtree"+Math.abs(frame-3)+".svg", width, height/2);
            const Wall = await imageToAsciiArray("/wall.svg", width, height);
            const backWall = await imageToAsciiArray("/backwall.svg", width, height);
            const Door = await imageToAsciiArray("/door.svg", width / 2, height / 2);
            const Tree = await imageToAsciiArray("/tree"+Math.abs(frame-3)+".svg", width, height);
            let Torch = await imageToAsciiArray("/torchOff.svg", width/6, height/6);
            if(!(new Date().getHours() < 22 && new Date().getHours() > 5)){
                Torch = await imageToAsciiArray("/torch"+(Math.floor(Math.random()*3)+1)+".svg", width/6, height/6);
            }
            let i = 0;
            images[i] = {} as imageData;
            const backDrop = await generateBackdrop(width,height,cloudStrength);
            images[i].image = backDrop;
            images[i].width = backDrop[0].length;
            images[i].height = backDrop.length;
            images[i].startX = centerX - Math.floor(images[i].width / 2);
            images[i].startY = centerY - Math.floor(images[i].height / 2);

            i++;
            images[i] = {} as imageData;
            images[i].image = Steps;
            images[i].width = Steps[0].length;
            images[i].height = Steps.length;
            images[i].startX = centerX - Math.floor(images[i].width / 2);
            images[i].startY = centerY - Math.floor(images[i].height / 2) + Math.floor(height/2);

            i++;
            images[i] = {} as imageData;
            images[i].image = backTree;
            images[i].width = backTree[0].length;
            images[i].height = backTree.length;
            images[i].startX = centerX - Math.floor(images[i].width / 2) - Math.floor(Wall[0].length/1.5);
            images[i].startY = centerY - Math.floor(images[i].height / 2);

            
            i++;
            images[i] = {} as imageData;
            images[i].image = backWall;
            images[i].width = backWall[0].length;
            images[i].height = backWall.length;
            images[i].startX = centerX - Math.floor(images[i].width / 2) + Math.floor(Wall[0].length/1.1);
            images[i].startY = centerY - Math.floor(images[i].height / 2) - Math.floor(height / 4);
            
            i++;
            images[i] = {} as imageData;
            images[i].image = Wall;
            images[i].width = Wall[0].length;
            images[i].height = Wall.length;
            images[i].startX = centerX - Math.floor(images[i].width / 2);
            images[i].startY = centerY - Math.floor(images[i].height / 2) - Math.floor(height / 4);

            i++;
            images[i] = {} as imageData;
            DoorNum = i;
            images[i].image = Door;
            images[i].width = Door[0].length;
            images[i].height = Door.length;
            images[i].startX = centerX - Math.floor(images[i].width / 2);
            images[i].startY = centerY - Math.floor(images[i].height / 2);
            
            i++;
            images[i] = {} as imageData;
            torchNum = i;
            images[i].image = Torch;
            images[i].width = Torch[0].length;
            images[i].height = Torch.length;
            images[i].startX = centerX - Math.floor(images[i].width / 2) - Math.floor(Door[0].length/2);
            images[i].startY = centerY - Math.floor(images[i].height / 2);
            
            const torchRadius = (Math.min(width, height)/4) + Math.random();
            let torchX = images[torchNum].startX + Math.floor(images[torchNum].width / 2);
            let torchY = images[torchNum].startY + Math.floor(images[torchNum].height / 4);

            i++;
            images[i] = {} as imageData;
            images[i].image = Tree;
            images[i].width = Tree[0].length;
            images[i].height = Tree.length;
            images[i].startX = centerX - Math.floor(images[i].width / 2) + Math.floor(Door[0].length/1.5);
            images[i].startY = centerY - Math.floor(images[i].height / 2) - Math.floor(height / 4.5);

            switch (randomEvent){
                case 0:
                const gnome = await imageToAsciiArray("/gnome"+Math.abs(frame-3)+".svg", width/3, height/3);
                i++;
                images[i] = {} as imageData;
                images[i].image = gnome;
                images[i].width = gnome[0].length;
                images[i].height = gnome.length;
                images[i].startX = centerX - Math.floor(images[i].width / 2) - Math.floor(Door[0].length/1.5);
                images[i].startY = centerY - Math.floor(images[i].height / 2) + Math.floor(height/5);
                gnomeNum = i;
                break;
                case 1:
                    const crow = await imageToAsciiArray("/crow"+Math.abs(frame-3)+".svg", width/10, height/10);
                    i++;
                    images[i] = {} as imageData;
                    images[i].image = crow;
                    images[i].width = crow[0].length;
                    images[i].height = crow.length;
                    images[i].startX = centerX - Math.floor(images[i].width / 2) + Math.floor(Door[0].length/1.5);
                    images[i].startY = centerY - Math.floor(images[i].height / 2) - Math.floor(height / 4.5);
                break;
                case 2:
                    const boat = await imageToAsciiArray("/boat.svg", width/4, height/4);
                    i++;
                    images[i] = {} as imageData;
                    images[i].image = boat;
                    images[i].width = boat[0].length;
                    images[i].height = boat.length;
                    images[i].startX = centerX - Math.floor(images[i].width * 8);
                    images[i].startY = centerY - Math.floor(images[i].height/4);

                break;
                case 3:
                    const owl = await imageToAsciiArray("/owl"+Math.abs(frame-3)+".svg", width/7, height/7);
                    i++;
                    images[i] = {} as imageData;
                    images[i].image = owl;
                    images[i].width = owl[0].length;
                    images[i].height = owl.length;
                    images[i].startX = centerX - Math.floor(images[i].width / 2) + Math.floor(Door[0].length/1.5);
                    images[i].startY = centerY - Math.floor(images[i].height / 2) - Math.floor(height / 4.5);
                break;
                case 4:
                    const chest = await imageToAsciiArray("/chest"+Math.abs(frame-3)+".svg", width/6, height/6);
                    i++;
                    images[i] = {} as imageData;
                    images[i].image = chest;
                    images[i].width = chest[0].length;
                    images[i].height = chest.length;
                    images[i].startX = centerX - Math.floor(images[i].width / 2) - Math.floor(Door[0].length/1.5);
                    images[i].startY = centerY - Math.floor(images[i].height / 2) + Math.floor(height/5);
                break;
            }
            if(new Date().getHours() > 23 || new Date().getHours() < 1){
            const creepyMan = await imageToAsciiArray("/creepyMan.svg", width, height);
            i++;
            images[i] = {} as imageData;
            images[i].image = creepyMan;
            images[i].width = creepyMan[0].length;
            images[i].height = creepyMan.length;
            images[i].startX = centerX - Math.floor(images[i].width / 2) + Math.floor(Door[0].length/1.5);
            images[i].startY = centerY - Math.floor(images[i].height / 2) - Math.floor(height / 4.5);
            }





            const colorCombos = createColorCombinations()

            let art: JSX.Element[] = [];
            for (let y = 0; y < height; y++) {
                let row: JSX.Element[] = [];
                for (let x = 0; x < width; x++) {
                    let tile: AsciiTile = { character: " ", avgColor: "white", backColor: "black" }; // Default tile
                    // Add className for door elements and onClick handler
                    let isDoor = images[DoorNum].startY <= y && y < images[DoorNum].startY + images[DoorNum].height &&
                                    images[DoorNum].startX <= x && x < images[DoorNum].startX + images[DoorNum].width && 
                                    images[DoorNum];
                    for (let i = 0; i < images.length; i++) {
                        if (y === 0 || x === 0 || y === height - 1 || x === width - 1) {
                            tile = { character: "▓", avgColor: "", backColor: "" };
                        } else {
                            if (y >= images[i].startY && y < images[i].startY + images[i].height && x >= images[i].startX && x < images[i].startX + images[i].width) {
                                const asciiTile = images[i].image[y - images[i].startY][x - images[i].startX];
                                let closerColor = findClosestColorCombination(asciiTile.avgColor,colorCombos);
                                // Calculate the distance from the torch
                                let rainColor = findClosestColorCombination("rgb(255,255,255)",colorCombos)[0];
                                const torchDistance = Math.sqrt(Math.pow(x - torchX, 2) + Math.pow(y - torchY, 2));
                                if((torchDistance > torchRadius || (i < torchNum - 2 || i > torchNum)) || (new Date().getHours() < 22 && new Date().getHours() > 5)){
                                    const timeColor = adjustColorByTime(asciiTile.avgColor,colorCombos);
                                    closerColor = findClosestColorCombination(timeColor,colorCombos);
                                    const darkRainColor = adjustColorByTime("rgb(255,255,255)",colorCombos);
                                    rainColor = findClosestColorCombination(darkRainColor,colorCombos)[0];
                                }
                                if (asciiTile.character !== "") {
                                    // Place the premade art character
                                    tile = asciiTile;
                                    tile.avgColor = closerColor[0];
                                    tile.backColor = closerColor[1];
                                }else if(i == DoorNum){
                                    isDoor = false;
                                }
                                if(randomEvent === 0){
                                    const gnomeDistance = Math.sqrt(Math.pow(x - images[gnomeNum].startX - (images[gnomeNum].width/2), 2) + Math.pow(y - images[gnomeNum].startY, 2));
                                    if((Math.random() * 10) > 9 && gnomeDistance < (Math.min(width, height)/8) && i != gnomeNum){
                                        const musicNotes = ["♪","♫"];
                                        tile.character = (musicNotes[Math.floor(Math.random()*musicNotes.length)])
                                        tile.avgColor =  findClosestColorCombination("rgb(0,0,0)",colorCombos)[0];
    
                                    }
                                }
                                if((Math.random() * 10) + 6 < cloudStrength){
                                    // rain effect
                                    const month = new Date().getMonth();
                                    tile.character = (month >= 12 || month <= 2) ? '*' : '/';
                                    tile.avgColor = rainColor;
                                }
                            }
                        }
                    }
                    const className = isDoor ? 'door' : '';
                    row.push(
                        <p 
                            key={`${x}-${y}`} 
                            style={{ 
                                display: 'inline', 
                                margin: 0, 
                                color: tile.avgColor, 
                                background: tile.backColor 
                            }}
                            className={className}
                            onClick={isDoor ? handleButtonClick : undefined}
                        >
                            {tile.character}
                        </p>
                    );
                }
                art.push(<div key={y} style={{ height: '1em' }}>{row}</div>);
            }

            setAsciiArt(art);
        } catch (error) {
            console.error('Error generating ASCII art:', error);
            setAsciiArt([<p key="error">Error generating ASCII art.</p>]);
        }
    };

    const getColor = (char: string): string => {
        switch (char) {
            case '▓':
            case '▒':
            case '░':
                return 'white';
            default:
                return 'white';
        }
    };

    useEffect(() => {
        generateAsciiArt();
        const interval = setInterval(generateAsciiArt, 1000); // Update every 1 second
        return () => clearInterval(interval);
    }, []);

    const handleButtonClick = () => {
        window.location.href = `${window.location.origin}/explore`;
    };

    return (
        <div className="ascii-background">
            <div className="ascii-content">
                {asciiArt}
            </div>
            <div className='explore-button' onClick={handleButtonClick}>Enter</div>
            <div className='notification'>
                {notifications.map(notification => (
                    <div key={notification.key}>
                        {notification}
                    </div>
                ))}
            </div>
            <div className="recent-rooms">
                    <div>
                        Recently Active Rooms:
                        </div>
                {activeRooms.map((room, index) => (
                    <a key={index} className="room-name" href={`${window.location.origin}/explore?go=${room.name}`} data-description={room.description}>
                        {room.name}
                    </a>
                ))}
                <div>
                    Random Rooms:
                    </div>
            {randomRooms.map((room, index) => (
                <a key={index} className="room-name" href={`${window.location.origin}/explore?go=${room.name}`} data-description={room.description}>
                    {room.name}
                </a>
            ))}
            </div>
              <div className="home-themes">
            {themes.map((symbol, key) => {
                return <span key={key} 
                onClick={() => colorUtil.changeTheme(symbol.name)}
        style={{
            backgroundColor: symbol['background-primary'],
            border: symbol['sidebar-border'],
            color: symbol['text-primary']
          }}>{symbol.name}</span>
            })}</div>
            <div className="home-volume">
            <span>{volume>0?"🕪":"x🕨"}</span>
            <input type="range" min="0" max="1000" value={volume} className="slider" id="myRange" onChange={event => {
              setVolume(event.target.valueAsNumber)
            }}></input></div>
        </div>
    );
};

export default Home;

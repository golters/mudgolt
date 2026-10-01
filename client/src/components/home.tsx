import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from "react-dom"
import './home.css'; // Import CSS for styling
import { imageToAsciiArray, generateBackdrop, createColorCombinations, adjustColorByTime, findClosestColorCombination, FRAME_GLYPH, MUSIC_GLYPHS, RAIN_GLYPHS} from './home_art';
import { PixiAsciiRenderer } from './PixiAsciiRenderer';
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
import { client, networkTask, sendEvent } from "../network";
import {
  store,
} from "../store"
import { colorUtil } from "../../src/utils"
import { themes } from "../../src/utils/themes"
import { useSoundContext,SoundProvider } from './SoundContext';

export interface imageData {
    image: AsciiTile[][]; // Update to use AsciiTile
    width: number;
    height: number;
    startX: number;
    startY: number;
}

interface AsciiTile {
    character: string;
    avgColor: number;
    backColor: number;
}

const WHITE = 0xffffff;
const BLACK = 0;

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

localStorage.volume = localStorage.volume || "0.2"
localStorage.muted = localStorage.muted || "true"

if (isNaN(Number(localStorage.volume))) {
    localStorage.volume = "0.2"
}
  
export const Home: React.FC = () => {
    const [notifications, setNotifications] = useState<JSX.Element[]>([]);
    const eventListenerRef = useRef<null | (() => void)>(null);
    const asciiRootRef = useRef<HTMLDivElement>(null);
    const pixiRendererRef = useRef<PixiAsciiRenderer | null>(null);
    const tileBuffersRef = useRef({
        tiles: [] as AsciiTile[][],
        doorTiles: [] as boolean[][],
        width: 0,
        height: 0,
    });
    const colorCachesRef = useRef({
        normal: new Map<number, [number, number]>(),
        time: new Map<number, [number, number]>(),
        timeKey: '',
    });
    const [muted, setMuted] = useState(localStorage.getItem("muted") === "true")
    const [volume, setVolume] = useState(Number(localStorage.volume) * 10)
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

    if (client && activeRooms.length === 0) {
        sendEvent(HOME_UPDATE_EVENT, store.player?.roomId)
    }
        
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

    useEffect(() => {
        const root = asciiRootRef.current;
        if (!root) {
            return;
        }

        let disposed = false;
        let renderer: PixiAsciiRenderer | null = null;
        const initializeRenderer = async () => {
            renderer = await PixiAsciiRenderer.create(root);
            if (disposed) {
                renderer.destroy();
                return;
            }
            pixiRendererRef.current = renderer;
        };
        initializeRenderer();

        const handleDoorClick = (event: MouseEvent) => {
            if (pixiRendererRef.current?.isDoorAt(event.clientX, event.clientY)) {
                window.location.href = `${window.location.origin}/explore`;
            }
        };

        root.addEventListener('click', handleDoorClick);
        return () => {
            disposed = true;
            root.removeEventListener('click', handleDoorClick);
            pixiRendererRef.current?.destroy();
            pixiRendererRef.current = null;
        };
    }, []);

    const renderAsciiDom = (tiles: AsciiTile[][], doorTiles: boolean[][]) => {
        pixiRendererRef.current?.render(tiles, doorTiles);
    };

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
            const now = new Date();
            const hour = now.getHours();
            const month = now.getMonth();
            const isDay = hour > 5 && hour < 22;
            const timeKey = `${hour}:${now.getMinutes()}`;
            if (colorCachesRef.current.timeKey !== timeKey) {
                colorCachesRef.current.time.clear();
                colorCachesRef.current.timeKey = timeKey;
            }
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
            if(!isDay){
                Torch = await imageToAsciiArray("/torch"+(Math.floor(Math.random()*3)+1)+".svg", width/6, height/6);
            }
            let i = 0;
            images[i] = {} as imageData;
            const backDrop = await generateBackdrop(width, height, cloudStrength, now);
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
            if(hour > 23 || hour < 1){
            const creepyMan = await imageToAsciiArray("/creepyMan.svg", width, height);
            i++;
            images[i] = {} as imageData;
            images[i].image = creepyMan;
            images[i].width = creepyMan[0].length;
            images[i].height = creepyMan.length;
            images[i].startX = centerX - Math.floor(images[i].width / 2) + Math.floor(Door[0].length/1.5);
            images[i].startY = centerY - Math.floor(images[i].height / 2) - Math.floor(height / 4.5);
            }





            const colorCombos = createColorCombinations();
            const { normal: normalColorCache, time: timeColorCache } = colorCachesRef.current;
            const getClosestColor = (color: number, useTimeColor: boolean) => {
                if (useTimeColor) {
                    const cached = timeColorCache.get(color);
                    if (cached) {
                        return cached;
                    }

                    const closest = findClosestColorCombination(
                        adjustColorByTime(color, now),
                        colorCombos
                    );
                    timeColorCache.set(color, closest);
                    return closest;
                }

                return findClosestColorCombination(color, colorCombos, normalColorCache);
            };
            const whiteColor = getClosestColor(WHITE, false)[0];
            const darkWhiteColor = getClosestColor(WHITE, true)[0];
            const blackColor = getClosestColor(BLACK, false)[0];
            const torchRadiusSquared = torchRadius * torchRadius;
            const gnomeRadius = Math.min(width, height) / 8;
            const gnomeRadiusSquared = gnomeRadius * gnomeRadius;
            const gnomeX = gnomeNum >= 0
                ? images[gnomeNum].startX + images[gnomeNum].width / 2
                : 0;
            const gnomeY = gnomeNum >= 0 ? images[gnomeNum].startY : 0;
            const buffers = tileBuffersRef.current;
            if (buffers.width !== width || buffers.height !== height) {
                buffers.tiles = Array.from(
                    { length: height },
                    () => Array.from(
                        { length: width },
                        () => ({ character: " ", avgColor: WHITE, backColor: BLACK })
                    )
                );
                buffers.doorTiles = Array.from(
                    { length: height },
                    () => Array(width).fill(false)
                );
                buffers.width = width;
                buffers.height = height;
            }

            const { tiles, doorTiles } = buffers;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const tile = tiles[y][x];
                    tile.character = " ";
                    tile.avgColor = WHITE;
                    tile.backColor = BLACK;
                    doorTiles[y][x] = false;
                }
            }

            for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const image = images[imageIndex];
                const startY = Math.max(1, image.startY);
                const endY = Math.min(height - 1, image.startY + image.height);
                const startX = Math.max(1, image.startX);
                const endX = Math.min(width - 1, image.startX + image.width);

                for (let y = startY; y < endY; y++) {
                    const imageRow = image.image[y - image.startY];
                    for (let x = startX; x < endX; x++) {
                        const asciiTile = imageRow[x - image.startX];
                        const torchDx = x - torchX;
                        const torchDy = y - torchY;
                        const useTimeColor = isDay ||
                            torchDx * torchDx + torchDy * torchDy > torchRadiusSquared ||
                            imageIndex < torchNum - 2 || imageIndex > torchNum;

                        if (asciiTile.character !== "") {
                            const closerColor = getClosestColor(asciiTile.avgColor, useTimeColor);
                            const tile = tiles[y][x];
                            tile.character = asciiTile.character;
                            tile.avgColor = closerColor[0];
                            tile.backColor = closerColor[1];
                            if (imageIndex === DoorNum) {
                                doorTiles[y][x] = true;
                            }
                        } else if (imageIndex === DoorNum) {
                            doorTiles[y][x] = false;
                        }

                        const tile = tiles[y][x];
                        if (randomEvent === 0 && imageIndex !== gnomeNum) {
                            const gnomeDx = x - gnomeX;
                            const gnomeDy = y - gnomeY;
                            if ((Math.random() * 10) > 9 &&
                                gnomeDx * gnomeDx + gnomeDy * gnomeDy < gnomeRadiusSquared) {
                                tile.character = MUSIC_GLYPHS[Math.floor(Math.random() * MUSIC_GLYPHS.length)];
                                tile.avgColor = blackColor;
                            }
                        }
                        if ((Math.random() * 10) + 6 < cloudStrength) {
                            tile.character = (month >= 12 || month <= 2) ? RAIN_GLYPHS[0] : RAIN_GLYPHS[1];
                            tile.avgColor = useTimeColor ? darkWhiteColor : whiteColor;
                        }
                    }
                }
            }

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (y === 0 || x === 0 || y === height - 1 || x === width - 1) {
                        const tile = tiles[y][x];
                        tile.character = FRAME_GLYPH;
                        tile.avgColor = WHITE;
                        tile.backColor = BLACK;
                        doorTiles[y][x] = false;
                    }
                }
            }

            renderAsciiDom(tiles, doorTiles);
        } catch (error) {
            console.error('Error generating ASCII art:', error);
            const root = asciiRootRef.current;
            if (root) {
                root.textContent = 'Error generating ASCII art.';
            }
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
            <div ref={asciiRootRef} className="ascii-content" />
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

import{
  colorUtil,
} from "./color"

const canvas = document.createElement("canvas")
const context = canvas.getContext("2d")

canvas.width = 128
canvas.height = 128


class IconUtil {  
  public changeFavicon(src: string) {
    const link = document.createElement("link"),
      oldLink = document.getElementById("dynamic-favicon");
    link.id = "dynamic-favicon";
    link.rel = "shortcut icon";
    link.href = src;
    if (oldLink) {
      document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
  }

  public getFaviconUrl = (notificationCount: number): string => {
    if(!context){
      throw new Error("no context");
    }
    const rootElement = document.documentElement;
    
    const circleColor = rootElement.style.getPropertyValue("--color-background-primary")
    context.fillStyle = circleColor
    context.beginPath()
  
    context.arc(
      canvas.width / 2, // x
      canvas.height / 2, // y
      canvas.width / 2, // radius
      0, // start angle
      Math.PI * 2, // end angle
    )
  
    context.fill()
    context.closePath()
  
    context.font = "bold 5rem monospace"
    const fontColor = rootElement.style.getPropertyValue("--color-text-primary")
    context.fillStyle = fontColor

    let message = "MG" 
    if(notificationCount > 0){
      message = "✪"
    }
    context.fillText(
      message, 
      canvas.width / 4, 
      canvas.height / 1.5,
    )

    this.changeFavicon(`${canvas.toDataURL}`)
  
    //return canvas.toDataURL()
    return "./favicon.icon"
  }
  
}

export const iconUtil = new IconUtil();

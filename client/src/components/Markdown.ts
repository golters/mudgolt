import marked from "marked"
import "./Markdown.css"

marked.setOptions({
  gfm: true,
  sanitize: true,
})

const renderer = new marked.Renderer()

renderer.link = (href, title, text) => {
  return `<a target="_blank" href="${href}">${text}</a>`
}

export const Markdown = (string: string, options: marked.MarkedOptions = {}) => {
  const container = document.createElement("span")
  
  container.innerHTML = marked(string, {
    renderer, 
    ...options,
  })

  container.classList.toggle("markdown")

  return container
}

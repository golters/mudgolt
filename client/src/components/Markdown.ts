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

export const Markdown = (string: string) => {
  const container = document.createElement("span")
  container.innerHTML = marked(string, { renderer })
  container.classList.toggle("markdown")

  return container
}

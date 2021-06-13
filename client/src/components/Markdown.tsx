import marked from "marked"
import React from "react"
import "./Markdown.css"

marked.setOptions({
  gfm: true,
  sanitize: true,
})

const renderer = new marked.Renderer()

renderer.link = (href, title, text) => {
  return `<a target="_blank" href="${href}">${text}</a>`
}

export const Markdown: React.FC<{
  string: string, 
  options?: marked.MarkedOptions,
}> = (props) => {
  const __html = marked(props.string, {
    renderer, 
    ...(props.options || {}),
  })

  return (
    <span
      className="markdown" 
      dangerouslySetInnerHTML={{ __html }} 
    />
  )
}

import React from "react"
import { renderMarkdown } from "../utils/markdown"
import "./Markdown.css"

export const Markdown: React.FC<{
  string: string,
  allowHtml?: boolean,
}> = (props) => {
  const __html = renderMarkdown(props.string, props.allowHtml)

  return (
    <span
      className="markdown"
      dangerouslySetInnerHTML={{ __html }}
    />
  )
}

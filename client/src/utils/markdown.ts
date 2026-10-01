import { Marked, Renderer } from "marked"
import DOMPurify from "dompurify"

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, character => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[character]!))

const renderer = new Renderer()
renderer.link = function (token) {
  const link = Renderer.prototype.link.call(this, token)
  return link.replace("<a ", '<a target="_blank" rel="noopener noreferrer" ')
}

const markdown = new Marked({ gfm: true, renderer })
const textOnlyHtml = new Renderer()
textOnlyHtml.html = ({ text }) => escapeHtml(text)
textOnlyHtml.link = renderer.link

export function renderMarkdown(source: string, allowHtml = false): string {
  const html = markdown.parse(source, {
    async: false,
    renderer: allowHtml ? renderer : textOnlyHtml,
  })
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target"],
  })
}

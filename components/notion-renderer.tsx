"use client"
// import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import remarkGfm from "remark-gfm"
import Image from "next/image"

interface NotionRendererProps {
  markdown: string
}

export default function NotionRenderer({ markdown }: NotionRendererProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "")
            return !inline && match ? (
              <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" {...props}>
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          img({ ...props }: any) {
            return (
              <div className="relative w-full h-96 my-8">
                <Image src={props.src || ""} alt={props.alt || ""} fill className="object-contain" />
              </div>
            )
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

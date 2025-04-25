import { getPage, getPageMarkdown } from "@/lib/notion"
import NotionRenderer from "@/components/notion-renderer"
import { notFound } from "next/navigation"

export default async function BlogPost({ params }: { params: { pageId: string } }) {
  try {
    // Notion 페이지 ID로 페이지 정보 가져오기
    const page = await getPage(params.pageId)

    // 페이지 제목 추출
    const title = page.properties.Title?.title[0]?.plain_text || "제목 없음"

    // 페이지 내용을 마크다운으로 변환
    const markdown = await getPageMarkdown(params.pageId)

    return (
      <article className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <div className="text-gray-500">
            {new Date(page.created_time).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        <NotionRenderer markdown={markdown} />
      </article>
    )
  } catch (error) {
    console.error("Error fetching blog post:", error)
    notFound()
  }
}

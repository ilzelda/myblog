import { getPage, getBlocks } from "@/lib/notion"
import { notFound } from "next/navigation"
import NotionBlockRenderer, { NotionBlock } from "../../components/notion-block-renderer"

export default async function BlogPost({ params }: { params: Promise<{ pageId: string }> }) {
  try {
    const { pageId } = await params
    // Notion 페이지 ID로 페이지 정보 가져오기
    const page = await getPage(pageId)

    // 페이지 제목 추출 (타입 안전하게 처리)
    let title = "제목 없음";
    if ('properties' in page && page.properties.title && 'title' in page.properties.title) {
      title = page.properties.title.title
        .map((part: { plain_text: string }) => part.plain_text)
        .join("");
    }

    // 생성 날짜 추출 (타입 안전하게 처리)
    let createdTime = new Date();
    if ('created_time' in page) {
      createdTime = new Date(page.created_time);
    }

    // 페이지 블록들 가져오기
    // 페이지 블록들 가져오기 (타입 변환)
    const blocksResponse = await getBlocks(pageId)
    const blocks = blocksResponse.filter(block => 'type' in block) as NotionBlock[]

    return (
      <article className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <div className="text-gray-500">
            {createdTime.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>
        
        <main>
          <NotionBlockRenderer blocks={blocks} />
        </main>
        
      </article>
    )
  } catch (error) {
    console.error("Error fetching blog post:", error)
    notFound()
  }
}

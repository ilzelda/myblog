import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md"

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const n2m = new NotionToMarkdown({ notionClient: notion })

export async function getChildPages(page_id: string) {
  const response = await notion.blocks.children.list({
    block_id: page_id,
  });

  return response.results;
}

// 특정 페이지 정보 가져오기
export async function getPage(pageId: string) {
  const response = await notion.pages.retrieve({ page_id: pageId })
  console.log("[LOG] getPage : \n", response)
  return response
}

// 페이지 내용(블록) 가져오기
export async function getBlocks(blockId: string) {
  const blocks = []
  let cursor

  while (true) {
    const { results, next_cursor } = await notion.blocks.children.list({
      start_cursor: cursor,
      block_id: blockId,
    })
    blocks.push(...results)
    if (!next_cursor) {
      break
    }
    cursor = next_cursor
  }

  // 중첩된 블록 처리
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    if (block.has_children) {
      const children = await getBlocks(block.id)
      blocks[i].children = children
    }
  }

  return blocks
}

// Notion 페이지를 마크다운으로 변환
export async function getPageMarkdown(pageId: string) {
  const mdblocks = await n2m.pageToMarkdown(pageId)
  const mdString = n2m.toMarkdownString(mdblocks)
  return mdString.parent
}

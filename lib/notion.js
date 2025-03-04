import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function getChildPages() {
  const response = await notion.blocks.children.list({
    block_id: process.env.NOTION_PARENT_PAGE_ID,
  });

  return response.results;
}

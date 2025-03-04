import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });


import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

async function fetchNotionData() {
  const response = await notion.blocks.children.list({
    block_id: process.env.NOTION_PARENT_PAGE_ID,
  });
  console.log(response);
}

fetchNotionData();

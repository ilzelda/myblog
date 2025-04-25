// /app/page.tsx
import Link from "next/link";
import { getChildPages } from "../lib/notion";

export const revalidate = 60;

export default async function Home() {
  const pages = await getChildPages(process.env.NOTION_PARENT_PAGE_ID);

  return (
    <div>
      <h1>My Portfolio</h1>
      <ul>
        {pages.map((page) => (
          "child_page" in page ? (
            <li key={page.id}>
              <Link href={`/${page.id}`}>
                { page.child_page.title}
              </Link>
            </li>
          ) : null
        ))}
      </ul>
    </div>
  );
}

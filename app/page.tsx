// /app/page.tsx
import { getChildPages } from "../lib/notion";

export const revalidate = 60;

export default async function Home() {
  const pages = await getChildPages();

  return (
    <div>
      <h1>My Portfolio</h1>
      <ul>
        {pages.map((page) => (
          <li key={page.id}>
            {page?.child_page?.title || "No Title"}
          </li>
        ))}
      </ul>
    </div>
  );
}

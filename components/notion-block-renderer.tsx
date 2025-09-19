import React from 'react';
import Image from 'next/image';

// Notion API 타입 정의
interface RichText {
  plain_text: string;
  href?: string;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
}

interface NotionBlock {
  id: string;
  type: string;
  [key: string]: unknown;
  children?: NotionBlock[];
}

interface BlockValue {
  rich_text?: RichText[];
  language?: string;
  caption?: RichText[];
  type?: string;
  external?: { url: string };
  file?: { url: string };
  icon?: {
    type: string;
    emoji?: string;
  };
  url?: string;
}

interface NotionBlockRendererProps {
  blocks: NotionBlock[];
}

const NotionBlockRenderer: React.FC<NotionBlockRendererProps> = ({ blocks }) => {
  const renderBlock = (block: NotionBlock) => {
    const { type, id } = block;
    const value = block[type] as BlockValue;

    switch (type) {
      case 'paragraph':
        return (
          <p key={id} className="mb-4">
            {(value.rich_text || []).map((text: RichText, index: number) => (
              <span
                key={index}
                className={`
                  ${text.annotations.bold ? 'font-bold' : ''}
                  ${text.annotations.italic ? 'italic' : ''}
                  ${text.annotations.strikethrough ? 'line-through' : ''}
                  ${text.annotations.underline ? 'underline' : ''}
                  ${text.annotations.code ? 'bg-gray-100 px-1 rounded font-mono text-sm' : ''}
                `}
                style={{
                  color: text.annotations.color !== 'default' ? text.annotations.color : 'inherit'
                }}
              >
                {text.href ? (
                  <a href={text.href} className="text-blue-600 hover:underline">
                    {text.plain_text}
                  </a>
                ) : (
                  text.plain_text
                )}
              </span>
            ))}
          </p>
        );

      case 'heading_1':
        return (
          <h1 key={id} className="text-2xl font-bold mb-4 mt-8">
            {(value.rich_text || []).map((text: RichText) => text.plain_text).join('')}
          </h1>
        );

      case 'heading_2':
        return (
          <h2 key={id} className="text-xl font-bold mb-3 mt-6">
            {(value.rich_text || []).map((text: RichText) => text.plain_text).join('')}
          </h2>
        );

      case 'heading_3':
        return (
          <h3 key={id} className="text-lg font-bold mb-2 mt-4">
            {(value.rich_text || []).map((text: RichText) => text.plain_text).join('')}
          </h3>
        );

      case 'bulleted_list_item':
      case 'numbered_list_item':
        return (
          <li key={id} className="mb-2 ml-4">
            {(value.rich_text || []).map((text: RichText, index: number) => (
              <span key={index}>{text.plain_text}</span>
            ))}
            {block.children && (
              <div className="ml-4">
                <NotionBlockRenderer blocks={block.children} />
              </div>
            )}
          </li>
        );

      case 'code':
        return (
          <pre key={id} className="bg-gray-900 text-white p-4 rounded mb-4 overflow-x-auto">
            <code className={`language-${value.language || 'text'}`}>
              {(value.rich_text || []).map((text: RichText) => text.plain_text).join('')}
            </code>
          </pre>
        );

      case 'quote':
        return (
          <blockquote key={id} className="border-l-4 border-gray-300 pl-4 italic mb-4">
            {(value.rich_text || []).map((text: RichText, index: number) => (
              <span key={index}>{text.plain_text}</span>
            ))}
          </blockquote>
        );

      case 'divider':
        return <hr key={id} className="my-8 border-gray-300" />;

      case 'image':
        const src = value.type === 'external' && value.external 
          ? value.external.url 
          : value.file?.url || '';
        return (
          <div key={id} className="mb-6">
            <Image
              src={src}
              alt={value.caption ? value.caption.map((c: RichText) => c.plain_text).join('') : ''}
              width={800}
              height={400}
              className="rounded-lg"
            />
            {value.caption && value.caption.length > 0 && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                {value.caption.map((c: RichText) => c.plain_text).join('')}
              </p>
            )}
          </div>
        );

      case 'toggle':
        return (
          <details key={id} className="mb-4">
            <summary className="cursor-pointer font-medium">
              {(value.rich_text || []).map((text: RichText) => text.plain_text).join('')}
            </summary>
            <div className="mt-2 ml-4">
              {block.children && <NotionBlockRenderer blocks={block.children} />}
            </div>
          </details>
        );

      case 'callout':
        return (
          <div key={id} className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex items-start">
              {value.icon && (
                <span className="mr-2 text-lg">
                  {value.icon.type === 'emoji' ? value.icon.emoji : '📝'}
                </span>
              )}
              <div>
                {(value.rich_text || []).map((text: RichText, index: number) => (
                  <span key={index}>{text.plain_text}</span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'embed':
        return (
          <div key={id} className="mb-6">
            <iframe
              src={value.url as string}
              className="w-full h-96 border rounded"
              title="Embedded content"
            />
          </div>
        );

      default:
        return (
          <div key={id} className="mb-4 p-2 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">
              지원되지 않는 블록 타입: {type}
            </p>
          </div>
        );
    }
  };

  // 연속된 리스트 아이템들을 그룹화
  const groupBlocks = (blocks: NotionBlock[]) => {
    const grouped: (NotionBlock | { type: string; listType: string; items: NotionBlock[]; id: string })[] = [];
    let currentList: NotionBlock[] = [];
    let currentListType = '';

    blocks.forEach((block) => {
      if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
        if (currentListType === block.type) {
          currentList.push(block);
        } else {
          if (currentList.length > 0) {
            grouped.push({
              type: 'list',
              listType: currentListType,
              items: currentList,
              id: `list-${grouped.length}`
            });
          }
          currentListType = block.type;
          currentList = [block];
        }
      } else {
        if (currentList.length > 0) {
          grouped.push({
            type: 'list',
            listType: currentListType,
            items: currentList,
            id: `list-${grouped.length}`
          });
          currentList = [];
          currentListType = '';
        }
        grouped.push(block);
      }
    });

    if (currentList.length > 0) {
      grouped.push({
        type: 'list',
        listType: currentListType,
        items: currentList,
        id: `list-${grouped.length}`
      });
    }

    return grouped;
  };

  const groupedBlocks = groupBlocks(blocks);

  return (
    <div className="prose prose-lg max-w-none">
      {groupedBlocks.map((block, index) => {
        if (block.type === 'list') {
          const ListComponent = (block as { listType: string; items: NotionBlock[] }).listType === 'numbered_list_item' ? 'ol' : 'ul';
          return (
            <ListComponent key={index} className="mb-4">
              {(block as { items: NotionBlock[] }).items.map((item: NotionBlock) => renderBlock(item))}
            </ListComponent>
          );
        }
        return renderBlock(block as NotionBlock);
      })}
    </div>
  );
};

export default NotionBlockRenderer;

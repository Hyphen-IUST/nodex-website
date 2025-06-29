"use client";

import React from "react";

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className = "",
}) => {
  if (!content || content === "None") {
    return <span className={className}>None</span>;
  }

  // Split content by double newlines to create paragraphs
  const paragraphs = content.split(/\n\s*\n/);

  const renderParagraph = (paragraph: string, index: number) => {
    // Check if this is an action header (e.g., "**Approved Action** ✅")
    const isActionHeader = /^\*\*.*?\*\*\s*[✅❌🔄]?\s*$/.test(
      paragraph.trim()
    );

    // Check if this is a bullet point list
    if (paragraph.includes("• ") || paragraph.includes("- ")) {
      const lines = paragraph.split("\n");
      const listItems: string[] = [];
      const regularLines: string[] = [];

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("• ") || trimmedLine.startsWith("- ")) {
          listItems.push(trimmedLine.substring(2)); // Remove bullet point
        } else if (trimmedLine) {
          regularLines.push(trimmedLine);
        }
      });

      return (
        <div key={index} className="space-y-2">
          {regularLines.length > 0 && (
            <div
              className={isActionHeader ? "font-medium text-foreground" : ""}
            >
              {regularLines.map((line, lineIndex) => (
                <div key={lineIndex}>{renderInlineFormatting(line)}</div>
              ))}
            </div>
          )}
          {listItems.length > 0 && (
            <ul className="list-disc list-inside space-y-1 ml-4">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex} className="text-sm">
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    // Regular paragraph - split by single newlines and render as separate lines
    const lines = paragraph.split("\n").filter((line) => line.trim());

    return (
      <div
        key={index}
        className={`space-y-1 ${
          isActionHeader ? "font-medium text-foreground" : ""
        }`}
      >
        {lines.map((line, lineIndex) => (
          <div key={lineIndex}>{renderInlineFormatting(line.trim())}</div>
        ))}
      </div>
    );
  };

  const renderInlineFormatting = (text: string) => {
    // Handle bold text **text**
    text = text.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    );

    // Handle italic text *text*
    text = text.replace(
      /(?<!\*)\*([^*]+?)\*(?!\*)/g,
      '<em class="italic">$1</em>'
    );

    // Handle code text `text`
    text = text.replace(
      /`(.*?)`/g,
      '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>'
    );

    // Handle status badges (APPROVED, REJECTED, etc.)
    text = text.replace(
      /\b(APPROVED|REJECTED|PENDING)\b/g,
      '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">$1</span>'
    );

    // Handle separators (like ---, ==, etc.)
    if (/^[-=_]{3,}$/.test(text.trim())) {
      return <hr className="my-3 border-border/50" />;
    }

    // Return the formatted text
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {paragraphs.map((paragraph, index) =>
        renderParagraph(paragraph.trim(), index)
      )}
    </div>
  );
};

import clsx from "clsx";
import DOMPurify from "dompurify";
import Markdown from "markdown-to-jsx";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

const tokenPattern = /(^|[\s([{*_~])([#@])([A-Za-z0-9_][A-Za-z0-9_-]*)/g;

const getTokenUrl = (symbol, value) => {
  const query = symbol === "#" ? value : `${symbol}${value}`;
  return `/search?search_query=${encodeURIComponent(query)}`;
};

const getTokenClassName = (symbol) =>
  clsx("font-semibold transition-colors", {
    "!text-gold hover:!text-custom_yellow": symbol === "#",
    "!text-blue-600 hover:!text-blue-700": symbol === "@",
  });

const renderInlineText = (text) => {
  const value = String(text);
  const output = [];
  let lastIndex = 0;
  let match;

  tokenPattern.lastIndex = 0;
  while ((match = tokenPattern.exec(value)) !== null) {
    const [fullMatch, prefix, symbol, tokenValue] = match;
    const tokenStart = match.index + prefix.length;

    if (match.index > lastIndex) {
      output.push(value.slice(lastIndex, match.index));
    }

    if (prefix) output.push(prefix);

    output.push(
      <Link
        key={`${symbol}${tokenValue}-${tokenStart}`}
        to={getTokenUrl(symbol, tokenValue)}
        className={getTokenClassName(symbol)}
      >
        {symbol}
        {tokenValue}
      </Link>
    );

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < value.length) {
    output.push(value.slice(lastIndex));
  }

  return output.length ? output : value;
};

const renderInlineChildren = (children) =>
  React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return renderInlineText(child);
    }

    return child;
  });

const MarkdownLink = ({ children, href = "", ...props }) => {
  if (href.startsWith("/")) {
    return (
      <Link {...props} to={href} className="text-gold underline">
        {children}
      </Link>
    );
  }

  return (
    <a
      {...props}
      href={href}
      className="text-gold underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

const markdownOptions = {
  overrides: {
    a: {
      component: MarkdownLink,
    },
    p: {
      component: ({ children, ...props }) => (
        <p {...props} className="mb-1 last:mb-0 whitespace-pre-wrap">
          {renderInlineChildren(children)}
        </p>
      ),
    },
    strong: {
      component: ({ children, ...props }) => (
        <strong {...props} className="font-semibold text-inherit">
          {renderInlineChildren(children)}
        </strong>
      ),
    },
    em: {
      component: ({ children, ...props }) => (
        <em {...props} className="italic text-inherit">
          {renderInlineChildren(children)}
        </em>
      ),
    },
    h1: {
      component: ({ children, ...props }) => (
        <p {...props} className="mb-1 text-lg font-semibold text-inherit">
          {renderInlineChildren(children)}
        </p>
      ),
    },
    h2: {
      component: ({ children, ...props }) => (
        <p {...props} className="mb-1 text-base font-semibold text-inherit">
          {renderInlineChildren(children)}
        </p>
      ),
    },
    h3: {
      component: ({ children, ...props }) => (
        <p {...props} className="mb-1 font-semibold text-inherit">
          {renderInlineChildren(children)}
        </p>
      ),
    },
    li: {
      component: ({ children, ...props }) => (
        <li {...props}>{renderInlineChildren(children)}</li>
      ),
    },
  },
};

const hasHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(value);

const linkifyHtml = (html) => {
  const sanitizedHtml = DOMPurify.sanitize(html);

  if (typeof document === "undefined" || typeof window === "undefined") {
    return sanitizedHtml;
  }

  const template = document.createElement("template");
  template.innerHTML = sanitizedHtml;

  const walker = document.createTreeWalker(
    template.content,
    window.NodeFilter.SHOW_TEXT
  );
  const textNodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;

    if (!parent || parent.closest("a, script, style, code, pre")) continue;
    tokenPattern.lastIndex = 0;
    if (!tokenPattern.test(node.nodeValue || "")) continue;

    tokenPattern.lastIndex = 0;
    textNodes.push(node);
  }

  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    const value = node.nodeValue || "";
    let lastIndex = 0;
    let match;

    tokenPattern.lastIndex = 0;
    while ((match = tokenPattern.exec(value)) !== null) {
      const [fullMatch, prefix, symbol, tokenValue] = match;

      if (match.index > lastIndex) {
        fragment.append(document.createTextNode(value.slice(lastIndex, match.index)));
      }

      if (prefix) fragment.append(document.createTextNode(prefix));

      const anchor = document.createElement("a");
      anchor.href = getTokenUrl(symbol, tokenValue);
      anchor.className = getTokenClassName(symbol);
      anchor.textContent = `${symbol}${tokenValue}`;
      fragment.append(anchor);

      lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < value.length) {
      fragment.append(document.createTextNode(value.slice(lastIndex)));
    }

    node.parentNode?.replaceChild(fragment, node);
  });

  return template.innerHTML;
};

export default function RichContentText({ content = "", className }) {
  const rawContent = typeof content === "string" ? content : String(content ?? "");
  const trimmedContent = rawContent.trimStart();
  const isHtml = hasHtml(trimmedContent);
  const safeHtml = useMemo(
    () => (isHtml ? linkifyHtml(trimmedContent) : ""),
    [isHtml, trimmedContent]
  );
  const safeMarkdown = useMemo(
    () => (!isHtml ? DOMPurify.sanitize(trimmedContent) : ""),
    [isHtml, trimmedContent]
  );

  if (!trimmedContent) return null;

  return (
    <div className={clsx("rich-content-text w-full break-words", className)}>
      {isHtml ? (
        <div
          className="space-y-1 [&_a]:text-gold [&_a]:font-semibold [&_a]:transition-colors [&_a:hover]:text-custom_yellow [&_em]:italic [&_i]:italic [&_strong]:font-semibold [&_b]:font-semibold [&_p]:mb-1 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      ) : (
        <Markdown options={markdownOptions}>{safeMarkdown}</Markdown>
      )}
    </div>
  );
}

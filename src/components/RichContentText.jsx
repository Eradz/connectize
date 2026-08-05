import clsx from "clsx";
import DOMPurify from "dompurify";
import Markdown from "markdown-to-jsx";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { getUserDisplayName, getUserHandle } from "../lib/userDisplay";

const tokenPattern = /(^|[\s([{*_~])([#@])([A-Za-z0-9_][A-Za-z0-9_-]*)/g;

const normalizeMentionToken = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const slugifyMentionValue = (value = "") =>
  normalizeMentionToken(String(value).replace(/[_\s]+/g, "-"));

const getCompanyDisplayName = (company = {}) =>
  company.company_name || company.name || company.slug || "Company";

const getUserMentionKeys = (user = {}) => {
  const displayName = getUserDisplayName(user);
  const keys = [
    user.username,
    getUserHandle(user),
    user.first_name,
    user.last_name,
    displayName,
    slugifyMentionValue(displayName),
  ];

  return keys.filter(Boolean).map((key) => normalizeMentionToken(key));
};

const getCompanyMentionKeys = (company = {}) => {
  const displayName = getCompanyDisplayName(company);
  const keys = [
    company.slug,
    company.company_name,
    company.name,
    displayName,
    slugifyMentionValue(displayName),
  ];

  return keys.filter(Boolean).map((key) => normalizeMentionToken(key));
};

const matchesMentionToken = (token, keys = []) => {
  const normalized = normalizeMentionToken(token);
  return keys.some((key) => key === normalized);
};

const resolveMentionTarget = (token, mentionUsers = [], mentionCompanies = []) => {
  const user = mentionUsers.find((item) =>
    matchesMentionToken(token, getUserMentionKeys(item))
  );

  if (user?.id) {
    return {
      label: getUserDisplayName(user),
      url: `/co/${user.id}`,
      type: "user",
    };
  }

  const company = mentionCompanies.find((item) =>
    matchesMentionToken(token, getCompanyMentionKeys(item))
  );

  const companyTarget = company?.slug || company?.company_name || company?.name;
  if (companyTarget) {
    return {
      label: getCompanyDisplayName(company),
      url: `/${encodeURIComponent(companyTarget)}`,
      type: "company",
    };
  }

  return null;
};

const getTokenTarget = (symbol, value, mentionUsers = [], mentionCompanies = []) => {
  if (symbol === "@") {
    const mentionTarget = resolveMentionTarget(value, mentionUsers, mentionCompanies);
    if (mentionTarget) return mentionTarget;

    // Unresolved mention: keep the raw @token text (never guess a name),
    // but still link it to search so it stays tappable.
    return {
      label: `@${value}`,
      url: `/search?search_query=${encodeURIComponent(`@${value}`)}`,
      type: "mention",
    };
  }

  const query = value;
  return `/search?search_query=${encodeURIComponent(query)}`;
};

const getTokenClassName = (symbol) =>
  clsx("font-semibold transition-colors", {
    "!text-gold hover:!text-custom_yellow": symbol === "#" || symbol === "@",
  });

const renderInlineText = (text, mentionUsers = [], mentionCompanies = []) => {
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

    const tokenTarget = getTokenTarget(
      symbol,
      tokenValue,
      mentionUsers,
      mentionCompanies
    );
    const tokenLabel =
      symbol === "#"
        ? `${symbol}${tokenValue}`
        : tokenTarget.label;

    output.push(
      <Link
        key={`${symbol}${tokenValue}-${tokenStart}`}
        to={typeof tokenTarget === "string" ? tokenTarget : tokenTarget.url}
        className={getTokenClassName(symbol)}
      >
        {tokenLabel}
      </Link>
    );

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < value.length) {
    output.push(value.slice(lastIndex));
  }

  return output.length ? output : value;
};

const renderInlineChildren = (children, mentionUsers = [], mentionCompanies = []) =>
  React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return renderInlineText(child, mentionUsers, mentionCompanies);
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

const createMarkdownOptions = (mentionUsers = [], mentionCompanies = []) => ({
  overrides: {
    a: {
      component: MarkdownLink,
    },
    span: {
      component: ({ children, ...props }) => (
        <span {...props}>
          {renderInlineChildren(children, mentionUsers, mentionCompanies)}
        </span>
      ),
    },
    p: {
  component: ({ children, ...props }) => (
    <p {...props} className="mb-1 last:mb-0 whitespace-pre-wrap">
      {renderInlineChildren(children, mentionUsers, mentionCompanies)}
    </p>
  ),
},
    strong: {
      component: ({ children, ...props }) => (
        <strong {...props} className="font-semibold text-inherit">
          {renderInlineChildren(children, mentionUsers, mentionCompanies)}
        </strong>
      ),
    },
    em: {
      component: ({ children, ...props }) => (
        <em {...props} className="italic text-inherit">
          {renderInlineChildren(children, mentionUsers, mentionCompanies)}
        </em>
      ),
    },
    h1: {
      component: ({ children, ...props }) => (
        <p {...props} className="mb-1 text-lg font-semibold text-inherit">
          {renderInlineChildren(children, mentionUsers, mentionCompanies)}
        </p>
      ),
    },
    h2: {
      component: ({ children, ...props }) => (
        <p {...props} className="mb-1 text-base font-semibold text-inherit">
          {renderInlineChildren(children, mentionUsers, mentionCompanies)}
        </p>
      ),
    },
    h3: {
      component: ({ children, ...props }) => (
        <p {...props} className="mb-1 font-semibold text-inherit">
          {renderInlineChildren(children, mentionUsers, mentionCompanies)}
        </p>
      ),
    },
    li: {
      component: ({ children, ...props }) => (
        <li {...props}>
          {renderInlineChildren(children, mentionUsers, mentionCompanies)}
        </li>
      ),
    },
  },
});

const hasHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(value);

const linkifyHtml = (html, mentionUsers = [], mentionCompanies = []) => {
  const sanitizedHtml = DOMPurify.sanitize(html);

  if (typeof document === "undefined" || typeof window === "undefined") {
    return sanitizedHtml;
  }

  const template = document.createElement("template");
  template.innerHTML = sanitizedHtml;

  template.content.querySelectorAll(".mention-node").forEach((element) => {
    const mentionLabel = element.getAttribute("data-mention-label");
    const mentionType = element.getAttribute("data-mention-type");
    const mentionId = element.getAttribute("data-mention-id");
    const mentionToken = element.getAttribute("data-mention");

    if (mentionLabel && (mentionId || mentionToken)) {
      const anchor = document.createElement("a");
      anchor.className = getTokenClassName("@");
      anchor.textContent = mentionLabel;
      anchor.href =
        mentionType === "company"
          ? `/${encodeURIComponent(mentionToken || mentionLabel)}`
          : mentionId
          ? `/co/${encodeURIComponent(mentionId)}`
          : `/search?search_query=${encodeURIComponent(`@${mentionToken}`)}`;
      element.replaceWith(anchor);
      return;
    }

    element.removeAttribute("style");
    element.classList.remove("mention-node");
  });

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

      const tokenTarget = getTokenTarget(
        symbol,
        tokenValue,
        mentionUsers,
        mentionCompanies
      );
      const anchor = document.createElement("a");
      anchor.href = typeof tokenTarget === "string" ? tokenTarget : tokenTarget.url;
      anchor.className = getTokenClassName(symbol);
      anchor.textContent =
        symbol === "#"
          ? `${symbol}${tokenValue}`
          : tokenTarget.label;
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

export default function RichContentText({
  content = "",
  className,
  mentionUsers = [],
  mentionCompanies = [],
}) {
  const rawContent = typeof content === "string" ? content : String(content ?? "");
  const normalizedContent = rawContent
  .replace(/\r\n/g, "</br>") // Windows line endings
  .replace(/\u00A0/g, " ")           // nbsp -> normal space
  .split("\n")
  .map((line) => line.trimEnd())     // strip trailing spaces so "blank" lines are truly empty
  .join("\n")
  .replace(/\n{3,}/g, "\n\n");    
  const trimmedContent = normalizedContent.trimStart();
  const isHtml = hasHtml(trimmedContent);
  const safeHtml = useMemo(
    () => (isHtml ? linkifyHtml(trimmedContent, mentionUsers, mentionCompanies) : ""),
    [isHtml, mentionCompanies, mentionUsers, trimmedContent]
  );
  const safeMarkdown = useMemo(
    () => (!isHtml ? DOMPurify.sanitize(trimmedContent) : ""),
    [isHtml, trimmedContent]
  );
  const markdownOptions = useMemo(
    () => createMarkdownOptions(mentionUsers, mentionCompanies),
    [mentionCompanies, mentionUsers]
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

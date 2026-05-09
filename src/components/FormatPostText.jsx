import DOMPurify from "dompurify";
import Markdown from "markdown-to-jsx";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LightParagraph from "./ParagraphText";

const CustomLink = ({ children, ...props }) => (
  <a
    {...props}
    className="text-gold underline"
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

const CustomHeading = ({ children, ...props }) => (
  <span {...props} className="!text-bold !text-lg !text-black !block">
    {children}
  </span>
);

const CustomParagraph = ({ children, ...props }) => (
  <p {...props} className="!text-black">
    {children}
  </p>
);

const CustomEmphasis = ({ children, ...props }) => (
  <em {...props} className="!text-black">
    {children}
  </em>
);

const CustomStrong = ({ children, ...props }) => (
  <strong {...props} className="!text-black">
    {children}
  </strong>
);

const CustomHashTag = ({ children, ...props }) => {
  const navigate = useNavigate();
  const childrenStr = String(children).trim();
  const isHashTag = childrenStr.startsWith("#");

  if (!isHashTag) {
    return (
      <span {...props} className="!text-black">
        {children}
      </span>
    );
  }

  const searchQuery = childrenStr.slice(1).trim();

  return (
    <span
      {...props}
      className="text-gold font-semibold cursor-pointer"
      onClick={() => navigate(`/search?search_query=${searchQuery}`)}
    >
      {children}
    </span>
  );
};

const FormatPostText = ({ text, isSinglePost = false, postId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const options = {
    overrides: {
      a: {
        component: CustomLink,
      },
      h1: {
        component: CustomHeading,
      },
      h2: {
        component: CustomHeading,
      },
      p: {
        component: CustomParagraph,
      },
      em: {
        component: CustomEmphasis,
      },
      strong: {
        component: CustomStrong,
      },
      span: {
        component: CustomHashTag,
      },
    },
  };

  const sanitizedText = DOMPurify.sanitize(
    typeof text === "string" ? text : String(text)
  );
  const shouldCollapse =
    !isSinglePost &&
    (sanitizedText.length > 260 ||
      sanitizedText.split(/\r?\n/).filter(Boolean).length > 4);
  const isCollapsed = shouldCollapse && !isExpanded;

  return (
    <LightParagraph
      asDiv={true}
      balance={false}
      className="!max-w-none lg:!max-w-none w-full text-left !text-black"
    >
      {isSinglePost ? (
        <Markdown options={options}>{sanitizedText}</Markdown>
      ) : (
        <div className="w-full">
          <div
            className={`relative w-full overflow-hidden ${
              isCollapsed ? "max-h-[7.5rem]" : ""
            }`}
          >
            <Markdown options={options}>{sanitizedText}</Markdown>
            {isCollapsed && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-white/0" />
            )}
          </div>
          {shouldCollapse && (
            <button
              type="button"
              className="mt-1 text-sm font-semibold text-gold hover:text-custom_yellow transition-colors"
              onClick={() => setIsExpanded((expanded) => !expanded)}
            >
              {isExpanded ? "View less" : "View more"}
            </button>
          )}
        </div>
      )}
    </LightParagraph>
  );
};

export default FormatPostText;

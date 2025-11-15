import DOMPurify from "dompurify";
import Markdown from "markdown-to-jsx";
import React from "react";
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
  const searchQuery = children.slice(1).trim();

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
  const navigate = useNavigate();

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

  return (
    <LightParagraph asDiv={true}>
      {isSinglePost ? (
        <Markdown options={options}>{sanitizedText}</Markdown>
      ) : (
        <div
          className="line-clamp-5 cursor-pointer"
          onClick={() => navigate(`/posts/${postId}`)}
        >
          <Markdown options={options}>{sanitizedText}</Markdown>
        </div>
      )}
    </LightParagraph>
  );
};

export default FormatPostText;

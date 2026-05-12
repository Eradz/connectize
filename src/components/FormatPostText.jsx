import React, { useState } from "react";
import LightParagraph from "./ParagraphText";
import RichContentText from "./RichContentText";

const FormatPostText = ({
  text,
  isSinglePost = false,
  mentionUsers = [],
  mentionCompanies = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const postText = typeof text === "string" ? text : String(text ?? "");
  const shouldCollapse =
    !isSinglePost &&
    (postText.length > 260 ||
      postText.split(/\r?\n/).filter(Boolean).length > 4);
  const isCollapsed = shouldCollapse && !isExpanded;

  return (
    <LightParagraph
      asDiv={true}
      balance={false}
      className="!max-w-none lg:!max-w-none w-full text-left !text-black"
    >
      {isSinglePost ? (
        <RichContentText
          content={postText}
          className="!text-black"
          mentionUsers={mentionUsers}
          mentionCompanies={mentionCompanies}
        />
      ) : (
        <div className="w-full">
          <div
            className={`relative w-full overflow-hidden ${
              isCollapsed ? "max-h-[7.5rem]" : ""
            }`}
          >
            <RichContentText
              content={postText}
              className="!text-black"
              mentionUsers={mentionUsers}
              mentionCompanies={mentionCompanies}
            />
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

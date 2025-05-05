import clsx from "clsx";
import DOMPurify from "dompurify";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import ReusableModal from "./custom/ResusableModal";

export const MarkdownComponent = ({
  markdownContent = "",
  markdownTitle = "",
  isDescription = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Sanitize the Markdown content using DOMPurify
  const sanitizedDescriptionMarkdown = DOMPurify.sanitize(markdownContent);

  const tabletScreen = useMediaQuery({ maxWidth: "768px" });

  return (
    <section>
      <div
        className={clsx(
          "prose space-y-1 !leading-tight max-md:prose-sm prose-p:text-sm  prose-p:text-gray-600 prose-a:text-gold prose-a:no-underline prose-a:transition-colors prose-a:duration-200 prose-a:hover:text-gold prose-img:rounded-lg prose-img:max-w-full",
          {
            "md:line-clamp-5": isDescription,
          },
          className
        )}
        dangerouslySetInnerHTML={{
          __html: sanitizedDescriptionMarkdown,
        }}
      />
      {isDescription && sanitizedDescriptionMarkdown.length >= 80 && (
        <button
          className="text-sm max-md:hidden"
          onClick={() => setIsOpen(true)}
        >
          see more
        </button>
      )}

      <ReusableModal
        isOpen={tabletScreen ? false : isOpen}
        size="4xl"
        onClose={() => setIsOpen(false)}
        title={markdownTitle}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizedDescriptionMarkdown,
          }}
        />
      </ReusableModal>
    </section>
  );
};

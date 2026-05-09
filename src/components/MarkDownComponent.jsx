import clsx from "clsx";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import ReusableModal from "./custom/ResusableModal";
import RichContentText from "./RichContentText";

export const MarkdownComponent = ({
  markdownContent = "",
  markdownTitle = "",
  isDescription = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const content =
    (typeof markdownContent === "string"
      ? markdownContent
      : String(markdownContent ?? "")
    ).trimStart();

  const tabletScreen = useMediaQuery({ maxWidth: "768px" });

  return (
    <section>
      {/* <div
        ref={descRef}
        className={clsx(
          "desc-clear prose space-y-1 !leading-tight max-md:prose-sm prose-p:text-sm  prose-p:text-gray-600 prose-a:text-gold prose-a:no-underline prose-a:transition-colors prose-a:duration-200 prose-a:hover:text-gold prose-img:rounded-lg prose-img:max-w-full !text-dark",
          {
            "md:line-clamp-5": isDescription,
          },
          className
        )}
        dangerouslySetInnerHTML={{
          __html: sanitizedDescriptionMarkdown,
        }}
      /> */}
      <RenderGrayTextMarkdown
        isDescription={isDescription}
        markdownContent={content}
        className={className}
      />
      {isDescription && content.length >= 80 && (
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
        <RenderGrayTextMarkdown
          markdownContent={content}
        />
      </ReusableModal>
    </section>
  );
};

function RenderGrayTextMarkdown({
  isDescription,
  className,
  markdownContent,
}) {
  return (
    <RichContentText
      content={markdownContent}
      className={clsx(
        "remove-br text-sm space-y-1 !leading-tight max-md:prose-sm prose-p:text-sm prose-p:text-gray-600 prose-a:text-gold prose-a:no-underline prose-a:transition-colors prose-a:duration-200 prose-a:hover:text-gold prose-img:rounded-lg prose-img:max-w-full !text-dark",
        {
          "md:line-clamp-5": isDescription,
        },
        className
      )}
    />
  );
}

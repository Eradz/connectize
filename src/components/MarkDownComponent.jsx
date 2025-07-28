import clsx from "clsx";
import DOMPurify from "dompurify";
import { useEffect, useRef, useState } from "react";
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
  const sanitizedDescriptionMarkdown =
    DOMPurify.sanitize(markdownContent)?.trimStart();

  // useEffect(() => {
  //   document.querySelectorAll(".desc-clear p span")?.forEach((node) => {
  //     node.style.color = "#373737";
  //   });
  // }, [sanitizedDescriptionMarkdown, isOpen]);

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
        sanitizedDescriptionMarkdown={sanitizedDescriptionMarkdown}
        className={className}
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
        <RenderGrayTextMarkdown
          sanitizedDescriptionMarkdown={sanitizedDescriptionMarkdown}
        />
      </ReusableModal>
    </section>
  );
};

function RenderGrayTextMarkdown({
  isDescription,
  className,
  sanitizedDescriptionMarkdown,
}) {
  // const descRef = useRef();

  // this is just my really weird hack to remove the first line break and paragrah and also the gray color added when the desc was created.

  /**
   * @todo there are way better ways to do this
   */
  const [html, setHtml] = useState();
  useEffect(() => {
    const html = document.createElement("div");

    html.innerHTML = sanitizedDescriptionMarkdown;
    if (html.firstChild.textContent === "") {
      html.removeChild(html.firstChild);
    }
    html?.querySelectorAll("p span")?.forEach((node) => {
      node.style.color = "#373737";
    });
    setHtml(html.outerHTML);
  }, [sanitizedDescriptionMarkdown]);

  return (
    <div
      // ref={descRef}
      className={clsx(
        "remove-br prose space-y-1 !leading-tight max-md:prose-sm prose-p:text-sm  prose-p:text-gray-600 prose-a:text-gold prose-a:no-underline prose-a:transition-colors prose-a:duration-200 prose-a:hover:text-gold prose-img:rounded-lg prose-img:max-w-full !text-dark",
        {
          "md:line-clamp-5": isDescription,
        },
        className
      )}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
}

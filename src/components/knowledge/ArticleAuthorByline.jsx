import { Link } from "react-router-dom";
import { User } from "lucide-react";
import clsx from "clsx";
import { getArticleAuthor } from "../../lib/articleAuthor";

/**
 * Article byline that honors the backend `display_author` field.
 * Shows the company name + logo (linking to the company profile `/:slug`)
 * when the article was published on behalf of a company, otherwise the user.
 *
 * Set `linkable={false}` when the byline is rendered inside a card that is
 * already wrapped in a <Link> (nested anchors are invalid HTML).
 */
export default function ArticleAuthorByline({
  article,
  className,
  iconClassName = "h-4 w-4",
  textClassName,
  linkable = true,
}) {
  const author = getArticleAuthor(article);

  const content = (
    <>
      {author.avatar ? (
        <img
          src={author.avatar}
          alt={author.name}
          className={clsx(iconClassName, "rounded-full object-cover shrink-0")}
        />
      ) : (
        <User className={clsx(iconClassName, "shrink-0")} />
      )}
      <span className={textClassName}>{author.name}</span>
    </>
  );

  if (linkable && author.type === "company" && author.href) {
    return (
      <Link
        to={author.href}
        title={`View ${author.name}'s profile`}
        className={clsx("flex items-center gap-1.5 hover:underline", className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={clsx("flex items-center gap-1.5", className)}>{content}</div>
  );
}

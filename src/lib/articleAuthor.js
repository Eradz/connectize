/**
 * Resolve the display author of a knowledge article.
 *
 * The backend now returns `display_author`:
 *   { type: 'company' | 'user', id, name, avatar, slug, verified }
 * plus a nested `company` object when the article was posted on behalf of a
 * company. This helper prefers `display_author` and falls back to the legacy
 * `author` fields when it is missing (defensive for older payloads).
 */
export function getArticleAuthor(article) {
  const displayAuthor = article?.display_author;

  if (displayAuthor && (displayAuthor.name || displayAuthor.id)) {
    const isCompany = displayAuthor.type === "company";
    const slug =
      displayAuthor.slug ||
      article?.company?.slug ||
      article?.company?.company_name ||
      null;

    return {
      type: isCompany ? "company" : "user",
      id: displayAuthor.id ?? null,
      name: displayAuthor.name || "Anonymous",
      avatar:
        displayAuthor.avatar ||
        (isCompany ? article?.company?.logo : article?.author?.avatar) ||
        null,
      slug,
      verified: !!displayAuthor.verified,
      // Company routes are `/:company` slug; users are `/co/:id`
      href: isCompany
        ? slug
          ? `/${slug}`
          : null
        : displayAuthor.id
        ? `/co/${displayAuthor.id}`
        : null,
    };
  }

  // Legacy fallback: plain user author fields
  const author = article?.author;
  const name =
    author?.first_name || author?.last_name
      ? `${author?.first_name || ""} ${author?.last_name || ""}`.trim()
      : "Anonymous";

  return {
    type: "user",
    id: author?.id ?? null,
    name,
    avatar: author?.avatar || null,
    slug: null,
    verified: false,
    href: author?.id ? `/co/${author.id}` : null,
  };
}

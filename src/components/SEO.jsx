import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { frontendUrl } from "../lib/helpers/index";

const SEOKeywords =
  "social media, connect, chat, share, friends, networking, oil and gas networking, energy professionals, oil and gas social platform, energy industry collaboration, oil and gas jobs, upstream, midstream, downstream, energy sector networking, oil and gas suppliers, industry insights, oil and gas investments";

//
export function createSEO({
  title = "Connectize - The Social Hub",
  description = "Connectize is the leading social platform for the oil and gas industry, connecting professionals, engineers, suppliers, and investors. Network, collaborate on projects, share insights, and explore job opportunities in the energy sector. Join today!",
  keywords = SEOKeywords,
  image,
  relativeImagePath,
  url,
  type = "website",
}) {
  const ogImage = image || "/seo/" + (relativeImagePath || "default-image.png");

  //     <meta name="description" content={description} />
  // <meta name="keywords" content={keywords} />
  // <meta name="author" content="Connectize Team - Clever Akanimoh" />
  // <meta name="robots" content="index, follow" />

  return [
    { title: title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: keywords,
    },
    {
      name: "author",
      content: "Connectize Team - Clever Akanimoh",
    },
    {
      name: "robots",
      content: "index, follow",
    },

    // Open Graph Meta Tags
    { property: "og:type", content: type },
    { property: "og:site_name", content: "Connectize" },
    { property: "og:locale", content: "en_US" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: title },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    ...(url ? [{ property: "og:url", content: url }] : []),

    // Twitter Card Meta Tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@connectize" },
    { name: "twitter:creator", content: "@connectize" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    { name: "twitter:image:alt", content: title },

    // Canonical URL
    ...(url ? [{ tagName: "link", rel: "canonical", href: url }] : []),
  ];
}

// const SEO = ({
//   title = "Connectize - The Social Hub",
//   description = "Connectize is the leading social platform for the oil and gas industry, connecting professionals, engineers, suppliers, and investors. Network, collaborate on projects, share insights, and explore job opportunities in the energy sector. Join today!",
//   keywords = SEOKeywords,
//   image,
//   relativeImagePath,
//   url,
//   type = "website",
// }) => {
//   const location = useLocation();
//   const currentUrl = url || `${frontendUrl()}${location.pathname}`;

//   const ogImage = image || "/seo/" + (relativeImagePath || "default-image.png");

//   return (
//     <Helmet async prioritizeSeoTags defaultTitle={title}>
//       <title>{title}</title>
//       <meta name="description" content={description} />
//       <meta name="keywords" content={keywords} />
//       <meta name="author" content="Connectize Team - Clever Akanimoh" />
//       <meta name="robots" content="index, follow" />

//       {/* Open Graph Meta Tags */}
//       <meta property="og:type" content={type} />
//       <meta property="og:title" content={title} />
//       <meta property="og:description" content={description} />
//       <meta property="og:image" content={ogImage} />
//       <meta property="og:url" content={currentUrl} />
//       <link rel="canonical" href={currentUrl} />

//       {/* Twitter Card Meta Tags */}
//       <meta name="twitter:card" content="summary_large_image" />
//       <meta name="twitter:title" content={title} />
//       <meta name="twitter:description" content={description} />
//       <meta name="twitter:image" content={ogImage} />
//     </Helmet>
//   );
// };



const SEO = ({
  title = "Connectize - The Social Hub",
  description = "Connectize is the leading social platform for the oil and gas industry, connecting professionals, engineers, suppliers, and investors. Network, collaborate on projects, share insights, and explore job opportunities in the energy sector. Join today!",
  keywords = "social media, connect, chat, share, friends, networking, oil and gas networking, energy professionals, oil and gas social platform, energy industry collaboration, oil and gas jobs, upstream, midstream, downstream, energy sector networking, oil and gas suppliers, industry insights, oil and gas investments",
  image,
  relativeImagePath,
  url,
  type = "website",
}) => {
  const location = useLocation();
  const currentUrl = url || `${frontendUrl()}${location.pathname}`;

  const ogImage = image || "/seo/" + (relativeImagePath || "default-image.png");

  return (
    <Helmet async prioritizeSeoTags defaultTitle={title}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Connectize Team - Clever Akanimoh" />
      <meta name="robots" content="index, follow" />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={currentUrl} />
      <link rel="canonical" href={currentUrl} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;


// import { Helmet } from "react-helmet-async";
// import { useLocation } from "react-router";
// import { frontendUrl } from "../lib/helpers";

// const SEO = ({
//   title = "Connectize - The Social Hub",
//   description = "Connectize is the leading social platform for the oil and gas industry, connecting professionals, engineers, suppliers, and investors. Network, collaborate on projects, share insights, and explore job opportunities in the energy sector. Join today!",
//   keywords = "social media, connect, chat, share, friends, networking, oil and gas networking, energy professionals, oil and gas social platform, energy industry collaboration, oil and gas jobs, upstream, midstream, downstream, energy sector networking, oil and gas suppliers, industry insights, oil and gas investments",
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

function SEO() {
  return null;
}
export default SEO;

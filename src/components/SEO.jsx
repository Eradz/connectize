import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { frontendUrl } from "../lib/helpers";

const SEO = ({
  title = "Connectize - The Social Hub",
  description = "Connectize helps you stay connected with your friends, share moments, and explore content.",
  keywords = "social media, connect, chat, share, friends, networking",
  image,
  url,
  type = "website",
}) => {
  const location = useLocation();
  const currentUrl = url || `${frontendUrl()}${location.pathname}`;

  const ogImage = image || frontendUrl() + "/default-image.png";

  return (
    <Helmet async>
      <title>{title} | connectize</title>
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

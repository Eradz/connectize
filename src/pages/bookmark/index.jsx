// import React from "react";
import { BookmarkedProducts } from "../../components/bookmark/BookmarkedProducts";
import { BookmarkedServices } from "../../components/bookmark/BookmarkedServices";
import CustomTabs from "../../components/custom/tabs";
import HeadingText from "../../components/HeadingText";
import { createSEO } from "../../components/SEO";
// import SEO from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "My Bookmarks",
  });
export default function BookMark() {
  return (
    <section>
      {/* <SEO title="My Bookmark" /> */}
      <header className="border-b pb-2">
        <HeadingText>My Bookmarks</HeadingText>
      </header>

      <section>
        <CustomTabs
          tabListStyle="absolute right-0 -top-14"
          tabsHeading={["Products", "Services"]}
          tabsPanels={[<BookmarkedProducts />, <BookmarkedServices />]}
        />
      </section>
    </section>
  );
}

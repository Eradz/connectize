import React from "react";
import HeadingText from "../../../components/HeadingText";
import LightParagraph from "../../../components/ParagraphText";

export default function Content({ array = [] }) {
  return (
    <section className="w-3/4">
      {array.map((item, index) => {
        return (
          <section key={index} className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">{item.title}</h2>
            <p className="text-xs text-gray-500">
              Last Updated: {item.lastUpdated}
            </p>
            <LightParagraph>{item.content}</LightParagraph>
            {item.details.map((detail, idx) => (
              <div
                key={idx}
                className="mb-4"
                id={detail.heading.replace(/\s+/g, "-").toLowerCase()}
              >
                <HeadingText heading="sub-heading">
                  {detail.heading}
                </HeadingText>
                <LightParagraph>{detail.text}</LightParagraph>
              </div>
            ))}
          </section>
        );
      })}
    </section>
  );
}

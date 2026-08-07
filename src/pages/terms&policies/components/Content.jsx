import React from "react";
import HeadingText from "../../../components/HeadingText";
import LightParagraph from "../../../components/ParagraphText";

export default function Content({ array = [] }) {
  return (
    <section className="flex justify-center w-full min-w-0 px-6 md:px-14 py-10 md:py-14">
      <div className="w-full max-w-[70ch]">
        {array.map((item, index) => {
          return (
            <section key={index} className="mb-8">
              <h2 className="font-serif font-bold text-3xl md:text-[42px] text-gold tracking-tight mb-3">
                {item.title}
              </h2>
              <div className="flex items-center gap-2 pb-6 mb-6 border-b-2 border-[#12203A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9C6F2E]" />
                <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-[#6E7688]">
                  Last updated — {item.lastUpdated}
                </p>
              </div>

              <div className="text-[17px] text-[#3E4A61] mb-4">
                <LightParagraph>{item.content}</LightParagraph>
              </div>

              {item.details.map((detail, idx) => {
                const number = String(idx + 1).padStart(2, "0");
                return (
                  <div
                    key={idx}
                    className="mt-14 scroll-mt-6"
                    id={detail.heading.replace(/\s+/g, "-").toLowerCase()}
                  >
                    <div className="flex items-baseline gap-4 mb-4">
                      <span className="font-mono text-sm text-[#7A561F] bg-[#FCFAF5] border border-[#DFD9C8] rounded-sm px-2.5 py-0.5 shrink-0">
                        {number}
                      </span>
                      <HeadingText heading="sub-heading">
                        <span className="font-serif font-semibold text-2xl text-[#12203A]">
                          {detail.heading}
                        </span>
                      </HeadingText>
                    </div>
                    <div className="text-[#3E4A61] pl-0 md:pl-[52px]">
                      <LightParagraph>{detail.text}</LightParagraph>
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </section>
  );
}
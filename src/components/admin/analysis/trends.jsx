import React from "react";
import EChart from "./EChart";
import HeadingText from "../../HeadingText";
import LightParagraph from "../../ParagraphText";
import { ChevronDownIcon } from "@radix-ui/react-icons";

function Trends() {
  const option = {
    tooltip: {
      trigger: "axis",
    },
    // legend: {
    //   data: ["Email", "Union Ads", "Video Ads", "Direct", "Search Engine"],
    // },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "5%",
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Email",
        smooth: "true",
        type: "line",
        stack: "Total",
        data: [120, 132, 101, 134, 90, 230, 210],
      },
    ],
  };

  return (
    <section className="space-y-8">
      <div>
        <div className="flex gap-3 items-center">
          <HeadingText>Analysis</HeadingText>
          <ChevronDownIcon />
        </div>
        <LightParagraph>Yearly Analysis</LightParagraph>
      </div>

      {/*  */}
      <div className="bg-white rounded-md px-3">
        <div className="py-3">
          <LightParagraph>Market Trend Analysis</LightParagraph>
          <h2 className="font-semibold text-2xl">12,589k</h2>
        </div>
        <EChart option={option} />
      </div>
    </section>
  );
}
export default Trends;

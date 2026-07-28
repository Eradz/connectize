import React from 'react'
import EChart from './EChart';
import LightParagraph from "../../ParagraphText";
import { Divider } from "@chakra-ui/react";

export default function Chart() {
  const option = {
    tooltip: {
      trigger: "axis",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00"],
    },
    yAxis: {
      type: "value",
      data: [0, 20, 40, 60, 80, 100],
    },
    series: [
      {
        name: "Sales",
        type: "line",
        smooth: true,
        data: [31, 40, 28, 50, 42, 82, 56],
      },
      {
        name: "Revenue",
        type: "line",
        smooth: true,
        data: [11, 32, 45, 32, 34, 52, 41],
      },
      {
        name: "Customers",
        type: "line",
        smooth: true,
        data: [15, 11, 32, 18, 9, 24, 11],
      },
    ],
  };
 
  return (
    <section className="grid lg:grid-cols-2 gap-3 mt-3">
      <div className="bg-white p-3 rounded-md w-full">
        <div className="p-3">
          <LightParagraph>sales</LightParagraph>
          <h2 className="font-semibold text-2xl">5,987.37</h2>
        </div>
        <Divider />
        <EChart option={option} />
      </div>

      <div className="bg-white p-3 rounded-md w-full">
        <div className="p-3">
          <LightParagraph>ReachES</LightParagraph>
          <h2 className="font-semibold text-2xl">5,987.34</h2>
        </div>
        <Divider />
        <EChart option={option} />
      </div>
    </section>
  );
}

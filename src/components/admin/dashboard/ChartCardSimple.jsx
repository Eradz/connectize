import React from "react";
import { ChartIcon } from "../../ui/ModernIcon";

const ChartCardSimple = ({ title, subtitle, type = "line" }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <ChartIcon size={40} className="mx-auto mb-2 text-gray-400" aria-hidden="true" />
          <p className="text-gray-600">Chart: {type}</p>
          <p className="text-sm text-gray-500">Chart.js temporarily disabled</p>
        </div>
      </div>
    </div>
  );
};

export default ChartCardSimple;

import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";

const ChartCardSimple = ({ title, subtitle, type = "line" }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <ChartBarIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" aria-hidden="true" />
          <p className="text-gray-600">Chart: {type}</p>
          <p className="text-sm text-gray-500">Chart.js temporarily disabled</p>
        </div>
      </div>
    </div>
  );
};

export default ChartCardSimple;

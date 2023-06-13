"use client";

import React, { useState } from "react";
import { EnergyProductionData } from "../interfaces";
import ReactSlider from "react-slider";

interface TimelineProps {
  data: EnergyProductionData[];
  onYearChange: (year: number) => void;
}

export default function Timeline({ data, onYearChange }: TimelineProps) {
  const [value, setValue] = useState(data[0].year);

  const handleChange = (newValue: number | null | Array<number | null>) => {
    if (typeof newValue === "number") {
      setValue(newValue);
      onYearChange(newValue);
    }
  };

  return (
    <div className="mt-8 w-full">
      <ReactSlider
        className="h-2 rounded-md bg-gray-300"
        thumbClassName="w-4 h-4 bg-blue-500 rounded-full focus:outline-none transition-all duration-200"
        trackClassName="h-2 bg-blue-500 rounded-md"
        min={data[0].year}
        max={data[data.length - 1].year}
        value={value}
        onChange={handleChange}
      />
      <div className="flex justify-between text-xs mt-2">
        {data.map((d) => (
          <span key={d.year}>{d.year}</span>
        ))}
      </div>
      <div className="text-center mt-2">{value}</div>
    </div>
  );
}

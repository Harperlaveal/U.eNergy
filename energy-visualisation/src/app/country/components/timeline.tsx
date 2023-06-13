import React, { useState } from "react";
import { EnergyProductionData } from "../interfaces";
import Slider from "@mui/material/Slider";

interface TimelineProps {
  data: EnergyProductionData[];
  onYearChange: (year: number) => void;
}

export default function Timeline({ data, onYearChange }: TimelineProps) {
  const [value, setValue] = useState(data[data.length - 1].year);

  const handleChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setValue(newValue);
      onYearChange(newValue);
    }
  };

  const totalYears = data[data.length - 1].year - data[0].year;

  return (
    <div className="mt-8 w-full relative">
      <Slider
        value={value}
        onChange={handleChange}
        min={data[0].year}
        max={data[data.length - 1].year}
        sx={{
          "& .MuiSlider-thumb": {
            transition: "left 0.3s ease-in-out",
            "&:not(.MuiSlider-active)": {
              transition: "left 0.3s ease-in-out",
            },
          },
          "& .MuiSlider-track": {
            transition: "width 0.3s ease-in-out",
            "&:not(.MuiSlider-active)": {
              transition: "width  0.3s ease-in-out",
            },
          },
        }}
      />
      <div className="flex justify-between text-xs w-full">
        {data.map((d, i) => (
          <span
            key={d.year}
            style={{
              position: "absolute",
              left: `${((d.year - data[0].year) / totalYears) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            {d.year}
          </span>
        ))}
      </div>
      <div className="text-center mt-5">{value}</div>
    </div>
  );
}

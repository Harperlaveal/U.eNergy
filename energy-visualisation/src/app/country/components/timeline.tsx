import React, { useState, useEffect, useRef } from "react";
import { EnergyProductionData } from "../interfaces";
import Slider from "@mui/material/Slider";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

interface TimelineProps {
  data: EnergyProductionData[];
  onYearChange: (year: number) => void;
}

export default function Timeline({ data, onYearChange }: TimelineProps) {
  const [value, setValue] = useState<number>(data[data.length - 1].year);
  const [index, setIndex] = useState<number>(data.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setValue(newValue);
      onYearChange(newValue);
      const closestYear = data.reduce((prev, curr) =>
        Math.abs(curr.year - newValue) < Math.abs(prev.year - newValue)
          ? curr
          : prev
      );
      const newIndex = data.findIndex((d) => d.year === closestYear.year);
      if (newIndex !== -1) {
        setIndex(newIndex);
      }
      if (isPlaying) {
        setIsPlaying(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      intervalRef.current = setInterval(() => {
        setIndex((prevIndex) => {
          const nextIndex = prevIndex >= data.length - 1 ? 0 : prevIndex + 1;
          return nextIndex;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const totalYears = data[data.length - 1].year - data[0].year;

  useEffect(() => {
    onYearChange(data[index].year);
    setValue(data[index].year);
  }, [index, onYearChange]);

  return (
    <div className="mt-8 w-full relative">
      <button onClick={handlePlay}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </button>
      <Slider
        value={value}
        onChange={handleChange}
        min={parseInt(data[0].year.toString())}
        max={parseInt(data[data.length - 1].year.toString())}
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
              transition: "width 0.3s ease-in-out",
            },
          },
        }}
      />
      <div className="flex justify-between text-xs w-full">
        {data.map((d, i) => (
          <button
            className={` hover:text-blue-400 ${
              d.year === value
                ? "text-blue-500 "
                : ""
            }`}
            onClick={() => {
              setIndex(i);
              setValue(d.year);
              onYearChange(d.year);
            }}
            key={d.year}
            style={{
              position: "absolute",
              left: `${((d.year - data[0].year) / totalYears) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            {d.year}
          </button>
        ))}
      </div>
    </div>
  );
}

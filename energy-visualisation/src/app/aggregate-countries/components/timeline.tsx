import React, { useState, useEffect, useRef } from "react";
import Slider from "@mui/material/Slider";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

interface TimelineProps {
  years: number[];
  onYearChange: (year: number) => void;
  rangeChanged: boolean; 
  setRangeChanged: (changed: boolean) => void; 
}

export default function Timeline({ years, onYearChange, rangeChanged, setRangeChanged }: TimelineProps) {
  const [value, setValue] = useState<number>(years[years.length - 1]);
  const index = useRef(years.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [tick, setTick] = useState(0); // State to trigger re-render

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
      const closestYear = years.reduce((prev, curr) =>
        Math.abs(curr - newValue) < Math.abs(prev - newValue)
          ? curr
          : prev
      );
      const newIndex = years.findIndex((d) => d === closestYear);
      if (newIndex !== -1) {
        index.current = newIndex; // Update index ref here
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
    if (rangeChanged) {
      setRangeChanged(false);
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      setIsPlaying((prevIsPlaying) => {
        if (!prevIsPlaying) {
          intervalRef.current = setInterval(() => {
            index.current = index.current >= years.length - 1 ? 0 : index.current + 1;
            setTick((tick) => tick + 1);
          }, 1000);
          return true;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return false;
        }
      });
    }
  };
  useEffect(() => {
    if (rangeChanged) {
      setRangeChanged(false);
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [rangeChanged, setRangeChanged]);

  useEffect(() => {
    onYearChange(years[index.current]);
    setValue(years[index.current]);
  }, [tick, onYearChange, years]); // Add tick to the dependency array

  return (
    <div className="mt-8 w-full relative">
      <button onClick={handlePlay}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </button>
      <Slider
        value={value}
        onChange={handleChange}
        min={parseInt(years[0].toString())}
        max={parseInt(years[years.length - 1].toString())}
        sx={{
          "& .MuiSlider-thumb": {
            transition: "left 0.3s ease-in-out",
            "&:not(.Mui-disabled)": {
              "&:before": { boxShadow: "0px 0px 0px 8px rgba(63,81,181,0.16)" },
            },
          },
        }}
      />
    </div>
  );
}

import React, { useState, useEffect, useContext } from "react";
import BarChart from "./barchart";
import Timeline from "./timeline";
import { EnergyProductionData } from "../interfaces";
import { CountryDataContext } from "../contexts/country-data-context";
import CountryLoader from "./country-loader/country-loader";
import { Card, CardContent, TextField } from "@mui/material";

interface CountryViewerProps {
  countryName: string;
}

export default function CountryViewer({ countryName }: CountryViewerProps) {
  const { countryData } = useContext(CountryDataContext);

  const [selectedYear, setSelectedYear] = useState<number>(0);

  useEffect(() => {
    if (countryData[countryName]?.length > 0) {
      setSelectedYear(
        countryData[countryName]?.[countryData[countryName]?.length - 1]?.year
      );
    }
  }, []);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const calculateMaxWatts = (data: EnergyProductionData[]) => {
    console.log("calc -> ");
    console.log(data);
    let max: number = 0;
    data.forEach((d) => {
      d.production.forEach((p) => {
        const wattsAsNumber = Number(p.watts);
        if (wattsAsNumber > max) {
          max = wattsAsNumber;
        }
      });
    });
    console.log("max: -> " + max);
    return max;
  };

  if (!countryData[countryName]) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <CountryLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <h1 className="text-2xl font-medium">
        Energy Production for {countryName} in the Year {selectedYear}
      </h1>
      <BarChart
        data={
          selectedYear
            ? countryData[countryName]?.find((d) => d.year == selectedYear)
            : countryData[countryName]?.[countryData[countryName]?.length - 1]
        }
        max={calculateMaxWatts(countryData[countryName])}
      />
      <Timeline
        data={countryData[countryName]}
        onYearChange={handleYearChange}
      />
    </div>
  );
}

import React, { useState, useEffect, useContext } from "react";
import BarChart from "./barchart";
import Timeline from "./timeline";
import { EnergyProductionData, EnergySourceProduction } from "../interfaces";
import { CountryDataContext } from "../contexts/country-data-context";

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
    let max = 0;
    data.forEach((d) => {
      d.production.forEach((p) => {
        if (p.watts > max) {
          max = p.watts;
        }
      });
    });
    return max;
  };

  if (countryData[countryName] === undefined) {
    return <></>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-[75%]">
      <h1 className="text-2xl font-bold mb-6">{countryName}</h1>
      <div className="h-[50%] w-[75%]">
        <BarChart
          data={
            selectedYear
              ? countryData[countryName]?.find((d) => d.year == selectedYear)
              : countryData[countryName]?.[countryData[countryName]?.length - 1]
          }
          max={calculateMaxWatts(countryData[countryName])}
        />
        {countryData[countryName] && countryData[countryName].length > 0 ? (
          <Timeline
            data={countryData[countryName]}
            onYearChange={handleYearChange}
          />
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

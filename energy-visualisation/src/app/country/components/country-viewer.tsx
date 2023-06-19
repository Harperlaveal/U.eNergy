import React, { useState, useEffect, useContext } from "react";
import BarChart from "./barchart";
import Timeline from "./timeline";
import { EnergyProductionData } from "../interfaces";
import { CountryDataContext } from "../contexts/country-data-context";
import CountryLoader from "./country-loader/country-loader";
import { saveAs } from "file-saver";

interface CountryViewerProps {
  countryName: string;
  initYear: number;
}

export default function CountryViewer({
  countryName,
  initYear,
}: CountryViewerProps) {
  const { countryData } = useContext(CountryDataContext);

  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [exportOption, setExportOption] = useState<string>("all");

  useEffect(() => {
    if (initYear !== 0) {
      setSelectedYear(initYear);
    }
    if (countryData[countryName]?.length > 0) {
      setSelectedYear(
        countryData[countryName]?.[countryData[countryName]?.length - 1]?.year
      );
    }
  }, []);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const saveDataToFile = () => {
    let dataStr = `Country: ${countryName}\n\n`;

    const dataToExport =
      exportOption === "all"
        ? countryData[countryName]
        : countryData[countryName]?.filter((d) => d.year === selectedYear);

    dataToExport.forEach((d) => {
      dataStr += `Year: ${d.year}\n`;
      d.production.forEach((p) => {
        dataStr += `${p.source}: ${p.watts} watts\n`;
      });
      dataStr += "\n";
    });

    const blob = new Blob([dataStr], { type: "text/plain;charset=utf-8" });
    saveAs(
      blob,
      `${countryName}_data_${
        exportOption === "all" ? "all_years" : selectedYear
      }.txt`
    );
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
      <div className="flex justify-between items-center w-full mb-3 px-6">
        <div className="opacity-0 flex-grow"></div>
        <h1 className="text-2xl font-medium flex-grow text-center">
          Energy Production for {countryName} in the Year {selectedYear}
        </h1>
        <div className="flex space-x-2">
          <select
            className="p-2 rounded shadow-md text-black"
            value={exportOption}
            onChange={(e) => setExportOption(e.target.value)}
          >
            <option value="all">All Years</option>
            <option value="current">Current Year</option>
          </select>
          <button
            className="bg-blue-500 p-2 rounded text-white hover:shadow-md"
            onClick={saveDataToFile}
          >
            Extract Info
          </button>
        </div>
      </div>
      <div className="px-24 w-full">
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
          initYear={initYear}
        />
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { EnergyProductionData } from "../interfaces";
import BarChart from "../components/barchart";
import Timeline from "../components/timeline";
import { mockData } from "../mock-data";

export default function CountryPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const [data, setData] = useState<EnergyProductionData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(0);

  useEffect(() => {
    setData(mockData);
    setSelectedYear(mockData[0].year);
  }, [id]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-6">
        {capitalizeFirstLetter(id)} Energy Production
      </h1>
      <div className="h-[50%] w-[50%]">
        <BarChart
          data={data.find((d) => d.year === selectedYear)}
          max={calculateMaxWatts(data)}
        />
        {data.length > 0 ? (
          <Timeline data={data} onYearChange={handleYearChange} />
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function calculateMaxWatts(data: EnergyProductionData[]) {
  let max = 0;
  data.forEach((d) => {
    d.production.forEach((p) => {
      if (p.watts > max) {
        max = p.watts;
      }
    });
  });
  return max;
}

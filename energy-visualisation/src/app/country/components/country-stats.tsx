import React from "react";
import { useContext, useEffect, useState } from "react";
import { CountryDataContext } from "../contexts/country-data-context";

interface CountryStatsProps {
  countryName: string;
}

export default function CountryStats({ countryName }: CountryStatsProps) {
  const [highestProdSource, setHighestProdSource] = React.useState<string>("");
  const [totalProduction, setTotalProduction] = useState<{
    [source: string]: number;
  }>({});
  const [year, setYear] = useState<number>(0);

  const { countryData } = useContext(CountryDataContext);

  const data = countryData[countryName];

  useEffect(() => {
    if (data && data.length) {
      const firstYear = data[0].year;
      setYear(firstYear);

      let production: { [source: string]: number } = {};

      for (let d of data) {
        d.production.forEach((p) => {
          if (production[p.source]) {
            production[p.source] += parseInt(p.watts.toString());
          } else {
            production[p.source] = parseInt(p.watts.toString());
          }
        });
      }

      let maxSource = Object.keys(production).reduce((a, b) =>
        production[a] > production[b] ? a : b
      );

      setHighestProdSource(maxSource);
      setTotalProduction(production); // Save total production in state
    }
  }, [data]);

  if (!data) {
    return <></>;
  }

  return (
    <div className="flex flex-col space-y-1 p-1">
      <h2 className="text-lg font-bold">Since {year}</h2>
      <div className="spacy-y-1 text-sm">
        <h3 className="font-medium ">Biggest producer</h3>
        <div className="ml-4 ">{highestProdSource}</div>
      </div>
      <div className="space-y-1 text-sm">
        <h3 className="font-medium ">Total production</h3>
        <ul className="ml-4 space-y-1">
          {Object.entries(totalProduction).map(([source, watts]) => (
            <li key={source} className="flex flex-row space-x-2">
              <h4 className="font-regular">{source}</h4>
              <div className="font-light">{Math.trunc(watts)}TWh</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

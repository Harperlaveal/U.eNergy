import React, { useState, useEffect, createContext } from "react";
import { EnergyProductionData } from "../interfaces";
import { loadCSVData, createCountryData } from "../utils";

interface CountryDataContextProps {
  countryData: { [country: string]: EnergyProductionData[] };
  setCountryData: (data: { [country: string]: EnergyProductionData[] }) => void;
  countryList: string[];
}

export const CountryDataContext = createContext<CountryDataContextProps>({
  countryData: {},
  setCountryData: () => {},
  countryList: [],
});

export function CountryDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [countryData, setCountryData] = useState<{
    [country: string]: EnergyProductionData[];
  }>({});

  const [countryList, setCountryList] = useState<string[]>([]);

  useEffect(() => {
    loadCSVData("/data/data.csv")
      .then((data) => {
        const transformedData = createCountryData(data);
        setCountryData(transformedData);

        // Extract unique country values from the CSV data
        const uniqueCountries = Array.from(
          new Set(data.map((row) => row.COUNTRY))
        );
        setCountryList(uniqueCountries);
      })
      .catch((error) => {
        console.error("Failed to load country data", error);
      });
  }, []);

  return (
    <CountryDataContext.Provider
      value={{ countryData, setCountryData, countryList }}
    >
      {children}
    </CountryDataContext.Provider>
  );
}

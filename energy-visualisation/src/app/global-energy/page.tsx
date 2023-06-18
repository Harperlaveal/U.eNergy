"use client";

import React, { useState, useEffect, useContext } from 'react';
import BarChart from './components/barchart';
import Timeline from './components/timeline';
import CountryRange from './components/country-range';
import { loadCSVData, createCountryData } from '../country/utils';
import { CSVRow, EnergyProductionData } from '../country/interfaces';
import { RenewableDataContainer } from './interfaces';
import SustainabilityBarChart from './components/sustainabilityBarChart';
import Energyloader from './components/energy-loader/energy-loader';
import { ThemeContext } from "../contexts/theme-context";

const GlobalEnergyPage = () => {
  const [countryData, setCountryData] = useState<{ [country: string]: EnergyProductionData[] }>({});
  const [sustainabilityData, setSustainabilityData] = useState<{ [country: string]: RenewableDataContainer[] }>({});
  const [countryRange, setCountryRange] = useState<[number, number]>([1, 10]);
  const years: number[] = ([2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]);
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [countryList, setCountryList] = useState<string[]>([]);
  const [rangeChanged, setRangeChanged] = useState(false);
  const [countryCount, setCountryCount] = useState<number>(countryList.length);
  const [selectedVisualisation, setSelectedVisualisation] = useState<string>("energy");
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useContext(ThemeContext);

  const createSustainabilityData = (allRows: CSVRow[]): { [country: string]: RenewableDataContainer[] } => {
    const countrySustainabilityData: { [country: string]: RenewableDataContainer[] } = {};
    for (const row of allRows) {
      const country = row.COUNTRY;
      const year = row.YEAR;
      let renewableTWh = 0;
      let nonRenewableTWh = 0;
      
      if(row.PRODUCT === "Renewables") {
        renewableTWh = parseFloat(row.VALUE.toString());
      } else if(row.PRODUCT === "Non-renewables") {
        nonRenewableTWh = parseFloat(row.VALUE.toString());
      } 
  
      if (!countrySustainabilityData[country]) {
        countrySustainabilityData[country] = ([{ name: country, year: year, renewableTWh: renewableTWh, nonRenewableTWh: nonRenewableTWh }]);
      } else {
        const existingData = countrySustainabilityData[country].find((d) => d.year === year);
        
        if(existingData){
          existingData.renewableTWh += renewableTWh;
          existingData.nonRenewableTWh += nonRenewableTWh;

        } else {
          countrySustainabilityData[country].push({
            name: country,
            year: year,
            renewableTWh: renewableTWh,
            nonRenewableTWh: nonRenewableTWh,
          });
        }
      }
    }
    return countrySustainabilityData;
  };

  useEffect(() => {
    loadCSVData("/data/data.csv")
      .then((data: any[]) => {
        const transformedData = createCountryData(data);
        setCountryData(transformedData);

        const countrySustainabilityData = createSustainabilityData(data);
        setSustainabilityData(countrySustainabilityData);

        const uniqueCountries = Array.from(new Set(data.map((row: { COUNTRY: any; }) => row.COUNTRY)));
        setCountryList(uniqueCountries);

        setIsLoading(false);
      })
      .catch((error: any) => {
        console.error("Failed to load country data", error);
      });
  }, []);

  const handleYearChange = (year: number) => {
      setSelectedYear(year);
  };

  const handleCountryRangeChange = (range: [number, number]) => {
    setCountryRange(range);
    setRangeChanged(true);
  };

  const handleVisualisationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVisualisation(event.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <Energyloader />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen items-center justify-center w-full space-y-[20px] p-32 ${theme === 'dark' ? 'bg-black-800 text-white' : ''}`}>
      <div className="flex space-x-4">
        <div className="w-64">
          <select onChange={handleVisualisationChange} className={`w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline ${theme === 'dark' ? 'bg-black text-white' : ''}`}>
                    <option value="energy">Energy</option>
                    <option value="sustainability">Sustainability</option>
                </select>
            </div>
        </div>
        <Timeline
          years={years}
          onYearChange={handleYearChange}
          rangeChanged={rangeChanged}
          setRangeChanged={setRangeChanged}
        />
        <>
        {selectedVisualisation === "energy" ? (
                  <BarChart
                  countryData={countryData}
                  countryRange={countryRange}
                  year={selectedYear}
                  setCountryCount={setCountryCount}
                  />
                  )  : (
                    <SustainabilityBarChart
                    sustainabilityData={sustainabilityData}
                    countryRange={countryRange}
                    year={selectedYear}
                    setCountryCount={setCountryCount}
                    />)
        }
        </>
        <CountryRange
          countryCount={countryCount}
          onCountryRangeChange={handleCountryRangeChange}
        />
    </div>
  );
};

export default GlobalEnergyPage;

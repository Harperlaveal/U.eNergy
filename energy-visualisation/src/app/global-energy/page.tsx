"use client";

import React, { useState, useEffect } from 'react';
import BarChart from './components/barchart';
import Timeline from './components/timeline';
import CountryRange from './components/country-range';
import CountryTooltip from './components/country-tooltip';
import { loadCSVData, createCountryData } from '../country/utils';
import { EnergyProductionData } from '../country/interfaces';

const GlobalEnergyPage = () => {
  const [countryData, setCountryData] = useState<{ [country: string]: EnergyProductionData[] }>({});
  const [countryRange, setCountryRange] = useState<[number, number]>([1, 10]);
  const years: number[] = ([2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2020, 2021, 2022]);
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [countryList, setCountryList] = useState<string[]>([]);
  const [rangeChanged, setRangeChanged] = useState(false);

  useEffect(() => {
    loadCSVData("/data/data.csv")
      .then((data: any[]) => {
        const transformedData = createCountryData(data);
        setCountryData(transformedData);

        const uniqueCountries = Array.from(new Set(data.map((row: { COUNTRY: any; }) => row.COUNTRY)));
        setCountryList(uniqueCountries);
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

  return (
    <><div className="flex flex-col justify-center items-center h-screen">
      <div className="flex-grow flex flex-col justify-center items-center">
        <CountryRange countryCount={countryList.length} onCountryRangeChange={handleCountryRangeChange} />
        <BarChart
          countryData={countryData}
          countryRange={countryRange}
          year={selectedYear} />
    </div><Timeline
        years={years}
        onYearChange={handleYearChange}
        rangeChanged={rangeChanged}
        setRangeChanged={setRangeChanged} />
    </div></>
  );
};

export default GlobalEnergyPage;

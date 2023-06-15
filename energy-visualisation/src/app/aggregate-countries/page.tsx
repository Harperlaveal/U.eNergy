"use client";

import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import BarChart from './components/barchart';
import Timeline from './components/timeline';
import { EnergyProductionData } from '../country/interfaces';
import { loadCSVData } from '../country/utils';
import { createCountryData } from '../country/utils';
import CountryScale from './components/country-scale';

const productionMethods: string[] = ["Hydro", "Nuclear", "Solar", "Wind", "Other renewables", "Natural gas", "Coal", "Oil"];



const SimilarCountriesPage = () => {
  const [countryData, setCountryData] = useState<{
    [country: string]: EnergyProductionData[];
  }>({});
  const [countryCount, setCountryCount] = useState<number>(10);
  const [years, setYears] = useState<number[]>([2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2020, 2021, 2022]);
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [countryList, setCountryList] = useState<string[]>([]);


  const handleYearChange = (year: number) => {
      setSelectedYear(year);
    };

  const handleCountryCountChange = (count: number) => {
      setCountryCount(count);
  };

    useEffect(() => {
    loadCSVData("/data/data.csv")
      .then((data: any[]) => {
        const transformedData = createCountryData(data);
        setCountryData(transformedData);

        // Extract unique country values from the CSV data
        const uniqueCountries = Array.from(
          new Set(data.map((row: { COUNTRY: any; }) => row.COUNTRY))
        );
        setCountryList(uniqueCountries);
      })
      .catch((error: any) => {
        console.error("Failed to load country data", error);
      });
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="flex-grow flex flex-col justify-center items-center">
    <CountryScale countryCount={countryList.length} onCountryCountChange={handleCountryCountChange} />
    <BarChart
      countryData={countryData}
      countryCount={countryCount}
      year={selectedYear}
      setSelectedCountry={() => { }}
    />
  </div>
      <Timeline
        years={years}
        onYearChange={handleYearChange}
      />
    </div>
  );
};

export default SimilarCountriesPage;

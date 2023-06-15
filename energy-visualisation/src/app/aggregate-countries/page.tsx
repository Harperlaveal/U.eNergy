"use client";

import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import BarChart from './components/barchart';

interface Country {
  country: string;
  amount: number;
  id: string;
}

const productionMethods: string[] = ["Hydro", "Nuclear", "Solar", "Wind", "Other renewables", "Natural gas", "Coal", "Oil"];

const SimilarCountriesPage = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryTotals, setCountryTotals] = useState<Country[]>([]);
  const [countryCount, setCountryCount] = useState<number>(10);
  const [year, setYear] = useState<number>(2022);
  const [years, setYears] = useState<string[]>(['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2020', '2021', '2022']);

    useEffect(() => {
    d3.csv("data/data.csv").then((data) => {
      const instances = data.filter((d) => productionMethods.includes(String(d.PRODUCT)));
      const countries = Array.from(new Set(data.map((d) => String(d.COUNTRY))));

      const totals = countries.map((country) => {
        const countryInstances = instances.filter((d) => String(d.COUNTRY) === country && Number(d.YEAR) === year);
        const totalEnergy: number = countryInstances.reduce((a, b) => a + Number(b.VALUE), 0);

        return { country, amount: totalEnergy, id: country };
      });

      totals.sort((a, b) => b.amount - a.amount);
      setCountryTotals(totals);
    });
  }, [year]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <BarChart
        countryTotals={countryTotals}
        countryCount={countryCount}
        year={year}
        setSelectedCountry={setSelectedCountry}
      />
      
    </div>
  );
};

export default SimilarCountriesPage;

"use client";
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const productionMethods: string[] = ["Hydro", "Nuclear", "Solar", "Wind", "Other renewables", "Natural gas", "Coal", "Oil"];
const productionColors: string[] = ["#1F77B4", "#FEF502", "#F4BF3A", "#D1F1F9", "#79E381", "#DE2A2A", "#000000", "#6A4848"];

interface Country {
  country: string;
  amount: number;
  id: string;
}

const SimilarCountriesPage = () => {
  const ref = useRef<SVGSVGElement | null>(null);
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

  const maxYValue = Math.max(...countryTotals.slice(0, countryCount).map(d => d.amount));
  const yScale = d3.scaleLinear().domain([0, maxYValue]).range([160, 0]);
  const xScale = d3.scaleBand<string>()
  .domain(countryTotals.slice(0, countryCount).map(d => d.country))
  .range([0, countryCount * 50])
  .padding(0.2);

useEffect(() => {
  if (!ref.current) return;
  const svg = d3.select(ref.current);

  // remove the old y-axis if it exists
  svg.select('.y-axis').remove();

  // create the y-axis
  const yAxis = d3.axisLeft(yScale);
  svg.append('g')
    .attr('class', 'y-axis') // add a class to the y-axis for selecting it later
    .attr('transform', 'translate(60, 20)')
    .call(yAxis);
}, [ref, yScale, year]);


  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <svg ref={ref} className="w-3/4 h-3/4" viewBox={`0 0 ${countryCount * 50 + 80} 200`}>
        <g transform="translate(60, 20)">
          {/* X-axis */}
          <line x1="0" y1="160" x2={countryCount * 60} y2="160" stroke="black" />
          {/* Y-axis */}
          <line x1="0" y1="160" x2="200" y2="160" stroke="black" />

          {/* Axis labels */}
          <text x="-50" y="180" fontSize="12">{year}</text>
          <text x="-10" y="-10" fontSize="12">Total Watts Produced (GWh)</text>

          {/* Bar chart */}
          {countryTotals.slice(0, countryCount).map((country, index) => (
            <g key={country.id} transform={`translate(${index * 50}, 0)`}>
              <rect
                x="0"
                y={yScale(country.amount) - 1}
                width={xScale.bandwidth()}
                height={160 - yScale(country.amount)}
                fill={productionColors[index]}
                onClick={() => setSelectedCountry(country)}
              />
              <text x={xScale.bandwidth() / 2} y={170} fontSize="5" textAnchor="middle">{country.country}</text>
            </g>
          ))}
        </g>
      </svg>
      <div className="flex justify-center mt-4">
        <h1 className="text-2xl font-bold mr-4">Timeline</h1>
        <div className="flex space-x-2">
          {years.map((year) => (
            <button key={year} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setYear(Number(year))}>{year}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimilarCountriesPage;

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { EnergyProductionData, EnergySourceProduction } from '@/app/country/interfaces';
import { CountryDataContext } from '@/app/country/contexts/country-data-context';
interface BarChartProps {
  countryData: {
    [country: string]: EnergyProductionData[];
  }
  countryCount: number;
  year: number;
  setSelectedCountry: React.Dispatch<React.SetStateAction<{ country: string; amount: number; id: string; } | null>>;
}

const productionColors: string[] = [
  "#1F77B4", "#FEF502", "#F4BF3A", "#D1F1F9", "#79E381", 
  "#DE2A2A", "#000000", "#6A4848", "#FF5733", "#AF7AC5", 
  "#17A589", "#5499C7", "#A04000", "#922B21", "#76448A", 
  "#1F618D", "#B7950B", "#641E16", "#D4AC0D", "#212F3C", 
  "#A569BD", "#27AE60", "#196F3D", "#1A5276", "#D35400"
];


const BarChart: React.FC<BarChartProps> = ({ countryData, countryCount, year, setSelectedCountry }) => {
  const ref = useRef<SVGSVGElement | null>(null);

    const countries = Object.keys(countryData);
  // Calculate the total watt production for each country for the specified year.
  const totals = countries.map((country: string | number) => {
    const countryYearData = countryData[country].find(data => data.year === year.toString());
    let totalWatts = 0;
    if (countryYearData) {
      totalWatts = countryYearData.production.reduce((total, source) => total + Number(source.watts), 0);
    }
    return { amount: totalWatts, id: country };
  });
  // sort totals in descending order then remove N countries, N being countryCount
    totals.sort((a: { amount: number; }, b: { amount: number; }) => b.amount - a.amount);
    totals.splice(countryCount);

  const maxYValue = Math.max(...totals.map((d: { amount: any; }) => d.amount));
  const yScale = d3.scaleLinear().domain([0, maxYValue]).range([160, 0]);
  const xScale = d3.scaleBand<string>()
    .domain(totals.map((d: { id: any; }) => d.id))
    .range([0, countryCount * 50])
    .padding(0.2);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);

    svg.select('.y-axis').remove();

    const yAxis = d3.axisLeft(yScale);
    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', 'translate(60, 20)')
      .call(yAxis);
  }, [ref, yScale, totals]);

  return (
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
        {totals.map((total: React.SetStateAction<{amount: number; id: string; } | null>, index: number) => (
          <g key={total.id} transform={`translate(${index * 50}, 0)`}>
            <rect
              x="0"
              y={yScale(total.amount) - 1}
              width={xScale.bandwidth()}
              height={160 - yScale(total.amount)}
              fill={productionColors[index]}
              onClick={() => setSelectedCountry(total)}
            />
            <text x={xScale.bandwidth() / 2} y={170} fontSize="5" textAnchor="middle">{total.id}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

export default BarChart;

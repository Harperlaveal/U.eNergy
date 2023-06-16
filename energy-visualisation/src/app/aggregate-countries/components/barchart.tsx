import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { EnergyProductionData, EnergySourceProduction } from '@/app/country/interfaces';
import { CountryDataContext } from '@/app/country/contexts/country-data-context';
import { count } from 'console';

interface BarChartProps {
  countryData: {
    [country: string]: EnergyProductionData[];
  };
  countryRange: [number, number];
  year: number;
  setSelectedCountry: React.Dispatch<React.SetStateAction<{ country: string; amount: number; id: string; } | null>>;
}

const BarChart: React.FC<BarChartProps> = ({ countryData, countryRange, year, setSelectedCountry }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const countries = Object.keys(countryData);
  const excludedCountries = ["IEA Total", "OECD Americas", "OECD Europe", "OECD Asia Oceania"];
  const filteredCountries = countries.filter((country) => !excludedCountries.includes(country));

  let colourMap: { [country: string]: string } = {};
  filteredCountries.forEach((country, i) => {
    const hue = Math.round((i / countries.length) * 360);
    colourMap[country] = `hsl(${hue}, 100%, 50%)`;
  });

  let totals = filteredCountries.map((country) => {
    const countryYearData = countryData[country].find((data) => data.year === year.toString());
    let totalWatts = 0;
    if (countryYearData) {
      totalWatts = countryYearData.production.reduce((total, source) => total + Number(source.watts), 0);
    }
    return { amount: totalWatts, id: country };
  });
  totals.sort((a: { amount: number }, b: { amount: number }) => b.amount - a.amount);
  totals = totals.slice(countryRange[0], countryRange[1]);

  const maxYValue = Math.max(...totals.map((d: { amount: any }) => d.amount));
  const yScale = d3.scaleLinear().domain([0, maxYValue]).range([160, 0]);
  const xScale = d3.scaleBand<string>()
    .domain(totals.map((d: { id: any }) => d.id))
    .range([0, (countryRange[1] - countryRange[0]) * 50])
    .padding(0.2);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);

    svg.select('.y-axis').remove();
    svg.select('.x-axis').remove();

    const yAxis = d3.axisLeft(yScale);
    const xAxis = d3.axisBottom(xScale).tickSize(5);

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', 'translate(60, 20)')
      .call(yAxis);

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(60, ${yScale(0) + 20})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '5px');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .on('zoom', (event) => {
        const newYScale = event.transform.rescaleY(yScale);
        svg.select<SVGGElement>('.y-axis').call(yAxis.scale(newYScale));
        svg.selectAll<SVGRectElement, { amount: number; id: string }>('rect')
          .attr('y', (d) => newYScale(d.amount))
          .attr('height', (d) => 160 - newYScale(d.amount));
      });

    svg.call(zoom);
  }, [ref, yScale, totals]);

  return (
    <svg ref={ref} className="w-3/4 h-3/4" viewBox={`0 0 ${(countryRange[1] - countryRange[0]) * 50 + 80} 200`}>
      <g transform="translate(60, 20)">
        {/* X-axis */}
        <line x1="0" y1="160" x2={(countryRange[1] - countryRange[0]) * 50} y2="160" stroke="black" />

        {/* Axis labels */}
        <text x="-50" y="180" fontSize="12">{year}</text>
        <text x="-10" y="-10" fontSize="12">Total Watts Produced (TWh)</text>

        {/* Bar chart */}
        {totals.map((total, index) => (
          <g key={total.id} transform={`translate(${index * 50}, 0)`}>
            <rect
              x="0"
              y={yScale(total.amount)}
              width={xScale.bandwidth()}
              height={160 - yScale(total.amount)}
              fill={colourMap[total.id]}
              onClick={() => setSelectedCountry(total)}
            />
          </g>
        ))}
      </g>
    </svg>
  );
};

export default BarChart;

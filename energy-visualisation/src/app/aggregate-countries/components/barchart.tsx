import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface BarChartProps {
  countryTotals: { country: string; amount: number; id: string; }[];
  countryCount: number;
  year: number;
  setSelectedCountry: React.Dispatch<React.SetStateAction<{ country: string; amount: number; id: string; } | null>>;
}

const productionColors: string[] = ["#1F77B4", "#FEF502", "#F4BF3A", "#D1F1F9", "#79E381", "#DE2A2A", "#000000", "#6A4848"];

const BarChart: React.FC<BarChartProps> = ({ countryTotals, countryCount, year, setSelectedCountry }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const maxYValue = Math.max(...countryTotals.slice(0, countryCount).map(d => d.amount));
  const yScale = d3.scaleLinear().domain([0, maxYValue]).range([160, 0]);
  const xScale = d3.scaleBand<string>()
    .domain(countryTotals.slice(0, countryCount).map(d => d.country))
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
  }, [ref, yScale, countryTotals]);

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
  );
};

export default BarChart;

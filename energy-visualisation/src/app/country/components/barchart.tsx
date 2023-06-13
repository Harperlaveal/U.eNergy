import React, { useRef, useEffect } from "react";
import { select, scaleBand, scaleLinear, max } from "d3";
import { EnergyProductionData } from "../interfaces";

interface BarChartProps {
  data?: EnergyProductionData;
}

export default function BarChart({ data }: BarChartProps) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = select(svgRef.current);

    const width = 500;
    const height = 500;

    const xScale = scaleBand()
      .domain(data.production.map((d) => d.source))
      .range([0, width])
      .padding(0.2);

    const yScale = scaleLinear()
      .domain([0, max(data.production, (d) => d.watts) as number])
      .range([height, 0]);

    svg
      .selectAll("rect")
      .data(data.production)
      .join("rect")
      .attr("x", (d) => xScale(d.source) || 0)
      .attr("y", (d) => yScale(d.watts))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.watts))
      .attr("fill", "steelblue");
  }, [data]);

  return (
    <svg ref={svgRef} width={500} height={500}>
      <g className="x-axis" />
      <g className="y-axis" />
    </svg>
  );
}

import React, { useRef, useEffect } from "react";
import {
  select,
  scaleBand,
  scaleLinear,
  axisLeft,
  axisBottom,
  transition,
} from "d3";
import { EnergyProductionData } from "../interfaces";

interface BarChartProps {
  data?: EnergyProductionData;
  max: number;
}

export default function BarChart({ data, max }: BarChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data || !svgRef.current || !wrapperRef.current) return;

    const svg = select(svgRef.current);

    const width = wrapperRef.current.clientWidth;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 50, left: 100 };

    const xScale = scaleLinear()
      .domain([0, max * 50])
      .range([margin.left, width - margin.right]);

    const yScale = scaleBand()
      .domain(data.production.map((d) => d.source))
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    const xAxis = axisBottom(xScale);
    const yAxis = axisLeft(yScale);

    svg
      .select<SVGGElement>(".x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Watts");

    svg
      .select<SVGGElement>(".y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 10)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Energy Production Method");

    const t = transition().duration(1000);

    svg
      .selectAll("rect")
      .data(data.production)
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("x", margin.left)
            .attr("y", (d) => yScale(d.source) || 0)
            .attr("width", (d) => xScale(d.watts) - margin.left)
            .attr("height", yScale.bandwidth())
            .attr("fill", "steelblue")
            .call((enter) =>
              enter
                .transition(t)
                .delay((d, i) => i * 100)
                .attr("x", margin.left)
                .attr("width", (d) => xScale(d.watts) - margin.left)
            ),
        (update) =>
          update.call((update) =>
            update
              .transition(t)
              .attr("y", (d) => yScale(d.source) || 0)
              .attr("height", yScale.bandwidth())
              .attr("width", (d) => xScale(d.watts) - margin.left)
          ),
        (exit) =>
          exit.call((exit) =>
            exit.transition(t).attr("x", margin.left).attr("width", 0).remove()
          )
      );
  }, [data]);

  return (
    <div ref={wrapperRef} style={{ width: "100%" }}>
      <svg ref={svgRef} style={{ width: "100%", height: "500px" }}>
        <g className="x-axis" />
        <g className="y-axis" />
      </svg>
    </div>
  );
}

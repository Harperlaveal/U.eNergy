import React, { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { line, curveCardinal } from "d3-shape";
import { scaleLinear, scaleTime } from "d3-scale";
import { extent } from "d3-array";
import { EnergyProductionData } from "../interfaces";

interface LineGraphBackgroundProps {
  data: EnergyProductionData[];
  selectedYear: number;
}

export default function LineGraphBackground({
  data,
  selectedYear,
}: LineGraphBackgroundProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const totalProdPerYear = data.map((yearData) => ({
      year: yearData.year,
      totalProduction: yearData.production.reduce(
        (sum, curr) => sum + parseInt(curr.watts.toString()),
        0
      ),
    }));

    const svg = select(svgRef.current);
    const svgWidth = svg.node()!.getBoundingClientRect().width;
    const svgHeight = svg.node()!.getBoundingClientRect().height;

    svg.selectAll("*").remove();

    const xScale = scaleTime()
      .domain(
        extent(totalProdPerYear, (d) => new Date(d.year, 0)) as [Date, Date]
      )
      .range([0, svgWidth]);

    const yScale = scaleLinear()
      .domain([0, Math.max(...totalProdPerYear.map((d) => d.totalProduction))])
      .range([svgHeight, 0]);

    const lineGenerator = line<(typeof totalProdPerYear)[0]>()
      .x((d) => xScale(new Date(d.year, 0)))
      .y((d) => yScale(d.totalProduction))
      .curve(curveCardinal);

    svg
      .append("path")
      .attr("class", "line")
      .attr("d", lineGenerator(totalProdPerYear))
      .attr("fill", "none")
      .attr("stroke-opacity", 0.7)
      .attr("stroke", "lightBlue")
      .attr("stroke-width", 2);

    svg
      .selectAll(".circle")
      .data(totalProdPerYear)
      .join("circle")
      .attr("class", "circle")
      .attr("cx", (d) => xScale(new Date(d.year, 0)))
      .attr("cy", (d) => yScale(d.totalProduction))
      .attr("r", 5)
      .attr("opacity", (d) =>
        selectedYear === d.year || selectedYear === d.year ? 1 : 0.5
      )
      .attr("fill", "lightBlue")
      
    svg
      .append("text")
      .attr("class", "label")
      .attr("x", svgWidth - 20)
      .attr("y", 20)
      .text("Total Production")
      .style("fill-opacity", 0.5)
      .style("font-size", "10px");

    svg.exit().remove();
  }, [data, selectedYear]);

  return (
    <div className="w-full h-0 mb-0">
      <svg ref={svgRef} className="w-full overflow-visible"></svg>
    </div>
  );
}

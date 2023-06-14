import React, { useRef, useEffect, useContext } from "react";
import {
  select,
  scaleBand,
  scaleLinear,
  axisLeft,
  axisBottom,
  transition,
  scaleOrdinal,
} from "d3";
import { EnergyProductionData, EnergySourceProduction } from "../interfaces";
import { ThemeContext } from "../../contexts/theme-context";
import { energySources } from "../utils";

interface BarChartProps {
  data?: EnergyProductionData;
  max: number;
}

export default function BarChart({ data, max }: BarChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  const labelColor = isDarkMode ? "white" : "black";
  const tooltipBackgroundColor = isDarkMode ? "black" : "white";

  const colorScale = scaleOrdinal<string>()
    .domain(energySources)
    .range([
      "#00FF00",
      "#66FF00",
      "#CCFF00",
      "#FFFF00",
      "#FFCC00",
      "#FF9900",
      "#FF6600",
      "#FF3300",
    ]);

  const colorFn = (d: EnergySourceProduction): string => {
    return colorScale(d.source) as string;
  };

  useEffect(() => {
    if (!data || !svgRef.current || !wrapperRef.current) return;

    data.production.sort((a, b) => b.watts - a.watts);

    const svg = select(svgRef.current);

    const width = wrapperRef.current.clientWidth;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 50, left: 100 };

    const xScale = scaleLinear()
      .domain([0, max])
      .range([0, width - margin.right - margin.left]);

    const yScale = scaleBand()
      .domain(data.production.map((d) => d.source))
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    const xAxis = axisBottom(xScale).tickSizeOuter(0);
    const yAxis = axisLeft(yScale).tickSizeOuter(0);

    const xAxisG = svg
      .select<SVGGElement>(".x-axis")
      .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
      .call(xAxis);

    const yAxisG = svg
      .select<SVGGElement>(".y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);

    const t = transition().duration(1000);

    const tooltip = select("body")
      .append("div")
      .attr(
        "class",
        "tooltip rounded p-2 text-center shadow-lg border-2 bg-white dark:bg-black"
      )
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", tooltipBackgroundColor)
      .style("color", labelColor);

    const bars = svg
      .selectAll<SVGRectElement, EnergySourceProduction>("rect")
      .data(data.production, (d) => d.source);

    bars
      .enter()
      .append("rect")
      .attr("y", (d) => yScale(d.source) || 0)
      .attr("x", margin.left) // Bars start at y-axis
      .attr("width", 0) // Initial width is 0
      .attr("height", yScale.bandwidth())
      .attr("fill", colorFn)
      .attr("fill-opacity", "0.5")
      .attr("stroke", colorFn)
      .on("mouseover", function () {
        select(this).style("fill-opacity", 0.8);
      })
      .on("mousemove", function (event, d) {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`)
          .style("visibility", "visible")
          .html(`Method: ${d.source}<br>Amount: ${Math.trunc(d.watts)}TWh`);
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
        select(this).style("fill-opacity", 0.5);
      })
      .merge(bars)
      .transition(t)
      .attr("x", margin.left)
      .attr("width", (d) => xScale(d.watts))
      .attr("y", (d) => yScale(d.source) || 0)
      .attr("height", yScale.bandwidth());

    bars.exit().remove();
  }, [data, theme]);

  return (
    <div className="flex flex-row w-full">
      <div ref={wrapperRef} style={{ flex: "1" }} className="relative h-500px">
        <div className="transform -rotate-90 absolute left-[-100px] top-[50%]">
          <div>Production Method</div>
        </div>
        <svg
          ref={svgRef}
          style={{ width: "100%", height: "500px", overflow: "visible" }}
        >
          <g className="x-axis" />
          <g className="y-axis" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <div>Amount Produced (Terrawatt Hours)</div>
        </div>
      </div>
      <div className="w-[200px]">
        {energySources.map((source, index) => (
          <LegendItem
            key={source}
            color={colorScale(source) as string}
            label={source}
          />
        ))}
      </div>
    </div>
  );
}

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center mb-2">
    <div
      className="w-4 h-4 rounded-full mr-4 opacity-50 hover:opacity-100"
      style={{ backgroundColor: color }}
    ></div>
    <span>{label}</span>
  </div>
);

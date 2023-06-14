import React, { useRef, useEffect, useContext } from "react";
import {
  select,
  scaleBand,
  scaleLinear,
  axisLeft,
  axisBottom,
  scaleOrdinal,
  transition,
} from "d3";
import { EnergyProductionData, EnergySourceProduction } from "../interfaces";
import { ThemeContext } from "../../contexts/theme-context";

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

  useEffect(() => {
    if (!data || !svgRef.current || !wrapperRef.current) return;

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

    // Create color scale
    const colorScale = scaleOrdinal()
      .domain(data.production.map((d) => d.source))
      .range([
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
      ]);

    const colorFn = (d: EnergySourceProduction): string => {
      const color = colorScale(d.source);
      return color ? (color as string) : "#000000"; // default color
    };

    const xAxis = axisBottom(xScale).tickSizeOuter(0);
    const yAxis = axisLeft(yScale).tickSizeOuter(0);

    const xAxisG = svg
      .select<SVGGElement>(".x-axis")
      .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
      .call(xAxis);

    const xAxisText = xAxisG.selectAll("text.axis-label").data([null]);

    xAxisText
      .join("text")
      .attr("class", "axis-label")
      .attr("x", (width - margin.right - margin.left) / 2)
      .attr("y", 60)
      .attr("fill", labelColor)
      .style("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Terrawatt Hours");

    const yAxisG = svg
      .select<SVGGElement>(".y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);

    const yAxisText = yAxisG.selectAll("text.axis-label").data([null]);

    yAxisText
      .join("text")
      .attr("class", "axis-label")
      .attr("x", -height / 2)
      .attr("y", -120)
      .attr("transform", "rotate(-90)")
      .attr("fill", labelColor)
      .style("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Energy Production Method");

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

    svg
      .selectAll("rect")
      .data(data.production)
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("y", (d) => yScale(d.source) || 0)
            .attr("x", margin.left) // Bars start at y-axis
            .attr("width", 0) // Initial width is 0
            .attr("height", yScale.bandwidth())
            .attr("fill", colorFn)
            .attr("fill-opacity", "0.5")
            .attr("stroke", colorFn)
            .on("mouseover", function () {
              select(this).style("fill-opacity", 1);
            })
            .on("mousemove", function (event, d) {
              tooltip
                .style("top", `${event.pageY - 10}px`)
                .style("left", `${event.pageX + 10}px`)
                .style("visibility", "visible")
                .html(`Method: ${d.source}<br>TWh: ${d.watts}`);
            })
            .on("mouseout", function () {
              tooltip.style("visibility", "hidden");
              select(this).style("fill-opacity", 0.5);
            })
            .call(
              (enter) =>
                enter
                  .transition(t)
                  .delay((d, i) => i * 100)
                  .attr("width", (d) => xScale(d.watts)) // Animate width to scaled 'watts' value
            ),
        (update) =>
          update.call((update) =>
            update
              .transition(t)
              .attr("y", (d) => yScale(d.source) || 0)
              .attr("height", yScale.bandwidth())
              .attr("width", (d) => xScale(d.watts))
          ),
        (exit) =>
          exit.call((exit) =>
            exit.transition(t).attr("x", margin.left).attr("width", 0).remove()
          )
      );
  }, [data, theme]);

  return (
    <div ref={wrapperRef} style={{ width: "100%" }}>
      <div></div>
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "500px", overflow: "visible" }}
      >
        <g className="x-axis" />
        <g className="y-axis" />
      </svg>
    </div>
  );
}

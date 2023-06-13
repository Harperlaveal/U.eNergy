import React, { useRef, useEffect, useContext } from "react";
import {
  select,
  scaleBand,
  scaleLinear,
  axisLeft,
  axisBottom,
  transition,
} from "d3";
import { EnergyProductionData } from "../interfaces";
import { ThemeContext } from "../../contexts/theme-context"; // Update this path

interface BarChartProps {
  data?: EnergyProductionData;
  max: number;
}

export default function BarChart({ data, max }: BarChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useContext(ThemeContext); // Get current theme mode
  const isDarkMode = theme === "dark"; // Whether the current theme is dark mode
  const labelColor = isDarkMode ? "white" : "black"; // color of labels
  const tooltipBackgroundColor = isDarkMode ? "black" : "white"; // color of tooltip background

  useEffect(() => {
    if (!data || !svgRef.current || !wrapperRef.current) return;

    const svg = select(svgRef.current);

    const width = wrapperRef.current.clientWidth;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 50, left: 100 };

    const xScale = scaleLinear()
      .domain([0, max])
      .range([margin.left, width - margin.right]);

    const yScale = scaleBand()
      .domain(data.production.map((d) => d.source))
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    const xAxis = axisBottom(xScale).tickSizeOuter(0);
    const yAxis = axisLeft(yScale).tickSizeOuter(0);

    const xAxisG = svg
      .select<SVGGElement>(".x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    const xAxisText = xAxisG.selectAll("text.axis-label").data([null]);

    xAxisText
      .join("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", labelColor)
      .style("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Watts");

    const yAxisG = svg
      .select<SVGGElement>(".y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);

    const yAxisText = yAxisG.selectAll("text.axis-label").data([null]);

    yAxisText
      .join("text")
      .attr("class", "axis-label")
      .attr("x", -height / 2)
      .attr("y", -70)
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
            .attr("x", margin.left)
            .attr("y", (d) => yScale(d.source) || 0)
            .attr("width", (d) => xScale(d.watts))
            .attr("height", yScale.bandwidth())
            .on("mousemove", function (event, d) {
              tooltip
                .style("top", `${event.pageY - 10}px`)
                .style("left", `${event.pageX + 10}px`)
                .style("visibility", "visible")
                .html(`Source: ${d.source}<br>Watts: ${d.watts}`);
            })
            .on("mouseout", function () {
              tooltip.style("visibility", "hidden");
            })
            .call((enter) =>
              enter
                .transition(t)
                .delay((d, i) => i * 100)
                .attr("x", margin.left)
                .attr("width", (d) => xScale(d.watts))
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
      )
      .attr(
        "class",
        "fill-primary opacity-50 stroke-vuwGreen stroke-1 hover:opacity-100"
      );

    svg.selectAll("rect").data(data.production);
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

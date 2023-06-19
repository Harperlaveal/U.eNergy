import React, { useRef, useEffect, useContext, useState } from "react";
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
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // get total production for the year
  const totalProduction = data
    ? data.production.reduce(
        (sum, curr) => sum + parseInt(curr.watts.toString()),
        0
      )
    : 0;

  const typeBreakdown = data
    ? data.production.map((item) => ({
        source: item.source,
        production: item.watts,
      }))
    : [];

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

    const yAxis = axisLeft(yScale).tickSizeOuter(0);
    const xAxis = axisBottom(xScale);

    const t = transition().duration(1000);

    const yAxisG = svg
      .select<SVGGElement>(".y-axis")
      .attr("transform", `translate(${margin.left}, 0)`);

    yAxisG
      .selectAll(".tick")
      .data(data.production, (d: any) => d.source)
      .transition(t)
      .attr("transform", (d) => `translate(0,${yScale(d.source)})`);

    yAxisG.transition(t).call(yAxis);

    const xAxisG = svg
      .select<SVGGElement>(".x-axis")
      .attr("transform", `translate(${margin.left},${height - margin.bottom})`);

    xAxisG.transition(t).call(xAxis);

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

    const yLabels = yAxisG.selectAll(".tick text");

    yLabels
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        tooltip.style("visibility", "visible");
        const correspondingData = data.production.find(
          (item) => item.source === d
        );
        if (correspondingData) {
          setActiveItem(correspondingData.source);
        }
      })
      .on("mousemove", function (event, d) {
        // Find the corresponding data for this y-axis label
        const correspondingData = data.production.find(
          (item) => item.source === d
        );
        if (correspondingData) {
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`)
            .style("visibility", "visible")
            // if its less than 1TWh, don't truncate
            .html(
              `Method: ${correspondingData.source}<br>Amount: ${
                correspondingData.watts >= 1
                  ? Math.trunc(correspondingData.watts)
                  : correspondingData.watts
              }GWh`
            );
        }
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });

    yLabels.exit().remove();

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
      .attr("fill-opacity", 0.5)
      .attr("stroke", colorFn)
      .on("mouseover", function (event, d) {
        select(this).style("fill-opacity", 0.8);
        select(this).style("cursor", "pointer");
        setActiveItem(d.source);
      })
      .on("mousemove", function (event, d) {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`)
          .style("visibility", "visible")
          // if its less than 1TWh, don't truncate
          .html(
            `Method: ${d.source}<br>Amount: ${
              d.watts >= 1 ? Math.trunc(d.watts) : d.watts
            }GWh`
          );
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
        select(this).style("fill-opacity", 0.5);
        setActiveItem(null);
      })
      .merge(bars)
      .transition(t)
      .attr("x", margin.left)
      .attr("width", (d) => xScale(d.watts))
      .attr("y", (d) => yScale(d.source) || 0)
      .attr("height", yScale.bandwidth());

    bars.exit().remove();

    return () => {
      tooltip.style("visibility", "hidden");
    };
  }, [data, theme]);

  interface LegendItemProps {
    color: string;
    label: string;
    isActive: boolean;
  }

  const LegendItem = ({ color, label, isActive }: LegendItemProps) => (
    <div className="flex  justify-start">
      <div
        className={`w-4 h-4 rounded-full mr-4 ${
          isActive ? "opacity-100" : "opacity-50"
        }`}
        style={{ backgroundColor: color }}
      ></div>
      <div className="text-xs">{label}</div>
    </div>
  );

  return (
    <div className="flex flex-row w-full">
      <div ref={wrapperRef} style={{ flex: "1" }} className="relative h-500px">
        <div className="transform -rotate-90 absolute left-[-100px] top-[50%]">
          <h1 className="text-lg ">Production Method</h1>
        </div>
        <svg
          ref={svgRef}
          style={{ width: "100%", height: "500px", overflow: "visible" }}
        >
          <g className="x-axis" />
          <g className="y-axis" />
        </svg>
        <div className="absolute bottom-[-10px] left-0 right-0 text-center">
          <h1 className="text-lg ">Amount Produced (Gigawatt Hours)</h1>
        </div>
      </div>
      <div className="overflow-visible no-wrap relative right-[-75px] flex flex-col items-center space-y-6 text-xs">
        <div className="space-y-2 shadow-lg p-2 rounded-lg">
          <h3 className="font-reguar">Most to least renewable</h3>
          <div className="space-y-2 font-light">
            {energySources.map((source, index) => (
              <LegendItem
                key={index}
                color={colorScale(source) as string}
                label={source}
                isActive={source === activeItem}
              />
            ))}
          </div>
        </div>
        <div className="shadow-lg p-2 rounded-lg">
          <div>
            <h3 className="font-medium">Yearly Total</h3>
            <div>{parseInt(totalProduction.toString())} GWh</div>
          </div>
          <div className="mt-2">
            <h3 className="font-medium">Yearly Breakdown</h3>
            <div className="font-light">
              {typeBreakdown.map((item, index) => (
                <div key={index}>
                  {item.source}: {parseInt(item.production.toString())} GWh
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

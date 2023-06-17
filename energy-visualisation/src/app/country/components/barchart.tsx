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
    if (!ref.current) return;
    const svg = d3.select(ref.current);

    // X scale
    const xScale = d3.scaleBand()
        .domain(totals.map((total) => total.id))
        .range([60, width])
        .padding(0.1);

    // Y scale
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(totals, (total) => total.value)])
        .range([height, 20]);

    // Colour scale
    const colourMap = d3.scaleOrdinal()
        .domain(totals.map((total) => total.id))
        .range(d3.schemeSet2);

    // remove the old Y-axis
    svg.select('.y-axis').remove();

    // remove the old X-axis
    svg.select('.x-axis').remove();

    // Create axes
    const yAxis = d3.axisLeft(yScale);
    const xAxis = d3.axisBottom(xScale);

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(60, 20)')
        .call(yAxis);

    // Create transition
    const t = d3.transition().duration(1000);

    const xAxisG = svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${yScale(0) + 20})`);

    // Transition the x-axis
    xAxisG.transition(t).call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)") // adjust the angle as needed
        .style("text-anchor", "end");

    // Get the parent group of the bar chart
    const g = svg.select("g");

    // Select all current bars within the parent group
    const bars = g.selectAll('.bar')
        .data(totals, (total: any) => total.id);

    // Use the .enter() method to get your entering elements:
    const entering = bars.enter();

    // Use the .exit() method to get your exiting elements:
    const exiting = bars.exit();

    // Update bars
    bars
        .attr("class", "bar update")
        .attr("x", (d) => xScale(d.id)!)
        .attr("y", (d) => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => yScale(0) - yScale(d.value))
        .attr("fill", (d) => colourMap(d.id));

    // Add bars
    entering
        .append("rect")
        .attr("class", "bar enter")
        .attr("x", (d) => xScale(d.id)!)
        .attr("y", yScale(0))
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", (d) => colourMap(d.id))
        .transition(t)
        .attr("y", (d) => yScale(d.value))
        .attr("height", (d) => yScale(0) - yScale(d.value));

    // Remove bars
    exiting
        .attr("class", "bar exit")
        .transition(t)
        .attr("y", yScale(0))
        .attr("height", 0)
        .remove();

}, [ref, width, height, totals]);

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
          <h1 className="text-lg ">Amount Produced (Terrawatt Hours)</h1>
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
            <div>{parseInt(totalProduction.toString())} TWh</div>
          </div>
          <div className="mt-2">
            <h3 className="font-medium">Yearly Breakdown</h3>
            <div className="font-light">
              {typeBreakdown.map((item, index) => (
                <div key={index}>
                  {item.source}: {parseInt(item.production.toString())} TWh
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

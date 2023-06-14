"use client";
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function AggregateCountries() {
    const chartContainerRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
    // Use the D3 library to load the data file
    d3.csv('data/data.csv').then((data: any[]) => {
      // Convert data to numeric values
      data.forEach((d: { value: number; }) => {
        d.value = +d.value;
      });

      // Set up chart dimensions
      const width = 400;
      const height = 300;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };

      // Create SVG element
      const svg = d3
        .select(chartContainerRef.current)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      // Define scales for x and y axes
      const xScale = d3
        .scaleBand()
        .domain(data.map((d: { country: any; }) => d.country))
        .range([0, width])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d: { value: any; }) => d.value)!])
        .range([height, 0]);

      // Create and append bars
      svg
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d: { country: any; }) => xScale(d.country)!)
        .attr('y', (d: { value: any; }) => yScale(d.value)!)
        .attr('width', xScale.bandwidth())
        .attr('height', (d: { value: any; }) => height - yScale(d.value)!)
        .attr('fill', 'steelblue');
    });
  }, []);


  return (
    <div className="flex flex-col h-screen items-center justify-center w-full space-y-4">
      <h1 className="text-3xl font-bold ">Energy Production by Country</h1>
      <svg ref={chartContainerRef} />
    </div>
  );
}


"use client";



import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TreeMap = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    d3.csv("data/data.csv").then((data) => {
    if (data && svgRef.current) {
      const width = 800; // Width of the SVG container
      const height = 600; // Height of the SVG container

      // Create the tree map layout
      const treemap = d3
        .treemap()
        .size([width, height])
        .paddingOuter(10)
        .paddingTop(20)
        .paddingInner(4)
        .round(true);

      // Convert the data to hierarchical format
      const root = d3
        .hierarchy(data)
        .sum(d => d.value) // Assuming the value property represents the size of each energy type
        .sort((a, b) => b.value - a.value); // Sort nodes by value in descending order

      // Generate the tree map nodes
      treemap(root);

      // Select the SVG container and create a group for the tree map visualization
      const svg = d3.select(svgRef.current);
      const group = svg.append('g').attr('transform', 'translate(0, 0)');

      // Create SVG elements for each tree map node
      const nodes = group
        .selectAll('g')
        .data(root.descendants())
        .join('g')
        .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

      // Create rectangles for each node
      nodes
        .append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', 'steelblue')
        .attr('stroke', 'white');

      // Add text labels to the rectangles
      nodes
        .append('text')
        .attr('x', 4)
        .attr('y', 14)
        .attr('fill', 'white')
        .text(d => d.data.name); // Assuming the name property represents the label for each energy type
    }
  }, [data]);

  return <svg ref={svgRef} />;
};

export default TreeMap;
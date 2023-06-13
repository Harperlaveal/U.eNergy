/**
 * @packageDocumentation
 * @module SimilarCountriesPage
 * Contains the SimilarCountriesPage component
 * 
 * To start the app run the following command
 * "npm run dev"
 * 
 * The website will be available at http://localhost:3000/similar-countries
 * 
 */
// This statement causes our code to run in the client web browser instead of the server. Console log messages appear in the web browser.
"use client";

// import the react library 
import React, { use, useEffect } from 'react';
import * as d3 from 'd3';

// export a component that has a div with header inside that says countries
export const SimilarCountriesPage = () => { 

    // This log message currently appears in both the web browser console and the server console
    console.log("Hello from SimilarCountriesPage");

    // Use the D3 library to load the data file
    useEffect(() => {

        const container = d3.select("#visualization");

        d3.csv("data/data.csv").then(data => {
            console.log(data);

            container.append('h2').text("Countries with similar energy generation methods")
            .append('svg')
            .attr('width', 500)
            .attr('height', 500)
            .append('circle')
            .attr('cx', 100)
            .attr('cy', 100)
            .attr('r', 50)
            .style('fill', 'blue');
        });
    },[ ] /*This argument causes this function to be called once*/);

    return (
      <div>
          <h1>Countries</h1>
          <div id="visualization"></div>
          {
            
          }
      </div>
    ); 
};

export default SimilarCountriesPage;
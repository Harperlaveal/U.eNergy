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

// type script string variable called year
const year: string = '2022';

/**
 * An array of strings that represent the different energy production methods
 */
const productionMethods: string[] = ["Hydro", "Nuclear", "Solar", "Wind", "Other renewables", "Natural gas", "Coal", "Oil"];

// export a component that has a div with header inside that says countries
export const SimilarCountriesPage = () => { 

    // This log message currently appears in both the web browser console and the server console
    console.log("Hello from SimilarCountriesPage");

    // Use the D3 library to load the data file
    useEffect(() => {

        const container = d3.select("#visualization");

        d3.csv("data/data.csv").then(data => {
            console.log(data);

            // filter data to only include instances from the target year
            const dataFromYear = data.filter(d => d.YEAR === year);
            // map the dataFromYear to PRODUCT and remove duplicates
            const products = dataFromYear.map(d => d.PRODUCT).filter((value, index, self) => self.indexOf(value) === index);
            // map the dataFromYear to COUNTRY and remove duplicates
            const countries = dataFromYear.map(d => d.COUNTRY).filter((value, index, self) => self.indexOf(value) === index);
            // remove any elements from filteredData that are not in productionMethods
            const instances = dataFromYear.filter(d => productionMethods.includes(String(d.PRODUCT)));
            // log instances
            console.log(instances);

            

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
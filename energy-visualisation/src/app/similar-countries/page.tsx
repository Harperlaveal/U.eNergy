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

/**
 * An array of colors that represent the different energy production methods
 */
const productionColors: string[] = ["#1F77B4", "#FEF502", "#F4BF3A", "#D1F1F9", "#79E381", "#DE2A2A", "#000000", "#6A4848"];

/**
 * A mapping from energy production method to color array index
 */
const productionColorMap: Map<string, number> = new Map([
    ["Hydro", 0],
    ["Nuclear", 1],
    ["Solar", 2],
    ["Wind", 3],
    ["Other renewables", 4],
    ["Natural gas", 5],
    ["Coal", 6],
    ["Oil", 7]
]);

const color = d3.scaleOrdinal(productionColors);

// export a component that has a div with header inside that says countries
export const SimilarCountriesPage = () => { 

    // This log message currently appears in both the web browser console and the server console
    console.log("Hello from SimilarCountriesPage");

    // This function is called once when the page loads, it runs on the client browser.
    useEffect(() => {

        console.log(color);

        const container = d3.select("#visualization");
        // Use the D3 library to load the data file
        d3.csv("data/data.csv").then(data => {
            // console.log(data); // sanity check 

            // filter data to only include instances from the target year
            const dataFromYear = data.filter(d => d.YEAR === year);
            // map the dataFromYear to PRODUCT and remove duplicates
            const products = dataFromYear.map(d => String(d.PRODUCT)).filter((value, index, self) => self.indexOf(value) === index);
            // map the dataFromYear to COUNTRY and remove duplicates
            const countries = dataFromYear.map(d => String(d.COUNTRY)).filter((value, index, self) => self.indexOf(value) === index);
            // remove any elements from filteredData that are not in productionMethods
            const instances = dataFromYear.filter(d => productionMethods.includes(String(d.PRODUCT)));
            // log instances
            console.log(instances);

            // Current goal is to find the top generation method for each country in the given year to determine what color the node should be in the graph

            // for each country iterate over instances and create a new object with the country name and the sum of the values for each production method
            const countryTotals = countries.map(country => {
                const countryInstances = instances.filter(d => String(d.COUNTRY) === country);
                var amount: number = Number.MIN_VALUE;
                var biggestMethod: string = "";
                productionMethods.forEach(method => {
                    const methodInstances = countryInstances.filter(d => String(d.PRODUCT) === method);
                    const methodTotal = methodInstances.reduce((a, b) => a + Number(b.VALUE), 0);
                    if (methodTotal > amount) {
                        amount = methodTotal;
                        biggestMethod = method;
                    }
                });

                var colorIndex: number = Number(productionColorMap.get(biggestMethod));

                return {country: country, biggestProducer: biggestMethod, amount: amount, color: productionColors[colorIndex]};
            }
            );
            console.log(countryTotals);
            
            // At this stage we want to calculate the similarity of each country to one another for the force attaction in the graph


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
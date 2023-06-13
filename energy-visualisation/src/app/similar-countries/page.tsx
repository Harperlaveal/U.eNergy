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

// export a component that has a div with header inside that says countries
export const SimilarCountriesPage = () => { 

    // This log message currently appears in both the web browser console and the server console
    console.log("Hello from SimilarCountriesPage");

    // This function is called once when the page loads, it runs on the client browser.
    useEffect(() => {

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
            // console.log(instances);

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

                return {country: country, biggestProducer: biggestMethod, amount: amount, color: productionColors[colorIndex], id: country, group: colorIndex};
            }
            );
            // console.log(countryTotals);
            
            // At this stage we want to calculate the similarity of each country to one another for the force attaction in the graph
            var edges: any[]= [];

            /**
             * Use the euclidean distance formula to calculate the similarity between two countries. Copilot is a G.
             * @param countryA 
             * @param countryB 
             * @returns The euclidean distance between countryA and countryB
             */
            const calculateCountrySimilarity = (countryA: string, countryB: string) => {
                var similarity: number = 0;
                // for each energy production method
                productionMethods.forEach(method => {
                    // get the instances for countryA and countryB
                    const countryAInstances = instances.filter(d => String(d.COUNTRY) === countryA);
                    const countryBInstances = instances.filter(d => String(d.COUNTRY) === countryB);
                    // get the instances for countryA and countryB for the current method
                    const countryAMethodInstances = countryAInstances.filter(d => String(d.PRODUCT) === method);
                    const countryBMethodInstances = countryBInstances.filter(d => String(d.PRODUCT) === method);
                    // get the total amount of energy produced for countryA and countryB for the current method
                    const countryAMethodTotal = countryAMethodInstances.reduce((a, b) => a + Number(b.VALUE), 0);
                    const countryBMethodTotal = countryBMethodInstances.reduce((a, b) => a + Number(b.VALUE), 0);
                    // calculate the difference between the two countries for the current method
                    const difference: number = countryAMethodTotal - countryBMethodTotal;
                    // square the difference
                    const squaredDifference: number = Math.pow(difference, 2);
                    // calculate the range of the current method
                    const range: number = Math.max(countryAMethodTotal, countryBMethodTotal) - Math.min(countryAMethodTotal, countryBMethodTotal);
                    if (range === 0 || squaredDifference === 0) {
                        // skip this method
                        return;
                    }
                    // divide the squared difference by the squared range
                    const normalizedDifference: number = squaredDifference / Math.pow(range, 2);
                    // add the normalized difference to the similarity
                    similarity += normalizedDifference;
                });
                return similarity;
            };
            // var temp:number = 0/100; // 0
            // var temp2:number = 0/0; // NaN
            // var temp3:number = 10/0; // Infinity
            countries.forEach(countryA => {
                countries.forEach(countryB => {
                    // if country a is the same as country b then skip
                    if (countryA === countryB) {
                        return;
                    }
                    var weight: number = calculateCountrySimilarity(countryA, countryB);
                    var edge: Object = {source: countryA, target: countryB, value: weight};
                    edges.push(edge);
                });
            });

            console.log(edges);

            // time to make the d3 force simulation graph (https://observablehq.com/@d3/force-directed-graph/2?intent=fork)

            const width: number = 1000;
            const height: number = 1000;
            // convert the country instances to nodes
            const nodes: d3.SimulationNodeDatum[] = countryTotals.map(country => {
                return {id: String(country.country), group: Number(country.group)} as d3.SimulationNodeDatum;
            });
            const links: d3.SimulationLinkDatum<d3.SimulationNodeDatum>[] = edges.map(edge => {
                return {source: String(edge.source), target: String(edge.target), value: Number(edge.value)} as d3.SimulationLinkDatum<d3.SimulationNodeDatum>;
            });

            const simulation = d3.forceSimulation(nodes).
                force("link", d3.forceLink(links).id((d: any) => d.id)).
                force("charge", d3.forceManyBody()).
                force("center", d3.forceCenter(width / 2, height / 2)).on("tick", ticked);

            const container = d3.select("#visualization");
            const svg = container.append("svg").
                attr("viewBox", [0, 0, width, height]).
                attr("width", width).
                attr("height", height).
                attr("style", "max-width: 100%; height: auto;");
            
            const link = svg.append("g").
                attr("stroke", "#999").
                attr("stroke-opacity", 0.6).
                selectAll("line").
                data(links).
                join("line").
                attr("stroke-width", (d: any) => Math.sqrt(d.value));

            const node = svg.append("g").
                attr("stroke", "#fff").
                attr("stroke-width", 1.5).
                selectAll("circle").
                data(nodes).
                join("circle").
                attr("r", 5).
                attr("fill", (d: any) => productionColors[d.group]);

            node.append("title").
                text((d: any) => d.id);

            function ticked() {
                link.
                    attr("x1", (d: any) => d.source.x).
                    attr("y1", (d: any) => d.source.y).
                    attr("x2", (d: any) => d.target.x).
                    attr("y2", (d: any) => d.target.y);

                node.
                    attr("cx", (d: any) => d.x).
                    attr("cy", (d: any) => d.y);
            }

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
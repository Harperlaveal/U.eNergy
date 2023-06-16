//Create a treemap using d3 and next.js, using the data from /data/data.csv
//The treemap should have the following features:


"use client";



import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getCode } from 'iso-3166-1-alpha-2';
import { getContinentCode, getContinentName } from '@brixtol/country-continent';

const productionColorMap: Map<string, string> = new Map([
  ["Hydro", "#1F77B4"],
  ["Nuclear", "#FEF502"],
  ["Solar", "#F4BF3A"],
  ["Wind", "#D1F1F9"],
  ["Other renewables","#79E381"],
  ["Natural gas", "#DE2A2A"],
  ["Coal", "#000000"],
  ["Oil", "#6A4848"],
]);

// a string array of each generation method
const methods: string[] = ["Hydro", "Nuclear", "Solar", "Wind", "Other renewables", "Natural gas", "Coal", "Oil"];

// a string array of the continents of the world
const continents: string[] = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];

// a number array called years that goes from 2010 to 2022
const years = Array.from({ length: 12 }, (_, i) => 2010 + i);

interface CountryNode {
  name: string; /* All -> Method (i.e. Coal, Gas, Nuclear) -> Continent -> individual countries */
  energyProduced: number;
  children?: CountryNode[];
}

const allNodes: Map<string, Map<string, CountryNode[]>> = new Map();

export const TreeMap = () => {
  const svgRef = useRef(null);
  const [year, setYear] = useState<Number>(2022);

  useEffect(() => {
    // Use the D3 library to load the data file
    console.log("Use effect called, trying to load data");
    d3.csv("data/data.csv").then((data) => {
      console.log("Data loaded");
      console.log(data); // sanity check

      const dataFromYear = data.filter((d) => d.YEAR === year.toString());
      
      // init the map with each generation method as a key and an empty array as the value
      //var allNodes: Map<string, Map<string, CountryNode[]>> = new Map();
      methods.forEach((method) => {
        var methodMap: Map<string, CountryNode[]> = new Map();
        continents.forEach((continent) => {
          methodMap.set(continent, []);
        });
        allNodes.set(method, methodMap);
      });

      // By method
      methods.forEach((method) => {
        // console.log("Method: " + method);
        const dataFromMethod = dataFromYear.filter((d) => d.PRODUCT === method);
        // console.log(dataFromMethod);
        continents.forEach((continent) => {
          // console.log("Continent: " + continent);
          var instancesFromThisContinent: any = [];
          // By continent
          // go through every instance, if it belongs to this continent, add it to the array
          dataFromMethod.forEach((d) => {
            const countryName = String(d.COUNTRY);
            const countryCode = getCode(countryName);
            if (countryCode !== null) {
              const countryContinent = getContinentName(countryCode);
              if (countryContinent === continent) {
                instancesFromThisContinent.push(d);
              }
            }
          });
          // Now that we have all the instances from this continent, we need to group the instances by country
          // By country
          const countries: any[] = instancesFromThisContinent.map((d: any) => d.COUNTRY).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
          countries.forEach((country) => {
            // Energy produced by method
            const coutryInstances = instancesFromThisContinent.filter((d: any) => d.COUNTRY === country);
            const energyProduced: number = coutryInstances.reduce((a: number, b: any) => a + Number(b.VALUE), 0);
            // Add the country to the leaf nodes
            const countryNode: CountryNode = {
              name: country,
              energyProduced: energyProduced,
            };
            // add the country node to all nodes
            const methodMap = allNodes.get(method);
            if (methodMap !== undefined) {
              const continentMap = methodMap.get(continent);
              if (continentMap !== undefined) {
                continentMap.push(countryNode);
              }
            }
          });
        });
      });
      console.log("All leaf nodes");
     console.log(allNodes);
    });


    // Convert the Map to Hierarchy Format using the function I wrote
    function convertMapToHierarchy(allNodes: Map<string, Map<string, CountryNode[]>>): CountryNode {
      const root: CountryNode = { name: "All", energyProduced: 0, children: [] };
    
      allNodes.forEach((methodMap, method) => {
        const methodNode: CountryNode = {
          name: method,
          energyProduced: 0,
          children: [],
        };
        //@ts-ignore
        root.children.push(methodNode);
    
        methodMap.forEach((continentMap, continent) => {
          const continentNode: CountryNode = {
            name: continent,
            energyProduced: 0,
            children: [],
          };
             //@ts-ignore
          methodNode.children.push(continentNode);
    
          continentMap.forEach((countries) => {
               //@ts-ignore
            countries.forEach((country) => {
                 //@ts-ignore
              continentNode.children.push(country);
              continentNode.energyProduced += country.energyProduced;
            });
          });
          methodNode.energyProduced += continentNode.energyProduced;
        });
      });
      return root;
    }

    //Convert the Map to Hierarchy Format using the function I wrote
const hieracrchyData = convertMapToHierarchy(allNodes);
  console.log(hieracrchyData);

var width = 960;
var height = 600;

//Tree map layout
const treemap = d3
    .treemap<CountryNode>()
    .size([width, height])
    .padding(1)
    .round(true)
    .tile(d3.treemapSliceDice);

    var de = d3.hierarchy<CountryNode>(hieracrchyData);
    treemap(de);
    console.log(hieracrchyData);
    
    //Select the SVG Container
    const svg = d3.select(svgRef.current);


    const nodes = svg
        .selectAll<SVGRectElement, d3.HierarchyRectangularNode<CountryNode>>('rect')
        //@ts-ignore
        .data(de.leaves())
        .join('rect')
         //@ts-ignore
        .attr('x', (d) => d.x0)
         //@ts-ignore
        .attr('y', (d) => d.y0)
         //@ts-ignore
        .attr('width', (d) => d.x1 - d.x0)
         //@ts-ignore
        .attr('height', (d) => d.y1 - d.y0)
        .style('fill', (d) => {
           //@ts-ignore
          const method = d.parent?.parent?.data.name || '';
          return productionColorMap.get(method) || '';
        });

        console.log(nodes);
    
  const container = d3.select('#visualization');
  // delete any existing 
  container.selectAll('*').remove();
  // Add the tree map to container
  container.append('svg').attr('width', 1000).attr('height', 1000);
  container.select('svg').append('g').attr('id', 'treemap');
   //@ts-ignore
  container.select('#treemap').selectAll('rect').data(de.leaves()).join('rect')
  }, [year]);

  return (
    <div id="visualization"></div>
  );
};

export default TreeMap;


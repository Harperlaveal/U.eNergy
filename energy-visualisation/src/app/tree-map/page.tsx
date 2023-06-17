"use client"

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getCode } from 'iso-3166-1-alpha-2';
import { getContinentName } from '@brixtol/country-continent';
import { compileFunction } from 'vm';

const productionColorMap: Map<string, string> = new Map([
  ["Hydro", "#1F77B4"],
  ["Nuclear", "#FEF502"],
  ["Solar", "#F4BF3A"],
  ["Wind", "#D1F1F9"],
  ["Other renewables", "#79E381"],
  ["Natural gas", "#DE2A2A"],
  ["Coal", "#000000"],
  ["Oil", "#6A4848"],
]);

const allProductionMethods: string[] = ["Hydro", "Nuclear", "Solar", "Wind", "Other renewables", "Natural gas", "Coal", "Oil"];

const methods: string[] = ["Hydro", "Nuclear", "Solar", "Wind", "Other renewables", "Natural gas", "Coal", "Oil"];
// const continents: string[] = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];
const continents: string[] = ["Asia", "Europe", "North America", "Oceania", "South America"];

const continentToColorMap: Map<string, string> = new Map([
  ["Asia", "#FEF502"], // yellow
  ["Europe", "#F4BF3A"], // orange
  ["North America", "#D1F1F9"], // light blue
  ["Oceania", "#79E381"], // green
  ["South America", "#DE2A2A"], // red
]);

interface CountryNode {
  name: string;
  value: number;
  children: CountryNode[];
}

const allNodes: Map<string, Map<string, CountryNode[]>> = new Map();

export const TreeMap = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [year, setYear] = useState<number>(2022);
  // a number state called depth
  const [depth, setDepth] = useState<number>(0);
  const [hoveredChild, setHoveredChild] = useState<string | null>(null);


  useEffect(() => {
    d3.csv("data/data.csv").then((data) => {
      console.log(data);
      const dataFromYear = data.filter((d) => d.YEAR === year.toString());
      
      methods.forEach((method) => {
        const methodMap: Map<string, CountryNode[]> = new Map();
        continents.forEach((continent) => {
          methodMap.set(continent, []);
        });
        allNodes.set(method, methodMap);
      });

      methods.forEach((method) => {
        const dataFromMethod = dataFromYear.filter((d) => d.PRODUCT === method);
        continents.forEach((continent) => {
          const instancesFromThisContinent: any[] = [];
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
          const countries: any[] = instancesFromThisContinent
            .map((d: any) => d.COUNTRY)
            .filter((value: any, index: any, self: any) => self.indexOf(value) === index) || [];

          countries.forEach((country) => {
            const countryInstances = instancesFromThisContinent.filter((d: any) => d.COUNTRY === country);
            const energyProduced: number = countryInstances.reduce((a: number, b: any) => a + Number(b.VALUE), 0);
            const countryNode: CountryNode = {
              name: country,
              value: energyProduced,
              children: [] as CountryNode[],
            };
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

      const hierarchyData = convertMapToGraph(allNodes); 

      var width = 1300;
      var height = 800;

      const treemap = d3
        .treemap()
        .size([width, height])
        .padding(1)
        .round(true)
        .tile(d3.treemapSquarify); // we like this one :)

      /* Copy Stu code starts */

      // delete the old tree map if it exists
      d3.select("#treemap").select("*").remove();

      const zoom = d3.zoom().scaleExtent([1, 10]).on('zoom', (event) => {
        svg.attr('transform', event.transform);
        svg.selectAll("text").attr('font-size', (d) => isParentView ? 16 / event.transform.k + "px" : 10 / event.transform.k + "px");
      });

      var svg = d3.select("#treemap").
        append("svg").
        attr("width", width).
        attr("height", height).
        on("click", switchView).
        // @ts-ignore
        call(zoom).
        append("g");
        

      function sumByValue(d: any) {
        return d.value;
      }

      var isParentView = true;

      var root = d3.hierarchy(hierarchyData).sum(sumByValue);
      // @ts-ignore
      treemap(root);
      update(root.children);

      /**
       * This function just goes back and forth between root node and layer 1 nodes
       * We can probably figure something out to make it go deeper.
       * We don't know which cell you clicked in so we can't tell which node to traverse down to.
       */
      function switchView() {
        svg.selectAll(".node").remove();
        isParentView ? update(root.children) : update(root.leaves());
        isParentView = !isParentView;
      }

      function update(node: any) {

        console.log("root in update function: ");
        console.log(node);

        var cell = svg.selectAll(".node")
          .data(node)
          .enter().append("g")
          .attr("class", "node")
          .attr("transform", function (d: any) { return "translate(" + d.x0 + "," + d.y0 + ")"; });
        cell.append("clipPath")
        // @ts-ignore
        .attr("id", function(d) { return "clip-" + d.data.name })
        .append("rect")
        // @ts-ignore
        .attr("width", function(d) { return d.x1 - d.x0; })
        // @ts-ignore
        .attr("height", function(d) { return d.y1 - d.y0; });
        cell.append("rect")
        // @ts-ignore
        .attr("id", function(d) { return d.data.name; })
        // @ts-ignore
        .attr("width", function(d) { return d.x1 - d.x0; })
        // @ts-ignore
        .attr("height", function(d) { return d.y1 - d.y0; })
         .style("stroke", function(d) { return isParentView ? "black" : "none"; }) // add stroke color
         .style("stroke-width", function(d) { return isParentView ? "2px" : "0px"; }) // add stroke width
        
        // @ts-ignore
        .attr("fill", function(d) {
          if (!isParentView){
            console.log("d in update function: ");
            console.log(d);
            // @ts-ignore
            var continent = String(d.parent.data.name);
            var color = String(continentToColorMap.get(continent));
          } else {
            // @ts-ignore
            var type = d.data.name;
            var color = String(productionColorMap.get(type));
            return color;
          }
          return color;
        });

        cell.append("text")
        .attr("class", "node-text")
        // @ts-ignore
        .attr("clip-path", function(d) { return "url(#clip-" + d.data.name + ")"; })
        .selectAll("tspan")
        //@ts-ignore
        .data(function(d) { return [d.data.name]; }) // Use the name directly, no split
        .enter().append("tspan")
        //Set the text of the child nodes to be smaller, but make the zoom functionality still work

        // @ts-ignore
        .attr("font-size", function(d) { return isParentView ? "16px" : "6px"; })
        // @ts-ignore
      
        //.attr("font-size"," 8px")
        // @ts-ignore
        .attr("fill", function(d) { return isParentView && d === "Coal" ? "white" : "black"; })
        .attr("x", 4)
        .attr("y", 20) // Fixed position for the name
        .text(function(d) { return d; });    
      }

      /* Copy stu code ends */
    });
  }, [year]);


//Write a function to convert the map to a hierarchy data structure that d3 can use
// Create the node for each continent

// Create the root node
/**
 * Converts map data structure into recursive graph data structure.
 * @param allNodes 
 * @returns 
 */
function convertMapToGraph(allNodes: Map<string, Map<string, CountryNode[]>>): any {
  // Create the node for each production method
  var methodsList: any[] = [];

  methods.forEach((method) => {
    
    var continentList: any[] = [];
    
      // Add countries to the continent nodes
      continents.forEach((continent) => {  
        // @ts-ignore
        const countries: any[] = allNodes.get(method)?.get(continent)?.map((country) => {
          return {
            name: country.name,
            value: country.value,
          };
        });

        // log an error if countries is undefined and continue
        if (countries === undefined || countries === null) {
          console.log("Error: countries is undefined");
          return;
        }
        // make the contient node
        const continentNode = {
          name: continent,
          children: countries,
        };
        // add the continent node to the continent list
        continentList.push(continentNode);
      });
      const methodNode = {
        name: method,
        children: continentList,
      };
      methodsList.push(methodNode);
    });
    // make the root node
    const rootNode = {
      name: "All",
      children: methodsList,
    };
    return rootNode;
  
  }

  var width = 960;
  var height = 600;

  return (
    <div className=" flex flex-row pt-44 h-screen px-2 w-full items-center overflow-hidden">
      <div className="flex flex-col w-[90%] items-center h-full">
        <h1 className="text-4xl font-bold z-10">Production Hierachy</h1>
        <h3 className="text-2xl font-bold z-10">Zoom and drag around to view the different countries based on Production Type</h3>
        <h4 className="text-2xl font-bold z-10">Click back and forth to see the relation between the country and energy type</h4>
        <div className="flex flex-col">
          <div id="treemap"></div>
        </div>
      </div>
    </div>
  );

};

export default TreeMap;

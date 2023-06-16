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

      console.log("allNodes before convert function");
      console.log(allNodes);
      const hierarchyData = convertMapToGraph(allNodes); 

      console.log("hierachy data: ");
      console.log(hierarchyData);


      var width = 1300;
      var height = 800;

      const treemap = d3
        .treemap()
        .size([width, height])
        .padding(1)
        .round(true)
        //.tile(d3.treemapSliceDice);
        //.tile(d3.treemapBinary);
        .tile(d3.treemapSquarify); // we like this one :)
        //.tile(d3.treemapResquarify);
        //.tile(d3.treemapSlice);
        //.tile(d3.treemapDice);


      const customData = {
        name: "root",
        children: [
          {
            name: "Hydro",
            children: [
              { name: "Asia", children: [
                { name: "China", value: 1 },
                { name: "India", value: 1 }
              ] },
              { name: "Europe", children: [
                { name: "Germany", value: 1 },
                { name: "France", value: 1 },
                { name: "Italy", value: 1 },
                { name: "Spain", value: 1 },
                { name: "United Kingdom", value: 1 },
              ] },
              { name: "North America", value: 1 },
              { name: "Oceania", value: 1 },
              { name: "South America", value: 1 },
            ],
          },
          {
            name: "Nuclear",
            children: [
              { name: "Asia", value: 1 },
              { name: "Europe", value: 1 },
              { name: "North America", value: 1 },
              { name: "Oceania", value: 1 },
              { name: "South America", value: 1 },
            ],
          },
        ]
      };
      console.log("customData");
      console.log(customData);

      /* Copy Stu code starts */

      // delete the old tree map if it exists
      d3.select("#treemap").select("*").remove();

      var svg = d3.select("#treemap").
        append("svg").
        attr("width", width).
        attr("height", height).
        on("click", switchView);

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
        cell.append("rect")
        // @ts-ignore
        .attr("id", function(d) { return d.data.name; })
        // @ts-ignore
        .attr("width", function(d) { return d.x1 - d.x0; })
        // @ts-ignore
        .attr("height", function(d) { return d.y1 - d.y0; })
        .attr("border", "1px solid black")
        // @ts-ignore
        .attr("fill", function(d) {
          if (!isParentView){
            console.log("d in update function: ");
            console.log(d);
            // @ts-ignore
            var continent = String(d.parent.data.name);
            var color = String(continentToColorMap.get(continent));
            // var color = getRandomColor();  
          } else {
            // @ts-ignore
            var type = d.data.name;
            var color = String(productionColorMap.get(type));
            return color;
          }
          
          return color;
        });

        cell.append("text")
          // @ts-ignore
          .attr("clip-path", function(d) { return "url(#clip-" + d.data.name + ")"; })
          .selectAll("tspan")
          // @ts-ignore
          .data(function(d) { return [d.data.name]; }) // Use the name directly, no split
          .enter().append("tspan")
          .attr("font-size", d => isParentView ? "16px" : "10px")
          .attr("x", 4)
          .attr("y", 20) // Fixed position for the name
          .text(function(d) { return d; });
      }

      /* Copy stu code ends */
    });
  }, [year]);

//Write a function to convert the map to a hierarchy data structure that d3 can use
// Create the node for each continent

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++){
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

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

      /**
       * @deprecated
       * @param allNodes 
       * @returns 
       */
      function convertMapToHierarchy(allNodes: Map<string, Map<string, CountryNode[]>>): CountryNode {
        const root: CountryNode = { name: "All", value: 0, children: [] };
      //Gets Energy method from map
        allNodes.forEach((methodMap, method) => {
          const methodNode: CountryNode = {
            name: method,
            value: 0,
            children: [],
          };
          //Gets contienent from the Method
          methodMap.forEach((continentMap, continent) => {
            const continentNode: CountryNode = {
              name: continent,
              value: 0,
              children: [],
            };
            //Gets country from the continent
            continentMap.forEach((countries) => {
              countries.children.forEach((country) => {
                continentNode.children.push(country);
                continentNode.value += country.value;
              });
            });
            methodNode.children.push(continentNode);
            methodNode.value += continentNode.value;
          });
          root.children.push(methodNode);
          root.value += methodNode.value;
        });
      
        return root;
        
      }

      

  var width = 960;
  var height = 600;

  return (
    <div className=" flex flex-row pt-44 h-screen px-2 w-full items-center overflow-hidden">
      <div className="flex flex-col w-[90%] items-center h-full">
        <h1 className="text-4xl font-bold z-10">Production Hierachy</h1>
        <div className="flex flex-col">
          <div id="treemap"></div>
        </div>
      </div>
    </div>
  );

  /*
     return (
    <div>
      <svg ref={svgRef} width={width} height={height} className="shadow-lg" />
    </div>
  );
  */

};

export default TreeMap;

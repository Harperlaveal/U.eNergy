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

const methods: string[] = ["Hydro", "Nuclear", "Solar", "Wind", "Other renewables", "Natural gas", "Coal", "Oil"];
// const continents: string[] = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];
const continents: string[] = ["Asia", "Europe", "North America", "Oceania", "South America"];

interface CountryNode {
  name: string;
  value: number;
  children: CountryNode[];
}

const allNodes: Map<string, Map<string, CountryNode[]>> = new Map();

export const TreeMap = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [year, setYear] = useState<number>(2022);

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
      console.log(hierarchyData); // the hierarchy data structure is OK

      var width = 960;
      var height = 600;

      /*
      const treemap = d3
        .treemap<CountryNode>() // Or maybe something is going wrong here?
        .size([width, height])
        .padding(1)
        .round(true)
        .tile(d3.treemapSliceDice);
      */

      /*
       * The NaNs are coming from here somewhere?
       */  
      const treemap = d3
        .treemap() // Or maybe something is going wrong here?
        .size([width, height])
        .padding(1)
        .round(true)
        .tile(d3.treemapSliceDice);
      

      // const root = d3.hierarchy<CountryNode>(hierarchyData); // Something is going wrong here?

      /*
       * The NaNs are coming from here somewhere?
       */  
      const root = d3.hierarchy(hierarchyData); // Something is going wrong here?

      console.log("root before tree map");
      console.log(root);
      // @ts-ignore
      treemap(root);
      console.log("root after treemap");
      console.log(root);

      const svg = d3.select(svgRef.current);

      console.log("root leaves");
      console.log(root.leaves());

      /*
      svg.selectAll('rect')
        .data(root.leaves() as d3.HierarchyRectangularNode<CountryNode>[])
        .enter()
        .append('rect')
        .attr('x', (d) => {
          // console.log(d);
          return d.x0;
          // return 1;
        })
        .attr('y', (d) => d.y0)
        .attr('width', (d) => {
          return d.x1 - d.x0
          //return 1;
        })
        .attr('height', (d) => {
          return d.y1 - d.y0
          //return 1;
        })
        .attr('stroke', 'black')
        .style('fill', (d) => {
          const method = d.parent?.parent?.data.name || '';
          return productionColorMap.get(method) || '';
        });
        */

        svg.selectAll('rect')
        .data(root.leaves())
        .enter()
        .append('rect')
        .attr('x', (d) => {
          // console.log(d);
          var temp = d as any;
          return temp.x0;
          // return d.x0;
          // return 1;
        })
        .attr('y', (d) => {
          var temp = d as any;
          return temp.y0;
          // return d.y0;
        })
        .attr('width', (d) => {
          var temp = d as any;
          return temp.x1 - temp.x0;
          // return d.x1 - d.x0;
          //return 1;
        })
        .attr('height', (d) => {
          var temp = d as any;
          return temp.y1 - temp.y0;
          // return d.y1 - d.y0
          //return 1;
        })
        .attr('stroke', 'black')
        .style('fill', (d) => {
          const method = d.parent?.parent?.data.name || '';
          return productionColorMap.get(method) || '';
        });
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
function convertMapToGraph(allNodes: Map<string, Map<string, CountryNode[]>>): CountryNode {
  // Create the node for each production method
  var methodsList: CountryNode[] = [];
  var methodTotal: number = 0;
  var rootNodeTotal: number = 0;

  methods.forEach((method) => {
    
    var methodTotal: number = 0;
    var continentList: CountryNode[] = [];
    
      // Add countries to the continent nodes
      continents.forEach((continent) => {  
        var continentEnergy: number = 0;
        const countries: CountryNode[] = allNodes.get(method)?.get(continent) as CountryNode[];
        // log an error if countries is undefined and continue
        if (countries === undefined || countries === null) {
          console.log("Error: countries is undefined");
          return;
        }
        // calculate contientn energy
        countries.forEach((country) => {
          continentEnergy += country.value;
        });
        // make the contient node
        const continentNode: CountryNode = {
          name: continent,
          value: continentEnergy,
          children: countries,
        };
        // add the continent node to the continent list
        continentList.push(continentNode);
        // add to the continent total
        methodTotal += continentNode.value;
      });
      const methodNode: CountryNode = {
        name: method,
        value: methodTotal,
        children: continentList,
      };
      methodsList.push(methodNode);
      // add to the method total
      methodTotal += methodNode.value;
    });
    // make the root node
    // calculate root node energy
    methodsList.forEach((method) => {
      rootNodeTotal += method.value;
    });

    const rootNode: CountryNode = {
      name: "All",
      value: rootNodeTotal,
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
    <div>
      <svg ref={svgRef} width={width} height={height} className="shadow-lg" />
    </div>
  );
};

export default TreeMap;

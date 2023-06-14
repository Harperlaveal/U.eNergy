import { CSVRow, EnergyProductionData, EnergySourceProduction } from './interfaces';
import * as d3 from "d3";

export const loadCSVData = (path: string): Promise<CSVRow[]> =>
    new Promise((resolve, reject) => {
        d3.csv(path)
            .then((data) => {
                resolve(data as unknown as CSVRow[]);
            })
            .catch((error) => reject(error));
    });

export function convertToEnergySourceProduction(row: CSVRow): EnergySourceProduction {
    return {
        source: row.PRODUCT,
        watts: row.VALUE,
    };
}

export function groupByYear(rows: CSVRow[]): EnergyProductionData[] {
    const grouped: { [year: number]: EnergySourceProduction[] } = {};

    for (const row of rows) {
        if (grouped[row.YEAR]) {
            grouped[row.YEAR].push(convertToEnergySourceProduction(row));
        } else {
            grouped[row.YEAR] = [convertToEnergySourceProduction(row)];
        }
    }

    return Object.entries(grouped).map(([year, production]) => ({
        year: Number(year),
        production,
    }));
}

export const energySources = [
    "Hydro",
    "Nuclear",
    "Solar",
    "Wind",
    "Other renewables",
    "Natural gas",
    "Coal",
    "Oil",
];

export function createCountryData(allRows: CSVRow[]): { [country: string]: EnergyProductionData[] } {
    const allCountriesData: { [country: string]: EnergyProductionData[] } = {};

    for (const row of allRows) {
        const country = row.COUNTRY;
        const year = row.YEAR;
        const production = convertToEnergySourceProduction(row);

        // Only add production data for the 8 specified energy sources
        if (!energySources.includes(production.source)) {
            continue;
        }

        if (!allCountriesData[country]) {
            allCountriesData[country] = [];
        }

        const countryData = allCountriesData[country];

        let yearData = countryData.find((d) => d.year === year);
        if (!yearData) {
            yearData = {
                year: year,
                // Initialize with zero production for all energy sources
                production: energySources.map((source) => ({ source: source, watts: 0 })),
            };
            countryData.push(yearData);
        }

        // Find the production entry for the current energy source and update the watts
        const sourceProduction = yearData.production.find((p) => p.source === production.source);
        if (sourceProduction) {
            sourceProduction.watts = production.watts;
        }
    }

    // Sort the energy sources by watts in descending order for each country's production data
    for (const country in allCountriesData) {
        const countryData = allCountriesData[country];

        countryData.forEach((yearData) => {
            yearData.production.sort((a, b) => b.watts - a.watts);
        });
    }

    return allCountriesData;
}
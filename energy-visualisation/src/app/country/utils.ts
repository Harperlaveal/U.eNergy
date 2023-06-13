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

export function createCountryData(allRows: CSVRow[]): { [country: string]: EnergyProductionData[] } {
    const allCountriesData: { [country: string]: EnergyProductionData[] } = {};

    for (const row of allRows) {
        const country = row.COUNTRY;
        const year = row.YEAR;
        const production = convertToEnergySourceProduction(row);

        if (!allCountriesData[country]) {
            allCountriesData[country] = [];
        }

        const countryData = allCountriesData[country];

        let yearData = countryData.find((d) => d.year === year);
        if (!yearData) {
            yearData = {
                year: year,
                production: [],
            };
            countryData.push(yearData);
        }

        yearData.production.push(production);
    }

    // Select the top 10 energy sources with the highest watts for each country
    for (const country in allCountriesData) {
        const countryData = allCountriesData[country];

        // Calculate the total watts for each energy source
        const energySourceWatts: { [source: string]: number } = {};
        for (const yearData of countryData) {
            for (const production of yearData.production) {
                const source = production.source;
                const watts = production.watts;
                energySourceWatts[source] = (energySourceWatts[source] || 0) + watts;
            }
        }

        // Sort the energy sources based on watts in descending order
        const topEnergySources = Object.keys(energySourceWatts).sort(
            (a, b) => energySourceWatts[b] - energySourceWatts[a]
        ).slice(0, 10);

        // Update the production data for each year to include only the top energy sources
        for (const yearData of countryData) {
            const yearProduction: EnergySourceProduction[] = [];
            for (const source of topEnergySources) {
                const production = yearData.production.find((p) => p.source === source);
                yearProduction.push(production || { source: source, watts: 0 });
            }
            yearData.production = yearProduction;
        }
    }

    return allCountriesData;
}
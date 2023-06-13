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
        if (!allCountriesData[row.COUNTRY]) {
            allCountriesData[row.COUNTRY] = [];
        }

        let countryData = allCountriesData[row.COUNTRY];

        let yearData = countryData.find((d) => d.year === row.YEAR);
        if (!yearData) {
            yearData = {
                year: row.YEAR,
                production: [],
            };
            countryData.push(yearData);
        }

        yearData.production.push(convertToEnergySourceProduction(row));
    }

    return allCountriesData;
}


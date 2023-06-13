import { EnergyProductionData } from "./interfaces";

export const mockData: EnergyProductionData[] = [
    {
        year: 2019,
        production: [
            { source: 'Solar', watts: 1200 },
            { source: 'Wind', watts: 900 },
            { source: 'Hydro', watts: 700 },
            { source: 'Nuclear', watts: 1500 },
            { source: 'Fossil Fuels', watts: 2000 },
        ],
    },
    {
        year: 2020,
        production: [
            { source: 'Solar', watts: 1500 },
            { source: 'Wind', watts: 1000 },
            { source: 'Hydro', watts: 800 },
            { source: 'Nuclear', watts: 1600 },
            { source: 'Fossil Fuels', watts: 1900 },
        ],
    },
    {
        year: 2021,
        production: [
            { source: 'Solar', watts: 1300 },
            { source: 'Wind', watts: 900 },
            { source: 'Hydro', watts: 800 },
            { source: 'Nuclear', watts: 500 },
            { source: 'Fossil Fuels', watts: 600 },
        ],
    },
    {
        year: 2022,
        production: [
            { source: 'Solar', watts: 200 },
            { source: 'Wind', watts: 300 },
            { source: 'Hydro', watts: 700 },
            { source: 'Nuclear', watts: 1100 },
            { source: 'Fossil Fuels', watts: 1200 },
        ],
    },
];

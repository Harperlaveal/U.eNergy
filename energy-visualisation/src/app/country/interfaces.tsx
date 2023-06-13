export interface EnergyProductionData {
  year: number;
  production: Array<EnergySourceProduction>;
}

export interface EnergySourceProduction {
  source: string;
  watts: number;
}

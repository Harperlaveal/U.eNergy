export interface EnergyProductionData {
  year: number;
  production: Array<EnergySourceProduction>;
}

export interface EnergySourceProduction {
  source: string;
  watts: number;
}

export interface Country {
  name: string;
  code: string;
}

export interface CSVRow {
  COUNTRY: string;
  CODE_TIME: string;
  TIME: string;
  YEAR: number;
  MONTH: number;
  MONTH_NAME: string;
  PRODUCT: string;
  VALUE: number;
  DISPLAY_ORDER: number;
  yearToDate: number;
  previousYearToDate: number;
  share: number;
}

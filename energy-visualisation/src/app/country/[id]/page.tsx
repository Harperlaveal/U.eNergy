"use client";
import { useState, useEffect } from "react";
import { EnergyProductionData } from "../interfaces";
import BarChart from "../components/barchart";
import Timeline from "../components/timeline";
import { mockData } from "../mock-data";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import AutoComplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { countries } from "../countries";
import { Country } from "../interfaces";
import { useRouter } from "next/navigation";

export default function CountryPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const [data, setData] = useState<EnergyProductionData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const selectedCountry =
    countries.find(
      (country) => country.name.toLowerCase() === decodeURI(id).toLowerCase()
    ) || null;

  useEffect(() => {
    setData(mockData);
    setSelectedYear(mockData[0].year);
  }, [id]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const router = useRouter();

  const handleCountrySelect = (_: any, value: Country | null) => {
    if (value) {
      router.push(`/country/${value.name}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && selectedCountry) {
      event.preventDefault();
      router.push(`/country/${selectedCountry.name}`);
    }
  };

  return (
    <div className="flex">
      <div className="flex flex-col items-center justify-center h-screen w-[75%]">
        <h1 className="text-2xl font-bold mb-6">
          {capitalizeFirstLetter(decodeURI(id))}
        </h1>
        <div className="h-[50%] w-[75%]">
          <BarChart
            data={data.find((d) => d.year === selectedYear)}
            max={calculateMaxWatts(data)}
          />
          {data.length > 0 ? (
            <Timeline data={data} onYearChange={handleYearChange} />
          ) : (
            <div></div>
          )}
        </div>
      </div>
      <div className="fixed right-24 top-32">
        <Card className="max-w-[350px] p-4">
          <CardContent>
            <h2 className="text-xl font-bold">Select Another Country</h2>
            <AutoComplete
              className="w-full mt-4"
              options={countries}
              getOptionLabel={(country: Country) => country.name}
              filterOptions={(options, params) => {
                const filtered = options.filter((option) =>
                  option.name
                    .toLowerCase()
                    .includes(params.inputValue.toLowerCase())
                );
                return filtered;
              }}
              value={selectedCountry}
              onChange={handleCountrySelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={""}
                  variant="outlined"
                  fullWidth
                  onKeyDown={handleKeyDown}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <div className="w-full flex items-start justify-start  px-2 py-4">
                    {option.name}
                  </div>
                </li>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function calculateMaxWatts(data: EnergyProductionData[]) {
  let max = 0;
  data.forEach((d) => {
    d.production.forEach((p) => {
      if (p.watts > max) {
        max = p.watts;
      }
    });
  });
  return max;
}

import { Card, CardContent, TextField } from "@mui/material";
import AutoComplete from "@mui/material/Autocomplete";
import { useRouter } from "next/navigation";
import React, { useContext } from "react";
import { CountryDataContext } from "../contexts/country-data-context";

interface CountrySelectorProps {
  id: string;
}

export default function CountrySelector({ id }: CountrySelectorProps) {
  const { countryList } = useContext(CountryDataContext);

  const selectedCountry =
    countryList.find(
      (countryName) => countryName.toLowerCase() === decodeURI(id).toLowerCase()
    ) || null;

  const router = useRouter();

  const handleCountrySelect = (_: any, value: string | null) => {
    if (value) {
      router.push(`/country/${value}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && selectedCountry) {
      event.preventDefault();
      router.push(`/country/${selectedCountry}`);
    }
  };

  return (
    <Card className="h-auto">
      <CardContent className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold">Select Country</h2>
        <AutoComplete
          className="shadow-md"
          options={countryList}
          getOptionLabel={(countryName) => countryName}
          filterOptions={(options, params) => {
            const filtered = options.filter((option) =>
              option.toLowerCase().includes(params.inputValue.toLowerCase())
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
                {option}
              </div>
            </li>
          )}
        />
      </CardContent>
    </Card>
  );
}

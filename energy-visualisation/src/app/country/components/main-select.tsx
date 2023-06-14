import { Autocomplete, TextField } from "@mui/material";
import { useContext } from "react";
import { CountryDataContext } from "../contexts/country-data-context";

interface MainSelectProps {
  selectedCountry: string | null;
  handleCountryChange: (event: any, value: string | null) => void;
}

export default function MainSelect({
  selectedCountry,
  handleCountryChange,
}: MainSelectProps) {
  const countries = useContext(CountryDataContext).countryList;

  return (
    <Autocomplete
      className="w-[50%] "
      options={countries}
      getOptionLabel={(country) => country}
      value={selectedCountry}
      onChange={handleCountryChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Country"
          variant="outlined"
          fullWidth
        />
      )}
    />
  );
}

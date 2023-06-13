"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField, Button } from "@mui/material/";
import { Country } from "./interfaces";
import { countries } from "./countries";

export default function CountryHomePage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const handleCountryChange = (_: any, value: Country | null) => {
    setSelectedCountry(value);
  };

  const handleViewCountry = () => {
    if (selectedCountry) {
      router.push(`/country/${selectedCountry.name}`);
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center w-full space-y-4">
      <h1 className="text-3xl font-bold ">Energy Production by Country</h1>
      <Autocomplete
        className="w-[50%] "
        options={countries}
        getOptionLabel={(country) => country.name}
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
      <Button
        variant="contained"
        color="primary"
        onClick={handleViewCountry}
        disabled={selectedCountry === null}
      >
        View Country
      </Button>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material/";
import MainSelect from "./components/main-select";
import { CountryDataProvider } from "./contexts/country-data-context";

export default function CountryHomePage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleCountryChange = (_: any, value: string | null) => {
    setSelectedCountry(value);
  };

  const handleViewCountry = () => {
    if (selectedCountry) {
      router.push(`/country/${selectedCountry}`);
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center w-full space-y-4">
      <h1 className="text-3xl font-bold ">Energy Production by Country</h1>
      <CountryDataProvider>
        <MainSelect
          selectedCountry={selectedCountry}
          handleCountryChange={handleCountryChange}
        />
      </CountryDataProvider>
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

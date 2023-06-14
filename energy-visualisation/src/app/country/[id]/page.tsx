"use client";
import CountryViewer from "../components/country-viewer";
import { CountryDataProvider } from "../contexts/country-data-context";
import CountrySelector from "../components/country-selector";
import { Card, CardContent } from "@mui/material";

export default function CountryPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const countryName = capitalizeFirstLetter(decodeURI(id));

  return (
    <div className="flex flex-col pt-32 px-16 w-full">
      <CountryDataProvider>
        <h1 className="text-4xl font-semi-bold mb-6">{countryName}</h1>
        <div className="flex flex-row space-x-2">
          <div className="pb-4 px-24 pt-4 shadow-xl w-[80%] min-h-[700px] items-center rounded-xl">
            <CountryViewer countryName={countryName} />
          </div>
          <div className="flex flex-col flex-grow space-y-4 ">
            <CountrySelector id={id} />
            <Card className="flex-grow">
              <CardContent>Stats</CardContent>
            </Card>
          </div>
        </div>
      </CountryDataProvider>
    </div>
  );
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

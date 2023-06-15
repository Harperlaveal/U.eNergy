"use client";
import CountryViewer from "../components/country-viewer";
import { CountryDataProvider } from "../contexts/country-data-context";
import CountrySelector from "../components/country-selector";
import { Card, CardContent } from "@mui/material";
import CountryStats from "../components/country-stats";

export default function CountryPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const countryName = capitalizeFirstLetter(decodeURI(id));

  return (
    <div className="flex flex-col pt-44 px-16 w-full">
      <CountryDataProvider>
        <div className="flex flex-row space-x-2">
          <div className="pb-16 px-24 pt-8 shadow-xl min-w-[80%] min-h-[700px] items-center rounded-xl border">
            <CountryViewer countryName={countryName} />
          </div>
          <div className="flex flex-col flex-grow space-y-4 ">
            <CountrySelector id={id} />
            <Card className="flex-grow">
              <CardContent>
                <CountryStats countryName={countryName} />
              </CardContent>
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

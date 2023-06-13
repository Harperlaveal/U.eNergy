"use client";
import CountryViewer from "../components/country-viewer";
import { CountryDataProvider } from "../contexts/country-data-context";
import CountrySelector from "../components/country-selector";

export default function CountryPage({ params }: { params: { id: string } }) {
  const id = params.id;

  return (
    <div className="flex">
      <CountryDataProvider>
        <div className="w-[75%]">
          <CountryViewer countryName={capitalizeFirstLetter(decodeURI(id))} />
        </div>
        <div className="fixed right-24 top-32">
          <CountrySelector id={id} />
        </div>
      </CountryDataProvider>
    </div>
  );
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

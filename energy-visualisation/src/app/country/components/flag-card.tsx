import { useState, useEffect } from "react";
import { countries } from "../countries";
import { Card, CardContent } from "@mui/material";

export default function FlagCard({ id }: { id: string }) {
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    setCountryCode(getCountryCode(decodeURI(id)));
  }, [id]);

  const getCountryCode = (countryName: string) => {
    const country =
      countries.find(
        (country) => country.name.toLowerCase() === countryName.toLowerCase()
      ) || null;
    if (country) {
      return country.code.toLowerCase();
    } else {
      return "";
    }
  };

  return (
    <Card className="min-h-[25%] items-center justify-center">
      <CardContent>
        {countryCode && (
          <div className="flex flex-col">
            <img
              src={`https://flagcdn.com/w640/${countryCode}.png`}
              alt="flag"
              className="shadow-md rounded"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import React, { useEffect, useState } from 'react';
import Slider from "@mui/material/Slider";

interface CountryScaleProps {
  countryCount: number;
  onCountryCountChange: (countryCount: number) => void;
}

export default function CountryScale({ countryCount, onCountryCountChange }: CountryScaleProps) {
    const [value, setValue] = useState<number>(countryCount);
  const handleChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
        onCountryCountChange(newValue);
        setValue(newValue);
    }
  };

    useEffect(() => {
        setValue(countryCount);
  }, [countryCount]);

  return (
    countryCount && (  // Renders Slider only when countryCount has a valid value
      <Slider
        value={value}
        onChange={handleChange}
        min={1}
        max={countryCount}
        sx={{
          "& .MuiSlider-thumb": {
            transition: "left 0.3s ease-in-out",
            "&:not(.MuiSlider-active)": {
              transition: "left 0.3s ease-in-out",
            },
          },
          "& .MuiSlider-track": {
            transition: "width 0.3s ease-in-out",
            "&:not(.MuiSlider-active)": {
              transition: "width 0.3s ease-in-out",
            },
          },
        }}
      />
    )
  );
}

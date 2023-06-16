import React, { useEffect, useState } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

interface CountryRangeProps {
  countryCount: number;
  onCountryRangeChange: (srange: [number, number]) => void;
}

export default function CountryRange({ countryCount, onCountryRangeChange }: CountryRangeProps) {
  const [start, setStart] = useState<number>();
  const [end, setEnd] = useState<number>();

  const handleChange = (values: [number, number]) => {
    const [newStart, newEnd] = values;
    onCountryRangeChange(values);
    setStart(newStart);
    setEnd(newEnd);
  };

  useEffect(() => {
    setStart(1);
    setEnd(10);
  }, [countryCount]);

  return (
    <><div className="w-3/4 h-3/4">Country Range Selection</div>
      <RangeSlider id="range-slider-gradient" min={1} max={countryCount} step={1} value={[start, end]} onInput={handleChange} className="margin-lg"></RangeSlider>
    </>
  );
}

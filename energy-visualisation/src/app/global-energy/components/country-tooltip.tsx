import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface CountryTooltipProps {
  open: boolean;
  countryData: { id: string; amount: number; } | null;
  children: React.ReactElement;
}

const CountryTooltip: React.FC<CountryTooltipProps> = ({ open, countryData, children }) => {
  return (
    <Tooltip 
      open={open}
      title={
        <Box>
          {countryData && <Typography>Country: {countryData.id}</Typography>}
          {countryData && <Typography>Total Energy Produced: {countryData.amount} TWh</Typography>}
        </Box>
      }
      placement="right"
    >
      {children}
    </Tooltip>
  );
};

export default CountryTooltip;

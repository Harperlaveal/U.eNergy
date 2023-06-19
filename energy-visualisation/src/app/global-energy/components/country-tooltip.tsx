import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface CountryTooltipProps {
  open: boolean;
  countryData: { 
    id: string; 
    amount?: number;
    renewable?: number;
    nonRenewable?: number; 
  } | null;
  children: React.ReactElement;
}

const CountryTooltip: React.FC<CountryTooltipProps> = ({ open, countryData, children }) => {
  return (
    <Tooltip 
      open={open}
      title={
        <Box>
          {countryData && <Typography>Country: {countryData.id}</Typography>}
          {countryData?.amount && <Typography>Total Energy Produced: {countryData.amount} GWh</Typography>}
          {countryData?.renewable && <Typography>Renewable Energy Produced: {countryData.renewable} GWh</Typography>}
          {countryData?.nonRenewable && <Typography>Non-renewable Energy Produced: {countryData.nonRenewable} GWh</Typography>}
        </Box>
      }
      placement="right"
    >
      {children}
    </Tooltip>
  );
};

export default CountryTooltip;

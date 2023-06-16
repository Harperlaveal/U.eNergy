import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

interface CountryDialogProps {
  open: boolean;
  onClose: () => void;
  countryData: { id: string; amount: number; } | null;
}

const CountryDialog: React.FC<CountryDialogProps> = ({ open, onClose, countryData }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Country Energy Production Data"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {countryData && `Country: ${countryData.id}`}
          <br />
          {countryData && `Total Energy Produced: ${countryData.amount} TWh`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CountryDialog;

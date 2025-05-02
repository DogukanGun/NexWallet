import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

interface AdminItemCardProps {
  name: string;
  disabled: boolean;
  onToggle: () => void;
  onDelete: () => void;
  extraContent?: React.ReactNode;
}

const AdminItemCard: React.FC<AdminItemCardProps> = ({
  name,
  disabled,
  onToggle,
  onDelete,
  extraContent
}) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: disabled ? 0.7 : 1,
        transition: 'all 0.2s'
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {name}
        </Typography>
        {extraContent}
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          variant="contained"
          color={disabled ? "success" : "warning"}
          startIcon={<PowerSettingsNewIcon />}
          onClick={onToggle}
          size="small"
        >
          {disabled ? "Enable" : "Disable"}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          size="small"
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default AdminItemCard; 
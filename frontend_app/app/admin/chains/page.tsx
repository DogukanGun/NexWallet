"use client";
import React, { useEffect, useState } from "react";
import { 
  Stack, 
  Button, 
  Container, 
  Grid, 
  TextField, 
  Paper, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Alert
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { withAuth } from "@/app/middleware/withAuth";
import AdminItemCard from "@/app/components/AdminItemCard";
import AddIcon from '@mui/icons-material/Add';
import NoDataImage from '@mui/icons-material/Storage'; // or any other icon you prefer
import { apiService } from "@/app/services/ApiService";

interface Chain {
  id: string;
  name: string;
  isEmbedded: boolean;
  disabled: boolean;
  icon: string;
}

const ChainsPage: React.FC = () => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [newChain, setNewChain] = useState<Omit<Chain, 'id'>>({ 
    name: '', 
    isEmbedded: false, 
    disabled: false, 
    icon: '' 
  });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchChains();
  }, []);

  const fetchChains = async () => {
    try {
      const data = await apiService.getChains();
      setChains(data);
    } catch (error) {
      enqueueSnackbar("Failed to fetch chains", { variant: "error" });
    }
  };

  const addChain = async () => {
    try {
      await apiService.createChain(newChain.name);
      fetchChains();
      enqueueSnackbar("Chain created successfully!", { variant: "success" });
      setOpenDialog(false);
      setNewChain({ name: '', isEmbedded: false, disabled: false, icon: '' });
    } catch (error) {
      enqueueSnackbar("Failed to create chain", { variant: "error" });
    }
  };

  const deleteChain = async (chainId: string) => {
    try {
      await apiService.deleteChain(chainId);
      fetchChains();
      enqueueSnackbar("Chain deleted successfully!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to delete chain", { variant: "error" });
    }
  };

  const toggleChain = async (chainId: string, currentDisabled: boolean) => {
    try {
      await apiService.toggleChain(chainId, currentDisabled);
      fetchChains();
      enqueueSnackbar(`Chain ${currentDisabled ? 'enabled' : 'disabled'} successfully!`, { 
        variant: "success" 
      });
    } catch (error) {
      enqueueSnackbar("Failed to update chain status", { variant: "error" });
    }
  };

  const EmptyState = () => (
    <Box 
      sx={{ 
        textAlign: 'center', 
        py: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}
    >
      <NoDataImage sx={{ fontSize: 60, color: 'text.secondary' }} />
      <Typography variant="h6" color="text.secondary">
        No Chains Available
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Get started by adding your first chain
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
      >
        Add Chain
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Chains
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add New Chain
          </Button>
        </Box>

        {chains.length === 0 ? (
          <EmptyState />
        ) : (
          <Grid container spacing={3}>
            {chains.map(chain => (
              <Grid item key={chain.id} xs={12} sm={6} md={4}>
                <AdminItemCard
                  name={chain.name}
                  disabled={chain.disabled}
                  onToggle={() => toggleChain(chain.id, chain.disabled)}
                  onDelete={() => deleteChain(chain.id)}
                  extraContent={
                    <Typography variant="body2" color="text.secondary">
                      {chain.isEmbedded ? "Embedded Chain" : "Regular Chain"}
                    </Typography>
                  }
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Chain</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chain Name"
            fullWidth
            value={newChain.name}
            onChange={(e) => setNewChain({ ...newChain, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={addChain} 
            variant="contained" 
            disabled={!newChain.name.trim()}
          >
            Add Chain
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(ChainsPage); 
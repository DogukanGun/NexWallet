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
  CircularProgress
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { withAuth } from "@/app/middleware/withAuth";
import AdminItemCard from "@/app/components/AdminItemCard";
import AddIcon from '@mui/icons-material/Add';
import NoDataImage from '@mui/icons-material/Storage';
import { apiService } from "@/app/services/ApiService";

interface LLMProvider {
  id: string;
  name: string;
  disabled: boolean;
}

const LLMProvidersPage: React.FC = () => {
  const [llmProviders, setLLMProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLLMProvider, setNewLLMProvider] = useState<Omit<LLMProvider, 'id'>>({ 
    name: '', 
    disabled: false 
  });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchLLMProviders();
  }, []);

  const fetchLLMProviders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLLMProviders();
      // Ensure we're getting an array
      setLLMProviders(Array.isArray(data) ? data : []);
    } catch (error) {
      enqueueSnackbar("Failed to fetch LLM providers", { variant: "error" });
      setLLMProviders([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const addLLMProvider = async () => {
    try {
      await apiService.createLLMProvider(newLLMProvider.name);
      fetchLLMProviders();
      enqueueSnackbar("LLM Provider created successfully!", { variant: "success" });
      setOpenDialog(false);
      setNewLLMProvider({ name: '', disabled: false });
    } catch (error) {
      enqueueSnackbar("Failed to create LLM provider", { variant: "error" });
    }
  };

  const deleteLLMProvider = async (llmId: string) => {
    try {
      await apiService.deleteLLMProvider(llmId);
      fetchLLMProviders();
      enqueueSnackbar("LLM Provider deleted successfully!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to delete LLM provider", { variant: "error" });
    }
  };

  const toggleLLMProvider = async (llmId: string, enable: boolean) => {
    try {
      await apiService.toggleLLMProvider(llmId, enable);
      fetchLLMProviders();
      enqueueSnackbar(`LLM Provider ${enable ? 'enabled' : 'disabled'} successfully!`, { 
        variant: "success" 
      });
    } catch (error) {
      enqueueSnackbar("Failed to update LLM provider status", { variant: "error" });
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
        No LLM Providers Available
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Get started by adding your first LLM provider
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
      >
        Add LLM Provider
      </Button>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            LLM Providers
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add New Provider
          </Button>
        </Box>

        {!loading && llmProviders.length === 0 ? (
          <EmptyState />
        ) : (
          <Grid container spacing={3}>
            {llmProviders.map(llm => (
              <Grid item key={llm.id} xs={12} sm={6} md={4}>
                <AdminItemCard
                  name={llm.name}
                  disabled={llm.disabled}
                  onToggle={() => toggleLLMProvider(llm.id, llm.disabled)}
                  onDelete={() => deleteLLMProvider(llm.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New LLM Provider</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Provider Name"
            fullWidth
            value={newLLMProvider.name}
            onChange={(e) => setNewLLMProvider({ ...newLLMProvider, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={addLLMProvider} 
            variant="contained" 
            disabled={!newLLMProvider.name.trim()}
          >
            Add Provider
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(LLMProvidersPage); 
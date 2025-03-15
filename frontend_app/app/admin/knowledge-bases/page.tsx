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
  Box
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { withAuth } from "@/app/middleware/withAuth";
import AdminItemCard from "@/app/components/AdminItemCard";
import AddIcon from '@mui/icons-material/Add';
import NoDataImage from '@mui/icons-material/Storage'; // or any other icon you prefer
import { apiService } from "@/app/services/ApiService";

interface KnowledgeBase {
  id: string;
  name: string;
  disabled: boolean;
}

const KnowledgeBasesPage: React.FC = () => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [newKnowledgeBase, setNewKnowledgeBase] = useState<Omit<KnowledgeBase, 'id'>>({ 
    name: '', 
    disabled: false 
  });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const fetchKnowledgeBases = async () => {
    try {
      const data = await apiService.getKnowledgeBases();
      setKnowledgeBases(data);
    } catch (error) {
      enqueueSnackbar("Failed to fetch knowledge bases", { variant: "error" });
    }
  };

  const addKnowledgeBase = async () => {
    try {
      await apiService.createKnowledgeBase(newKnowledgeBase.name);
      fetchKnowledgeBases();
      enqueueSnackbar("Knowledge Base created successfully!", { variant: "success" });
      setOpenDialog(false);
      setNewKnowledgeBase({ name: '', disabled: false });
    } catch (error) {
      enqueueSnackbar("Failed to create knowledge base", { variant: "error" });
    }
  };

  const deleteKnowledgeBase = async (kbId: string) => {
    try {
      await apiService.deleteKnowledgeBase(kbId);
      fetchKnowledgeBases();
      enqueueSnackbar("Knowledge Base deleted successfully!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to delete knowledge base", { variant: "error" });
    }
  };

  const toggleKnowledgeBase = async (kbId: string, currentDisabled: boolean) => {
    try {
      await apiService.toggleKnowledgeBase(kbId, currentDisabled);
      fetchKnowledgeBases();
      enqueueSnackbar(`Knowledge Base ${currentDisabled ? 'enabled' : 'disabled'} successfully!`, { 
        variant: "success" 
      });
    } catch (error) {
      enqueueSnackbar("Failed to update knowledge base status", { variant: "error" });
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
        No Knowledge Bases Available
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Get started by adding your first knowledge base
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
      >
        Add Knowledge Base
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Knowledge Bases
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add New Knowledge Base
          </Button>
        </Box>

        {knowledgeBases.length === 0 ? (
          <EmptyState />
        ) : (
          <Grid container spacing={3}>
            {knowledgeBases.map(kb => (
              <Grid item key={kb.id} xs={12} sm={6} md={4}>
                <AdminItemCard
                  name={kb.name}
                  disabled={kb.disabled}
                  onToggle={() => toggleKnowledgeBase(kb.id, kb.disabled)}
                  onDelete={() => deleteKnowledgeBase(kb.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Knowledge Base</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Knowledge Base Name"
            fullWidth
            value={newKnowledgeBase.name}
            onChange={(e) => setNewKnowledgeBase({ ...newKnowledgeBase, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={addKnowledgeBase} 
            variant="contained" 
            disabled={!newKnowledgeBase.name.trim()}
          >
            Add Knowledge Base
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(KnowledgeBasesPage); 
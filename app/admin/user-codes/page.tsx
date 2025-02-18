"use client";
import { apiService } from "@/app/services/ApiService";
import { Button, Container, Grid2, Paper, Stack } from "@mui/material";
import { DataGrid, GridColDef, GridRowId } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { withAuth } from "@/app/middleware/withAuth";

type UserCodeType = {
  id: number;
  code: string;
  is_used: boolean;
  used_by: string;
};

const UserCode = () => {
  const [rows, setRows] = useState<UserCodeType[]>([]);
  const [columns] = useState<GridColDef[]>([
    { field: "id", headerName: "ID", width: 90 },
    { field: "code", headerName: "Code", width: 150 },
    { field: "is_used", headerName: "Used", width: 200 },
    {
      field: "used_by",
      headerName: "Used By",
      width: 200,
      valueGetter: (_, row) => `${row.used_by || "Not Used"}`,
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 150,
      renderCell: (params) => (
        <Button variant="contained" color="secondary" onClick={() => handleDelete(params.id)}>
          Delete
        </Button>
      ),
    },
    {
      field: "use",
      headerName: "Mark",
      width: 150,
      renderCell: (params) => (
        <Button variant="contained" color="primary" onClick={() => handleMarkAsUsed(params.id)}>
          Mark as Used
        </Button>
      ),
    },
  ]);

  const paginationModel = { pageSize: 5, page: 0 };

  async function handleDelete(id: GridRowId): Promise<void> {
    try {
      const response = await apiService.deleteUserCode(id.toString());

      if (!response) {
        enqueueSnackbar("Failed to delete the user code", { variant: "error" });
      }

      setRows((prevRows) => prevRows.filter((row) => row.id !== Number(id.toString())));
    } catch (error) {
      enqueueSnackbar("Error deleting user code:", { variant: "error" });
      console.error("Error deleting user code:", error);
    }
  }

  async function handleMarkAsUsed(id: GridRowId): Promise<void> {
    try {
      const response = await apiService.updateUserCode(id.toString());

      if (!response) {
        enqueueSnackbar("Failed to mark the user code as used", { variant: "error" });
      }

      setRows((prevRows) =>
        prevRows.map((row) => (row.id === id ? { ...row, is_used: true } : row)),
      );
    } catch (error) {
      enqueueSnackbar("Error marking user code as used:", { variant: "error" });
      console.error("Error marking user code as used:", error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getUserCodes();
        const data: UserCodeType[] = response.code;
        setRows(data);
      } catch (error) {
        enqueueSnackbar("Error fetching user codes:", { variant: "error" });
        console.error("Error fetching user codes:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="hero min-h-screen">
      <Stack
        spacing={2}
        sx={{
          alignItems: "center",
          width: "100%",
          height: "100%",
          mx: 3,
          pb: 5,
          mt: { xs: 8, md: 8 },
        }}
      >
        <Container>
          <Grid2 size={{ xs: 12, sm: 12, lg: 12 }}>
            <Paper sx={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
                sx={{ border: 0 }}
                onRowSelectionModelChange={(selectionModel) => {
                  const selectedIDs = new Set(selectionModel);
                  const selectedRowData = rows.filter((row) => selectedIDs.has(row.id));
                  console.log(selectedRowData);
                }}
              />
            </Paper>
          </Grid2>
        </Container>
      </Stack>
    </div>
  );
};

export default withAuth(UserCode);

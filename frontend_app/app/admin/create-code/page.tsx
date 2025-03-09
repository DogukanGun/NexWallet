"use client";
import { Stack, Button, Container, Grid2 } from "@mui/material";
import React from "react";
import { enqueueSnackbar } from "notistack";
import { apiService } from "@/app/services/ApiService";
import { withAuth } from "@/app/middleware/withAuth";

const UserCodesPage: React.FC = () => {
  const onClick = () => {
    apiService
      .postUserCode()
      .then((data) => {
        console.log(data);
        enqueueSnackbar(`Code created successfully! Code: ${data.code}`, {
          variant: "success",
        });
      })
      .catch((error) => {
        console.error("Error fetching user code:", error);
        enqueueSnackbar("Error creating code", { variant: "error" });
      });
  };

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
            <Button onClick={onClick} variant="contained" color="primary">
              Create Code
            </Button>
          </Grid2>
        </Container>
      </Stack>
    </div>
  );
};

export default withAuth(UserCodesPage);

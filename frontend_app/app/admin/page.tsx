"use client";
import React from "react";
import { PieChart } from "./components/PieChart";
import { dummyPieChart } from "./dummy";
import CustomCard from "./components/Card";
import Grid from "@mui/material/Grid2";
import { Box, Stack } from "@mui/material";
import PageViewsBarChart from "./components/LineChart";
import StatCard, { StatCardProps } from "./components/StatsCard";
import { withAuth } from "../middleware/withAuth";

const data: StatCardProps[] = [
  {
    title: "Users",
    value: "14k",
    interval: "Last 30 days",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340, 380, 360, 400, 380,
      420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: "Conversions",
    value: "325",
    interval: "Last 30 days",
    trend: "down",
    data: [
      1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600, 820, 780, 800, 760,
      380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300, 220,
    ],
  },
  {
    title: "Event count",
    value: "200k",
    interval: "Last 30 days",
    trend: "neutral",
    data: [
      500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510, 530, 520, 410, 530,
      520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
    ],
  },
];

const UserCodesPage1: React.FC = () => {
  return (
    <Box
      component="main"
      sx={(theme) => ({
        flexGrow: 1,
        backgroundColor: "white",
        overflow: "auto",
        position: "relative",
      })}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            color: "white",
            fontSize: "2rem",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Will be live soon
        </Box>
      </Box>

      <Stack
        spacing={2}
        sx={{
          alignItems: "center",
          mx: 3,
          pb: 5,
          mt: { xs: 8, md: 0 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
          <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
            <h1 className="text-black w-full text-center text-2xl">User Stats</h1>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <CustomCard>
                <PieChart data={dummyPieChart} />
              </CustomCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <CustomCard>
                <PieChart data={dummyPieChart} />
              </CustomCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <CustomCard>
                <PieChart data={dummyPieChart} />
              </CustomCard>
            </Grid>
            <PageViewsBarChart />
            {data.map((card, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard {...card} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
};

export default withAuth(UserCodesPage1);

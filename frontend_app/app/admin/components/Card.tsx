import React from "react";
import Card from "@mui/material/Card";

interface CardProps {
  children: React.ReactNode;
}

const CustomCard: React.FC<CardProps> = ({ children }) => {
  return <Card sx={{ width: 400, height: 400, padding: 2 }}>{children}</Card>;
};

export default CustomCard;

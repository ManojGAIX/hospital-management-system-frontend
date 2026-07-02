import React from "react";

import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import { genderOptions } from "../utils/constants";

export default function PatientSearch({
  filters,
  setFilters,
  onClear,
}) {
  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 3,
        background: "#fff",
        border: "1px solid #E5E7EB",
      }}
    >
      <Grid container spacing={2} alignItems="flex-end">
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Search"
            placeholder="Search Name / Phone / Patient ID"
            value={filters.search}
            onChange={(e) =>
              handleChange("search", e.target.value)
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            fullWidth
            label="Gender"
            value={filters.gender}
            onChange={(e) =>
              handleChange("gender", e.target.value)
            }
          >
            <MenuItem value="">All</MenuItem>

            {genderOptions.map((gender) => (
              <MenuItem
                key={gender}
                value={gender}
              >
                {gender}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={onClear}
            sx={{
              height: 56,
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Clear
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
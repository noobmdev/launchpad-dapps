import { Box, Grid, Spinner, useToast } from "@chakra-ui/react";
import { usePools } from "hooks/useFetch";
import React from "react";
import Allocations from "./components/Allocations";

const Projects = () => {
  const { pools, isLoading, isError } = usePools();
  const toast = useToast();
  if (isLoading) return <Spinner />;
  if (isError) return null;
  return (
    <Box>
      <Box fontSize="2.25em" fontWeight="semibold" mb="1em">
        Active Allocations
      </Box>

      <Grid
        templateColumns={{
          base: "repeat(1,1fr)",
          md: "repeat(2,1fr)",
          xl: "repeat(3,1fr)",
        }}
        gap="8"
      >
        {pools?.map((pool, idx) => (
          <Allocations key={idx} pool={pool} />
        ))}
      </Grid>
    </Box>
  );
};

export default Projects;

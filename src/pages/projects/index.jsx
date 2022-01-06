import { Box, Grid } from "@chakra-ui/react";
import { GlobalContext } from "context/GlobalContext";
import React, { useContext } from "react";
import Allocations from "./components/Allocations";

const Projects = () => {
  const { pools } = useContext(GlobalContext);

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
        {pools.map((pool, idx) => (
          <Allocations key={idx} pool={pool} poolId={idx} />
        ))}
      </Grid>
    </Box>
  );
};

export default Projects;

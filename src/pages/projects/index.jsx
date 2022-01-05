import { Box, Button, Grid, HStack, VStack } from "@chakra-ui/react";
import { POOL_STATUSES } from "configs";
import { GlobalContext } from "context/GlobalContext";
import { formatEther, parseEther } from "ethers/lib/utils";
import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";

const Projects = () => {
  const { pools } = useContext(GlobalContext);

  console.log(pools);
  const renderButtonTxt = (status) => {
    switch (status) {
      case POOL_STATUSES.register:
        return "Go to Register";
      case POOL_STATUSES.deposit:
        return "Go to Deposit";
      case POOL_STATUSES.claim:
        return "Go to Claim";
      default:
        return "Not available";
    }
  };

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
          <VStack
            key={idx}
            align="stretch"
            px="8"
            py="6"
            border="1px solid #E2E8F0"
            borderRadius="md"
            spacing="4"
          >
            <Box>
              <Box color="gray.600">WARE</Box>
              <Box fontSize="1.875em" fontWeight="semibold">
                Warrior Arena
              </Box>
            </Box>
            <HStack>
              <Button bg="black" size="xs" color="white">
                APPROVED
              </Button>
              <Button size="xs" variant="outline">
                BSC
              </Button>
            </HStack>
            <HStack justify="space-between">
              <Box>Available Now</Box>
              <Box color="gray,500">
                {pool.pendingTokenAAmount
                  ? formatEther(pool.pendingTokenAAmount.toString())
                  : "0.0"}{" "}
                MARS
              </Box>
            </HStack>
            <HStack justify="space-between">
              <Box>Claimed</Box>
              <Box color="gray,500">
                {pool.pendingTokenAAmountClaimed
                  ? formatEther(pool.pendingTokenAAmountClaimed.toString())
                  : "0.0"}{" "}
                MARS
              </Box>
            </HStack>
            <HStack justify="space-between">
              <Box>Claimable in Batch</Box>
              <Box color="gray,500">0.00 MARS</Box>
            </HStack>
            <HStack justify="space-between">
              <Box>Date</Box>
              <Box color="gray,500">October 11th 2021</Box>
            </HStack>
            <Link to={`/projects/${idx}`}>
              <Button
                w="100%"
                color="white"
                borderRadius="md"
                bg="green.300"
                _hover={{
                  bg: "green.200",
                }}
              >
                {renderButtonTxt(pool.status)}
              </Button>
            </Link>
          </VStack>
        ))}
      </Grid>
    </Box>
  );
};

export default Projects;

import { Image } from "@chakra-ui/image";
import { Box, Grid, GridItem, HStack } from "@chakra-ui/layout";
import React from "react";

const Home = () => {
  return (
    <Grid templateColumns="repeat(2,1fr)" gap="4" color="white">
      <GridItem colSpan="2">
        <HStack>
          <Image boxSize="10" src="https://i.imgur.com/j6CS2Lm.png" />
          <Box fontSize="2xl" fontWeight="semibold">
            DopeWarZ Community Sale
          </Box>
        </HStack>
      </GridItem>
      <GridItem colSpan="2">
        <HStack spacing="4">
          <HStack>
            <Image
              boxSize="5"
              src="https://redkite.polkafoundry.com/images/BUSD.png"
            />
            <Box>BUSD</Box>
          </HStack>
          <HStack
            borderLeft="1px solid"
            borderRight="1px solid"
            px="4"
            borderColor="gray.600"
          >
            <Image
              boxSize="5"
              src="https://redkite.polkafoundry.com/images/icons/rocket.svg"
            />
            <Box>No tier & KYC required</Box>
          </HStack>
          <HStack>
            <Image
              boxSize="5"
              src="https://redkite.polkafoundry.com/images/bsc.svg"
            />
            <Box>Binance Smart Chain</Box>
          </HStack>
        </HStack>
      </GridItem>
      <GridItem></GridItem>
    </Grid>
  );
};

export default Home;

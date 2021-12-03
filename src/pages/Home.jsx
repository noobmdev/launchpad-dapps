import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Box, Grid, GridItem, HStack, VStack } from "@chakra-ui/layout";
import { Progress } from "@chakra-ui/progress";
import { Tooltip } from "@chakra-ui/tooltip";
import React, { useState } from "react";

const timeline = [
  {
    name: "Upcoming",
    value: 0,
    desc: "This status is displayed before the pool is opened for swapping. You must apply the Whitelist to join the pool.",
  },
  {
    name: "Swap",
    value: 1,
    desc: "You can start buying token when the pool is changed to Swap status.",
  },
  {
    name: "Filled",
    value: 2,
    desc: "Filled status is displayed when the pool reaches its maximum swap value (100%)",
  },
  {
    name: "Claimable",
    value: 3,
    desc: "You can claim you purchased tokens when the pool has Claimable status.",
  },
  {
    name: "End",
    value: 4,
    desc: "The pool will become End after users have claim their tokens.",
  },
];

const Home = () => {
  const [currentTimeline, setCurrentTimeline] = useState(timeline[1]);

  return (
    <Grid templateColumns="repeat(2,1fr)" gap="4" color="white">
      <GridItem colSpan={{ base: 2, xl: 1 }} py="6">
        <Grid templateColumns="repeat(2,1fr)" gap="2">
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
                borderColor="gray.400"
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
        </Grid>
      </GridItem>
      <GridItem
        colSpan={{ base: 2, xl: 1 }}
        bg="#303035"
        p="6"
        borderRadius="md"
      >
        <HStack h="100%" justify="center">
          <Button colorScheme="blue">Join whitelist</Button>
        </HStack>
      </GridItem>
      <GridItem
        colSpan={{ base: 2, xl: 1 }}
        bg="#303035"
        p="6"
        borderRadius="md"
      >
        <VStack align="stretch" spacing="4">
          <Box fontSize="lg" fontWeight="semibold">
            POOL TIMELINE
          </Box>
          <ul className="timeline">
            {timeline.map((time, idx) => (
              <Tooltip label={time.desc} placement="bottom-start" p="4">
                <li
                  className={
                    currentTimeline.value === time.value ? "active" : ""
                  }
                >
                  <span className="timeline_index">{idx + 1}</span>
                  <span className="timeline_name">{time.name}</span>
                </li>
              </Tooltip>
            ))}
          </ul>
        </VStack>
      </GridItem>
      <GridItem
        colSpan={{ base: 2, xl: 1 }}
        bg="#303035"
        p="6"
        borderRadius="md"
      >
        <VStack align="stretch" spacing="4">
          <Box fontSize="lg" fontWeight="semibold">
            SWAP INFO
          </Box>
          <HStack justify="space-between">
            <Box fontWeight="semibold">Swap Amount</Box>
            <Box color="gray.400">1 DRUG = 0.03 BUSD</Box>
          </HStack>
          <Box color="blue.500" fontWeight="semibold" fontSize="2xl">
            66,666 DRUG
          </Box>
          <Box>
            <HStack justify="space-between">
              <Box fontWeight="semibold">100%</Box>
              <Box color="gray.400">0 / 66,666</Box>
            </HStack>
            <Progress size="sm" value={0} borderRadius="3em" />
          </Box>
        </VStack>
      </GridItem>
      <GridItem colSpan="2" bg="#303035" p="6" borderRadius="md">
        <VStack align="stretch" spacing="4">
          <Box fontSize="lg" fontWeight="semibold">
            POOL DETAILS
          </Box>
          <Grid templateColumns="repeat(2,1fr)" gap="4">
            <GridItem colSpan={{ base: 2, xl: 1 }}>
              <Grid
                templateColumns={{ base: "repeat(6,1fr)", xl: "repeat(3,1fr)" }}
                gap="2"
              >
                <GridItem>
                  <Box color="gray.400">Token Swap Time</Box>
                </GridItem>
                <GridItem colSpan="2">
                  <Box>10:15 PM Dec 01, 2021 (GMT+07:00)</Box>
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem colSpan={{ base: 2, xl: 1 }}>
              <Grid
                templateColumns={{ base: "repeat(6,1fr)", xl: "repeat(3,1fr)" }}
                gap="2"
              >
                <GridItem>
                  <Box color="gray.400">Total Raise</Box>
                </GridItem>
                <GridItem colSpan="2">
                  <Box>1,999.79 BUSD</Box>
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem colSpan={{ base: 2, xl: 1 }}>
              <Grid
                templateColumns={{ base: "repeat(6,1fr)", xl: "repeat(3,1fr)" }}
                gap="2"
              >
                <GridItem>
                  <Box color="gray.400">Type</Box>
                </GridItem>
                <GridItem colSpan="2">
                  <Box>Claimable</Box>
                </GridItem>
              </Grid>
            </GridItem>

            <GridItem colSpan={{ base: 2, xl: 1 }}>
              <Grid
                templateColumns={{ base: "repeat(6,1fr)", xl: "repeat(3,1fr)" }}
                gap="2"
              >
                <GridItem>
                  <Box color="gray.400">Lock Schedule</Box>
                </GridItem>
                <GridItem colSpan="2">
                  <Box>View token release schedule</Box>
                </GridItem>
              </Grid>
            </GridItem>

            <GridItem colSpan={{ base: 2, xl: 1 }}>
              <Grid
                templateColumns={{ base: "repeat(6,1fr)", xl: "repeat(3,1fr)" }}
                gap="2"
              >
                <GridItem>
                  <Box color="gray.400">Website</Box>
                </GridItem>
                <GridItem colSpan="2">
                  <Box>https://dopewarz.io/</Box>
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem colSpan={{ base: 2, xl: 1 }}>
              <Grid
                templateColumns={{ base: "repeat(6,1fr)", xl: "repeat(3,1fr)" }}
                gap="2"
              >
                <GridItem>
                  <Box color="gray.400">Social</Box>
                </GridItem>
                <GridItem colSpan="2">
                  <Box>View token release schedule</Box>
                </GridItem>
              </Grid>
            </GridItem>

            <GridItem colSpan="2">
              <Grid templateColumns="repeat(6,1fr)" gap="2">
                <GridItem>
                  <Box color="gray.400">Token Claim Time</Box>
                </GridItem>
                <GridItem colSpan="5">
                  <Box>11:30 PM Dec 01, 2021 (GMT+07:00)</Box>
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem colSpan="2">
              <Grid templateColumns="repeat(6,1fr)" gap="2">
                <GridItem>
                  <Box color="gray.400">Pre-order Start Time</Box>
                </GridItem>
                <GridItem colSpan="5">
                  <Box>11:30 PM Dec 01, 2021 (GMT+07:00)</Box>
                </GridItem>
              </Grid>
            </GridItem>

            <GridItem colSpan="2">
              <Grid templateColumns="repeat(6,1fr)" gap="2">
                <GridItem>
                  <Box color="gray.400">Project Information</Box>
                </GridItem>
                <GridItem colSpan="5">
                  <Box>
                    DopeWarz is a comprehensive Metaverse, full with a virtual
                    economy that enables people to buy and sell virtual DrugZ to
                    earn real world tradable assets.
                  </Box>
                </GridItem>
              </Grid>
            </GridItem>
          </Grid>
        </VStack>
      </GridItem>
    </Grid>
  );
};

export default Home;

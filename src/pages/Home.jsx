import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Input } from "@chakra-ui/input";
import { Box, Flex, Grid, GridItem, HStack, VStack } from "@chakra-ui/layout";
import { Progress } from "@chakra-ui/progress";
import { Tooltip } from "@chakra-ui/tooltip";
import { BigNumber } from "@ethersproject/bignumber";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { useActiveWeb3React } from "hooks/useActiveWeb3React";
import debounce from "lodash/debounce";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatNumber } from "utils";
import {
  approveB,
  buyPreOrder,
  claimPendingToken,
  getAllowanceB,
  getStartTime,
  getTotalAmountBought,
} from "utils/callContract";

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

const getTimeFromTimestamp = (timestamp) => {
  const exam_ending_at = new Date(timestamp * 1000);
  const current_time = new Date();

  const totalSeconds = Math.floor((exam_ending_at - current_time) / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);

  const days = Math.floor(totalHours / 24);
  const hours = totalHours - days * 24;
  const minutes = totalMinutes - days * 24 * 60 - hours * 60;
  const seconds =
    totalSeconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;
  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

const Home = () => {
  const { account, library } = useActiveWeb3React();

  const [currentTimeline, setCurrentTimeline] = useState(timeline[0]);
  const [startTime, setStartTime] = useState({
    swap: 0,
    claim: 0,
  });
  const [totalBought, setTotalBought] = useState();
  const [totalPreOrder, setTotalPreOrder] = useState(15000000);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [allowanceB, setAllowanceB] = useState();
  const [amountSwap, setAmountSwap] = useState();
  const [needApprove, setNeedApprove] = useState(false);

  const [approving, setApproving] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    (async () => {
      if (!library) return;
      try {
        const [swap, claim] = await getStartTime(library);
        setStartTime({ swap, claim });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [library]);

  useEffect(() => {
    (async () => {
      if (!library) return;
      try {
        const totalBought = await getTotalAmountBought(library);
        setTotalBought(totalBought);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [library, refresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      let timeLeft;
      switch (currentTimeline.value) {
        case timeline[0].value:
          if (startTime.swap) {
            timeLeft = getTimeFromTimestamp(startTime.swap);
          }
          break;

        default:
          break;
      }
      setTimeLeft(timeLeft);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTimeline, startTime]);

  useEffect(() => {
    if (startTime.swap !== 0) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (
        totalBought &&
        totalBought?.lt(
          BigNumber.from(parseUnits(totalPreOrder.toString(), 18))
        )
      ) {
        setCurrentTimeline(timeline[1]);
      } else if (startTime.swap === 0 || startTime.claim > currentTimestamp) {
        setCurrentTimeline(timeline[2]);
      } else {
        setCurrentTimeline(timeline[3]);
      }
    }
  }, [startTime, totalBought, totalPreOrder]);

  useEffect(() => {
    (() => {
      if (!library || !account) return;
      getAllowanceTokenB();
    })();
  }, [library, account]);

  useEffect(() => {
    if (amountSwap && allowanceB) {
      BigNumber.from(amountSwap).gt(allowanceB)
        ? setNeedApprove(true)
        : setNeedApprove(false);
    }
  }, [amountSwap, allowanceB]);

  const getAllowanceTokenB = async () => {
    if (!library || !account) return;
    try {
      const allowance = await getAllowanceB(library, account);
      console.log("allowance", allowance);
      setAllowanceB(allowance);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeAmountSwap = (e) => {
    const value = e.target.value;
    if (!value) {
      setAmountSwap(undefined);
      return;
    }
    const reDecimal = /^\d+(\.\d{0,})?$/gi;
    if (!reDecimal.test(value))
      return alert("Please enter valid decimal number");
    const amount = parseUnits(value, 18);
    setAmountSwap(amount);
  };

  const handleApprove = async () => {
    if (!library || !account) return;
    try {
      setApproving(true);
      await approveB(library, account);
      setNeedApprove(false);
      setApproving(false);
    } catch (error) {
      setApproving(false);
      console.error(error);
      if (error.data?.message) {
        alert(
          error.data.message?.toString().replace("execution reverted: ", "") ??
            "ERROR"
        );
      }
    }
  };

  const handleSwap = async () => {
    if (!library || !account || !amountSwap) return;
    try {
      setSwapping(true);
      await buyPreOrder(library, account, amountSwap);
      setRefresh((pre) => !pre);
      setSwapping(false);
    } catch (error) {
      setSwapping(false);
      console.error(error);
      if (error.data?.message) {
        alert(
          error.data.message?.toString().replace("execution reverted: ", "") ??
            "ERROR"
        );
      }
    }
  };

  const handleClaim = async () => {
    if (!library || !account) return;
    try {
      setSwapping(true);
      await claimPendingToken(library, account);
      setRefresh((pre) => !pre);
      setSwapping(false);
    } catch (error) {
      setSwapping(false);
      console.error(error);
      if (error.data?.message) {
        alert(
          error.data.message?.toString().replace("execution reverted: ", "") ??
            "ERROR"
        );
      }
    }
  };

  const renderTimelineContent = () => {
    switch (currentTimeline.value) {
      case timeline[0].value:
        return (
          startTime.swap && (
            <Box>
              <Box>End to apply for the Whitelist in</Box>
              <HStack align="flex-start" spacing="0">
                <Box textAlign="center" pos="relative" px={{ base: 2, md: 4 }}>
                  <Box fontWeight="semibold" fontSize="2xl">
                    {timeLeft.days}
                  </Box>
                  <Box fontSize="sm" color="gray.400">
                    Days
                  </Box>
                  <Box pos="absolute" right="0" top="1">
                    :
                  </Box>
                </Box>
                <Box textAlign="center" pos="relative" px={{ base: 2, md: 4 }}>
                  <Box fontWeight="semibold" fontSize="2xl">
                    {timeLeft.hours}
                  </Box>
                  <Box fontSize="sm" color="gray.400">
                    Hours
                  </Box>
                  <Box pos="absolute" right="0" top="1">
                    :
                  </Box>
                </Box>
                <Box textAlign="center" pos="relative" px={{ base: 2, md: 4 }}>
                  <Box fontWeight="semibold" fontSize="2xl">
                    {timeLeft.minutes}
                  </Box>
                  <Box fontSize="sm" color="gray.400">
                    Minutes
                  </Box>
                  <Box pos="absolute" right="0" top="1">
                    :
                  </Box>
                </Box>
                <Box textAlign="center" pos="relative" px={{ base: 2, md: 4 }}>
                  <Box fontWeight="semibold" fontSize="2xl">
                    {timeLeft.seconds}
                  </Box>
                  <Box fontSize="sm" color="gray.400">
                    Seconds
                  </Box>
                </Box>
              </HStack>
            </Box>
          )
        );

      case timeline[1].value:
        return <Box>You can swap if in whitelist</Box>;

      case timeline[2].value:
        return <Box>Swap filled wait to claim</Box>;

      case timeline[3].value:
        return <Box>You can claim now</Box>;

      case timeline[4].value:
        return <Box>Ended</Box>;

      default:
        return;
    }
  };

  const renderActions = () => {
    switch (currentTimeline.value) {
      case timeline[0].value:
        return (
          <Link to="/join-whitelist">
            <Button colorScheme="blue">Join whitelist</Button>
          </Link>
        );

      case timeline[1].value:
        return (
          <VStack align="stretch" flex="1" maxW="18em">
            <Input
              placeholder="Enter amount CAMA to swap"
              onChange={handleChangeAmountSwap}
            />
            <HStack justify="center">
              {needApprove && (
                <Button
                  colorScheme="teal"
                  isLoading={approving}
                  onClick={handleApprove}
                >
                  Approve
                </Button>
              )}
              <Button
                colorScheme="blue"
                isDisabled={needApprove}
                isLoading={swapping}
                onClick={handleSwap}
              >
                Swap
              </Button>
            </HStack>
          </VStack>
        );

      case timeline[3].value:
        return (
          <Box>
            <Button
              colorScheme="blue"
              isLoading={swapping}
              onClick={handleClaim}
            >
              Claim
            </Button>
          </Box>
        );

      default:
        return;
    }
  };

  return (
    <Grid templateColumns="repeat(2,1fr)" gap="4" color="white">
      <GridItem colSpan={{ base: 2, xl: 1 }} py="6">
        <Grid templateColumns="repeat(2,1fr)" gap="2">
          <GridItem colSpan="2">
            <Flex
              flexDir={{ base: "column", md: "row", xl: "row" }}
              align="center"
            >
              <Image boxSize="10" src="https://i.imgur.com/j6CS2Lm.png" />
              <Box
                p="2"
                fontSize="2xl"
                fontWeight="semibold"
                textAlign={{ base: "center", md: "left" }}
              >
                DopeWarZ Community Sale
              </Box>
            </Flex>
          </GridItem>
          <GridItem colSpan="2">
            <HStack spacing="0" flexFlow="wrap">
              <HStack p="2" w={{ base: "50%", md: "inherit", xl: "inherit" }}>
                <Image
                  boxSize="5"
                  src="https://redkite.polkafoundry.com/images/BUSD.png"
                />
                <Box>BUSD</Box>
              </HStack>
              <HStack p="2" w={{ base: "50%", md: "inherit", xl: "inherit" }}>
                <Image
                  boxSize="5"
                  src="https://redkite.polkafoundry.com/images/icons/rocket.svg"
                />
                <Box>No tier & KYC required</Box>
              </HStack>
              <HStack p="2">
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
          {renderActions()}
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

          <HStack
            pos="relative"
            justify="space-between"
            spacing="0"
            flexDir={{ base: "column", md: "row" }}
            h={{ base: "64", md: "8" }}
            align={{ base: "left", md: "center" }}
          >
            <Box
              pos="absolute"
              left={{ base: "13px", md: "0" }}
              right={{ base: "", md: "0" }}
              bottom={{ base: "0", md: "" }}
              top={{ base: "0", md: "50%" }}
              transform={{ base: "translateX(-50%)", md: "translateY(-50%)" }}
              h={{ base: "100%", md: "1.5" }}
              w={{ base: "1.5", md: "100%" }}
              bg="#44454b"
              borderRadius="md"
            />
            {timeline.map((time, idx) => (
              <Tooltip
                key={idx}
                label={time.desc}
                placement="bottom-start"
                p="4"
              >
                <Box
                  zIndex="1"
                  bg={
                    currentTimeline.value === time.value ? "#6398ff" : "#44454b"
                  }
                  textAlign="center"
                  w="26px"
                  h="26px"
                  lineHeight="26px"
                  borderRadius="50%"
                  pos="relative"
                  cursor="pointer"
                  fontSize="sm"
                >
                  {idx + 1}
                  <Box
                    pos="absolute"
                    top={{ base: "50%", md: "calc(100% + 8px)" }}
                    left={{
                      base: "calc(100% + 14px)",
                      md: idx === 0 ? "calc(100% + 8px)" : "50%",
                    }}
                    transform={{
                      base: "translateY(-50%)",
                      md: "translateX(-50%)",
                    }}
                    color="#aeaeae"
                    fontSize="sm"
                    fontWeight="semibold"
                  >
                    {time.name}
                  </Box>
                </Box>
              </Tooltip>
            ))}
          </HStack>
          <HStack pt={{ base: 0, md: 8 }}>{renderTimelineContent()}</HStack>
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
            <Box color="gray.400">1 CAMA = 0.04 BUSD</Box>
          </HStack>
          <Box color="blue.500" fontWeight="semibold" fontSize="2xl">
            {formatNumber(totalPreOrder)} CAMA
          </Box>
          <Box>
            <HStack justify="space-between">
              <Box fontWeight="semibold">
                {totalBought
                  ? (
                      parseFloat(
                        formatUnits(totalBought.toString(), 18) * 100
                      ) / totalPreOrder
                    ).toFixed(2)
                  : 0}
                %
              </Box>
              <Box color="gray.400">
                {totalBought
                  ? formatNumber(
                      parseFloat(formatUnits(totalBought.toString(), 18))
                    )
                  : "0"}{" "}
                / {formatNumber(totalPreOrder)}
              </Box>
            </HStack>
            <Progress
              size="sm"
              value={
                totalBought
                  ? parseFloat(formatUnits(totalBought.toString(), 18) * 100) /
                    totalPreOrder
                  : 0
              }
              borderRadius="3em"
            />
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
                <GridItem colSpan={{ base: 2, md: 1 }}>
                  <Box color="gray.400">Token Swap Time</Box>
                </GridItem>
                <GridItem colSpan={{ base: 4, md: 2 }}>
                  <Box>10:15 PM Dec 01, 2021 (GMT+07:00)</Box>
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem colSpan={{ base: 2, xl: 1 }}>
              <Grid
                templateColumns={{ base: "repeat(6,1fr)", xl: "repeat(3,1fr)" }}
                gap="2"
              >
                <GridItem colSpan={{ base: 2, md: 1 }}>
                  <Box color="gray.400">Total Raise</Box>
                </GridItem>
                <GridItem colSpan={{ base: 4, md: 2 }}>
                  <Box>1,999.79 BUSD</Box>
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem colSpan={{ base: 2, xl: 1 }}>
              <Grid
                templateColumns={{ base: "repeat(6,1fr)", xl: "repeat(3,1fr)" }}
                gap="2"
              >
                <GridItem colSpan={{ base: 2, md: 1 }}>
                  <Box color="gray.400">Type</Box>
                </GridItem>
                <GridItem colSpan={{ base: 4, md: 2 }}>
                  <Box>Claimable</Box>
                </GridItem>
              </Grid>
            </GridItem>

            <GridItem colSpan={{ base: 2, xl: 1 }}>
              <Grid
                templateColumns={{ base: "repeat(6,1fr)", xl: "repeat(3,1fr)" }}
                gap="2"
              >
                <GridItem colSpan={{ base: 2, md: 1 }}>
                  <Box color="gray.400">Lock Schedule</Box>
                </GridItem>
                <GridItem colSpan={{ base: 4, md: 2 }}>
                  <Box>View token release schedule</Box>
                </GridItem>
              </Grid>
            </GridItem>

            <GridItem colSpan={{ base: 2, xl: 1 }}>
              <Grid
                templateColumns={{ base: "repeat(6,1fr)", xl: "repeat(3,1fr)" }}
                gap="2"
              >
                <GridItem colSpan={{ base: 2, md: 1 }}>
                  <Box color="gray.400">Website</Box>
                </GridItem>
                <GridItem colSpan={{ base: 4, md: 2 }} wordBreak="break-word">
                  <Box>https://dopewarz.io/</Box>
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem colSpan={{ base: 2, xl: 1 }}>
              <Grid
                templateColumns={{ base: "repeat(6,1fr)", xl: "repeat(3,1fr)" }}
                gap="2"
              >
                <GridItem colSpan={{ base: 2, md: 1 }}>
                  <Box color="gray.400">Social</Box>
                </GridItem>
                <GridItem colSpan={{ base: 4, md: 2 }}>
                  <Box>View token release schedule</Box>
                </GridItem>
              </Grid>
            </GridItem>

            <GridItem colSpan="2">
              <Grid templateColumns="repeat(6,1fr)" gap="2">
                <GridItem colSpan={{ base: 2, md: 1 }}>
                  <Box color="gray.400">Token Claim Time</Box>
                </GridItem>
                <GridItem colSpan={{ base: 4, md: 2 }}>
                  <Box>11:30 PM Dec 01, 2021 (GMT+07:00)</Box>
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem colSpan="2">
              <Grid templateColumns="repeat(6,1fr)" gap="2">
                <GridItem colSpan={{ base: 2, md: 1 }}>
                  <Box color="gray.400">Pre-order Start Time</Box>
                </GridItem>
                <GridItem colSpan={{ base: 4, md: 2 }}>
                  <Box>11:30 PM Dec 01, 2021 (GMT+07:00)</Box>
                </GridItem>
              </Grid>
            </GridItem>

            <GridItem colSpan="2">
              <Grid templateColumns="repeat(6,1fr)" gap="2">
                <GridItem colSpan={{ base: 6, md: 1 }}>
                  <Box color="gray.400">Project Information</Box>
                </GridItem>
                <GridItem colSpan={{ base: 6, md: 5 }}>
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
